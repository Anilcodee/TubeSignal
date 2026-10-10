import { NextRequest, NextResponse } from 'next/server';
import { serpApiService } from '@/services/serpapi';
import { aiAnalyzerService } from '@/services/ai-analyzer';
import { cacheService } from '@/services/cache';
import { DataTransformerService } from '@/services/data-transformer';
import { buildSampleAnalysis, resolveSampleName } from '@/services/sample-analysis';
import { readRequestObject, ServiceError } from '@/services/request-guard';
import { isChannelId, normalizeChannelInput } from '@/utils/channel-input';
import type { FullAnalysisResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await readRequestObject(request);
    if (typeof body.channelId !== 'string' || !body.channelId.trim() || body.channelId.length > 512) {
      throw new ServiceError(400, 'A YouTube channel identifier is required for analysis.');
    }
    if (body.isDemo !== undefined && typeof body.isDemo !== 'boolean') {
      throw new ServiceError(400, 'isDemo must be a boolean.');
    }
    if (body.isDemo === true) {
      const sample = resolveSampleName(body.channelId);
      if (sample) {
        return NextResponse.json(buildSampleAnalysis(sample));
      }
      throw new ServiceError(404, 'This sample report is not available. Try the MKBHD, Fireship, or Veritasium sample report.');
    }

    let channelId = normalizeChannelInput(body.channelId);
    if (!channelId && process.env.SERPAPI_API_KEY?.trim()) {
      try {
        const searchRes = await serpApiService.searchChannels(body.channelId);
        const top = searchRes.channel_results?.[0];
        if (top?.handle || top?.channel_id) {
          channelId = top.handle || top.channel_id || null;
        }
      } catch {
        // proceed to validation check below
      }
    }
    if (!channelId) throw new ServiceError(400, 'Enter a YouTube @handle, UC channel ID, or channel URL. Search by name to discover a channel, or choose a sample report.');

    // 1. Cache hit check: Return instantly with 0 SerpApi/AI quota usage
    const fullCacheKey = `full_analysis:v2:${channelId.toLowerCase()}:${Boolean(body.isDemo)}`;
    const cachedAnalysis = cacheService.get<FullAnalysisResponse>(fullCacheKey);
    if (cachedAnalysis) {
      return NextResponse.json(cachedAnalysis);
    }

    if (!process.env.SERPAPI_API_KEY?.trim()) {
      throw new ServiceError(503, 'Live analysis is unavailable because SerpApi is not configured. Try the MKBHD, Fireship, or Veritasium sample report.');
    }
    const raw = await serpApiService.getChannelData(channelId);
    const info = raw.channel_results || raw.channel;
    if (!info || Array.isArray(info) || (!info.title && !info.name)) {
      throw new ServiceError(502, 'YouTube did not return a usable channel profile. Check the identifier and try again, or open a sample report.');
    }
    const videos = DataTransformerService.normalizeVideos(raw.videos_results);
    if (!videos.length) throw new ServiceError(404, 'No public videos were returned for this channel. Try another channel or a sample report.');
    const channel = DataTransformerService.normalizeChannel(channelId, raw, videos.length);
    if (isChannelId(channelId) && channel.channelId !== channelId) {
      throw new ServiceError(502, 'The data provider returned a different channel. Please retry with the channel URL.');
    }
    const { analysis: aiAnalysis, source: analysisSource, notice } = await aiAnalyzerService.analyzeChannel(channel, videos);
    const now = Date.now();
    const response: FullAnalysisResponse = {
      channel, videos, analytics: DataTransformerService.calculateAnalytics(videos, now), aiAnalysis,
      chartData: {
        viewsDistribution: DataTransformerService.toViewsDistribution(videos),
        publishingTimeline: DataTransformerService.toPublishingTimeline(videos, now),
        contentThemes: DataTransformerService.toContentThemes(aiAnalysis.contentThemes),
        lengthVsViews: DataTransformerService.toLengthVsViews(videos),
      },
      meta: {
        dataSource: 'live', analysisSource, generatedAt: new Date(now).toISOString(),
        notice: ['Observed public video sample, not the full channel history. Relative publication dates are approximate; lifetime views do not measure growth.', notice].filter(Boolean).join(' '),
      },
    };
    // Cache the full assembled analysis for 1 hour to preserve API quota across refreshes & comparisons
    cacheService.set(fullCacheKey, response, 60 * 60 * 1000);
    return NextResponse.json(response);
  } catch (error) {
    // Do not expose SDK errors, upstream payloads, or API-key-bearing URLs.
    return NextResponse.json({ error: error instanceof ServiceError ? error.message : 'Analysis is temporarily unavailable. Please retry or open a sample report.' },
      { status: error instanceof ServiceError ? error.statusCode : 500 });
  }
}
