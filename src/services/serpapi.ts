import { SerpApiChannelResponse, SerpApiVideoResult } from '@/types/serpapi';
import { cacheService } from './cache';

export class SerpApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'SerpApiError';
  }
}

export class SerpApiService {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search';

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || '';
  }

  private async fetchApi<T>(params: Record<string, string>): Promise<T> {
    const cacheKey = `serpapi:${JSON.stringify(params)}`;
    const cached = cacheService.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.apiKey) {
      throw new SerpApiError(401, 'SERPAPI_API_KEY is not configured in environment.');
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set('api_key', this.apiKey);

    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, val);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 1800 }, // 30 min cache
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new SerpApiError(res.status, `SerpApi Error (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as T;
    cacheService.set(cacheKey, data);
    return data;
  }

  /**
   * Search for YouTube channels using engine=youtube
   */
  public async searchChannels(query: string) {
    return this.fetchApi<Record<string, unknown>>({
      engine: 'youtube',
      search_query: query,
    });
  }

  /**
   * Get channel information and video list using engine=youtube_channel
   */
  public async getChannelData(channelId: string): Promise<SerpApiChannelResponse> {
    return this.fetchApi<SerpApiChannelResponse>({
      engine: 'youtube_channel',
      channel_id: channelId,
    });
  }

  /**
   * Get detailed video metrics using engine=youtube_video
   */
  public async getVideoDetails(videoId: string) {
    return this.fetchApi<Record<string, unknown>>({
      engine: 'youtube_video',
      v: videoId,
    });
  }

  /**
   * Batch fetch details for top videos
   */
  public async batchGetVideoDetails(videoIds: string[]) {
    const promises = videoIds.map((id) =>
      this.getVideoDetails(id).catch((err) => {
        console.warn(`Failed to fetch details for video ${id}:`, err);
        return null;
      })
    );
    return Promise.all(promises);
  }

  /**
   * Fetch video transcript using engine=youtube_video_transcript
   */
  public async getVideoTranscript(videoId: string) {
    return this.fetchApi<Record<string, unknown>>({
      engine: 'youtube_video_transcript',
      v: videoId,
    });
  }
}

export const serpApiService = new SerpApiService();
