import { NextRequest, NextResponse } from 'next/server';
import { serpApiService } from '@/services/serpapi';
import { cacheService } from '@/services/cache';
import { readRequestObject, ServiceError } from '@/services/request-guard';
import { analyzeTranscript, type HookAnalysis } from '@/utils/transcript-analyzer';
import type { SerpApiTranscriptSegment } from '@/types/serpapi';

const SAMPLE_TRANSCRIPTS: Record<string, SerpApiTranscriptSegment[]> = {
  'iphone-16-pro': [
    { start_ms: 0, snippet: "So Apple added a brand new camera control button to the iPhone 16 Pro.", start_time_text: "0:00" },
    { start_ms: 4500, snippet: "And after two full weeks of testing, I have some complicated feelings about it.", start_time_text: "0:04" },
    { start_ms: 9200, snippet: "Because on paper, this should be the ultimate tool for mobile photography.", start_time_text: "0:09" },
    { start_ms: 14000, snippet: "A physical two-stage shutter, capacitive touch swiping, and instant lens switching.", start_time_text: "0:14" },
    { start_ms: 20500, snippet: "But in actual daily use? It completely changes how you hold the phone.", start_time_text: "0:20" },
    { start_ms: 26000, snippet: "Let me show you the three things Apple didn't tell you on stage.", start_time_text: "0:26" },
    { start_ms: 33000, snippet: "First, let's talk about ergonomics and muscle memory...", start_time_text: "0:33" },
    { start_ms: 41000, snippet: "When you hold the phone in landscape, your index finger naturally rests right here...", start_time_text: "0:41" },
  ],
  'pixel-9-pro': [
    { start_ms: 0, snippet: "This is the Google Pixel 9 Pro. And Google finally stopped making excuses.", start_time_text: "0:00" },
    { start_ms: 5000, snippet: "For years, Pixel phones were the quirky underdogs with amazing cameras but middling hardware.", start_time_text: "0:05" },
    { start_ms: 11000, snippet: "Battery life was inconsistent. The fingerprint reader was slow. Tensor ran hot.", start_time_text: "0:11" },
    { start_ms: 17000, snippet: "With the Pixel 9 series, Google completely threw out that playbook.", start_time_text: "0:17" },
    { start_ms: 23000, snippet: "The build quality now rivals the best hardware Apple has ever shipped.", start_time_text: "0:23" },
    { start_ms: 29500, snippet: "So is this actually the best Android flagship of the year? Let's break down the truth.", start_time_text: "0:29" },
    { start_ms: 38000, snippet: "Let's start with the display, because this 3000-nit panel is absurd...", start_time_text: "0:38" },
  ],
  default: [
    { start_ms: 0, snippet: "This is the single most important decision any creator makes before clicking upload.", start_time_text: "0:00" },
    { start_ms: 4500, snippet: "And almost everyone is getting it completely wrong. Let me show you why.", start_time_text: "0:04" },
    { start_ms: 9000, snippet: "Over the last six months, we tracked over 100 million views across top tech channels.", start_time_text: "0:09" },
    { start_ms: 14500, snippet: "And what we discovered was a massive shift in how YouTube actually recommends videos to new viewers.", start_time_text: "0:14" },
    { start_ms: 21000, snippet: "It's not about click-through rate anymore. It's about opening momentum.", start_time_text: "0:21" },
    { start_ms: 27000, snippet: "In the next ten minutes, I'm breaking down the exact 3-step formula you can steal today.", start_time_text: "0:27" },
    { start_ms: 34000, snippet: "So grab a coffee, because step number one changes everything.", start_time_text: "0:34" },
    { start_ms: 42000, snippet: "Here's what happened when we ran our first test...", start_time_text: "0:42" },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await readRequestObject(request);
    let videoId = typeof body.videoId === 'string' ? body.videoId.trim() : '';
    const isDemo = Boolean(body.isDemo);

    // Extract ID from full URL if passed
    const urlMatch = videoId.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (urlMatch) {
      videoId = urlMatch[1];
    }

    if (!videoId) {
      throw new ServiceError(400, 'A valid YouTube video ID or link is required.');
    }

    const cacheKey = `transcript:${videoId}`;
    const cached = cacheService.get<{ segments: SerpApiTranscriptSegment[]; analysis: HookAnalysis }>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, ...cached, source: 'cache' });
    }

    // Demo fallback or if SerpApi key isn't provided
    if (isDemo || !process.env.SERPAPI_API_KEY?.trim()) {
      const segments = SAMPLE_TRANSCRIPTS[videoId] || SAMPLE_TRANSCRIPTS.default;
      const analysis = analyzeTranscript(segments);
      return NextResponse.json({
        success: true,
        segments,
        analysis,
        source: 'sample',
        notice: 'Sample demonstration transcript and hook breakdown.',
      });
    }

    try {
      const response = await serpApiService.getVideoTranscript(videoId);
      const segments = Array.isArray(response.transcript) ? response.transcript : [];

      if (segments.length === 0) {
        // Return structured fallback if video has no captions
        return NextResponse.json({
          success: false,
          error: 'No public captions or transcript available for this video.',
          segments: [],
          analysis: analyzeTranscript([]),
        }, { status: 404 });
      }

      const analysis = analyzeTranscript(segments);
      const result = { segments, analysis };
      cacheService.set(cacheKey, result, 24 * 60 * 60 * 1000); // 24 hours cache

      return NextResponse.json({
        success: true,
        ...result,
        source: 'serpapi',
      });
    } catch (apiError) {
      // If SerpApi couldn't find transcripts for this video (e.g. no CC on video)
      return NextResponse.json({
        success: false,
        error: apiError instanceof Error ? apiError.message : 'Transcript not available for this upload.',
        segments: [],
        analysis: analyzeTranscript([]),
      }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof ServiceError ? error.message : 'Unable to retrieve transcript.',
    }, { status: error instanceof ServiceError ? error.statusCode : 500 });
  }
}
