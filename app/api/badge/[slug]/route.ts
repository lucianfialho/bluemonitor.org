import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type BadgeStatus = "up" | "down" | "slow" | "pending" | "unknown";

const statusConfig: Record<BadgeStatus, { label: string; color: string }> = {
  up: { label: "Operational", color: "#22c55e" },
  down: { label: "Down", color: "#ef4444" },
  slow: { label: "Slow", color: "#eab308" },
  pending: { label: "Pending", color: "#3b82f6" },
  unknown: { label: "Unknown", color: "#71717a" },
};

function generateBadgeSvg(status: BadgeStatus, theme: "light" | "dark"): string {
  const { label, color } = statusConfig[status];
  const leftText = "BlueMonitor";
  const rightText = label;

  const leftWidth = leftText.length * 7.5 + 16;
  const rightWidth = rightText.length * 7 + 24;
  const totalWidth = leftWidth + rightWidth;

  const leftBg = theme === "dark" ? "#27272a" : "#3f3f46";
  const leftTextColor = "#ffffff";
  const rightTextColor = "#ffffff";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="24" viewBox="0 0 ${totalWidth} 24">
  <defs>
    <clipPath id="r"><rect width="${totalWidth}" height="24" rx="6"/></clipPath>
  </defs>
  <g clip-path="url(#r)">
    <rect width="${leftWidth}" height="24" fill="${leftBg}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="24" fill="${color}"/>
  </g>
  <g fill="${leftTextColor}" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="600">
    <text x="${leftWidth / 2}" y="15.5" text-anchor="middle">${leftText}</text>
  </g>
  <g fill="${rightTextColor}" font-family="system-ui,-apple-system,sans-serif" font-size="12" font-weight="600">
    <circle cx="${leftWidth + 10}" cy="12" r="4" fill="${rightTextColor}" opacity="0.9"/>
    <text x="${leftWidth + 20 + (rightWidth - 24) / 2}" y="15.5" text-anchor="middle">${rightText}</text>
  </g>
</svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug || slug.length > 253) {
    return new NextResponse("Invalid slug", { status: 400 });
  }

  const theme = request.nextUrl.searchParams.get("theme") === "dark" ? "dark" : "light";
  const sql = getDb();

  // Check if service exists
  const services = await sql`
    SELECT current_status FROM services WHERE slug = ${slug}
  `;

  let badgeStatus: BadgeStatus;

  if (services.length > 0) {
    const currentStatus = services[0].current_status as string | null;
    if (currentStatus === "up" || currentStatus === "down" || currentStatus === "slow") {
      badgeStatus = currentStatus;
    } else {
      badgeStatus = "unknown";
    }
  } else {
    // Check if already submitted
    const submissions = await sql`
      SELECT status FROM submissions WHERE url LIKE ${"%" + slug.replace(/-/g, ".") + "%"}
      LIMIT 1
    `;

    if (submissions.length > 0) {
      const subStatus = submissions[0].status as string;
      badgeStatus = subStatus === "approved" ? "unknown" : "pending";
    } else {
      // Auto-submit as new service
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
        // ignore duplicate
      }

      badgeStatus = "pending";
    }
  }

  const svg = generateBadgeSvg(badgeStatus, theme);

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
