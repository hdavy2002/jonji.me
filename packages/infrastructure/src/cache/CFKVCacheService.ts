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
   * Simple sliding-window rate limit using KV.
   * Stores a counter with TTL. Allows `limit` requests per `windowSeconds`.
   */
  async rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ success: boolean }> {
    const rateKey = `rl:${key}`;
    const current = await this.get(rateKey);
    const count = current ? parseInt(current, 10) : 0;
    if (count >= limit) {
      return { success: false };
    }
    await this.set(rateKey, String(count + 1), windowSeconds);
    return { success: true };
  }
}
