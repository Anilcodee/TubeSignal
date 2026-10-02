/** Formatting is separate from availability: missing counts are not measured zeros. */
export function formatViews(views: number): string {
  if (!Number.isFinite(views) || views < 0) return 'Unavailable';
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toLocaleString('en-US');
}

export function parseCount(value?: string | number): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
  if (typeof value !== 'string') return null;
  const clean = value.toLowerCase().replace(/,/g, '').replace(/\s*(?:views?|subscribers?)\s*$/, '').trim();
  if (clean === 'no') return 0;
  const match = /^(\d+(?:\.\d+)?)\s*([kmb])?$/.exec(clean);
  if (!match) return null;
  const multiplier = { k: 1e3, m: 1e6, b: 1e9 }[match[2]] || 1;
  const result = Math.round(Number(match[1]) * multiplier);
  return Number.isSafeInteger(result) ? result : null;
}

export function parseViewCount(value?: string | number): number { return parseCount(value) ?? 0; }

export function parseDurationToSeconds(value?: string): number {
  if (typeof value !== 'string' || !/^\d+(?::\d{2}){0,2}$/.test(value)) return 0;
  const parts = value.split(':').map(Number);
  if (parts.slice(1).some((part) => part >= 60)) return 0;
  const seconds = parts.reduce((total, part) => total * 60 + part, 0);
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : 0;
}

export function formatSecondsToDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return 'Unavailable';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function parseSubscribers(value?: string): number { return parseViewCount(value); }
