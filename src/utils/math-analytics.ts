import type { VideoData } from '@/types/analysis';
import { parsePublishingDate } from './publishing-date';
import { formatViews } from './format';

/**
 * Calculates days elapsed since the video's publication date.
 * Gracefully falls back to parsed dates or minimum 1 day.
 */
export function getDaysSincePublish(video: VideoData, now = Date.now()): number {
  if (video.publishedDate && video.publishedDate !== 'Unavailable') {
    const parsed = parsePublishingDate(video.publishedDate, now);
    if (parsed && Number.isFinite(parsed.timestamp)) {
      const days = Math.floor((now - parsed.timestamp) / 86_400_000);
      return Math.max(1, days);
    }
    const d = new Date(video.publishedDate);
    if (!isNaN(d.getTime())) {
      const days = Math.floor((now - d.getTime()) / 86_400_000);
      return Math.max(1, days);
    }
  }
  if (video.relativeDate) {
    const parsedRel = parsePublishingDate(video.relativeDate, now);
    if (parsedRel && Number.isFinite(parsedRel.timestamp)) {
      const days = Math.floor((now - parsedRel.timestamp) / 86_400_000);
      return Math.max(1, days);
    }
  }
  return 30; // sensible fallback for unparsed sample
}

export interface VideoVelocity {
  viewsPerDay: number;
  formatted: string;
  daysSince: number;
  isApproximate: boolean;
}

/**
 * Normalizes cumulative lifetime views into current pace: views ÷ days_since_publish.
 */
export function calculateVelocity(video: VideoData, now = Date.now()): VideoVelocity {
  const views = Number.isFinite(video.views) && video.views >= 0 ? video.views : 0;
  let daysSince = 30;
  let isApproximate = true;

  if (video.publishedDate && video.publishedDate !== 'Unavailable') {
    const parsed = parsePublishingDate(video.publishedDate, now);
    if (parsed && Number.isFinite(parsed.timestamp)) {
      daysSince = Math.max(1, Math.floor((now - parsed.timestamp) / 86_400_000));
      isApproximate = parsed.approximate;
    } else {
      const d = new Date(video.publishedDate);
      if (!isNaN(d.getTime())) {
        daysSince = Math.max(1, Math.floor((now - d.getTime()) / 86_400_000));
        isApproximate = false;
      }
    }
  } else if (video.relativeDate) {
    const parsedRel = parsePublishingDate(video.relativeDate, now);
    if (parsedRel && Number.isFinite(parsedRel.timestamp)) {
      daysSince = Math.max(1, Math.floor((now - parsedRel.timestamp) / 86_400_000));
      isApproximate = true;
    }
  }

  const viewsPerDay = Math.round(views / daysSince);
  return {
    viewsPerDay,
    formatted: `${isApproximate ? '~' : ''}${formatViews(viewsPerDay)}/day`,
    daysSince,
    isApproximate,
  };
}

export interface MADStats {
  median: number;
  mad: number;
  outlierCutoff: number;
}

/**
 * Median Absolute Deviation (Hampel 1974) with 1.4826 scale factor.
 * Statistically robust outlier test for power-law skewed YouTube distributions.
 */
export function calculateMAD(numbers: number[]): MADStats {
  const valid = numbers.filter((n) => Number.isFinite(n) && n >= 0);
  if (!valid.length) return { median: 0, mad: 0, outlierCutoff: 0 };

  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);

  const deviations = valid.map((x) => Math.abs(x - median));
  const sortedDev = [...deviations].sort((a, b) => a - b);
  const midDev = Math.floor(sortedDev.length / 2);
  const medDev = sortedDev.length % 2 ? sortedDev[midDev] : (sortedDev[midDev - 1] + sortedDev[midDev]) / 2;

  // 1.4826 factor scales MAD to estimate normal std deviation consistently
  const mad = 1.4826 * medDev;
  // Outlier threshold: median + 2.0 * MAD (or fallback to 2x median if MAD is 0)
  const outlierCutoff = Math.round(median + 2.0 * (mad > 0 ? mad : median * 0.5));

  return {
    median,
    mad,
    outlierCutoff,
  };
}

export interface TitleLengthBucket {
  id: 'short' | 'medium' | 'long';
  label: string;
  rangeText: string;
  count: number;
  avgViews: number;
  medianViews: number;
  winRate: number; // percentage of uploads beating channel median
  liftMultiplier: number;
  isWinner: boolean;
}

/**
 * Buckets title length by character counts and identifies performance sweet spots:
 * - Short (<= 35 chars): Punchy, high intrigue
 * - Medium (36 - 65 chars): Optimal desktop & mobile search/feed truncation
 * - Long (66+ chars): Detailed, SEO & podcast keywords
 */
export function analyzeTitleLengthBuckets(
  videos: VideoData[],
  medianViews: number
): {
  buckets: TitleLengthBucket[];
  winningBucket: TitleLengthBucket | null;
  insight: string;
} {
  const valid = videos.filter((v) => Number.isFinite(v.views) && v.views >= 0);
  const baseline = Math.max(1, medianViews);

  const rawBuckets = {
    short: valid.filter((v) => (v.title || '').length <= 35),
    medium: valid.filter((v) => (v.title || '').length > 35 && (v.title || '').length <= 65),
    long: valid.filter((v) => (v.title || '').length > 65),
  };

  const meta: { id: TitleLengthBucket['id']; label: string; rangeText: string }[] = [
    { id: 'short', label: 'Punchy', rangeText: '≤ 35 chars' },
    { id: 'medium', label: 'Balanced', rangeText: '36 – 65 chars' },
    { id: 'long', label: 'Detailed / SEO', rangeText: '66+ chars' },
  ];

  let maxAvg = 0;
  let winnerId: TitleLengthBucket['id'] | null = null;

  const buckets: TitleLengthBucket[] = meta.map(({ id, label, rangeText }) => {
    const list = rawBuckets[id];
    const count = list.length;
    const sum = list.reduce((acc, v) => acc + v.views, 0);
    const avgViews = count ? Math.round(sum / count) : 0;
    const sortedViews = list.map((v) => v.views).sort((a, b) => a - b);
    const midIdx = Math.floor(sortedViews.length / 2);
    const bucketMedian = count
      ? sortedViews.length % 2
        ? sortedViews[midIdx]
        : Math.round((sortedViews[midIdx - 1] + sortedViews[midIdx]) / 2)
      : 0;
    const wins = list.filter((v) => v.views >= baseline).length;
    const winRate = count ? Math.round((wins / count) * 100) : 0;
    const liftMultiplier = Number((avgViews / baseline).toFixed(1));

    if (count >= 2 && avgViews > maxAvg) {
      maxAvg = avgViews;
      winnerId = id;
    }

    return {
      id,
      label,
      rangeText,
      count,
      avgViews,
      medianViews: bucketMedian,
      winRate,
      liftMultiplier,
      isWinner: false,
    };
  });

  const winningBucket = buckets.find((b) => b.id === winnerId) || buckets.find((b) => b.count > 0) || null;
  if (winningBucket) {
    winningBucket.isWinner = true;
  }

  let insight = 'Title lengths are evenly distributed with balanced performance.';
  if (winningBucket && winningBucket.liftMultiplier > 1.1) {
    insight = `${winningBucket.label} titles (${winningBucket.rangeText}) outperform, averaging ${winningBucket.liftMultiplier}× the channel median views.`;
  }

  return { buckets, winningBucket, insight };
}
