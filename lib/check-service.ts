import { StatusCheckResult, HealthEndpointResponse } from "./types";

async function tryHealthEndpoint(
  domain: string,
  timeout: number
): Promise<{ ok: true; result: StatusCheckResult } | { ok: false }> {
  const url = `https://${domain}/api/health`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "BlueMonitor/1.0 (status check)",
        Accept: "application/json",
      },
    });

    clearTimeout(timer);
    const responseTime = Date.now() - start;

    if (res.status === 404 || res.status === 405) {
      return { ok: false };
    }

    let healthData: HealthEndpointResponse | null = null;
    try {
      const json = await res.json();
      if (json && typeof json === "object" && "status" in json) {
        healthData = json as HealthEndpointResponse;
      }
    } catch {
      // Not JSON — fall back to root check
      return { ok: false };
    }

    // Determine status from health response
    let status: StatusCheckResult["status"] = "up";
    const hasFailedCheck =
      healthData?.checks &&
      Object.values(healthData.checks).some((c) => c.status === "error");

    if (res.status >= 500 || healthData?.status === "error" || hasFailedCheck) {
      status = "down";
    } else if (
      healthData?.status === "degraded" ||
      responseTime > 3000
    ) {
      status = "slow";
    }

    return {
      ok: true,
      result: {
        status,
        responseTime,
        statusCode: res.status,
        checkedAt: new Date().toISOString(),
        healthEndpoint: true,
        healthData,
      },
    };
  } catch {
    return { ok: false };
  }
}

export async function checkService(
  domain: string,
  timeout = 10000
): Promise<StatusCheckResult> {
  // Try /api/health first for richer diagnostics
  const health = await tryHealthEndpoint(domain, timeout);
  if (health.ok) {
    return health.result;
  }

  // Fallback: HEAD request on root domain
  const url = `https://${domain}`;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "BlueMonitor/1.0 (status check)",
      },
    });

    clearTimeout(timer);
    const responseTime = Date.now() - start;

    let status: StatusCheckResult["status"] = "up";
    if (res.status >= 500) {
      status = "down";
    } else if (responseTime > 3000) {
      status = "slow";
    }

    return {
      status,
      responseTime,
      statusCode: res.status,
      checkedAt: new Date().toISOString(),
      healthEndpoint: false,
    };
  } catch {
    const responseTime = Date.now() - start;

    return {
      status: "down",
      responseTime,
      statusCode: 0,
      checkedAt: new Date().toISOString(),
      healthEndpoint: false,
    };
  }
}
