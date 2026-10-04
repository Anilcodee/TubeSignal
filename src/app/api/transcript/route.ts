import { NextRequest, NextResponse } from 'next/server';
import { serpApiService } from '@/services/serpapi';
import { cacheService } from '@/services/cache';
import { readRequestObject, ServiceError } from '@/services/request-guard';
import { analyzeTranscript, type HookAnalysis } from '@/utils/transcript-analyzer';
import type { SerpApiTranscriptSegment } from '@/types/serpapi';

const IPHONE_16_TRANSCRIPT: SerpApiTranscriptSegment[] = [
  { start_ms: 0, snippet: "So Apple added a brand new camera control button to the iPhone 16 Pro.", start_time_text: "0:00" },
  { start_ms: 4500, snippet: "And after two full weeks of testing, I have some complicated feelings about it.", start_time_text: "0:04" },
  { start_ms: 9200, snippet: "Because on paper, this should be the ultimate tool for mobile photography.", start_time_text: "0:09" },
  { start_ms: 14000, snippet: "A physical two-stage shutter, capacitive touch swiping, and instant lens switching.", start_time_text: "0:14" },
  { start_ms: 20500, snippet: "But in actual daily use? It completely changes how you hold the phone.", start_time_text: "0:20" },
  { start_ms: 26000, snippet: "Let me show you the three things Apple didn't tell you on stage.", start_time_text: "0:26" },
  { start_ms: 33000, snippet: "First, let's talk about ergonomics and muscle memory...", start_time_text: "0:33" },
  { start_ms: 41000, snippet: "When you hold the phone in landscape, your index finger naturally rests right here...", start_time_text: "0:41" },
];

const PIXEL_9_TRANSCRIPT: SerpApiTranscriptSegment[] = [
  { start_ms: 0, snippet: "This is the Google Pixel 9 Pro. And Google finally stopped making excuses.", start_time_text: "0:00" },
  { start_ms: 5000, snippet: "For years, Pixel phones were the quirky underdogs with amazing cameras but middling hardware.", start_time_text: "0:05" },
  { start_ms: 11000, snippet: "Battery life was inconsistent. The fingerprint reader was slow. Tensor ran hot.", start_time_text: "0:11" },
  { start_ms: 17000, snippet: "With the Pixel 9 series, Google completely threw out that playbook.", start_time_text: "0:17" },
  { start_ms: 23000, snippet: "The build quality now rivals the best hardware Apple has ever shipped.", start_time_text: "0:23" },
  { start_ms: 29500, snippet: "So is this actually the best Android flagship of the year? Let's break down the truth.", start_time_text: "0:29" },
  { start_ms: 38000, snippet: "Let's start with the display, because this 3000-nit panel is absurd...", start_time_text: "0:38" },
];

