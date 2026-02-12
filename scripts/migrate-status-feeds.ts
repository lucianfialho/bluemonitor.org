import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join } from "path";

interface FeedEntry {
  serviceId: number;
  slug: string;
  statusPageUrl: string | null;
  feedUrl: string | null;
  apiUrl: string | null;
  provider: string | null;
}

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(databaseUrl);

  console.log("Adding feed columns to services...");
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS status_page_url VARCHAR(500)`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS feed_url VARCHAR(500)`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS feed_api_url VARCHAR(500)`;
  await sql`ALTER TABLE services ADD COLUMN IF NOT EXISTS feed_provider VARCHAR(20)`;

  console.log("Loading feed data...");
  const feedsPath = join(__dirname, "status-feeds.json");
  const feeds: FeedEntry[] = JSON.parse(readFileSync(feedsPath, "utf-8"));

  console.log(`Updating ${feeds.length} services with feed URLs...`);
  let updated = 0;

  for (let i = 0; i < feeds.length; i += 50) {
    const batch = feeds.slice(i, i + 50);
    const promises = batch.map((f) =>
      sql`
        UPDATE services SET
          status_page_url = ${f.statusPageUrl},
          feed_url = ${f.feedUrl},
          feed_api_url = ${f.apiUrl},
          feed_provider = ${f.provider}
        WHERE id = ${f.serviceId}
      `
    );
    await Promise.all(promises);
    updated += batch.length;
    console.log(`  Progress: ${updated}/${feeds.length}`);
  }

  const result = await sql`SELECT COUNT(*)::int as count FROM services WHERE feed_url IS NOT NULL`;
  console.log(`Done! Services with feeds: ${result[0].count}`);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
