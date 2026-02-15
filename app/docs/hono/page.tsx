import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Hono Monitoring Setup",
  description:
    "Add uptime monitoring and heartbeat push to your Hono app. Health endpoint, scheduled heartbeats, and status badge.",
  alternates: {
    canonical: "/docs/hono",
  },
};

export default function HonoDocsPage() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
        <Link
          href="/docs"
          className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Docs
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Hono</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Hono
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400">
        Add monitoring to your Hono app. Works on Cloudflare Workers, Deno,
        Bun, and Node.js. Health endpoint, heartbeat push, and status badge.
      </p>

      {/* Step 1 */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            1
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Health endpoint
          </h2>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`import { Hono } from "hono";

const app = new Hono();

app.get("/api/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;`}</code>
        </pre>
      </section>

      {/* Step 2 */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            2
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Heartbeat push (optional)
          </h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          On Cloudflare Workers, use a{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            scheduled
          </code>{" "}
          handler. On other runtimes, use setInterval or a cron library.
        </p>

        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          Cloudflare Workers (wrangler.toml)
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`[triggers]
crons = ["*/5 * * * *"]`}</code>
        </pre>

        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          src/index.ts
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`export default {
  fetch: app.fetch,

  async scheduled(event, env, ctx) {
    const checks = {};

    // Database check (D1, Turso, etc.)
    const dbStart = Date.now();
    try {
      await env.DB.prepare("SELECT 1").run();
      checks.database = { status: "ok", latency: Date.now() - dbStart };
    } catch (err) {
      checks.database = { status: "error", latency: Date.now() - dbStart };
    }

    const hasError = Object.values(checks).some((c) => c.status === "error");

    await fetch("https://www.bluemonitor.org/api/v1/heartbeat", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${env.BLUEMONITOR_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: "yourapp.com",
        status: hasError ? "error" : "ok",
        timestamp: new Date().toISOString(),
        checks,
      }),
    });
  },
};`}</code>
        </pre>
      </section>

      {/* Step 3 */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            3
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Status badge
          </h2>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-green-400 dark:bg-zinc-950">
          <code>{`[![Status](https://www.bluemonitor.org/api/badge/your-domain-com)](https://www.bluemonitor.org/status/your-domain-com)`}</code>
        </pre>
      </section>

      {/* Step 4: Bot tracking */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            4
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Bot tracking
            </h2>
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
              PRO
            </span>
          </div>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Track which search engines, AI crawlers, and social bots visit your
          app. Add bot detection middleware to report visits to BlueMonitor.
          Requires a{" "}
          <Link
            href="/pricing"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
          >
            Pro plan
          </Link>
          .
        </p>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          Hono middleware
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`import { createMiddleware } from "hono/factory";

const BOT_PATTERNS = [
  { pattern: /Googlebot/i, name: "googlebot", category: "search_engine" },
  { pattern: /bingbot/i, name: "bingbot", category: "search_engine" },
  { pattern: /GPTBot/i, name: "gptbot", category: "ai_crawler" },
  { pattern: /ClaudeBot/i, name: "claudebot", category: "ai_crawler" },
  { pattern: /PerplexityBot/i, name: "perplexitybot", category: "ai_crawler" },
  { pattern: /Twitterbot/i, name: "twitterbot", category: "social" },
  { pattern: /facebookexternalhit/i, name: "facebookbot", category: "social" },
  { pattern: /AhrefsBot/i, name: "ahrefsbot", category: "seo" },
];

function identifyBot(ua) {
  for (const bot of BOT_PATTERNS) {
    if (bot.pattern.test(ua)) return bot;
  }
  return null;
}

const botTracking = createMiddleware(async (c, next) => {
  const ua = c.req.header("user-agent") || "";
  const bot = identifyBot(ua);
  if (bot) {
    // Use waitUntil on Workers, await on other runtimes
    const promise = fetch("https://www.bluemonitor.org/api/v1/bot-visits", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${c.env?.BLUEMONITOR_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: "yourapp.com",
        visits: [{
          bot_name: bot.name,
          bot_category: bot.category,
          path: new URL(c.req.url).pathname,
          user_agent: ua,
        }],
      }),
    }).catch(() => {});
    if (c.executionCtx?.waitUntil) {
      c.executionCtx.waitUntil(promise);
    } else {
      await promise;
    }
  }
  await next();
});

app.use("*", botTracking);`}</code>
        </pre>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          View results in your{" "}
          <Link
            href="/dashboard"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
          >
            dashboard
          </Link>{" "}
          under Bot Tracking.
        </p>
      </section>

      {/* AI tool CTA */}
      <section className="mt-12">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
          <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
            Using an AI coding tool?
          </h2>
          <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
            Paste this URL in Claude, Cursor, or Copilot and it will set up
            monitoring for your Hono app automatically.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 truncate rounded-lg bg-white px-4 py-2.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              https://www.bluemonitor.org/llm-hono.txt
            </code>
            <CopyButton text="https://www.bluemonitor.org/llm-hono.txt" />
          </div>
        </div>
      </section>

      {/* Next steps */}
      <section className="mt-12">
        <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50">
          <h2 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100">
            Next steps
          </h2>
          <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/docs/api"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                API Reference
              </Link>{" "}
              — explore all endpoints
            </li>
            <li>
              <Link
                href="/badge"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                Badge Generator
              </Link>{" "}
              — customize your badge
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
