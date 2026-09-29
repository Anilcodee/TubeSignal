export interface SerpApiChannelResult {
  title: string;
  link: string;
  channel_id: string;
  thumbnail?: string;
  avatar?: string;
  subscribers?: string;
  video_count?: string;
  description?: string;
  verified?: boolean;
}

export interface SerpApiVideoResult {
  title: string;
  link: string;
  video_id: string;
  thumbnail?: {
    static?: string;
    rich?: string;
  } | string;
  published_date?: string;
  views?: number | string;
  length?: string;
  description?: string;
  channel?: {
    name?: string;
    link?: string;
    id?: string;
  };
}

export interface SerpApiChannelResponse {
  search_metadata?: {
    id?: string;
    status?: string;
    total_time_taken?: number;
  };
  channel?: {
    name?: string;
    description?: string;
    subscribers?: string;
    avatar?: string;
    verified?: boolean;
    header_image?: string;
  };
  videos_results?: SerpApiVideoResult[];
  channel_results?: SerpApiChannelResult[];
}
