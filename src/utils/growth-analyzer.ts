import type { VideoData, AIAnalysis } from '@/types/analysis';
import { formatViews } from './format';
import { parsePublishingDate } from './publishing-date';

export interface DurationTier {
  id: 'short' | 'standard' | 'extended' | 'deep';
  label: string;
  rangeText: string;
  count: number;
  avgViews: number;
  medianViews: number;
  avgViewsFormatted: string;
  viewMultiplier: number; // vs channel median
  isWinner: boolean;
  percentageOfUploads: number;
}

export interface TitleFormula {
  id: 'curiosity' | 'numbers' | 'contrarian' | 'direct';
  label: string;
  badge: string;
  patternExample: string;
  count: number;
  winRate: number; // percentage of videos beating channel median
  avgMultiplier: number;
  sampleTitles: string[];
  accentColor: string;
}

export interface PublishingDayInsight {
  dayName: string;
  shortName: string;
  videoCount: number;
  standoutCount: number; // videos >= median
  winRate: number; // percentage
  isPeak: boolean;
  meanViews: number;
  liftMultiplier: number; // vs channel median
}

export interface AudiencePulse {
  sentimentScore: number; // channel standout rate (0 to 100)
  observedSignals: string[];
  contentDemands: { topic: string; demandLevel: 'High' | 'Very High'; reason: string }[];
}

export interface ChannelGrowthInsights {
  durationTiers: DurationTier[];
  winningDuration: DurationTier | null;
  durationInsightText: string;
  titleFormulas: TitleFormula[];
  topFormula: TitleFormula | null;
  publishingDays: PublishingDayInsight[];
  hasExactDates: boolean;
  peakPublishingDay: string;
  peakLiftMultiplier: number;
  audiencePulse: AudiencePulse;
}

