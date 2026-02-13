import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Hono Monitoring Setup — BlueMonitor",
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
