import type { VideoData, ChannelData, ChannelAnalytics, ContentTheme, ChannelSearchResult } from '@/types/analysis';
import type { NumericChartData, ScatterChartData } from '@/types/chart';
import type { SerpApiChannelResponse, SerpApiChannelResult, SerpApiVideoResult } from '@/types/serpapi';
import { formatViews, parseCount, parseDurationToSeconds, formatSecondsToDuration } from '@/utils/format';
import { isChannelId, normalizeChannelInput } from '@/utils/channel-input';
import { parsePublishingDate } from '@/utils/publishing-date';

const text = (value: unknown, max = 1000): string => typeof value === 'string' ? value.trim().slice(0, max) : '';
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const GOOGLE_CDN_HOST = /(?:^|\.)(?:ytimg\.com|ggpht\.com|googleusercontent\.com)$/i;
function imageUrl(value: unknown): string {
  const candidate = text(value, 2048);
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' && GOOGLE_CDN_HOST.test(url.hostname.toLowerCase()) ? url.toString() : '';
  } catch { return ''; }
}
function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return Math.round(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
}
function identity(info: SerpApiChannelResult): { id: string; handle: string } {
  const candidates = [info.external_id, info.channel_id, info.link, info.handle]
    .map((value) => normalizeChannelInput(text(value))).filter((value): value is string => value !== null);
  return { id: candidates.find(isChannelId) || candidates[0] || '', handle: candidates.find((value) => value.startsWith('@')) || '' };
}
function subscribers(info: SerpApiChannelResult): { label: string; count: number | null } {
  const count = parseCount(info.subscribers) ?? parseCount(info.subscribers_text);
  return { count, label: count === null ? 'Unavailable' : text(info.subscribers_text, 100) || text(info.subscribers, 100) || formatViews(count) };
}

export class DataTransformerService {
  public static normalizeVideos(rawVideos: SerpApiVideoResult[] = []): VideoData[] {
    if (!Array.isArray(rawVideos)) return [];
    const seen = new Set<string>();
    return rawVideos.slice(0, 50).flatMap((raw) => {
      if (!object(raw)) return [];
      const title = text(raw.title, 500);
      let videoId = text(raw.video_id, 100);
      if (!videoId) {
        try {
          const link = new URL(text(raw.link));
          if (['www.youtube.com', 'youtube.com'].includes(link.hostname) && link.pathname === '/watch') videoId = link.searchParams.get('v') || '';
        } catch { /* Missing IDs cannot be fabricated. */ }
      }
      if (!title || !/^[A-Za-z0-9_-]+$/.test(videoId) || seen.has(videoId)) return [];
      seen.add(videoId);
      const views = parseCount(raw.extracted_views as number) ?? parseCount(raw.views as number | string);
      const length = text(raw.length, 32);
      const lengthSeconds = parseDurationToSeconds(length);
      const thumbnail = object(raw.thumbnail) ? imageUrl(raw.thumbnail.static) || imageUrl(raw.thumbnail.rich) : imageUrl(raw.thumbnail);
      const publishedDate = text(raw.published_date, 100) || 'Unavailable';
      return [{
        videoId, title, views: views ?? 0, viewsAvailable: views !== null,
        viewsFormatted: views === null ? 'Unavailable' : formatViews(views),
        publishedDate,
        ...(parsePublishingDate(publishedDate)?.approximate ? { relativeDate: publishedDate } : {}),
        length: lengthSeconds ? length : 'Unavailable', lengthSeconds,
        thumbnail: thumbnail || (Array.isArray(raw.thumbnails) ? imageUrl(raw.thumbnails[0]?.url) : ''),
        url: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      }];
    });
  }

  public static normalizeChannel(channelId: string, raw: SerpApiChannelResponse, videoCount: number): ChannelData {
    const info = object(raw.channel_results) ? raw.channel_results : object(raw.channel) ? raw.channel : {};
    const identifiers = identity(info);
    const audience = subscribers(info);
    return {
      name: text(info.title) || text(info.name) || channelId,
      handle: identifiers.handle || (channelId.startsWith('@') ? channelId : ''),
      channelId: identifiers.id || channelId,
      avatar: imageUrl(info.thumbnail) || imageUrl(info.avatar),
      subscribers: audience.label,
      ...(audience.count !== null ? { subscriberCount: audience.count } : {}),
      description: text(info.description), totalVideosAnalyzed: videoCount,
    };
  }

