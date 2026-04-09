import { Argon2id } from "oslo/password";
import { redis } from "../../infrastructure/src/cache/RedisClient";
import { IUserRepository } from "../../../domain/src/user/IUserRepository";

export class VerifyOTPUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(email: string, code: string) {
    const hashedCode = await redis.get(`otp:${email}`);
    if (!hashedCode) {
      throw new Error("Code expired or not found");
    }

    const valid = await new Argon2id().verify(hashedCode as string, code);
    if (!valid) {
      throw new Error("Invalid code");
    }

    await redis.del(`otp:${email}`);

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      return { needsRegistration: true, email };
    }

    // This part assumes Lucia integration which I will implement next
    return { needsRegistration: false, user };
  }
}
