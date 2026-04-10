import { Redis } from '@upstash/redis';
import { Argon2id } from 'oslo/password';
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
    const hash = await this.redis.get<string>(`otp:${key}`);
    if (!hash) throw new Error('Code expired or not found. Request a new one.');

    const valid = await new Argon2id().verify(hash, code);
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
