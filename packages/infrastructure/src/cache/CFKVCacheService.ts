/**
 * CFKVCacheService — Cloudflare KV wrapper for OTP storage and rate limiting.
 * Uses the KV namespace already bound to the Worker — zero external network calls.
 */
export interface IKV {
  get(key: string, type?: 'text'): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export class CFKVCacheService {
  constructor(private readonly kv: IKV) {}

  async get(key: string): Promise<string | null> {
    return (await this.kv.get(key, 'text')) ?? null;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.kv.put(key, value, { expirationTtl: ttlSeconds });
  }

  async delete(key: string): Promise<void> {
    await this.kv.delete(key);
  }

  /**
   * Token-bucket style rate limit using KV.
   * Stores { count, windowStart }. Resets when windowSeconds have elapsed.
   * Allows `limit` requests per `windowSeconds` window.
   */
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ success: boolean }> {
    const rateKey = `rl:${key}`;
    const raw = await this.get(rateKey);
    const now = Date.now();

    if (!raw) {
      // Fresh window
      await this.set(rateKey, JSON.stringify({ count: 1, start: now }), windowSeconds);
      return { success: true };
    }

    let data: { count: number; start: number };
    try {
      data = JSON.parse(raw);
    } catch {
      // Corrupted — start fresh
      await this.set(rateKey, JSON.stringify({ count: 1, start: now }), windowSeconds);
      return { success: true };
    }

    const elapsed = (now - data.start) / 1000;
    if (elapsed >= windowSeconds) {
      // New window
      await this.set(rateKey, JSON.stringify({ count: 1, start: now }), windowSeconds);
      return { success: true };
    }

    if (data.count >= limit) {
      return { success: false };
    }

    // Within window — increment counter, reset TTL
    await this.set(rateKey, JSON.stringify({ count: data.count + 1, start: data.start }), windowSeconds);
    return { success: true };
  }
}