function calculateMedian(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function analyzeChannelGrowth(
  videos: VideoData[],
  medianViews: number,
  aiAnalysis?: AIAnalysis
): ChannelGrowthInsights {
  // Respect viewsAvailable: exclude missing views from dragging down view counts
  const validVideos = videos.filter((v) => v.viewsAvailable !== false && Number.isFinite(v.views) && v.views >= 0);
  const totalCount = Math.max(1, validVideos.length);
  const baselineMedian = Math.max(1, medianViews);

  // ── 1. Duration Tiers ──
  const tierBuckets: Record<DurationTier['id'], VideoData[]> = {
    short: [],
    standard: [],
    extended: [],
    deep: [],
  };

  validVideos.forEach((v) => {
    const mins = (v.lengthSeconds || 0) / 60;
    if (mins < 8) tierBuckets.short.push(v);
    else if (mins < 15) tierBuckets.standard.push(v);
    else if (mins < 30) tierBuckets.extended.push(v);
    else tierBuckets.deep.push(v);
  });

  const tierMeta: { id: DurationTier['id']; label: string; rangeText: string }[] = [
    { id: 'short', label: 'Bite-Sized', rangeText: '< 8 mins' },
    { id: 'standard', label: 'Standard YouTube', rangeText: '8 – 15 mins' },
    { id: 'extended', label: 'Extended Essay', rangeText: '15 – 30 mins' },
    { id: 'deep', label: 'Deep-Dive / Special', rangeText: '30+ mins' },
  ];

  const durationTiers: DurationTier[] = tierMeta.map(({ id, label, rangeText }) => {
    const bucket = tierBuckets[id];
    const count = bucket.length;
    const viewsList = bucket.map((v) => v.views);
    const sum = viewsList.reduce((acc, n) => acc + n, 0);
    const avgViews = count ? Math.round(sum / count) : 0;
    const med = count ? calculateMedian(viewsList) : 0;
    const viewMultiplier = Number((avgViews / baselineMedian).toFixed(1));
    const percentageOfUploads = Math.round((count / totalCount) * 100);

    return {
      id,
      label,
      rangeText,
      count,
      avgViews,
      medianViews: med,
      avgViewsFormatted: formatViews(avgViews),
      viewMultiplier,
      isWinner: false,
      percentageOfUploads,
    };
  });

  // Pick winner requiring at least 2 videos (prevents single outlier anomaly from winning)
  const eligibleTiers = durationTiers.filter((t) => t.count >= 2);
  const winningDuration = eligibleTiers.length
    ? eligibleTiers.reduce((prev, curr) => (curr.avgViews > prev.avgViews ? curr : prev))
    : null;

  if (winningDuration) {
    winningDuration.isWinner = true;
  }

  // Non-causal, observational description
  const durationInsightText = winningDuration
    ? `${winningDuration.label} (${winningDuration.rangeText}) averaged the highest view count (${winningDuration.viewMultiplier}× channel median) across ${winningDuration.count} uploads. (Observational pattern, not a causal guarantee).`
    : 'Upload durations in this sample are evenly distributed across formats.';

  // ── 2. Title Formulas ──
  const formulaDef: {
    id: TitleFormula['id'];
    label: string;
    badge: string;
    pattern: RegExp;
    patternExample: string;
    accentColor: string;
  }[] = [
    {
      id: 'curiosity',
      label: 'Curiosity Questions',
      badge: 'High Intrigue',
      pattern: /\b(why|how|what|who|where|when|can|is|are|will)\b|\?/i,
      patternExample: 'Why / How / Questions',
      accentColor: '#60A5FA',
    },
    {
      id: 'numbers',
      label: 'Listicles & Numbers',
      badge: 'Structured',
      pattern: /\b\d+\b/i,
      patternExample: 'Top 5 / 10 / Numbers',
      accentColor: '#F59E0B',
    },
    {
      id: 'contrarian',
      label: 'Contrarian Warnings',
      badge: 'Urgency & FOMO',
      pattern: /\b(don't|never|stop|worst|mistake|avoid|lie|truth|failed|terrible|warning)\b/i,
      patternExample: 'Never / Stop / Mistake',
      accentColor: '#EF4444',
    },
    {
      id: 'direct',
      label: 'Direct Authority Statements',
      badge: 'Definitive',
      pattern: /./, // fallback / default
      patternExample: 'Definitive Statements',
      accentColor: '#34D399',
    },
  ];

  const titleFormulas: TitleFormula[] = formulaDef.map(({ id, label, badge, pattern, patternExample, accentColor }) => {
    let matchedVideos: VideoData[] = [];

    if (id === 'direct') {
      matchedVideos = validVideos.filter(
        (v) =>
          !formulaDef[0].pattern.test(v.title) &&
          !formulaDef[1].pattern.test(v.title) &&
          !formulaDef[2].pattern.test(v.title)
      );
    } else {
      matchedVideos = validVideos.filter((v) => pattern.test(v.title));
    }

    const count = matchedVideos.length;
    const wins = matchedVideos.filter((v) => v.views >= baselineMedian).length;
    const winRate = count ? Math.round((wins / count) * 100) : 0;
    const avgViews = count ? Math.round(matchedVideos.reduce((sum, v) => sum + v.views, 0) / count) : 0;
    const avgMultiplier = Number((avgViews / baselineMedian).toFixed(1));
    const sampleTitles = matchedVideos.slice(0, 2).map((v) => v.title);

    return {
      id,
      label,
      badge,
      patternExample,
      count,
      winRate,
      avgMultiplier,
      sampleTitles,
      accentColor,
    };
  });

  const formulasWithVideos = titleFormulas.filter((f) => f.count >= 2);
  const topFormula = formulasWithVideos.length
    ? formulasWithVideos.reduce((prev, curr) => (curr.winRate > prev.winRate ? curr : prev))
    : titleFormulas[0] || null;

  // ── 3. Publishing Days (Only from real, exact timestamps) ──
  const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dayCounts = Array.from({ length: 7 }, () => ({ total: 0, standouts: 0, viewsSum: 0 }));

  validVideos.forEach((v) => {
    const parsed = parsePublishingDate(v.publishedDate);
    if (parsed && !parsed.approximate) {
      const d = new Date(parsed.timestamp);
      const dayIndex = d.getUTCDay();
      dayCounts[dayIndex].total++;
      dayCounts[dayIndex].viewsSum += v.views;
      if (v.views >= baselineMedian) {
        dayCounts[dayIndex].standouts++;
      }
    }
  });

  const hasExactDates = dayCounts.some((d) => d.total > 0);

  const publishingDays: PublishingDayInsight[] = dayCounts.map((item, idx) => {
    const winRate = item.total ? Math.round((item.standouts / item.total) * 100) : 0;
    const meanViews = item.total ? Math.round(item.viewsSum / item.total) : 0;
    const liftMultiplier = Number((meanViews / baselineMedian).toFixed(1));
    return {
      dayName: daysMap[idx],
      shortName: shortDays[idx],
      videoCount: item.total,
      standoutCount: item.standouts,
      winRate,
      meanViews,
      liftMultiplier,
      isPeak: false,
    };
  });

  let peakDayIndex = 0;
  let maxScore = -1;
  if (hasExactDates) {
    publishingDays.forEach((d, idx) => {
      const score = d.videoCount > 0 ? d.liftMultiplier * 10 + d.standoutCount : 0;
      if (score > maxScore) {
        maxScore = score;
        peakDayIndex = idx;
      }
    });

    if (publishingDays[peakDayIndex] && publishingDays[peakDayIndex].videoCount > 0) {
      publishingDays[peakDayIndex].isPeak = true;
    }
  }

  const peakDayObj = hasExactDates && publishingDays[peakDayIndex]?.videoCount > 0 ? publishingDays[peakDayIndex] : null;
  const peakPublishingDay = peakDayObj ? peakDayObj.dayName : 'Unavailable';
  const peakLiftMultiplier = peakDayObj ? peakDayObj.liftMultiplier : 1.0;

  // ── 4. Strategic Performance Signals & Concept Outlines (Real ground truth) ──
  const standouts = validVideos.filter((v) => v.views >= baselineMedian);
  const standoutScore = Math.round((standouts.length / totalCount) * 100);

  const sortedObserved = [...validVideos].sort((a, b) => b.views - a.views);
  const topUpload = sortedObserved[0];
  const secondUpload = sortedObserved[1];

  const observedSignals: string[] = [];
  if (topFormula && topFormula.count >= 2) {
    observedSignals.push(`🔥 ${topFormula.label} (${topFormula.winRate}% win rate)`);
  }
  if (winningDuration) {
    observedSignals.push(`⏱ ${winningDuration.label} (${winningDuration.rangeText})`);
  }
  if (aiAnalysis?.titlePatterns?.useOfNumbers && /\d/.test(aiAnalysis.titlePatterns.useOfNumbers)) {
    observedSignals.push('🔢 Numbered titles present');
  } else {
    observedSignals.push('🎯 High topical clarity');
  }

  const contentDemands: { topic: string; demandLevel: 'High' | 'Very High'; reason: string }[] = [];

  if (topUpload) {
    contentDemands.push({
      topic: `Follow-up to "${topUpload.title.length > 38 ? topUpload.title.slice(0, 36) + '…' : topUpload.title}"`,
      demandLevel: 'Very High',
      reason: `Top upload in sample: ${formatViews(topUpload.views)} views (${(topUpload.views / baselineMedian).toFixed(1)}× median).`,
    });
  }

  if (aiAnalysis?.contentThemes && aiAnalysis.contentThemes.length > 0) {
    const topTheme = aiAnalysis.contentThemes[0];
    contentDemands.push({
      topic: `Deep-Dive Series on "${topTheme.theme}"`,
      demandLevel: 'Very High',
      reason: `Dominant thematic pillar: ${topTheme.percentage}% of categorized sample.`,
    });
  } else if (secondUpload) {
    contentDemands.push({
      topic: `Expansion on "${secondUpload.title.length > 38 ? secondUpload.title.slice(0, 36) + '…' : secondUpload.title}"`,
      demandLevel: 'High',
      reason: `Second standout upload: ${formatViews(secondUpload.views)} views (${(secondUpload.views / baselineMedian).toFixed(1)}× median).`,
    });
  }

  if (aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0) {
    const rec = aiAnalysis.recommendations[0];
    contentDemands.push({
      topic: rec.length > 48 ? rec.slice(0, 46) + '…' : rec,
      demandLevel: 'High',
      reason: 'Empirical experimentation recommendation.',
    });
  }

  return {
    durationTiers,
    winningDuration,
    durationInsightText,
    titleFormulas,
    topFormula,
    publishingDays,
    hasExactDates,
    peakPublishingDay,
    peakLiftMultiplier,
    audiencePulse: {
      sentimentScore: standoutScore,
      observedSignals,
      contentDemands,
    },
  };
}
