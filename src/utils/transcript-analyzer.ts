import type { SerpApiTranscriptSegment } from '@/types/serpapi';

export interface HookAnalysis {
  hookText: string;
  hookDurationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  hookArchetype: 'Curiosity Question' | 'Bold Statement / Contrarian' | 'High-Stakes Narrative' | 'Problem & Warning' | 'Direct Demonstration';
  archetypeDescription: string;
  powerWords: string[];
  audienceAddresses: number;
  questionCount: number;
  fullTranscriptText: string;
  segments: {
    startMs: number;
    timestampText: string;
    text: string;
  }[];
}

const POWER_WORD_LIST = new Set([
  'secret', 'crazy', 'insane', 'shocking', 'truth', 'exposed', 'never', 'always',
  'worst', 'best', 'impossible', 'huge', 'massive', 'free', 'warning', 'danger',
  'actually', 'finally', 'nobody', 'everyone', 'mistake', 'destroy', 'unbelievable',
  'hidden', 'million', 'billion', 'simple', 'fast', 'easy', 'hack', 'guaranteed',
]);

export function analyzeTranscript(segments: SerpApiTranscriptSegment[]): HookAnalysis {
  if (!segments || segments.length === 0) {
    return {
      hookText: 'No spoken transcript available for this video.',
      hookDurationSeconds: 0,
      wordCount: 0,
      wordsPerMinute: 0,
      hookArchetype: 'Direct Demonstration',
      archetypeDescription: 'Visual or non-verbal opening demonstration.',
      powerWords: [],
      audienceAddresses: 0,
      questionCount: 0,
      fullTranscriptText: '',
      segments: [],
    };
  }

  const cleanSegments = segments.map((seg) => ({
    startMs: seg.start_ms ?? 0,
    timestampText: seg.start_time_text ?? '0:00',
    text: (seg.snippet ?? '').trim(),
  })).filter((s) => s.text.length > 0);

  // Opening hook: first 40 seconds (or first 3 segments if none exceed 40s)
  const hookSegments = cleanSegments.filter((s) => s.startMs <= 40_000);
  const effectiveHookSegments = hookSegments.length > 0 ? hookSegments : cleanSegments.slice(0, 3);

  const hookText = effectiveHookSegments.map((s) => s.text).join(' ');
  const fullTranscriptText = cleanSegments.map((s) => s.text).join(' ');

  // Word count & pacing
  const words = hookText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lastHookSegment = effectiveHookSegments[effectiveHookSegments.length - 1];
  const hookDurationSeconds = Math.max(10, Math.round((lastHookSegment?.startMs ?? 30_000) / 1000));
  const wordsPerMinute = Math.round((wordCount / (hookDurationSeconds / 60))) || 140;

  // Power words detection
  const detectedPowerWords = Array.from(new Set(
    words
      .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter((w) => POWER_WORD_LIST.has(w))
  ));

  // Audience address
  const audienceMatches = hookText.match(/\b(you|your|you're|we|us|our|everyone)\b/gi) || [];
  const audienceAddresses = audienceMatches.length;

  // Question count
  const questionCount = (hookText.match(/\?/g) || []).length;

  // Determine Archetype
  let hookArchetype: HookAnalysis['hookArchetype'] = 'High-Stakes Narrative';
  let archetypeDescription = 'Opens with immersive storytelling to immediately establish personal context and momentum.';

  if (questionCount > 0 || /\b(why|how|what if|could you|did you know|have you ever)\b/i.test(hookText)) {
    hookArchetype = 'Curiosity Question';
    archetypeDescription = 'Hooks viewer psychology with an open loop or direct question that demands resolution.';
  } else if (/\b(warning|danger|mistake|stop|worst|ruining|broke|fail)\b/i.test(hookText)) {
    hookArchetype = 'Problem & Warning';
    archetypeDescription = 'Leverages loss aversion and urgency by framing an immediate risk or critical pitfall.';
  } else if (/\b(never|impossible|secret|truth|actually|myth|nobody|insane)\b/i.test(hookText)) {
    hookArchetype = 'Bold Statement / Contrarian';
    archetypeDescription = 'Challenges conventional wisdom with a provocative claim that commands full attention.';
  } else if (/\b(i built|i spent|today|this is|i tested|we went)\b/i.test(hookText)) {
    hookArchetype = 'High-Stakes Narrative';
    archetypeDescription = 'Leaps directly into high-intensity action without preamble or channel intros.';
  }

  return {
    hookText,
    hookDurationSeconds,
    wordCount,
    wordsPerMinute,
    hookArchetype,
    archetypeDescription,
    powerWords: detectedPowerWords,
    audienceAddresses,
    questionCount,
    fullTranscriptText,
    segments: cleanSegments,
  };
}
