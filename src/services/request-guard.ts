export class ServiceError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ServiceError';
  }
}

/** Per provider, per process only: not a distributed/authenticated spending limit. */
export class PaidRequestGuard {
  private minuteStart = 0;
  private hourStart = 0;
  private minuteCount = 0;
  private hourCount = 0;
  private active = 0;

  constructor(private perMinute = 20, private perHour = 200, private concurrency = 4) {}

  public acquire(now = Date.now()): () => void {
    if (now - this.minuteStart >= 60_000) { this.minuteStart = now; this.minuteCount = 0; }
    if (now - this.hourStart >= 3_600_000) { this.hourStart = now; this.hourCount = 0; }
    if (this.minuteCount >= this.perMinute || this.hourCount >= this.perHour || this.active >= this.concurrency) {
      throw new ServiceError(429, 'Live request limit reached. Please wait before retrying, or explore a sample report.');
    }
    this.minuteCount++;
    this.hourCount++;
    this.active++;
    let released = false;
    return () => { if (!released) { this.active--; released = true; } };
  }
}

export const serpApiQuota = new PaidRequestGuard();
export const geminiQuota = new PaidRequestGuard(10, 100, 2);

/** Bound input before JSON parsing; do not trust Content-Length alone. */
export async function readRequestObject(request: Request): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  if (!reader) throw new ServiceError(400, 'A JSON request body is required.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        throw new ServiceError(413, 'Request is too large. Please submit one channel or search query.');
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid object');
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(400, 'Please send a valid JSON request.');
  } finally {
    reader.releaseLock();
  }
}
