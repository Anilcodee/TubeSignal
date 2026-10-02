export interface SerpApiChannelResult {
  title?: string;
  name?: string;
  link?: string;
  channel_id?: string;
  external_id?: string;
  handle?: string;
  thumbnail?: string;
  avatar?: string;
  subscribers?: string | number;
  subscribers_text?: string;
  description?: string;
}

export interface SerpApiVideoResult {
  title?: string;
  link?: string;
  video_id?: string;
  thumbnail?: { static?: string; rich?: string } | string;
  thumbnails?: { url?: string }[];
  published_date?: string;
  views?: number | string;
  extracted_views?: number;
  length?: string;
}

export interface SerpApiChannelResponse {
  search_metadata?: { status?: string };
  /** Current youtube_channel API returns an object, not the search-results array. */
  channel_results?: SerpApiChannelResult;
  channel?: SerpApiChannelResult;
  videos_results?: SerpApiVideoResult[];
}

export interface SerpApiSearchResponse {
  channel_results?: SerpApiChannelResult[];
}

export interface SerpApiTranscriptSegment {
  start_ms?: number;
  snippet?: string;
  start_time_text?: string;
  start_time_label?: string;
}

export interface SerpApiTranscriptResponse {
  search_metadata?: { status?: string };
  transcript?: SerpApiTranscriptSegment[];
}
