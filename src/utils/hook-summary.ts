import type { HookAnalysis } from './transcript-analyzer';
import type { HookSummary } from '@/types/analysis';

export function summarizeHooks(analyses: HookAnalysis[]): HookSummary | null {
  const valid = analyses.filter((analysis) => analysis.wordCount > 0);
  if (!valid.length) return null;

  const counts = new Map<string, number>();
  valid.forEach((analysis) => counts.set(analysis.hookArchetype, (counts.get(analysis.hookArchetype) || 0) + 1));
  const dominantArchetype = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unavailable';

  return {
    sampledVideoCount: valid.length,
    dominantArchetype,
    averageWordsPerMinute: Math.round(valid.reduce((sum, analysis) => sum + analysis.wordsPerMinute, 0) / valid.length),
    averageHookDurationSeconds: Math.round(valid.reduce((sum, analysis) => sum + analysis.hookDurationSeconds, 0) / valid.length),
    questionRate: Math.round((valid.filter((analysis) => analysis.questionCount > 0).length / valid.length) * 100),
    directAddressRate: Math.round((valid.filter((analysis) => analysis.audienceAddresses > 0).length / valid.length) * 100),
  };
}
