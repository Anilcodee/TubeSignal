import { createHash } from 'node:crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChannelData, VideoData, AIAnalysis } from '@/types/analysis';
import { MASTER_ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from '@/utils/prompts';
import { formatViews } from '@/utils/format';
import { cacheService } from './cache';
import { DataTransformerService } from './data-transformer';
import { geminiQuota } from './request-guard';

export interface AnalysisResult { analysis: AIAnalysis; source: 'gemini' | 'computed'; notice?: string }
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const string = (value: unknown, max = 1000): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 12 && value.every((item) => string(item, 600));
const exactKeys = (value: Record<string, unknown>, keys: string[]): boolean => Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));

/** Validate every nested field, then require measured fields to match server observations. */
export function validateAIAnalysis(value: unknown, baseline: AIAnalysis): AIAnalysis | null {
  if (!isObject(value) || !exactKeys(value, ['summary', 'contentThemes', 'titlePatterns', 'publishingStrategy', 'performanceInsights', 'recommendations'])) return null;
  if (!string(value.summary, 2000) || !strings(value.recommendations) || value.recommendations.length < 1 || value.recommendations.length > 8) return null;
  let validatedThemes: import('@/types/analysis').ContentTheme[] = baseline.contentThemes;
  if (!Array.isArray(value.contentThemes)) return null;
  if (value.contentThemes.length > 0) {
    for (const t of value.contentThemes) {
      if (!isObject(t) || !string(t.theme, 80) || typeof t.percentage !== 'number' || !Number.isFinite(t.percentage) || t.percentage < 0 || t.percentage > 100) {
        return null;
      }
      if (t.videoCount !== undefined && (typeof t.videoCount !== 'number' || !Number.isFinite(t.videoCount) || t.videoCount < 0)) {
        return null;
      }
    }
    validatedThemes = value.contentThemes.map((t) => ({
      theme: (t.theme as string).trim(),
      percentage: Math.round(t.percentage as number),
      videoCount: typeof t.videoCount === 'number' && Number.isFinite(t.videoCount) && t.videoCount > 0
        ? Math.round(t.videoCount)
        : Math.max(1, Math.round(((t.percentage as number) / 100) * (baseline.contentThemes[0]?.videoCount ? 20 : 10))),
    }));
  }
  const titles = value.titlePatterns;
  if (!isObject(titles) || !exactKeys(titles, ['avgLength', 'commonPatterns', 'emotionalTriggers', 'useOfNumbers'])
    || typeof titles.avgLength !== 'number' || !Number.isFinite(titles.avgLength) || titles.avgLength < 0 || titles.avgLength > 500
    || !strings(titles.commonPatterns) || !strings(titles.emotionalTriggers) || !string(titles.useOfNumbers)) return null;
  const publishing = value.publishingStrategy;
  if (!isObject(publishing) || !exactKeys(publishing, ['frequency', 'peakDays', 'consistency', 'seasonalPatterns'])
    || !string(publishing.frequency) || !strings(publishing.peakDays) || !string(publishing.consistency) || !string(publishing.seasonalPatterns)) return null;
  const performance = value.performanceInsights;
  if (!isObject(performance) || !exactKeys(performance, ['topPerformingTraits', 'underperformingTraits', 'viralFactors'])
    || !strings(performance.topPerformingTraits) || !strings(performance.underperformingTraits) || !strings(performance.viralFactors)) return null;
  // Compare individual fields, not JSON property order. These are data, not model opinions.
  for (const [actual, expected] of [[titles, baseline.titlePatterns], [publishing, baseline.publishingStrategy], [performance, baseline.performanceInsights]] as const) {
    for (const [key, expectedValue] of Object.entries(expected)) {
      if (JSON.stringify(actual[key]) !== JSON.stringify(expectedValue)) return null;
    }
  }
  const narrative = [value.summary, ...value.recommendations].join(' ');
  // Guard against fabricated claims, external links, or metric promises
  if (/https?:\/\/|guaranteed|proven to|retention rate|click.through rate|\bCTR\b|algorithm favors/i.test(narrative)) return null;
  return { ...baseline, summary: value.summary.trim(), contentThemes: validatedThemes, recommendations: value.recommendations.map((item) => item.trim()) };
}

export class AIAnalyzerService {
  private pending = new Map<string, Promise<AnalysisResult>>();

