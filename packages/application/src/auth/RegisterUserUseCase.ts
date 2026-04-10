import { nanoid } from 'nanoid';
import { createClient } from '@libsql/client';
import { User } from '@jonji/domain';
import type { IUserRepository } from '@jonji/domain';
import { CFKVCacheService, TursoPlatformClient } from '@jonji/infrastructure';

const TURSO_SCHEMA = `
CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  site_type TEXT NOT NULL,
  intent_type TEXT NOT NULL,
  agent_mode TEXT,
  category TEXT,
  subcategory TEXT,
  location_lat REAL,
  location_lng REAL,
  location_text TEXT,
  price_min REAL,
  price_max REAL,
  currency TEXT DEFAULT 'USD',
  availability_flag INTEGER DEFAULT 1,
  verified INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  published_at INTEGER,
  updated_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS inbox_threads (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  participant_ids TEXT NOT NULL,
  last_message_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS inbox_messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
`;

export class RegisterUserUseCase {
  private readonly cache: CFKVCacheService;

  constructor(
    private readonly kv: import('@jonji/infrastructure').IKV,
    private readonly userRepo: IUserRepository,
    private readonly tursoPlatform: TursoPlatformClient,
  ) {
    this.cache = new CFKVCacheService(kv);
  }

  async execute(
    email: string,
    username: string,
  ): Promise<{ sessionId: string; userId: string; username: string }> {
    const emailKey = email.toLowerCase().trim();
    const usernameKey = username.toLowerCase().trim();

    // Check that email was recently verified via /auth/otp/verify
    const verified = await this.cache.get(`verified:${emailKey}`);
    if (!verified) throw new Error('Email not verified. Complete verification first.');
    await this.cache.delete(`verified:${emailKey}`);

    // Check username
    const existing = await this.userRepo.findByUsername(usernameKey);
    if (existing) throw new Error('Username already taken.');

    // Provision Turso DB — name must be lowercase alphanumeric + hyphens, max 32 chars
    const userId = 'usr_' + nanoid(16);
    // Strip usr_ prefix from userId for the db name portion: usr_abc123... -> u-abc123...
    const { dbUrl, authToken } = await this.tursoPlatform.createUserDatabase(userId);

    // Run schema on new DB
    const userDb = createClient({ url: dbUrl, authToken });
    const statements = TURSO_SCHEMA.split(';').map((s) => s.trim()).filter(Boolean);
    for (const sql of statements) {
      await userDb.execute(sql);
    }

    // Create profile row
    await userDb.execute({
      sql: 'INSERT INTO profile (id, username, display_name, created_at) VALUES (?,?,?,?)',
      args: [userId, usernameKey, usernameKey, Date.now()],
    });

    // Save user to D1
    const user: User = {
      id: userId,
      email: emailKey,
      username: usernameKey,
      tursoDbUrl: dbUrl,
      tursoAuthToken: authToken,
      plan: 'free',
      verifiedTier: 'none',
      createdAt: Date.now(),
    };
    await this.userRepo.save(user);

    // Create session
    const sessionId = 'sess_' + crypto.randomUUID().replace(/-/g, '');
    await userDb.execute({
      sql: 'INSERT INTO sessions (id, expires_at) VALUES (?,?)',
      args: [sessionId, Date.now() + 1000 * 60 * 60 * 24 * 30],
    });

    return { sessionId, userId, username: usernameKey };
  }
}
