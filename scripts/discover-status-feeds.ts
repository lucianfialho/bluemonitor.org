import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(databaseUrl);

interface ServiceRow {
  id: number;
  slug: string;
  name: string;
  domain: string;
}

interface FeedResult {
  serviceId: number;
  slug: string;
  name: string;
  domain: string;
  statusPageUrl: string | null;
  feedUrl: string | null;
  apiUrl: string | null;
  provider: string | null;
}

// Common status page URL patterns to try
function getStatusPageCandidates(domain: string): string[] {
  const base = domain.replace(/^www\./, "");
  const name = base.split(".")[0];

  return [
    `https://status.${base}`,
    `https://${name}.statuspage.io`,
    `https://www.${name}status.com`,
    `https://${name}status.com`,
    `https://status.${name}.com`,
    `https://${base}/status`,
  ];
}

async function tryFetch(url: string, timeout = 5000): Promise<{ ok: boolean; text: string; contentType: string }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "BlueMonitor/1.0 (feed discovery)" },
    });
    clearTimeout(timer);
    const text = await res.text();
    return { ok: res.ok, text: text.slice(0, 2000), contentType: res.headers.get("content-type") || "" };
  } catch {
    return { ok: false, text: "", contentType: "" };
  }
}

async function discoverFeed(service: ServiceRow): Promise<FeedResult> {
  const result: FeedResult = {
    serviceId: service.id,
    slug: service.slug,
    name: service.name,
    domain: service.domain,
    statusPageUrl: null,
    feedUrl: null,
    apiUrl: null,
    provider: null,
  };

  const candidates = getStatusPageCandidates(service.domain);

  for (const base of candidates) {
    // Try Statuspage/incident.io JSON API first (most reliable)
    const apiUrl = `${base}/api/v2/summary.json`;
    const apiRes = await tryFetch(apiUrl);

    if (apiRes.ok && apiRes.contentType.includes("json")) {
      try {
        const data = JSON.parse(apiRes.text);
        if (data.page && data.status) {
          result.statusPageUrl = base;
          result.apiUrl = apiUrl;
          result.feedUrl = `${base}/history.rss`;
          result.provider = apiRes.text.includes("incident.io") ? "incident.io" : "statuspage";
          return result;
        }
      } catch {
        // not valid JSON
      }
    }

    // Try RSS feed directly
    const rssUrl = `${base}/history.rss`;
    const rssRes = await tryFetch(rssUrl);
    if (rssRes.ok && (rssRes.contentType.includes("xml") || rssRes.contentType.includes("rss") || rssRes.text.includes("<rss"))) {
      result.statusPageUrl = base;
      result.feedUrl = rssUrl;
      result.provider = "statuspage";
      return result;
    }

    // Try Atom feed
    const atomUrl = `${base}/feed.atom`;
    const atomRes = await tryFetch(atomUrl);
    if (atomRes.ok && (atomRes.contentType.includes("atom") || atomRes.contentType.includes("xml") || atomRes.text.includes("<feed"))) {
      result.statusPageUrl = base;
      result.feedUrl = atomUrl;
      result.provider = "atom";
      return result;
    }

    // Try Slack-style feed
    const slackRss = `${base}/feed/rss`;
    const slackRes = await tryFetch(slackRss);
    if (slackRes.ok && (slackRes.contentType.includes("xml") || slackRes.text.includes("<rss"))) {
      result.statusPageUrl = base;
      result.feedUrl = slackRss;
      result.provider = "custom";
      return result;
    }

    // Try AWS-style feed
    const awsRss = `${base}/rss/all.rss`;
    const awsRes = await tryFetch(awsRss);
    if (awsRes.ok && (awsRes.contentType.includes("xml") || awsRes.text.includes("<rss"))) {
      result.statusPageUrl = base;
      result.feedUrl = awsRss;
      result.provider = "aws";
      return result;
    }
  }

  return result;
}

async function main() {
  const services = (await sql`SELECT id, slug, name, domain FROM services ORDER BY name`) as ServiceRow[];
  console.log(`Scanning ${services.length} services for status feeds...\n`);

  const found: FeedResult[] = [];
  const BATCH_SIZE = 20;

  for (let i = 0; i < services.length; i += BATCH_SIZE) {
    const batch = services.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(discoverFeed));

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.feedUrl) {
        found.push(r.value);
        console.log(`  ✓ ${r.value.name} → ${r.value.provider} → ${r.value.apiUrl || r.value.feedUrl}`);
      }
    }

    const progress = Math.min(i + BATCH_SIZE, services.length);
    process.stdout.write(`\r  Progress: ${progress}/${services.length} (found: ${found.length})`);
  }

  console.log(`\n\n=== RESULTS ===`);
  console.log(`Total services: ${services.length}`);
  console.log(`With status feeds: ${found.length}`);
  console.log(`\nBy provider:`);

  const byProvider: Record<string, number> = {};
  for (const f of found) {
    byProvider[f.provider || "unknown"] = (byProvider[f.provider || "unknown"] || 0) + 1;
  }
  for (const [provider, count] of Object.entries(byProvider)) {
    console.log(`  ${provider}: ${count}`);
  }

  console.log(`\n--- Full list ---`);
  for (const f of found) {
    console.log(`${f.slug} | ${f.provider} | ${f.apiUrl || f.feedUrl}`);
  }

  // Output as JSON for further processing
  const outputPath = "scripts/status-feeds.json";
  const { writeFileSync } = await import("fs");
  writeFileSync(outputPath, JSON.stringify(found, null, 2));
  console.log(`\nSaved to ${outputPath}`);
}

main().catch((err) => {
  console.error("Discovery failed:", err);
  process.exit(1);
});