const SAMPLE_TRANSCRIPTS: Record<string, SerpApiTranscriptSegment[]> = {
  'iphone-16-pro': IPHONE_16_TRANSCRIPT,
  'bLqLh2uWq7M': IPHONE_16_TRANSCRIPT,
  'pixel-9-pro': PIXEL_9_TRANSCRIPT,
  'Z-P0iZ17Y5s': PIXEL_9_TRANSCRIPT,
  '5C_HPTJg5ek': [
    { start_ms: 0, snippet: "Rust. A blazingly fast, memory-efficient programming language designed to replace C and C++.", start_time_text: "0:00" },
    { start_ms: 4800, snippet: "It was created by Graydon Hoare at Mozilla and has been voted the most loved language for nine years straight.", start_time_text: "0:04" },
    { start_ms: 10500, snippet: "Why is it so popular? Because it solves the single biggest nightmare in software: memory safety bugs without using a garbage collector.", start_time_text: "0:10" },
    { start_ms: 18200, snippet: "Normally, languages like C give you raw power but let you shoot yourself in the foot with null pointer dereferences.", start_time_text: "0:18" },
    { start_ms: 25400, snippet: "Languages like Python or JavaScript keep you safe, but sacrifice raw performance to run a runtime garbage collector.", start_time_text: "0:25" },
    { start_ms: 32900, snippet: "Rust introduces an entirely new paradigm: the borrow checker.", start_time_text: "0:32" },
    { start_ms: 38500, snippet: "Every single piece of data in Rust has an owner, and rules are enforced at compile time.", start_time_text: "0:38" },
  ],
  'G3e-cpL7ofc': [
    { start_ms: 0, snippet: "Is this actually the end of Visual Studio Code? The AI editor revolution is moving faster than anyone expected.", start_time_text: "0:00" },
    { start_ms: 5500, snippet: "For almost a decade, VS Code was the undisputed king with over 70% developer market share.", start_time_text: "0:05" },
    { start_ms: 11800, snippet: "Then tools like Cursor, Windsurf, and Claude Engineer appeared, and suddenly developers started ditching the defaults.", start_time_text: "0:11" },
    { start_ms: 19200, snippet: "Instead of tab-completion autocomplete, we're talking about full codebase indexing, multi-file agentic diffs, and terminal execution.", start_time_text: "0:19" },
    { start_ms: 28000, snippet: "Today we are testing all of them on a real production repo to see if the hype actually holds up.", start_time_text: "0:28" },
    { start_ms: 36000, snippet: "Let's start with the benchmark test...", start_time_text: "0:36" },
  ],
  'SqcY0GlETPk': [
    { start_ms: 0, snippet: "Why is everyone in the JavaScript community suddenly furious at React and Next.js?", start_time_text: "0:00" },
    { start_ms: 5000, snippet: "For years, React was the safe default. But React 19 and Server Components brought massive architectural disruption.", start_time_text: "0:05" },
    { start_ms: 12500, snippet: "Developers are complaining about confusing mental models, server action leaking credentials, and vendor lock-in.", start_time_text: "0:12" },
    { start_ms: 20000, snippet: "Meanwhile frameworks like Svelte 5 and Astro are gaining crazy momentum.", start_time_text: "0:20" },
    { start_ms: 26500, snippet: "Let's unpack what actually went wrong and whether the outrage is justified.", start_time_text: "0:26" },
    { start_ms: 34000, snippet: "Here is the exact timeline of events...", start_time_text: "0:34" },
  ],
  '9pT5vVb9V7Q': [
    { start_ms: 0, snippet: "This silicon ball is the roundest object in the world.", start_time_text: "0:00" },
    { start_ms: 3800, snippet: "If you scaled it up to the size of the Earth, the highest peak and deepest trench would differ by only 14 meters.", start_time_text: "0:03" },
    { start_ms: 11200, snippet: "It cost over three million dollars to manufacture, and scientists made it to redefine the kilogram.", start_time_text: "0:11" },
    { start_ms: 18500, snippet: "Yet despite all our modern technology, it is physically impossible to make a truly perfect sphere.", start_time_text: "0:18" },
    { start_ms: 26000, snippet: "To understand why, we have to look down at the level of individual atoms and quantum thermodynamics.", start_time_text: "0:26" },
    { start_ms: 34500, snippet: "Let's begin in 1795 with the French Revolution...", start_time_text: "0:34" },
  ],
  'IV3dnLzthDA': [
    { start_ms: 0, snippet: "This single inventor had more impact on Earth's atmosphere than any other single organism in history.", start_time_text: "0:00" },
    { start_ms: 6000, snippet: "His name was Thomas Midgley Jr., and his creations led to millions of premature deaths worldwide.", start_time_text: "0:06" },
    { start_ms: 13000, snippet: "First, he solved engine knocking by adding lead to gasoline, knowing full well it was poisonous.", start_time_text: "0:13" },
    { start_ms: 20500, snippet: "Then to fix hazardous refrigerators, he invented chlorofluorocarbons, which punched a hole straight through the ozone layer.", start_time_text: "0:20" },
    { start_ms: 29000, snippet: "How did one brilliant chemical engineer manage to cause two global environmental catastrophes?", start_time_text: "0:29" },
    { start_ms: 37000, snippet: "The story begins in Dayton, Ohio in 1916...", start_time_text: "0:37" },
  ],
  'Uj3_KqkI9Zo': [
    { start_ms: 0, snippet: "Twenty-six words written in 1996 created the entire modern internet as we know it today.", start_time_text: "0:00" },
    { start_ms: 6000, snippet: "Without this single sentence, platforms like YouTube, Google, Wikipedia, and Reddit could not legally exist.", start_time_text: "0:06" },
    { start_ms: 13500, snippet: "It is called Section 230 of the Communications Decency Act.", start_time_text: "0:13" },
    { start_ms: 19000, snippet: "It protected website creators from being sued for what their users posted.", start_time_text: "0:19" },
    { start_ms: 25000, snippet: "But today, critics from all sides claim it broke our society, spread misinformation, and created unchecked tech monopolies.", start_time_text: "0:25" },
    { start_ms: 34000, snippet: "So how did a tiny compromise in 1996 build a trillion-dollar industry? Let's trace the origin...", start_time_text: "0:34" },
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
