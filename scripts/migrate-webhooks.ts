import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Creating webhooks table...");

  await sql`
    CREATE TABLE IF NOT EXISTS webhooks (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      url TEXT NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'discord',
      events TEXT[] NOT NULL DEFAULT '{down,recovered}',
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks (user_id)`;

  console.log("webhooks table created successfully.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
