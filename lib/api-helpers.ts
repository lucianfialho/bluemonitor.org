import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "./rate-limit";

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function withRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIp(request);
  const { success, remaining, reset } = rateLimit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Limit: 60 per minute." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "60",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(reset / 1000).toString(),
          "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  // Store remaining for use in response headers
  (request as unknown as Record<string, number>).__rlRemaining = remaining;
  (request as unknown as Record<string, number>).__rlReset = reset;
  return null;
}

export function apiResponse(
  request: NextRequest,
  data: unknown,
  { cacheSecs = 60 } = {}
): NextResponse {
  const remaining =
    (request as unknown as Record<string, number>).__rlRemaining ?? 60;
  const reset =
    (request as unknown as Record<string, number>).__rlReset ?? Date.now() + 60000;

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${cacheSecs}, stale-while-revalidate=${cacheSecs * 2}`,
      "X-RateLimit-Limit": "60",
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(reset / 1000).toString(),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
