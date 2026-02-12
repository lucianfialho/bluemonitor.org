import { neon } from "@neondatabase/serverless";

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);

  // Ensure services table exists before creating status_checks with FK
  const tableCheck = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables WHERE table_name = 'services'
    ) as exists
  `;
  if (!tableCheck[0].exists) {
    console.log("Services table not found. Please run migrate-services.ts first.");
    process.exit(1);
  }

  console.log("Creating status_checks table...");
  await sql`
    CREATE TABLE IF NOT EXISTS status_checks (
      id BIGSERIAL PRIMARY KEY,
      service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      status VARCHAR(10) NOT NULL CHECK (status IN ('up', 'down', 'slow')),
      response_time INTEGER NOT NULL,
      status_code SMALLINT NOT NULL DEFAULT 0,
      checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  console.log("Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS idx_status_checks_service_time ON status_checks (service_id, checked_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_status_checks_checked_at ON status_checks (checked_at)`;

  console.log("Adding cache columns to services...");
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS current_status VARCHAR(10)`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS current_response_time INTEGER`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ`;

  console.log("Migration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
