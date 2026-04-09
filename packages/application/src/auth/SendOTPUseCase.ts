import { Argon2id } from "oslo/password";
import { redis } from "../../infrastructure/src/cache/RedisClient"; // Assuming an exported redis instance
import { resend } from "../../infrastructure/src/email/ResendClient"; // Assuming an exported resend instance
import { Ratelimit } from "@upstash/ratelimit";

export class SendOTPUseCase {
  private ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
  });

  async execute(email: string) {
    const { success } = await this.ratelimit.limit(`otp:${email}`);
    if (!success) {
      throw new Error("Too many requests");
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashedCode = await new Argon2id().hash(code);

    await redis.set(`otp:${email}`, hashedCode, { ex: 600 });
    
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `Your Jonji code: ${code}`,
      text: `Your verification code is: ${code}\n\nExpires in 10 minutes.`
    });

    return { ok: true };
  }
}
