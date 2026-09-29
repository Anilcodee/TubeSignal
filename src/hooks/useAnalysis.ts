import { useState, useEffect } from 'react';
import { FullAnalysisResponse } from '@/types/analysis';

interface UseAnalysisReturn {
  data: FullAnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

export function useAnalysis(channelId: string, initialDemo = false): UseAnalysisReturn {
  const [data, setData] = useState<FullAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(initialDemo);

  const fetchAnalysis = async (demoState: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelId,
          isDemo: demoState,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Failed to analyze channel (Status ${res.status})`);
      }

      const result = (await res.json()) as FullAnalysisResponse;
      setData(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchAnalysis(isDemoMode);
    }
  }, [channelId, isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchAnalysis(isDemoMode),
    isDemoMode,
    toggleDemoMode,
  };
}
