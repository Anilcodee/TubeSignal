const CHANNEL_ID = /^UC[A-Za-z0-9_-]{22}$/;
const HANDLE = /^@[\p{L}\p{M}\p{N}_.\-·]{1,30}$/u;
const CHANNEL_TABS = new Set(['videos', 'shorts', 'streams', 'featured', 'about', 'playlists', 'community', 'posts']);

/** Direct identifiers only. Plain channel names need discovery; IDs retain their case. */
export function normalizeChannelInput(raw: string): string | null {
  const input = raw.trim();
  if (!input || input.length > 512 || /[\\\u0000-\u001f\u007f]/.test(input)) return null;
  if (CHANNEL_ID.test(input)) return input;
  if (HANDLE.test(input) && !input.includes('..')) return input;

  try {
    const candidate = /^(?:www\.|m\.)?youtube\.com\//i.test(input) ? `https://${input}` : input;
    // Check before URL parsing, which otherwise silently removes dot segments.
    const decoded = decodeURIComponent(candidate);
    if (decoded.includes('\\') || /(?:^|\/)\.{1,2}(?:\/|$|[?#])/.test(decoded)) return null;
    const url = new URL(candidate);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) return null;
    const parts = decodeURIComponent(url.pathname).replace(/\/$/, '').split('/').slice(1);
    if (parts[0] === 'channel' && CHANNEL_ID.test(parts[1] || '')) {
      return parts.length === 2 || (parts.length === 3 && CHANNEL_TABS.has(parts[2])) ? parts[1] : null;
    }
    if (HANDLE.test(parts[0] || '') && !parts[0].includes('..')) {
      return parts.length === 1 || (parts.length === 2 && CHANNEL_TABS.has(parts[1])) ? parts[0] : null;
    }
  } catch {
    // Invalid/unsupported URLs are not identifiers (and must not become handles).
  }
  return null;
}

export function isChannelId(value: string): boolean {
  return CHANNEL_ID.test(value);
}

/** Keep malformed identifiers/URLs out of paid name discovery. */
export function isInvalidSearchInput(value: string): boolean {
  return !value.trim() || value.length > 120 || /[\u0000-\u001f\u007f\\/]/.test(value)
    || value.startsWith('@') || /^UC[A-Za-z0-9_-]{18,}$/.test(value)
    || /(?:https?:|www\.|youtube\.com|youtu\.be)/i.test(value);
}
