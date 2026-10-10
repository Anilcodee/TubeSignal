import type { VideoData } from '@/types/analysis';
import { parsePublishingDate } from './publishing-date';
import { formatViews } from './format';

/** Parse only supported dates; never invent ages or accept future publication dates. */
export function getPublishingAge(video: VideoData, now = Date.now()) {
  if (!Number.isFinite(now)) return null;
  const parsed = parsePublishingDate(video.publishedDate || '', now)
    ?? parsePublishingDate(video.relativeDate || '', now);
  if (!parsed || parsed.timestamp > now) return null;
  return { days: (now - parsed.timestamp) / 86_400_000, approximate: parsed.approximate };
}

export function getDaysSincePublish(video: VideoData, now = Date.now()): number | null {
  const age = getPublishingAge(video, now);
  return age ? age.days : null;
}

export interface VideoVelocity {
  viewsPerDay: number | null;
  formatted: string;
  daysSince: number | null;
  isApproximate: boolean;
  available: boolean;
  usesOneDayFloor: boolean;
}

/**
 * Lifetime average, not current velocity or first-7/30-day performance.
 * Ages below one day use a one-day denominator to avoid unstable hourly extrapolation.
 */
export function calculateVelocity(video: VideoData, now = Date.now()): VideoVelocity {
  const age = getPublishingAge(video, now);
  const available = !!age && video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0;
  const viewsPerDay = available && age ? video.views / Math.max(1, age.days) : null;
  const isApproximate = age?.approximate ?? false;
  return {
    viewsPerDay,
    formatted: viewsPerDay !== null ? `${isApproximate ? '~' : ''}${formatViews(viewsPerDay)}/day` : 'Unavailable',
    daysSince: age?.days ?? null,
    isApproximate,
    available,
    usesOneDayFloor: !!age && age.days < 1,
  };
}

export function summarizeVelocity(videos: VideoData[], now = Date.now()) {
  const values = videos.map((video) => calculateVelocity(video, now)).filter((v) => v.viewsPerDay !== null);
  const sorted = values.map((v) => v.viewsPerDay!).sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const medianViewsPerDay = sorted.length ? (sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2) : null;
  return {
    medianViewsPerDay,
    medianViewsPerDayFormatted: medianViewsPerDay === null ? 'Unavailable' : formatViews(medianViewsPerDay),
    velocitySampleSize: values.length,
    approximateVelocityCount: values.filter((v) => v.isApproximate).length,
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
  const valid = videos.filter((v) => Number.isFinite(v.views) && v.views >= 0 && v.viewsAvailable !== false);
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

  const winningBucket = winnerId ? (buckets.find((b) => b.id === winnerId) || null) : null;
  if (winningBucket) {
    winningBucket.isWinner = true;
  }

  let insight = 'Title lengths are evenly distributed with balanced performance.';
  if (winningBucket && winningBucket.liftMultiplier > 1.1) {
    insight = `${winningBucket.label} titles (${winningBucket.rangeText}) outperform, averaging ${winningBucket.liftMultiplier}× the channel median views.`;
  }

  return { buckets, winningBucket, insight };
}
