import { Metadata } from "next";
import Link from "next/link";
import CopyButton from "./CopyButton";

export const metadata: Metadata = {
  title: "For Developers — BlueMonitor",
  description:
    "Add monitoring to your SaaS in one prompt. Share our llm.txt with your AI coding tool and get a health endpoint + status badge instantly.",
  alternates: {
    canonical: "/developers",
  },
};

const LLM_TXT_URL = "https://www.bluemonitor.org/llm.txt";

const frameworks = [
  { name: "Next.js", file: "app/api/health/route.ts" },
  { name: "Express", file: "routes/health.ts" },
  { name: "Hono", file: "src/health.ts" },
  { name: "FastAPI", file: "app/health.py" },
  { name: "Rails", file: "config/routes.rb" },
  { name: "Laravel", file: "routes/api.php" },
];

export default function DevelopersPage() {
  return (
    <div>
      {/* Hero */}
      <section className="px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl lg:text-7xl">
            One prompt.
            <br />
            Full monitoring.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-xl">
            Share this URL with Claude, Cursor, Copilot, or any AI coding tool.
            It creates a health endpoint and status badge for your SaaS
            automatically.
          </p>
        </div>
      </section>

      {/* llm.txt CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Paste this in your AI coding tool
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Works with any AI assistant that can read URLs — Claude Code,
              Cursor, GitHub Copilot, Windsurf, Codex, and more.
            </p>
            <div className="flex items-center gap-2">
              <code className="block flex-1 overflow-x-auto rounded-xl bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 dark:bg-zinc-950">
                {LLM_TXT_URL}
              </code>
              <CopyButton text={LLM_TXT_URL} />
            </div>
          </div>
        </div>
      </section>

      {/* What the AI does */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-lg text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
            What your AI will do.
          </h2>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                1
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Create a health endpoint
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                <code className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                  GET /api/health
                </code>{" "}
                — a simple endpoint that returns your service status. We check
                response time and status code every 5 minutes.
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                2
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Add a status badge
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                A live badge on your site showing Operational, Slow, or Down.
                Updates every 5 minutes. Works in HTML, Markdown, and any
                framework.
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white">
                3
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Push heartbeats (optional)
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Push detailed health data — database, cache, APIs — to
                BlueMonitor via{" "}
                <code className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                  POST /api/v1/heartbeat
                </code>
                . No public endpoint needed. Perfect for private services.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <code className="block flex-1 overflow-x-auto rounded-xl bg-zinc-900 px-3 py-2 text-xs text-zinc-300 dark:bg-zinc-950">
                  {LLM_TXT_URL}
                </code>
                <CopyButton text={LLM_TXT_URL} />
              </div>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                Paste in your AI tool to implement it automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How BlueMonitor checks */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
            How we monitor your SaaS.
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-600">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    With health endpoint
                  </h3>
                  <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
                    We call{" "}
                    <code className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                      /api/health
                    </code>{" "}
                    every 5 minutes and check the response status and latency.
                    If it returns an error or times out, we mark your service as
                    down.
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-xs text-zinc-300 dark:bg-zinc-950">
                    <code>{`{
  "status": "ok"
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-400 dark:bg-zinc-600">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Without health endpoint
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    We fall back to a HEAD request on your root domain. We can
                    only tell if the server responds and how fast — no internal
                    diagnostics.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Push monitoring (heartbeat)
                  </h3>
                  <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
                    Your service pushes detailed health data to BlueMonitor via{" "}
                    <code className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                      POST /api/v1/heartbeat
                    </code>
                    . Report each dependency individually — database, cache,
                    external APIs. If we stop receiving heartbeats for 10
                    minutes, the service is marked as down.
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3 text-xs text-zinc-300 dark:bg-zinc-950">
                    <code>{`{
  "status": "ok",
  "checks": {
    "database": { "status": "ok", "latency": 5 },
    "redis":    { "status": "ok", "latency": 2 },
    "stripe":   { "status": "ok", "latency": 120 }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported frameworks */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Works with any stack.
          </h2>
          <p className="mb-12 text-center text-zinc-500 dark:text-zinc-400">
            The{" "}
            <code className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              llm.txt
            </code>{" "}
            includes examples for popular frameworks. Your AI will pick the
            right one.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {frameworks.map((fw) => (
              <div
                key={fw.name}
                className="rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800/50"
              >
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {fw.name}
                </div>
                <code className="text-xs text-zinc-400">{fw.file}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status values */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Status checks every 5 minutes.
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Operational",
                color: "bg-green-500",
                rule: "< 3s response",
              },
              {
                label: "Slow",
                color: "bg-yellow-500",
                rule: "> 3s response",
              },
              {
                label: "Down",
                color: "bg-red-500",
                rule: "HTTP 500+ or timeout",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-zinc-100 p-4 text-center dark:bg-zinc-800/50"
              >
                <span
                  className={`mb-2 inline-block h-3 w-3 rounded-full ${s.color}`}
                />
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {s.label}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {s.rule}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/badge"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Badge generator
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              API docs
            </Link>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Submit your SaaS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
