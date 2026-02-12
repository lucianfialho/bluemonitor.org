import { Metadata } from "next";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit your SaaS — BlueMonitor",
  description:
    "Get your SaaS monitored on BlueMonitor. We track uptime, response time, and notify users when something goes wrong.",
  alternates: {
    canonical: "/submit",
  },
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Submit your SaaS
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Get your SaaS monitored on BlueMonitor. We&apos;ll track uptime,
        response time, and notify users when something goes wrong.
      </p>
      <SubmitForm />

      {/* Vibe coding CTA */}
      <div className="mt-10 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Building with AI?
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Share this URL with Claude, Cursor, Copilot, or any AI coding tool.
          It will create a health endpoint for your SaaS and add a status badge
          — all in one prompt.
        </p>
        <div className="flex items-center gap-2">
          <code className="block flex-1 overflow-x-auto rounded-lg bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300">
            https://www.bluemonitor.org/llm.txt
          </code>
        </div>
        <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
          Works with any framework — Next.js, Express, Hono, FastAPI, and more.
        </p>
      </div>
    </div>
  );
}