  public static normalizeSearchResults(raw: unknown): ChannelSearchResult[] {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    return raw.slice(0, 30).flatMap((info) => {
      if (!object(info)) return [];
      const identifiers = identity(info);
      const name = text(info.title) || text(info.name);
      if (!identifiers.id || !name || seen.has(identifiers.id)) return [];
      seen.add(identifiers.id);
      return [{ name, channelId: identifiers.id, handle: identifiers.handle,
        avatar: imageUrl(info.thumbnail) || imageUrl(info.avatar),
        subscribers: subscribers(info).label, description: text(info.description) }];
    }).slice(0, 10);
  }

  public static hasViews(video: VideoData): boolean {
    return video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0;
  }

  public static calculateAnalytics(videos: VideoData[], now = Date.now()): ChannelAnalytics {
    const views = videos.filter(this.hasViews).map((video) => video.views);
    const totalViews = views.reduce((total, value) => total + value, 0);
    const avgViews = views.length ? Math.round(totalViews / views.length) : 0;
    const durations = videos.map((video) => video.lengthSeconds).filter((value) => Number.isFinite(value) && value > 0);
    const dates = videos.map((video) => parsePublishingDate(video.publishedDate, now)).filter((value) => value !== null);
    const approximate = dates.some((date) => date.approximate);
    const spanDays = dates.length >= 2 ? (Math.max(...dates.map((date) => date.timestamp)) - Math.min(...dates.map((date) => date.timestamp))) / 86_400_000 : 0;
    let mostActiveDay = 'Unavailable';
    if (dates.length >= 2 && !approximate) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const counts = weekdays.map((_, day) => dates.filter((date) => new Date(date.timestamp).getUTCDay() === day).length);
      const max = Math.max(...counts);
      mostActiveDay = `${weekdays.filter((_, i) => counts[i] === max).join(', ')} (dated sample, UTC)`;
    }
    return {
      avgViews, avgViewsFormatted: views.length ? formatViews(avgViews) : 'Unavailable',
      medianViews: median(views), totalViews,
      totalViewsFormatted: views.length ? formatViews(totalViews) : 'Unavailable',
      publishingFrequency: spanDays >= 1 ? `${((dates.length - 1) * 7 / spanDays).toFixed(1)} videos/week (${approximate ? 'approximate, ' : ''}observed dated sample)` : 'Unavailable',
      avgVideoLength: durations.length ? formatSecondsToDuration(Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)) : 'Unavailable',
      medianVideoLength: durations.length ? formatSecondsToDuration(median(durations)) : 'Unavailable',
      mostActiveDay,
      // Differently aged lifetime view totals are not a historical growth series.
      viewsGrowthTrend: 'unknown',
    };
  }

  public static toViewsDistribution(videos: VideoData[]): NumericChartData {
    const top = videos.filter(this.hasViews).sort((a, b) => b.views - a.views).slice(0, 6);
    return {
      labels: top.map((video) => video.title.length > 25 ? `${video.title.substring(0, 22)}...` : video.title),
      datasets: [{ label: 'Observed views', data: top.map((video) => video.views), backgroundColor: '#7c5cfc', borderRadius: 8 }],
    };
  }

  public static toContentThemes(themes: ContentTheme[]): NumericChartData {
    const palette = ['#7c5cfc', '#06b6d4', '#f472b6', '#34d399', '#fbbf24', '#fb923c'];
    return {
      labels: themes.map((theme) => theme.theme),
      datasets: [{ data: themes.map((theme) => theme.percentage), backgroundColor: themes.map((_, i) => palette[i % palette.length]), borderWidth: 0 }],
    };
  }

  public static toPublishingTimeline(videos: VideoData[], now = Date.now()): NumericChartData {
    const counts = new Map<string, number>();
    let approximate = false;
    for (const video of videos) {
      const parsed = parsePublishingDate(video.publishedDate, now);
      if (!parsed) continue;
      approximate ||= parsed.approximate;
      const month = new Date(parsed.timestamp).toISOString().slice(0, 7);
      counts.set(month, (counts.get(month) || 0) + 1);
    }
    const labels = [...counts.keys()].sort();
    return {
      labels,
      datasets: [{ label: approximate ? 'Observed uploads (approximate dates)' : 'Observed uploads (dated sample)',
        data: labels.map((month) => counts.get(month)!), borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.1)', fill: false, tension: 0 }],
    };
  }

  public static toLengthVsViews(videos: VideoData[]): ScatterChartData {
    const observed = videos.filter((video) => this.hasViews(video) && Number.isFinite(video.lengthSeconds) && video.lengthSeconds > 0);
    return { labels: observed.map((video) => video.title), datasets: [{
      label: 'Observed duration (min) vs views', data: observed.map((video) => ({ x: Math.round(video.lengthSeconds / 6) / 10, y: video.views })),
      backgroundColor: '#f472b6', pointRadius: 6, pointHoverRadius: 9,
    }] };
  }
}
