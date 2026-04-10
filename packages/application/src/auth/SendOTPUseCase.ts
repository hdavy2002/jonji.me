import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { argon2id } from 'hash-wasm';
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
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoded = await argon2id({
      password: code,
      salt,
      iterations: 3,
      parallelism: 4,
      memorySize: 4096, // 4 MB
      hashLength: 32,
      outputType: 'encoded',
    });

    await this.redis.set(`otp:${key}`, encoded, { ex: 600 });
    await this.emailService.sendOTP(key, code);
  }
}
