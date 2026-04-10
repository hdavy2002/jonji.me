/**
 * OtpService — pure Web Crypto API, zero external dependencies.
 * Uses HMAC-SHA256 with LUCIA_SECRET as the key.
 * OTP codes are stored as HMAC digests, never as raw values.
 */
export class OtpService {
  constructor(private readonly secret: string) {}

  /** Generate a random 6-digit OTP code */
  generateCode(): string {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(array[0] % 900000 + 100000);
  }

  /** Create an HMAC-SHA256 digest of the code. Store this in Redis. */
  async hashCode(code: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(code),
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /** Verify a code against a stored HMAC digest. Constant-time comparison. */
  async verifyCode(code: string, storedHash: string): Promise<boolean> {
    const freshHash = await this.hashCode(code);
    if (freshHash.length !== storedHash.length) return false;
    let result = 0;
    for (let i = 0; i < freshHash.length; i++) {
      result |= freshHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
    }
    return result === 0;
  }
}
