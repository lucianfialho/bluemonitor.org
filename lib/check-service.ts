import { StatusCheckResult } from "./types";

export async function checkService(
  domain: string,
  timeout = 10000
): Promise<StatusCheckResult> {
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
    };
  } catch {
    const responseTime = Date.now() - start;

    return {
      status: "down",
      responseTime,
      statusCode: 0,
      checkedAt: new Date().toISOString(),
    };
  }
}
