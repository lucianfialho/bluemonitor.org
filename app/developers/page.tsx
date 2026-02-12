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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          One prompt. Full monitoring.
        </h1>
        <p className="mx-auto max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
          Share this URL with Claude, Cursor, Copilot, or any AI coding tool.
          It creates a health endpoint and status badge for your SaaS
          automatically.
        </p>
      </div>

      {/* llm.txt CTA */}
      <section className="mb-12 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Paste this in your AI coding tool
        </h2>
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          Works with any AI assistant that can read URLs — Claude Code, Cursor,
          GitHub Copilot, Windsurf, Codex, and more.
        </p>
        <div className="flex items-center gap-2">
          <code className="block flex-1 overflow-x-auto rounded-lg bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300">
            {LLM_TXT_URL}
          </code>
          <CopyButton text={LLM_TXT_URL} />
        </div>
      </section>

      {/* What the AI does */}
      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          What your AI will do
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-600 dark:bg-green-950 dark:text-green-400">
              1
            </div>
            <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
              Create a health endpoint
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <code className="text-xs">GET /api/health</code> — returns{" "}
              <code className="text-xs">{`{ "status": "ok" }`}</code> when your
              service is healthy. Can include database and dependency checks.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              2
            </div>
            <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
              Add a status badge
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              A live badge on your site showing Operational, Slow, or Down.
              Updates every 5 minutes. Works in HTML, Markdown, and any
              framework.
            </p>
          </div>
        </div>
      </section>

      {/* How BlueMonitor checks */}
      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          How we monitor your SaaS
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  With health endpoint
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  We call <code className="text-xs">/api/health</code> and parse
                  the JSON response. Your endpoint can report database status,
                  external dependencies, memory usage — anything you expose. If
                  it returns{" "}
                  <code className="text-xs">{`"status": "error"`}</code> or HTTP
                  500, we mark it as down.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <svg className="h-4 w-4 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                  Without health endpoint
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  We fall back to a HEAD request on your root domain. We can only
                  tell if the server responds and how fast — no internal
                  diagnostics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported frameworks */}
      <section className="mb-12">
        <h2 className="mb-4 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Works with any stack
        </h2>
        <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          The <code className="text-xs">llm.txt</code> includes examples for
          popular frameworks. Your AI will pick the right one.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {frameworks.map((fw) => (
            <div
              key={fw.name}
              className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {fw.name}
              </div>
              <code className="text-xs text-zinc-400">{fw.file}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Status values */}
      <section className="mb-12">
        <h2 className="mb-4 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Status checks every 5 minutes
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Operational", color: "bg-green-500", rule: "< 3s response" },
            { label: "Slow", color: "bg-yellow-500", rule: "> 3s response" },
            { label: "Down", color: "bg-red-500", rule: "HTTP 500+ or timeout" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-800"
            >
              <span className={`mb-2 inline-block h-3 w-3 rounded-full ${s.color}`} />
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {s.label}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {s.rule}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="flex flex-col items-center gap-4 text-sm">
        <div className="flex gap-6">
          <Link
            href="/badge"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Badge generator
          </Link>
          <Link
            href="/docs"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            API docs
          </Link>
          <Link
            href="/submit"
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            Submit your SaaS
          </Link>
        </div>
      </section>
    </div>
  );
}
