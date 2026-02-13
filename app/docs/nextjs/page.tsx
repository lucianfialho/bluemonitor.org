import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Next.js Monitoring Setup — BlueMonitor",
  description:
    "Add uptime monitoring and heartbeat push to your Next.js app. Health endpoint, Vercel Cron heartbeats, and status badge in minutes.",
  alternates: {
    canonical: "/docs/nextjs",
  },
};

export default function NextjsDocsPage() {
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
        <span className="text-zinc-900 dark:text-zinc-100">Next.js</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Next.js
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400">
        Add monitoring to your Next.js app with App Router. Set up a health
        endpoint, push heartbeats with Vercel Cron, and embed a status badge.
      </p>

      {/* Prerequisites */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Prerequisites
        </h2>
        <ul className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            Next.js 13+ with App Router
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            Your app deployed and accessible (e.g., on Vercel)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            <Link
              href="/submit"
              className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
            >
              Submit your service
            </Link>{" "}
            on BlueMonitor (or it auto-registers via the badge)
          </li>
        </ul>
      </section>

      {/* Step 1: Health endpoint */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            1
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Health endpoint
          </h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Create a simple health endpoint that BlueMonitor will ping every 5
          minutes. We check the response status and latency.
        </p>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          app/api/health/route.ts
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`export async function GET() {
  return Response.json({ status: "ok" });
}`}</code>
        </pre>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          That&apos;s it. BlueMonitor will call{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            GET /api/health
          </code>{" "}
          and mark your service as operational if it responds with 200 under 3
          seconds.
        </p>
      </section>

      {/* Step 2: Heartbeat push */}
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
          For detailed dependency monitoring, push heartbeats from your service
          to BlueMonitor. This checks your database, cache, and external APIs
          internally and reports the results. Requires a{" "}
          <Link
            href="/dashboard"
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
          >
            BlueMonitor API key
          </Link>
          .
        </p>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          app/api/cron/heartbeat/route.ts
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`import { db } from "@/lib/db"; // adjust to your setup

async function checkDependency(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    return { status: "ok" as const, latency: Date.now() - start };
  } catch (err) {
    return {
      status: "error" as const,
      latency: Date.now() - start,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function GET() {
  const checks = {
    database: await checkDependency("database", async () => {
      await db\`SELECT 1\`;
    }),
    // redis: await checkDependency("redis", async () => { await redis.ping(); }),
    // stripe: await checkDependency("stripe", async () => { await stripe.balance.retrieve(); }),
  };

  const hasError = Object.values(checks).some((c) => c.status === "error");
  const status = hasError ? "error" : "ok";

  await fetch(
    "https://www.bluemonitor.org/api/v1/heartbeat?domain=yourapp.com",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer bm_your_api_key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        timestamp: new Date().toISOString(),
        checks,
      }),
    }
  );

  return Response.json({ ok: true });
}`}</code>
        </pre>

        <p className="mt-6 mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          vercel.json
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`{
  "crons": [
    {
      "path": "/api/cron/heartbeat",
      "schedule": "*/5 * * * *"
    }
  ]
}`}</code>
        </pre>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          Vercel Cron runs this every 5 minutes. If BlueMonitor stops receiving
          heartbeats for 10 minutes, your service is marked as down.
        </p>
      </section>

      {/* Step 3: Status badge */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
            3
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Status badge
          </h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Add a live status badge to your app. Replace{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            your-domain-com
          </code>{" "}
          with your domain (dots become dashes).
        </p>
        <p className="mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          React component
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`function StatusBadge({ slug }: { slug: string }) {
  return (
    <a
      href={\`https://www.bluemonitor.org/status/\${slug}\`}
      target="_blank"
      rel="noopener"
    >
      <img
        src={\`https://www.bluemonitor.org/api/badge/\${slug}\`}
        alt="Status on BlueMonitor"
        height={36}
      />
    </a>
  );
}

// Usage: <StatusBadge slug="your-domain-com" />`}</code>
        </pre>
        <p className="mt-4 mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          Markdown (README.md)
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-green-400 dark:bg-zinc-950">
          <code>{`[![Status](https://www.bluemonitor.org/api/badge/your-domain-com)](https://www.bluemonitor.org/status/your-domain-com)`}</code>
        </pre>
      </section>

      {/* Environment variables */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Environment variables
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          If using heartbeat push, add your API key to{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            .env.local
          </code>
          :
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`BLUEMONITOR_API_KEY=bm_your_api_key`}</code>
        </pre>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          Then reference it in your heartbeat route:{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            process.env.BLUEMONITOR_API_KEY
          </code>
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
            monitoring for your Next.js app automatically.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 truncate rounded-lg bg-white px-4 py-2.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              https://www.bluemonitor.org/llm-nextjs.txt
            </code>
            <CopyButton text="https://www.bluemonitor.org/llm-nextjs.txt" />
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
              — customize your badge with live preview
            </li>
            <li>
              <Link
                href="/dashboard"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                Dashboard
              </Link>{" "}
              — set up webhooks for Discord, Slack, or custom alerts
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
