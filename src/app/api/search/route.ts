import { NextRequest, NextResponse } from 'next/server';
import { serpApiService } from '@/services/serpapi';
import { DataTransformerService } from '@/services/data-transformer';
import { readRequestObject, ServiceError } from '@/services/request-guard';
import { isInvalidSearchInput, normalizeChannelInput } from '@/utils/channel-input';
import type { ChannelSearchResponse } from '@/types/analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await readRequestObject(request);
    if (typeof body.query !== 'string' || !body.query.trim() || body.query.length > 512) {
      throw new ServiceError(400, 'Enter a channel name, @handle, or YouTube channel URL.');
    }
    const query = body.query.trim();
    const identifier = normalizeChannelInput(query);
    if (identifier) {
      // A resolvable identifier is not a verified search match or invented channel profile.
      const response: ChannelSearchResponse = { channels: [{
        name: identifier, channelId: identifier, handle: identifier.startsWith('@') ? identifier : '',
        avatar: '', subscribers: 'Unavailable',
        description: 'Direct channel identifier, not yet verified. Public details will be fetched during analysis.',
      }] };
      return NextResponse.json(response);
    }
    if (isInvalidSearchInput(query)) {
      throw new ServiceError(400, 'Use a channel name, valid @handle, or youtube.com/@handle or /channel/UC… URL. Video and unsupported URLs cannot be analyzed as channels.');
    }
    if (!process.env.SERPAPI_API_KEY?.trim()) {
      throw new ServiceError(503, 'Live channel discovery is unavailable because SerpApi is not configured. Try a sample report, or enter a known @handle.');
    }
    const result = await serpApiService.searchChannels(query);
    if (result.channel_results !== undefined && !Array.isArray(result.channel_results)) {
      throw new ServiceError(502, 'Channel discovery returned an unexpected result. Please retry or enter a known @handle.');
    }
    const response: ChannelSearchResponse = { channels: DataTransformerService.normalizeSearchResults(result.channel_results) };
    return NextResponse.json(response);
  } catch (error) {
    const response: ChannelSearchResponse = {
      channels: [], error: error instanceof ServiceError ? error.message : 'Channel discovery is temporarily unavailable. Please retry or enter a known @handle.',
    };
    return NextResponse.json(response, { status: error instanceof ServiceError ? error.statusCode : 500 });
  }
}
