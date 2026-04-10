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
