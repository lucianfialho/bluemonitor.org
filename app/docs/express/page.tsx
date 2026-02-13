import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Express Monitoring Setup — BlueMonitor",
  description:
    "Add uptime monitoring and heartbeat push to your Express app. Health endpoint, node-cron heartbeats, and status badge.",
  alternates: {
    canonical: "/docs/express",
  },
};

export default function ExpressDocsPage() {
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
        <span className="text-zinc-900 dark:text-zinc-100">Express</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Express
      </h1>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400">
        Add monitoring to your Express app. Set up a health endpoint, push
        heartbeats with node-cron, and embed a status badge.
      </p>

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
          A simple route that BlueMonitor pings every 5 minutes.
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});`}</code>
        </pre>
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
          Push detailed dependency health data on a schedule using{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            node-cron
          </code>
          . Install it first:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-green-400 dark:bg-zinc-950">
          <code>{`npm install node-cron`}</code>
        </pre>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`import cron from "node-cron";

async function sendHeartbeat() {
  const checks = {};

  // Database check
  const dbStart = Date.now();
  try {
    await db.query("SELECT 1");
    checks.database = { status: "ok", latency: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: "error",
      latency: Date.now() - dbStart,
      message: err.message,
    };
  }

  // Add more checks: redis, external APIs, etc.

  const hasError = Object.values(checks).some((c) => c.status === "error");

  await fetch("https://www.bluemonitor.org/api/v1/heartbeat", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.BLUEMONITOR_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      domain: "yourapp.com",
      status: hasError ? "error" : "ok",
      timestamp: new Date().toISOString(),
      checks,
    }),
  });
}

// Every 5 minutes
cron.schedule("*/5 * * * *", sendHeartbeat);
sendHeartbeat(); // Send immediately on startup`}</code>
        </pre>
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
          If you serve HTML, add the badge. Replace{" "}
          <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            your-domain-com
          </code>{" "}
          with your domain (dots become dashes).
        </p>
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-300 dark:bg-zinc-950">
          <code>{`<a href="https://www.bluemonitor.org/status/your-domain-com">
  <img
    src="https://www.bluemonitor.org/api/badge/your-domain-com"
    alt="Status on BlueMonitor"
    height="36"
  />
</a>`}</code>
        </pre>
        <p className="mt-4 mb-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          Markdown (README.md)
        </p>
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
            monitoring for your Express app automatically.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 truncate rounded-lg bg-white px-4 py-2.5 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
              https://www.bluemonitor.org/llm-express.txt
            </code>
            <CopyButton text="https://www.bluemonitor.org/llm-express.txt" />
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
            <li>
              <Link
                href="/dashboard"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-100"
              >
                Dashboard
              </Link>{" "}
              — set up webhook alerts
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
