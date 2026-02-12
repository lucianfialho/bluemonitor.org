import { neon } from "@neondatabase/serverless";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);

  console.log("Creating incidents table...");
  await sql`
    CREATE TABLE IF NOT EXISTS incidents (
      id BIGSERIAL PRIMARY KEY,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      source_id VARCHAR(255) NOT NULL,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      severity VARCHAR(20) NOT NULL DEFAULT 'minor',
      status VARCHAR(20) NOT NULL DEFAULT 'resolved',
      started_at TIMESTAMPTZ NOT NULL,
      resolved_at TIMESTAMPTZ,
      source_url VARCHAR(500),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("Creating indexes...");
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_source ON incidents (service_id, source_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_incidents_service_time ON incidents (service_id, started_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_incidents_started ON incidents (started_at DESC)`;

  console.log("Migration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
