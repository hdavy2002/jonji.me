CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  turso_db_url  TEXT NOT NULL,
  turso_auth_token TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK(plan IN ('free','pro','business','enterprise')),
  verified      INTEGER NOT NULL DEFAULT 0,
  verified_tier TEXT NOT NULL DEFAULT 'none' CHECK(verified_tier IN ('none','phone','id','professional')),
  created_at    INTEGER NOT NULL
);
