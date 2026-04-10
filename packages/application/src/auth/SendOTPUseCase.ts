import { OtpService, CFKVCacheService } from '@jonji/infrastructure';
import type { IEmailService } from '@jonji/domain';

export class SendOTPUseCase {
  private readonly otpService: OtpService;
  private readonly cache: CFKVCacheService;

  constructor(
    private readonly kv: import('@jonji/infrastructure').IKV,
    private readonly emailService: IEmailService,
    luciaSecret: string,
  ) {
    this.otpService = new OtpService(luciaSecret);
    this.cache = new CFKVCacheService(kv);
  }

  async execute(email: string): Promise<void> {
    const key = email.toLowerCase().trim();

    // Rate limit: 3 per 10 minutes (600 seconds)
    const { success } = await this.cache.rateLimit(`otp:${key}`, 3, 600);
    if (!success) {
      throw new Error('Too many requests. Please wait 10 minutes.');
    }

    const code = this.otpService.generateCode();
    const hash = await this.otpService.hashCode(code);

    await this.cache.set(`otp:${key}`, hash, 600);
    await this.emailService.sendOTP(key, code);
  }
}
