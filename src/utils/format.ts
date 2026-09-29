/**
 * Formatting utilities for views, dates, and durations
 */

export function formatViews(views: number): string {
  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B`;
  }
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }
  return views.toLocaleString();
}

export function parseViewCount(viewStr?: string | number): number {
  if (typeof viewStr === 'number') return viewStr;
  if (!viewStr) return 0;

  const clean = viewStr.toLowerCase().replace(/,/g, '').replace(/views?/g, '').trim();

  if (clean.endsWith('b')) {
    return Math.round(parseFloat(clean.replace('b', '')) * 1_000_000_000);
  }
  if (clean.endsWith('m')) {
    return Math.round(parseFloat(clean.replace('m', '')) * 1_000_000);
  }
  if (clean.endsWith('k')) {
    return Math.round(parseFloat(clean.replace('k', '')) * 1_000);
  }

  const num = parseInt(clean, 10);
  return isNaN(num) ? 0 : num;
}

export function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 0;
  const parts = durationStr.split(':').map(Number);
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

export function formatSecondsToDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseSubscribers(subStr?: string): number {
  return parseViewCount(subStr?.replace(/subscribers?/i, ''));
}
