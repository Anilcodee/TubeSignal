export interface PublishingDate { timestamp: number; approximate: boolean }
const DAY_MS = 86_400_000;

/** Relative YouTube dates are rounded ages, never evidence of a release weekday. */
export function parsePublishingDate(raw: string, now = Date.now()): PublishingDate | null {
  const value = raw.trim().replace(/^(?:streamed|premiered)\s+/i, '');
  const relative = /^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/i.exec(value);
  if (relative) {
    const days: Record<string, number> = { second: 1 / 86400, minute: 1 / 1440, hour: 1 / 24, day: 1, week: 7, month: 30.4375, year: 365.25 };
    const timestamp = now - Number(relative[1]) * days[relative[2].toLowerCase()] * DAY_MS;
    return Number.isFinite(timestamp) && timestamp >= 0 ? { timestamp, approximate: true } : null;
  }
  if (/^(today|yesterday)$/i.test(value)) {
    return { timestamp: now - (/yesterday/i.test(value) ? DAY_MS : 0), approximate: true };
  }
  // Avoid Date.parse's surprising acceptance of ambiguous numbers and invalid dates.
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (iso) {
    const day = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
    if (day.toISOString().slice(0, 10) !== value.slice(0, 10)) return null;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? { timestamp, approximate: false } : null;
  }
  const named = /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/.exec(value);
  if (named) {
    const names = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const month = names.findIndex((name) => name === named[1].toLowerCase() || name.slice(0, 3) === named[1].toLowerCase());
    if (month < 0) return null;
    return parsePublishingDate(`${named[3]}-${String(month + 1).padStart(2, '0')}-${named[2].padStart(2, '0')}`, now);
  }
  return null;
}
