import { NextRequest, NextResponse } from 'next/server';
import { serpApiService } from '@/services/serpapi';
import { aiAnalyzerService } from '@/services/ai-analyzer';
import { DataTransformerService } from '@/services/data-transformer';
import { FullAnalysisResponse } from '@/types/analysis';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelId, isDemo } = body;

    if (!channelId || typeof channelId !== 'string') {
      return NextResponse.json(
        { error: 'channelId is required for analysis' },
        { status: 400 }
      );
    }

    const cleanId = channelId.toLowerCase().replace(/^@/, '').trim();

    // Check if pre-cached demo file exists for this channel
    const demoFilePath = path.join(process.cwd(), 'public', 'demo', `${cleanId}.json`);
    if (isDemo || !process.env.SERPAPI_API_KEY) {
      if (fs.existsSync(demoFilePath)) {
        const demoContent = fs.readFileSync(demoFilePath, 'utf-8');
        const demoData = JSON.parse(demoContent) as FullAnalysisResponse;
        return NextResponse.json(demoData);
      }
      // If demo requested for mkbhd or fireship fallback
      if (cleanId.includes('mkbhd') || cleanId.includes('marques')) {
        const fallbackPath = path.join(process.cwd(), 'public', 'demo', 'mkbhd.json');
        if (fs.existsSync(fallbackPath)) {
          return NextResponse.json(JSON.parse(fs.readFileSync(fallbackPath, 'utf-8')));
        }
      }
      if (cleanId.includes('fireship')) {
        const fallbackPath = path.join(process.cwd(), 'public', 'demo', 'fireship.json');
        if (fs.existsSync(fallbackPath)) {
          return NextResponse.json(JSON.parse(fs.readFileSync(fallbackPath, 'utf-8')));
        }
      }
    }

    // Live SerpApi Pipeline
    if (process.env.SERPAPI_API_KEY) {
      // 1. Fetch channel data & catalog
      const channelRaw = await serpApiService.getChannelData(cleanId);
      const rawVideos = channelRaw.videos_results || [];

      // 2. Transform & normalize
      const videos = DataTransformerService.normalizeVideos(rawVideos);
      const channel = DataTransformerService.normalizeChannel(cleanId, channelRaw, videos.length);
      const analytics = DataTransformerService.calculateAnalytics(videos);

      // 3. AI Content Strategy Analysis
      const aiAnalysis = await aiAnalyzerService.analyzeChannel(channel, videos);

      // 4. Assemble Chart Datasets
      const chartData = {
        viewsDistribution: DataTransformerService.toViewsDistribution(videos),
        publishingTimeline: DataTransformerService.toPublishingTimeline(videos),
        contentThemes: DataTransformerService.toContentThemes(aiAnalysis.contentThemes),
        lengthVsViews: DataTransformerService.toLengthVsViews(videos),
      };

      const fullResponse: FullAnalysisResponse = {
        channel,
        videos,
        analytics,
        aiAnalysis,
        chartData,
      };

      return NextResponse.json(fullResponse);
    }

    // Default fallback if no keys configured and no specific demo match
    const fallbackPath = path.join(process.cwd(), 'public', 'demo', 'mkbhd.json');
    if (fs.existsSync(fallbackPath)) {
      const demoData = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8')) as FullAnalysisResponse;
      demoData.channel.name = cleanId.toUpperCase();
      demoData.channel.handle = `@${cleanId}`;
      return NextResponse.json(demoData);
    }

    return NextResponse.json(
      { error: 'Unable to analyze channel. Please provide API keys or use Demo Mode.' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[API /analyze]', error);
    return NextResponse.json(
      { error: 'An error occurred during channel analysis pipeline.' },
      { status: 500 }
    );
  }
}
