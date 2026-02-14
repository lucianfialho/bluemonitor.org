import { NextRequest, NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "./rate-limit";
import { getDb } from "./db";
import { getUserPlanByApiKey } from "./plans";

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer bm_")) return null;
  return auth.slice(7); // "Bearer " is 7 chars
}

async function validateApiKey(key: string): Promise<boolean> {
  try {
    const sql = getDb();
    const rows = await sql`SELECT id FROM api_keys WHERE key = ${key}`;
    if (rows.length > 0) {
      // Update last_used_at in background (don't await)
      sql`UPDATE api_keys SET last_used_at = NOW() WHERE key = ${key}`.catch(
        () => {}
      );
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function extractApiKeyOwner(
  request: NextRequest
): Promise<{ userId: string; apiKey: string } | null> {
  const apiKey = getApiKey(request);
  if (!apiKey) return null;

  try {
    const sql = getDb();
    const rows = await sql`SELECT user_id FROM api_keys WHERE key = ${apiKey}`;
    if (rows.length === 0) return null;

    // Update last_used_at in background
    sql`UPDATE api_keys SET last_used_at = NOW() WHERE key = ${apiKey}`.catch(
      () => {}
    );

    return { userId: rows[0].user_id as string, apiKey };
  } catch {
    return null;
  }
}

export async function withRateLimit(
  request: NextRequest
): Promise<NextResponse | null> {
  const apiKey = getApiKey(request);
  let identifier: string;
  let limit: number;

  if (apiKey) {
    const valid = await validateApiKey(apiKey);
    if (valid) {
      identifier = `key:${apiKey}`;
      const plan = await getUserPlanByApiKey(apiKey);
      limit = plan.limits.rateLimitAuthenticated;
    } else {
      return NextResponse.json(
        { error: "Invalid API key." },
        { status: 401 }
      );
    }
  } else {
    identifier = getClientIp(request);
    limit = RATE_LIMITS.anonymous;
  }

  const result = rateLimit(identifier, { limit });

  if (!result.success) {
    return NextResponse.json(
      { error: `Too many requests. Limit: ${limit} per minute.` },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
          "Retry-After": Math.ceil(
            (result.reset - Date.now()) / 1000
          ).toString(),
        },
      }
    );
  }

  (request as unknown as Record<string, number>).__rlRemaining =
    result.remaining;
  (request as unknown as Record<string, number>).__rlReset = result.reset;
  (request as unknown as Record<string, number>).__rlLimit = limit;
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
    (request as unknown as Record<string, number>).__rlReset ??
    Date.now() + 60000;
  const limit =
    (request as unknown as Record<string, number>).__rlLimit ??
    RATE_LIMITS.anonymous;

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${cacheSecs}, stale-while-revalidate=${cacheSecs * 2}`,
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(reset / 1000).toString(),
      "Access-Control-Allow-Origin": "*",
    },
  });
}
