import { Service, CategoryInfo, Category, Incident } from "./types";
import { getDb } from "./db";

export const categories: CategoryInfo[] = [
  { slug: "ai", name: "AI Services", description: "Artificial intelligence and machine learning platforms" },
  { slug: "social-media", name: "Social Media", description: "Social networking and media sharing platforms" },
  { slug: "gaming", name: "Gaming", description: "Gaming platforms and online games" },
  { slug: "streaming", name: "Streaming", description: "Video and music streaming services" },
  { slug: "productivity", name: "Productivity", description: "Productivity and collaboration tools" },
  { slug: "cloud", name: "Cloud Services", description: "Cloud computing and hosting platforms" },
  { slug: "finance", name: "Finance", description: "Banking and financial services" },
  { slug: "communication", name: "Communication", description: "Messaging and communication platforms" },
  { slug: "ecommerce", name: "E-Commerce", description: "Online shopping and marketplace platforms" },
  { slug: "developer", name: "Developer Tools", description: "Development platforms and tools" },
  { slug: "education", name: "Education", description: "Learning and education platforms" },
  { slug: "delivery", name: "Delivery", description: "Food and package delivery services" },
  { slug: "vpn", name: "VPN & Security", description: "VPN and security services" },
  { slug: "entertainment", name: "Entertainment", description: "Entertainment and media services" },
  { slug: "isp", name: "Internet Providers", description: "Internet service providers and telecom companies" },
  { slug: "dating", name: "Dating", description: "Dating apps and matchmaking platforms" },
  { slug: "logistics", name: "Logistics & Shipping", description: "Shipping and logistics tracking platforms" },
  { slug: "travel", name: "Travel", description: "Airlines, hotels, and travel booking platforms" },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return categories.find((c) => c.slug === slug);
}

function mapRow(row: Record<string, unknown>): Service {
  return {
    id: row.id as number,
    slug: row.slug as string,
    name: row.name as string,
    domain: row.domain as string,
    category: row.category as Category,
    checkUrl: row.check_url as string,
    keywords: row.keywords as string[],
    created_at: row.created_at as string,
    current_status: (row.current_status as Service["current_status"]) ?? null,
    current_response_time: (row.current_response_time as number) ?? null,
    last_checked_at: (row.last_checked_at as string) ?? null,
    last_heartbeat_at: (row.last_heartbeat_at as string) ?? null,
    status_page_url: (row.status_page_url as string) ?? null,
    feed_url: (row.feed_url as string) ?? null,
    feed_api_url: (row.feed_api_url as string) ?? null,
    feed_provider: (row.feed_provider as string) ?? null,
  };
}

export async function getServices(): Promise<Service[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM services ORDER BY name`;
  return rows.map(mapRow);
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM services WHERE slug = ${slug}`;
  return rows[0] ? mapRow(rows[0]) : undefined;
}

export async function getServicesByCategory(category: string): Promise<Service[]> {
  const sql = getDb();
  const rows = await sql`SELECT * FROM services WHERE category = ${category} ORDER BY name`;
  return rows.map(mapRow);
}

export async function getRelatedServices(slug: string, limit = 6): Promise<Service[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT s.* FROM services s
    JOIN services current ON current.slug = ${slug}
    WHERE s.category = current.category AND s.slug != ${slug}
    ORDER BY s.name
    LIMIT ${limit}
  `;
  return rows.map(mapRow);
}

export async function getServiceCount(): Promise<number> {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*)::int as count FROM services`;
  return rows[0].count as number;
}

export async function getServiceCountByCategory(category: string): Promise<number> {
  const sql = getDb();
  const rows = await sql`SELECT COUNT(*)::int as count FROM services WHERE category = ${category}`;
  return rows[0].count as number;
}

export async function getIncidentsBySlug(slug: string, limit = 10): Promise<Incident[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT i.*, s.name as service_name, s.slug as service_slug
    FROM incidents i
    JOIN services s ON s.id = i.service_id
    WHERE s.slug = ${slug}
    ORDER BY i.started_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Incident[];
}

export async function getRecentIncidents(limit = 50): Promise<Incident[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT i.*, s.name as service_name, s.slug as service_slug
    FROM incidents i
    JOIN services s ON s.id = i.service_id
    ORDER BY i.started_at DESC
    LIMIT ${limit}
  `;
  return rows as unknown as Incident[];
}
