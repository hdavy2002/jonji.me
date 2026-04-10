import type { IUserRepository } from '@jonji/domain';
import type { User } from '@jonji/domain';

export class D1UserRepository implements IUserRepository {
  constructor(private db: any) {}

  async findByEmail(email: string): Promise<User | null> {
    const { results } = await this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email.toLowerCase())
      .all();
    if (!results[0]) return null;
    return this.mapRow(results[0] as any);
  }

  async findByUsername(username: string): Promise<User | null> {
    const { results } = await this.db
      .prepare('SELECT * FROM users WHERE username = ?')
      .bind(username.toLowerCase())
      .all();
    if (!results[0]) return null;
    return this.mapRow(results[0] as any);
  }

  async save(user: User): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO users (id, email, username, turso_db_url, turso_auth_token, plan, verified_tier, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        user.id,
        user.email,
        user.username,
        user.tursoDbUrl,
        user.tursoAuthToken,
        user.plan,
        user.verifiedTier,
        user.createdAt,
      )
      .run();
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const { results } = await this.db
      .prepare('SELECT 1 FROM users WHERE username = ?')
      .bind(username.toLowerCase())
      .all();
    return results.length > 0;
  }

  private mapRow(r: any): User {
    return {
      id: r.id,
      email: r.email,
      username: r.username,
      tursoDbUrl: r.turso_db_url ?? '',
      tursoAuthToken: r.turso_auth_token ?? '',
      plan: r.plan ?? 'free',
      verifiedTier: r.verified_tier ?? 'none',
      createdAt: r.created_at,
    };
  }
}
