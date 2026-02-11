import { NextRequest, NextResponse } from "next/server";
import { StatusCheckResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;

  // Basic validation
  if (!domain || domain.length > 253) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const url = `https://${domain}`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "BlueMonitor/1.0 (status check)",
      },
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - start;

    let status: StatusCheckResult["status"] = "up";
    if (res.status >= 500) {
      status = "down";
    } else if (responseTime > 3000) {
      status = "slow";
    }

    const result: StatusCheckResult = {
      status,
      responseTime,
      statusCode: res.status,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch {
    const responseTime = Date.now() - start;

    const result: StatusCheckResult = {
      status: "down",
      responseTime,
      statusCode: 0,
      checkedAt: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
      },
    });
  }
}
