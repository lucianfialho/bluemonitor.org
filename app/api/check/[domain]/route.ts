import { NextRequest, NextResponse } from "next/server";
import { checkService } from "@/lib/check-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const { domain } = await params;

  if (!domain || domain.length > 253) {
    return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
  }

  const result = await checkService(domain);

  const cacheControl =
    result.status === "down"
      ? "public, s-maxage=30, stale-while-revalidate=15"
      : "public, s-maxage=60, stale-while-revalidate=30";

  return NextResponse.json(result, {
    headers: { "Cache-Control": cacheControl },
  });
}