  public async analyzeChannel(channel: ChannelData, videos: VideoData[]): Promise<AnalysisResult> {
    const baseline = this.generateFallbackAnalysis(channel, videos);
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return { analysis: baseline, source: 'computed', notice: 'Gemini is not configured; this report uses a computed observational summary.' };
    const modelName = process.env.GEMINI_MODEL?.trim() || 'gemini-1.5-flash';
    // A count-only key could silently reuse an analysis for completely different videos.
    const fingerprint = createHash('sha256').update(JSON.stringify({ modelName, channel, videos, baseline })).digest('hex');
    const cacheKey = `ai:v2:${fingerprint}`;
    const cached = cacheService.get<AnalysisResult>(cacheKey);
    if (cached) return cached;
    const existing = this.pending.get(cacheKey);
    if (existing) return existing;
    let release: (() => void) | undefined;
    try { release = geminiQuota.acquire(); } catch {
      return { analysis: baseline, source: 'computed', notice: 'AI request limit reached; the observed data is summarized without Gemini.' };
    }
    const promise = (async (): Promise<AnalysisResult> => {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: 'application/json' },
          systemInstruction: MASTER_ANALYSIS_SYSTEM_PROMPT,
        });
        const prompt = buildAnalysisUserPrompt(channel.name, channel.subscribers, videos.map((video) => ({
          title: video.title, views: DataTransformerService.hasViews(video) ? video.views : null,
          publishedDate: video.publishedDate, length: video.length,
        })), baseline);
        const result = await model.generateContent(prompt, { timeout: 18_000 });
        const response = result.response.text();
        if (response.length > 30_000) throw new Error('Oversized AI response');
        const parsed: unknown = JSON.parse(response.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
        const analysis = validateAIAnalysis(parsed, baseline);
        if (!analysis) throw new Error('Invalid AI response');
        const output: AnalysisResult = { analysis, source: 'gemini' };
        cacheService.set(cacheKey, output);
        return output;
      } catch {
        // SDK errors can include full URLs or provider payloads. Never log/return them.
        const output: AnalysisResult = { analysis: baseline, source: 'computed', notice: 'Gemini was unavailable or its response could not be validated; this report uses computed observations.' };
        cacheService.set(cacheKey, output, 60_000);
        return output;
      } finally {
        release?.();
        this.pending.delete(cacheKey);
      }
    })();
    this.pending.set(cacheKey, promise);
    return promise;
  }

  public generateFallbackAnalysis(channel: ChannelData, videos: VideoData[]): AIAnalysis {
    const analytics = DataTransformerService.calculateAnalytics(videos);
    const titles = videos.map((video) => video.title);
    const avgLength = titles.length ? Math.round(titles.reduce((sum, title) => sum + title.length, 0) / titles.length) : 0;
    const numbered = titles.filter((title) => /\d/.test(title)).length;
    const questions = titles.filter((title) => title.includes('?')).length;
    const colonTitles = titles.filter((title) => title.includes(':')).length;
    const observed = videos.filter(DataTransformerService.hasViews).sort((a, b) => b.views - a.views);
    const top = observed[0];
    const summary = `${channel.name}: this report covers ${videos.length} supplied videos, not the full channel history. `
      + (observed.length ? `${observed.length} have view counts, averaging ${analytics.avgViewsFormatted} views with a median of ${formatViews(analytics.medianViews)}. ` : 'View counts are unavailable. ')
    const clusters: { theme: string; pattern: RegExp }[] = [
      { theme: 'Reviews & Hands-On', pattern: /\b(review|hands.on|unboxing|first look|tested|impressions)\b/i },
      { theme: 'Comparisons & Versus', pattern: /\b(vs|versus|compared|better than|difference|which is)\b/i },
      { theme: 'Guides & Explainers', pattern: /\b(how to|guide|tutorial|explained|tips|tricks|steps)\b/i },
      { theme: 'Analysis & Deep Dives', pattern: /\b(why|truth|future of|history|rise|fall|secret|problem with)\b/i },
    ];
    const rawThemes = clusters.map(({ theme, pattern }) => {
      const matching = titles.filter((t) => pattern.test(t));
      return {
        theme,
        videoCount: matching.length,
        percentage: titles.length ? Math.round((matching.length / titles.length) * 100) : 0,
      };
    }).filter((t) => t.videoCount > 0);

    const categorized = rawThemes.reduce((sum, t) => sum + t.videoCount, 0);
    const otherCount = Math.max(0, titles.length - categorized);
    if (rawThemes.length > 0 && otherCount > 0) {
      rawThemes.push({
        theme: 'General Channel Topics',
        videoCount: otherCount,
        percentage: titles.length ? Math.round((otherCount / titles.length) * 100) : 0,
      });
    }
    const contentThemes = rawThemes.length > 0 ? rawThemes : [
      { theme: 'General Channel Topics', percentage: 100, videoCount: titles.length || 1 }
    ];

    return {
      summary, contentThemes,
      titlePatterns: {
        avgLength,
        commonPatterns: [questions ? `${questions} of ${titles.length} titles contain a question mark` : '', colonTitles ? `${colonTitles} of ${titles.length} titles contain a colon` : ''].filter(Boolean),
        emotionalTriggers: [],
        useOfNumbers: `${numbered} of ${titles.length} titles contain digits${titles.length ? ` (${Math.round(numbered / titles.length * 100)}%)` : ''}; this does not measure title effectiveness.`,
      },
      publishingStrategy: {
        frequency: analytics.publishingFrequency,
        peakDays: [],
        consistency: 'Unavailable: a partial catalog cannot establish a complete publishing schedule.',
        seasonalPatterns: 'Unavailable: no complete multi-season publishing history was supplied.',
      },
      performanceInsights: {
        topPerformingTraits: top ? [`Highest observed view count: “${top.title}” (${formatViews(top.views)} views). This is a ranking, not evidence of a causal trait.`] : [],
        underperformingTraits: [], viralFactors: [],
      },
      recommendations: [
        top ? `Review “${top.title}” as a possible follow-up experiment; its view count alone cannot establish the cause of performance.` : 'Collect public view counts before comparing video performance.',
        'Compare videos at the same age after publication before making performance comparisons.',
        analytics.publishingFrequency === 'Unavailable' ? 'Collect reliable publication dates before assessing upload cadence.' : 'Check the complete upload history before changing a publishing schedule based on this partial sample.',
      ],
    };
  }
}

export const aiAnalyzerService = new AIAnalyzerService();
