import Database from '@tauri-apps/plugin-sql';

let db: Database | null = null;

export const initDb = async () => {
  if (db) return db;
  db = await Database.load('sqlite:copilot.db');

  // Projects
  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sort_order INTEGER DEFAULT 0
    );
  `);

  // Chats
  await db.execute(`
    CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
        title TEXT NOT NULL DEFAULT 'Neuer Chat',
        model TEXT NOT NULL DEFAULT 'gpt-4o',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_pinned BOOLEAN DEFAULT FALSE
    );
  `);

  // Messages
  await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        tokens_used INTEGER
    );
  `);

  // Attachments
  await db.execute(`
    CREATE TABLE IF NOT EXISTS attachments (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Settings
  await db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
  `);

  // GitHub Accounts
  await db.execute(`
    CREATE TABLE IF NOT EXISTS github_accounts (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        access_token TEXT NOT NULL,
        avatar_url TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        rate_limit_remaining INTEGER DEFAULT 5000,
        rate_limit_reset DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used_at DATETIME
    );
  `);

  // Swarm
  await db.execute(`
    CREATE TABLE IF NOT EXISTS swarm_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        controller_model TEXT NOT NULL,
        strategy TEXT NOT NULL CHECK(strategy IN ('consensus', 'parallel', 'sequential', 'verification')),
        is_default BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS swarm_workers (
        id TEXT PRIMARY KEY,
        config_id TEXT NOT NULL REFERENCES swarm_configs(id) ON DELETE CASCADE,
        model TEXT NOT NULL,
        role TEXT,
        weight REAL DEFAULT 1.0,
        sort_order INTEGER DEFAULT 0
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS swarm_logs (
        id TEXT PRIMARY KEY,
        message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        worker_model TEXT NOT NULL,
        worker_response TEXT,
        tokens_used INTEGER,
        duration_ms INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};
