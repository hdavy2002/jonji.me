import { IUserRepository } from "../../../domain/src/user/IUserRepository";
import { redis } from "../cache/RedisClient";

export class D1UserRepository implements IUserRepository {
  constructor(private db: any) {} // Assuming D1 database handle

  async findByEmail(email: string) {
    const { results } = await this.db.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
    return results[0] || null;
  }

  async isUsernameTaken(username: string) {
    const { results } = await this.db.prepare("SELECT 1 FROM users WHERE username = ?").bind(username).all();
    return results.length > 0;
  }

  async provisionUserDatabase(userId: string) {
    // Calling Turso Platform API to create DB
    const response = await fetch(`https://api.turso.tech/v1/organizations/hdavy2002/databases`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TURSO_PLATFORM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: userId, group: "default" }),
    });
    return await response.json(); // Should return { dbUrl, authToken }
  }

  async save(user: any) {
    await this.db.prepare("INSERT INTO users (id, email, username, turso_db_url, turso_auth_token, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(user.id, user.email, user.username, user.turso_db_url, user.turso_auth_token, user.created_at)
      .run();
  }
}
