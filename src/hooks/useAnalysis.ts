import { useEffect, useState } from 'react';
import type { FullAnalysisResponse } from '@/types/analysis';

interface AnalysisResult {
  key: string;
  data: FullAnalysisResponse | null;
  error: string | null;
}

const memoryCache = new Map<string, FullAnalysisResponse>();

export function getClientCachedAnalysis(channelId: string, isDemo = false): FullAnalysisResponse | null {
  const normId = channelId.toLowerCase().trim().replace(/^@/, '');
  const key = `tubesignal_analysis:${normId}:${isDemo}`;
  const fromMem = memoryCache.get(key);
  if (fromMem) return fromMem;
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as FullAnalysisResponse;
        memoryCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // Ignore storage errors (private mode, quota, etc.)
    }
  }
  return null;
}

export function setClientCachedAnalysis(channelId: string, isDemo = false, data: FullAnalysisResponse): void {
  const normId = channelId.toLowerCase().trim().replace(/^@/, '');
  const key = `tubesignal_analysis:${normId}:${isDemo}`;
  memoryCache.set(key, data);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }
}

export function useAnalysis(channelId: string, isDemo = false) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const key = JSON.stringify([channelId, isDemo, attempt]);

  useEffect(() => {
    let disposed = false;

    // On mount or channel switch, check client cache first if not a forced refetch
    if (attempt === 0) {
      const cached = getClientCachedAnalysis(channelId, isDemo);
      if (cached) {
        queueMicrotask(() => {
          if (!disposed) {
            setResult({
              key,
              data: cached,
              error: null,
            });
          }
        });
        return;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 65000);
    const load = async () => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId, isDemo }),
          signal: controller.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Analysis is unavailable. Please try again.');
        const fullData = body as FullAnalysisResponse;
        setClientCachedAnalysis(channelId, isDemo, fullData);
        if (!disposed) setResult({ key, data: fullData, error: null });
      } catch (error) {
        if (!disposed) {
          setResult({
            key,
            data: null,
            error: controller.signal.aborted
              ? 'Analysis took too long. Try again, or explore a sample report.'
              : error instanceof Error ? error.message : 'Unable to load this report.',
          });
        }
      } finally {
        clearTimeout(timeout);
      }
    };
    void load();
    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [channelId, isDemo, key, attempt]);

  const current = result?.key === key ? result : null;
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    isLoading: !current,
    refetch: () => setAttempt((value) => value + 1),
  };
}
