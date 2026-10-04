import mkbhd from '../../public/demo/mkbhd.json';
import fireship from '../../public/demo/fireship.json';
import veritasium from '../../public/demo/veritasium.json';
import type { FullAnalysisResponse, VideoData } from '@/types/analysis';
import { normalizeChannelInput } from '@/utils/channel-input';
import { parseDurationToSeconds, formatViews } from '@/utils/format';
import { DataTransformerService } from './data-transformer';
import { aiAnalyzerService } from './ai-analyzer';

// Static allowlist: user input is never interpolated into filesystem paths/imports.
const samples = { mkbhd, fireship, veritasium };
type SampleName = keyof typeof samples;

export function resolveSampleName(raw: string): SampleName | null {
  const input = raw.trim();
  const direct = normalizeChannelInput(input);
  for (const name of Object.keys(samples) as SampleName[]) {
    if (input.toLowerCase() === name || direct?.toLowerCase() === `@${name}` || direct === samples[name].channel.channelId) return name;
  }
  return null;
}

export function buildSampleAnalysis(name: SampleName): FullAnalysisResponse {
  const fixture = samples[name];
  // Fixture dates are explicit; stale relative captions must not contradict them.
  const videos: VideoData[] = fixture.videos.map((video) => {
    const lengthSeconds = parseDurationToSeconds(video.length);
    return { ...video, relativeDate: undefined, viewsFormatted: formatViews(video.views), viewsAvailable: true,
      lengthSeconds, length: lengthSeconds ? video.length : 'Unavailable' };
  });
  const channel = { ...fixture.channel, totalVideosAnalyzed: videos.length };
  const fallback = aiAnalyzerService.generateFallbackAnalysis(channel, videos);
  const fixtureThemes = (fixture as unknown as { aiAnalysis?: { contentThemes?: import('@/types/analysis').ContentTheme[] } }).aiAnalysis?.contentThemes || [];
  const aiAnalysis = {
    ...fallback,
    contentThemes: fixtureThemes.length > 0 ? fixtureThemes : fallback.contentThemes,
  };
  return {
    channel, videos,
    analytics: DataTransformerService.calculateAnalytics(videos), aiAnalysis,
    chartData: {
      viewsDistribution: DataTransformerService.toViewsDistribution(videos),
      publishingTimeline: DataTransformerService.toPublishingTimeline(videos),
      contentThemes: DataTransformerService.toContentThemes(aiAnalysis.contentThemes),
      lengthVsViews: DataTransformerService.toLengthVsViews(videos),
    },
    meta: { dataSource: 'sample', analysisSource: 'computed', generatedAt: new Date().toISOString(),
      notice: 'Illustrative sample fixture, not current or verified YouTube data. Metrics are recomputed only from the supplied sample videos; subscriber counts and dates are fixture values.' },
  };
}
