import type { HookAnalysis } from '@/utils/transcript-analyzer';

export interface TranscriptResponse {
  success: boolean;
  analysis?: HookAnalysis;
  error?: string;
  source?: 'sample' | 'serpapi' | 'cache';
  notice?: string;
}

// Keep demo/live speech separate. Successful responses expire and the cache is bounded.
const cache = new Map<string, { expires: number; data: TranscriptResponse }>();
const keyFor = (id: string, demo: boolean) => `${demo ? 'sample' : 'live'}:${id}`;

export function getCachedTranscript(id: string, demo = false) {
  const key = keyFor(id, demo);
  const entry = cache.get(key);
  if (!entry || entry.expires <= Date.now()) { cache.delete(key); return null; }
  return entry.data;
}

export async function loadTranscript(id: string, demo = false, signal?: AbortSignal): Promise<TranscriptResponse> {
  if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
  const cached = getCachedTranscript(id, demo);
  if (cached) return cached;
  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, 30_000);
  try {
    const response = await fetch('/api/transcript', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: id, isDemo: demo }), signal: controller.signal,
    });
    const data = await response.json() as TranscriptResponse;
    if (!response.ok || !data.success || !data.analysis?.wordCount) {
      return { success: false, error: data.error || 'No usable spoken captions were returned.' };
    }
    if (!demo && data.source === 'sample') return { success: false, error: 'A live transcript is not available.' };
    if (cache.size >= 50) cache.delete(cache.keys().next().value!);
    cache.set(keyFor(id, demo), { data, expires: Date.now() + 15 * 60_000 });
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    return { success: false, error: controller.signal.aborted ? 'Transcript request timed out. Try again.' : 'Transcript unavailable. Try again.' };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}
