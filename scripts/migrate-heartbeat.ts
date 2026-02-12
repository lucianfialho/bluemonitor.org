import { neon } from "@neondatabase/serverless";

async function migrate() {
  const sql = neon(process.env.DATABASE_URL!);

  console.log("Adding last_heartbeat_at column to services...");

  await sql`
    ALTER TABLE services
    ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ
  `;

  console.log("last_heartbeat_at column added successfully.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
