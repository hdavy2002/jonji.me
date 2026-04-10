import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Argon2id } from 'oslo/password';
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
    const hash = await new Argon2id().hash(code);

    await this.redis.set(`otp:${key}`, hash, { ex: 600 });
    await this.emailService.sendOTP(key, code);
  }
}
