import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Creating watchlist table...");

  await sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, service_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist (user_id)`;

  console.log("watchlist table created successfully.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
