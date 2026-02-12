import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type BadgeStatus = "up" | "down" | "slow" | "pending" | "unknown";

const statusConfig: Record<BadgeStatus, { label: string; color: string; dot: string }> = {
  up: { label: "Operational", color: "#16a34a", dot: "#4ade80" },
  down: { label: "Down", color: "#dc2626", dot: "#f87171" },
  slow: { label: "Slow", color: "#ca8a04", dot: "#facc15" },
  pending: { label: "Pending", color: "#2563eb", dot: "#60a5fa" },
  unknown: { label: "Unknown", color: "#52525b", dot: "#a1a1aa" },
};

async function resolveBadgeStatus(slug: string): Promise<BadgeStatus> {
  const sql = getDb();

  const services = await sql`
    SELECT current_status FROM services WHERE slug = ${slug}
  `;

  if (services.length > 0) {
    const s = services[0].current_status as string | null;
    if (s === "up" || s === "down" || s === "slow") return s;
    return "unknown";
  }

  const submissions = await sql`
    SELECT status FROM submissions WHERE url LIKE ${"%" + slug.replace(/-/g, ".") + "%"}
    LIMIT 1
  `;

  if (submissions.length > 0) {
    return submissions[0].status === "approved" ? "unknown" : "pending";
  }

  // Auto-submit
  const domain = slug.replace(/-/g, ".");
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  try {
    await sql`
      INSERT INTO submissions (name, url)
      VALUES (${name}, ${"https://" + domain})
      ON CONFLICT DO NOTHING
    `;
  } catch {
    // ignore
  }

  return "pending";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || slug.length > 253) {
    return new Response("Invalid slug", { status: 400 });
  }

  const theme = request.nextUrl.searchParams.get("theme") === "dark" ? "dark" : "light";
  const badgeStatus = await resolveBadgeStatus(slug);
  const { label, color, dot } = statusConfig[badgeStatus];

  const bgLeft = theme === "dark" ? "#18181b" : "#27272a";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        {/* Left side - brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "0 16px",
            backgroundColor: bgLeft,
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          BlueMonitor
        </div>
        {/* Right side - status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            height: "100%",
            padding: "0 16px",
            backgroundColor: color,
            color: "#ffffff",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: dot,
            }}
          />
          {label}
        </div>
      </div>
    ),
    {
      width: 280,
      height: 36,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}
