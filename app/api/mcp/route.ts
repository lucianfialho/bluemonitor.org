import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { checkService } from "@/lib/check-service";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "list_services",
      "List monitored services on BlueMonitor. Optionally filter by category.",
      { category: z.string().optional(), limit: z.number().default(50) },
      async ({ category, limit }) => {
        const sql = getDb();
        const services = category
          ? await sql`
              SELECT slug, name, domain, category, current_status, current_response_time, last_checked_at
              FROM services
              WHERE category = ${category}
              ORDER BY name
              LIMIT ${limit}
            `
          : await sql`
              SELECT slug, name, domain, category, current_status, current_response_time, last_checked_at
              FROM services
              ORDER BY name
              LIMIT ${limit}
            `;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                services.map((s) => ({
                  slug: s.slug,
                  name: s.name,
                  domain: s.domain,
                  category: s.category,
                  status: s.current_status || "unknown",
                  response_time_ms: s.current_response_time,
                  last_checked: s.last_checked_at,
                })),
                null,
                2
              ),
            },
          ],
        };
      }
    );

    server.tool(
      "check_status",
      "Get the current status of a specific monitored service by its slug.",
      { slug: z.string() },
      async ({ slug }) => {
        const sql = getDb();
        const rows = await sql`
          SELECT s.slug, s.name, s.domain, s.category, s.current_status, s.current_response_time, s.last_checked_at,
                 sc.status as check_status, sc.response_time as check_response_time, sc.status_code, sc.checked_at
          FROM services s
          LEFT JOIN LATERAL (
            SELECT status, response_time, status_code, checked_at
            FROM status_checks
            WHERE service_id = s.id
            ORDER BY checked_at DESC
            LIMIT 1
          ) sc ON true
          WHERE s.slug = ${slug}
        `;

        if (rows.length === 0) {
          return {
            content: [{ type: "text" as const, text: `Service "${slug}" not found.` }],
          };
        }

        const s = rows[0];
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  slug: s.slug,
                  name: s.name,
                  domain: s.domain,
                  category: s.category,
                  status: s.current_status || "unknown",
                  response_time_ms: s.current_response_time,
                  last_checked: s.last_checked_at,
                  latest_check: s.checked_at
                    ? {
                        status: s.check_status,
                        response_time_ms: s.check_response_time,
                        status_code: s.status_code,
                        checked_at: s.checked_at,
                      }
                    : null,
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );

    server.tool(
      "list_watchlist",
      "List services in the authenticated user's watchlist.",
      {},
      async (_params, { authInfo }) => {
        if (!authInfo?.clientId) {
          return {
            content: [{ type: "text" as const, text: "Authentication required to access watchlist." }],
          };
        }

        const sql = getDb();
        const services = await sql`
          SELECT s.slug, s.name, s.domain, s.category, s.current_status, s.current_response_time, s.last_checked_at, w.created_at as added_at
          FROM watchlist w
          JOIN services s ON s.id = w.service_id
          WHERE w.user_id = ${authInfo.clientId}
          ORDER BY w.created_at DESC
        `;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                services.map((s) => ({
                  slug: s.slug,
                  name: s.name,
                  domain: s.domain,
                  category: s.category,
                  status: s.current_status || "unknown",
                  response_time_ms: s.current_response_time,
                  last_checked: s.last_checked_at,
                  added_at: s.added_at,
                })),
                null,
                2
              ),
            },
          ],
        };
      }
    );

    server.tool(
      "get_incidents",
      "Get recent incidents for a specific service.",
      { slug: z.string(), limit: z.number().default(10) },
      async ({ slug, limit }) => {
        const sql = getDb();
        const incidents = await sql`
          SELECT i.id, i.type, i.title, i.status, i.started_at, i.resolved_at,
                 s.name as service_name, s.slug as service_slug
          FROM incidents i
          JOIN services s ON s.id = i.service_id
          WHERE s.slug = ${slug}
          ORDER BY i.started_at DESC
          LIMIT ${limit}
        `;

        if (incidents.length === 0) {
          return {
            content: [{ type: "text" as const, text: `No recent incidents found for "${slug}".` }],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(incidents, null, 2),
            },
          ],
        };
      }
    );

    server.tool(
      "check_domain",
      "Perform an on-demand status check for any domain. Returns status, response time, and HTTP status code.",
      { domain: z.string() },
      async ({ domain }) => {
        const cleaned = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
        const result = await checkService(cleaned);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  domain: cleaned,
                  status: result.status,
                  response_time_ms: result.responseTime,
                  status_code: result.statusCode,
                  checked_at: result.checkedAt,
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );
  },
  { capabilities: {} },
  { basePath: "/api" }
);

const verifyToken = async (_req: Request, bearerToken?: string) => {
  if (!bearerToken?.startsWith("bm_")) return undefined;
  const sql = getDb();
  const keys = await sql`SELECT user_id FROM api_keys WHERE key = ${bearerToken}`;
  if (keys.length === 0) return undefined;
  return {
    token: bearerToken,
    clientId: keys[0].user_id as string,
    scopes: ["read"],
  };
};

const authHandler = withMcpAuth(handler, verifyToken, { required: true });

export { authHandler as GET, authHandler as POST, authHandler as DELETE };
