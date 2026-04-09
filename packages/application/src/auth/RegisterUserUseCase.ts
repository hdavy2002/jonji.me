import { nanoid } from "nanoid";
import { IUserRepository } from "../../../domain/src/user/IUserRepository";
import { VerifyOTPUseCase } from "./VerifyOTPUseCase";

export class RegisterUserUseCase {
  constructor(private userRepo: IUserRepository, private verifyOTP: VerifyOTPUseCase) {}

  async execute(email: string, username: string, code: string) {
    // 1. Verify OTP
    await this.verifyOTP.execute(email, code);

    // 2. Check username
    const taken = await this.userRepo.isUsernameTaken(username);
    if (taken) {
      throw new Error("Username already taken");
    }

    // 3. Register logic
    const userId = "usr_" + nanoid(16);
    
    // NOTE: Turso DB provisioning logic here depends on your infrastructure client
    // I will add the placeholders for now based on your provided schema/structure
    const { dbUrl, authToken } = await this.userRepo.provisionUserDatabase(userId);

    const user = {
      id: userId,
      email,
      username,
      turso_db_url: dbUrl,
      turso_auth_token: authToken,
      created_at: Date.now(),
    };

    await this.userRepo.save(user);

    return { ok: true, user };
  }
}
