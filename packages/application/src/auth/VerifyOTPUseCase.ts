import { createClient } from '@libsql/client';
import { OtpService, CFKVCacheService } from '@jonji/infrastructure';
import type { IUserRepository } from '@jonji/domain';

export type VerifyOTPResult =
  | { needsRegistration: true; email: string }
  | { needsRegistration: false; sessionId: string; userId: string; username: string };

export class VerifyOTPUseCase {
  private readonly otpService: OtpService;
  private readonly cache: CFKVCacheService;

  constructor(
    private readonly kv: import('@jonji/infrastructure').IKV,
    private readonly userRepo: IUserRepository,
    luciaSecret: string,
  ) {
    this.otpService = new OtpService(luciaSecret);
    this.cache = new CFKVCacheService(kv);
  }

  async execute(email: string, code: string): Promise<VerifyOTPResult> {
    const key = email.toLowerCase().trim();

    const storedHash = await this.cache.get(`otp:${key}`);
    if (!storedHash) {
      throw new Error('Code has expired or was not found. Request a new one.');
    }

    const valid = await this.otpService.verifyCode(code, storedHash);
    if (!valid) {
      throw new Error('Invalid code. Please try again.');
    }

    await this.cache.delete(`otp:${key}`);

    // Mark email as verified (short TTL — register must follow within minutes)
    await this.cache.set(`verified:${key}`, '1', 300);

    const user = await this.userRepo.findByEmail(key);
    if (!user) {
      return { needsRegistration: true, email: key };
    }

    const sessionId = 'sess_' + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;

    const db = createClient({ url: user.tursoDbUrl, authToken: user.tursoAuthToken });
    await db.execute({
      sql: 'INSERT INTO sessions (id, expires_at) VALUES (?, ?)',
      args: [sessionId, expiresAt],
    });

    return {
      needsRegistration: false,
      sessionId,
      userId: user.id,
      username: user.username,
    };
  }
}
