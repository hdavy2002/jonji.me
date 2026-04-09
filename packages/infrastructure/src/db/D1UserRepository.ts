import { IUserRepository, User } from '@jonji/domain';

export class D1UserRepository implements IUserRepository {
  constructor(private db: any) {} // D1 binding type
  async findByEmail(email: string): Promise<User | null> {
    const { results } = await this.db.prepare("SELECT * FROM users WHERE email = ?").bind(email).all();
    return results[0] as unknown as User || null;
  }
  async findByUsername(username: string): Promise<User | null> {
    const { results } = await this.db.prepare("SELECT * FROM users WHERE username = ?").bind(username).all();
    return results[0] as unknown as User || null;
  }
  async save(user: User): Promise<void> {
    await this.db.prepare("INSERT INTO users (id, email, username) VALUES (?, ?, ?)")
      .bind(user.id, user.email, user.username).run();
  }
}
