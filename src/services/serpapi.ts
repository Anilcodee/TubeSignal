import type { SerpApiChannelResponse, SerpApiSearchResponse } from '@/types/serpapi';
import { normalizeChannelInput } from '@/utils/channel-input';
import { cacheService } from './cache';
import { ServiceError, serpApiQuota } from './request-guard';

export class SerpApiError extends ServiceError {
  constructor(statusCode: number, message: string) { super(statusCode, message); this.name = 'SerpApiError'; }
}

export class SerpApiService {
  private pending = new Map<string, Promise<unknown>>();

  private async fetchApi<T>(params: Record<string, string>): Promise<T> {
    const cacheKey = `serpapi:${JSON.stringify(params)}`;
    const cached = cacheService.get<T>(cacheKey);
    if (cached !== null) return cached;
    const existing = this.pending.get(cacheKey);
    if (existing) return existing as Promise<T>;
    const apiKey = process.env.SERPAPI_API_KEY?.trim();
    if (!apiKey) throw new SerpApiError(503, 'Live YouTube data is unavailable because SerpApi is not configured. Try a sample report.');

    const release = serpApiQuota.acquire();
    const promise = (async () => {
      try {
        const url = new URL('https://serpapi.com/search.json');
        url.search = new URLSearchParams({ ...params, api_key: apiKey }).toString();
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: AbortSignal.timeout(18_000),
        });
        if (!response.ok) {
          const status = response.status === 429 ? 429 : response.status === 404 ? 404 : 502;
          throw new SerpApiError(status, status === 429
            ? 'YouTube data provider quota is temporarily unavailable. Please try later or open a sample report.'
            : status === 404 ? 'This YouTube channel could not be found. Check the handle or channel URL.'
              : 'The YouTube data provider could not complete this request. Please try later or open a sample report.');
        }
        if (Number(response.headers.get('content-length')) > 2_000_000) throw new Error('Oversized response');
        const text = await response.text();
        if (text.length > 2_000_000) throw new Error('Oversized response');
        const data: unknown = JSON.parse(text);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid response');
        const record = data as Record<string, unknown>;
        const metadata = record.search_metadata as { status?: unknown } | undefined;
        if (record.error || metadata?.status === 'Error') {
          // Upstream error text may include sensitive request details; never return/log it.
          if (params.engine === 'youtube' && typeof record.error === 'string' && /hasn.t returned any results|no results/i.test(record.error)) {
            const empty = { channel_results: [] } as T;
            cacheService.set(cacheKey, empty, 60_000);
            return empty;
          }
          throw new SerpApiError(502, 'YouTube did not return usable data. Check the channel and try again, or open a sample report.');
        }
        cacheService.set(cacheKey, data);
        return data as T;
      } catch (error) {
        if (error instanceof ServiceError) throw error;
        if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
          throw new SerpApiError(504, 'YouTube data took too long to load. Please retry or open a sample report.');
        }
        throw new SerpApiError(502, 'The YouTube data provider is temporarily unavailable. Please retry or open a sample report.');
      } finally {
        release();
        this.pending.delete(cacheKey);
      }
    })();
    this.pending.set(cacheKey, promise);
    return promise;
  }

  public searchChannels(query: string): Promise<SerpApiSearchResponse> {
    return this.fetchApi({ engine: 'youtube', search_query: query, sp: 'EgIQAg%3D%3D', hl: 'en' });
  }

  public getChannelData(channelInput: string): Promise<SerpApiChannelResponse> {
    const identifier = normalizeChannelInput(channelInput);
    if (!identifier) throw new SerpApiError(400, 'Enter a YouTube @handle, channel ID, or channel URL.');
    return this.fetchApi({ engine: 'youtube_channel', channel_id: identifier.replace(/^@/, ''), tab: 'videos', sort: 'latest', hl: 'en' });
  }

  public getVideoTranscript(videoId: string): Promise<import('@/types/serpapi').SerpApiTranscriptResponse> {
    if (!videoId) throw new SerpApiError(400, 'Video ID is required.');
    return this.fetchApi({ engine: 'youtube_video_transcript', v: videoId });
  }
}

export const serpApiService = new SerpApiService();
