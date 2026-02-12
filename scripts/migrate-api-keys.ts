import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Creating api_keys table...");

  await sql`
    CREATE TABLE IF NOT EXISTS api_keys (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      key VARCHAR(64) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL DEFAULT 'Default',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys (key)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys (user_id)`;

  console.log("api_keys table created successfully.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
