const hits = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of hits) {
    if (now > val.resetAt) hits.delete(key);
  }
}, 5 * 60 * 1000);

export const RATE_LIMITS = {
  anonymous: 60,
  authenticated: 300,
} as const;

export function rateLimit(
  identifier: string,
  { limit = RATE_LIMITS.anonymous as number, windowMs = 60_000 } = {}
): { success: boolean; remaining: number; reset: number; limit: number } {
  const now = Date.now();
  const entry = hits.get(identifier);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    hits.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, reset: resetAt, limit };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);

  if (entry.count > limit) {
    return { success: false, remaining: 0, reset: entry.resetAt, limit };
  }

  return { success: true, remaining, reset: entry.resetAt, limit };
}
