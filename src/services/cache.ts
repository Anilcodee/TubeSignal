interface CacheEntry<T> {
  data: T;
  expiry: number;
}

/** Small process-local TTL/LRU cache, not shared between deployments or workers. */
export class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  constructor(private maxEntries = 100, private defaultTTL = 30 * 60 * 1000) {}

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlMs = this.defaultTTL): void {
    if (this.maxEntries < 1) return;
    for (const [entryKey, entry] of this.cache) {
      if (Date.now() >= entry.expiry) this.cache.delete(entryKey);
    }
    this.cache.delete(key);
    while (this.cache.size >= this.maxEntries) {
      this.cache.delete(this.cache.keys().next().value!);
    }
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  public has(key: string): boolean { return this.get(key) !== null; }
  public delete(key: string): void { this.cache.delete(key); }
  public clear(): void { this.cache.clear(); }
}

export const cacheService = new CacheService();
