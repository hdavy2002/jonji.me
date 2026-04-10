import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
// @ts-ignore — argon2-browser has no TS types
import argon2 from 'argon2-browser';
import type { IEmailService } from '@jonji/domain';

export class SendOTPUseCase {
  constructor(
    private readonly redis: Redis,
    private readonly emailService: IEmailService,
  ) {}

  async execute(email: string): Promise<void> {
    const key = email.toLowerCase().trim();

    const ratelimit = new Ratelimit({
      redis: this.redis,
      limiter: Ratelimit.slidingWindow(3, '10 m'),
      prefix: 'ratelimit:otp',
    });
    const { success } = await ratelimit.limit(key);
    if (!success) {
      throw new Error('Too many requests. Please wait 10 minutes.');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    // Generate random salt (16 bytes = 128 bits)
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const result = await argon2.hash({
      pass: code,
      salt,
      type: argon2.ArgonType.Argon2id,
      mem: 4096,       // 4 MB memory
      iterations: 3,
      hashLen: 32,
      parallelism: 4,
    });
    // Store the encoded hash for later verification
    await this.redis.set(`otp:${key}`, result.encoded, { ex: 600 });
    await this.emailService.sendOTP(key, code);
  }
}
