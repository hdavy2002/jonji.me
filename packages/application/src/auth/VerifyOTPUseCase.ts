import { Redis } from '@upstash/redis';
import { argon2Verify } from 'hash-wasm';
import type { IUserRepository } from '@jonji/domain';

export type VerifyOTPResult =
  | { needsRegistration: true; email: string }
  | { needsRegistration: false; sessionId: string; userId: string; username: string };

export class VerifyOTPUseCase {
  constructor(
    private readonly redis: Redis,
    private readonly userRepo: IUserRepository,
  ) {}

  async execute(email: string, code: string): Promise<VerifyOTPResult> {
    const key = email.toLowerCase().trim();
    const stored = await this.redis.get<string>(`otp:${key}`);
    if (!stored) throw new Error('Code expired or not found. Request a new one.');

    let valid = false;
    try {
      valid = await argon2Verify({ password: code, hash: stored });
    } catch {
      valid = false;
    }
    if (!valid) throw new Error('Invalid code.');
    await this.redis.del(`otp:${key}`);

    const user = await this.userRepo.findByEmail(key);
    if (!user) return { needsRegistration: true, email: key };

    return {
      needsRegistration: false,
      sessionId: 'sess_' + crypto.randomUUID().replace(/-/g, ''),
      userId: user.id,
      username: user.username,
    };
  }
}
