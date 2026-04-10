import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { OtpService } from '@jonji/infrastructure';
import type { IEmailService } from '@jonji/domain';

export class SendOTPUseCase {
  private readonly otpService: OtpService;

  constructor(
    private readonly redis: Redis,
    private readonly emailService: IEmailService,
    luciaSecret: string,
  ) {
    this.otpService = new OtpService(luciaSecret);
  }

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

    const code = this.otpService.generateCode();
    const hash = await this.otpService.hashCode(code);

    await this.redis.set(`otp:${key}`, hash, { ex: 600 });
    await this.emailService.sendOTP(key, code);
  }
}
