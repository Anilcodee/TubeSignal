import { useEffect, useState } from 'react';
import type { FullAnalysisResponse } from '@/types/analysis';

interface AnalysisResult {
  key: string;
  data: FullAnalysisResponse | null;
  error: string | null;
}

export function useAnalysis(channelId: string, isDemo = false) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const key = JSON.stringify([channelId, isDemo, attempt]);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timeout = setTimeout(() => controller.abort(), 65000);
    const load = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId, isDemo }), signal: controller.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Analysis is unavailable. Please try again.');
        if (!disposed) setResult({ key, data: body as FullAnalysisResponse, error: null });
      } catch (error) {
        if (!disposed) setResult({ key, data: null, error: controller.signal.aborted ? 'Analysis took too long. Try again, or explore a sample report.' : error instanceof Error ? error.message : 'Unable to load this report.' });
      } finally { clearTimeout(timeout); }
    };
    void load();
    return () => { disposed = true; clearTimeout(timeout); controller.abort(); };
  }, [channelId, isDemo, key]);

  const current = result?.key === key ? result : null;
  return { data: current?.data ?? null, error: current?.error ?? null, isLoading: !current, refetch: () => setAttempt((value) => value + 1) };
}
