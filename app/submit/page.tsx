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
    <div>
      {/* Hero */}
      <section className="px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
            Submit your SaaS.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
            Get your SaaS monitored on BlueMonitor. We&apos;ll track uptime,
            response time, and notify users when something goes wrong.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-2xl">
          <SubmitForm />
        </div>
      </section>

      {/* Vibe coding CTA */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Building with AI?
            </h2>
            <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              Share this URL with Claude, Cursor, Copilot, or any AI coding
              tool. It will create a health endpoint for your SaaS and add a
              status badge — all in one prompt.
            </p>
            <code className="block overflow-x-auto rounded-xl bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300 dark:bg-zinc-950">
              https://www.bluemonitor.org/llm.txt
            </code>
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              Works with any framework — Next.js, Express, Hono, FastAPI, and
              more.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
