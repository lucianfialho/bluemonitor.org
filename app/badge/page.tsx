import { Metadata } from "next";
import BadgeGenerator from "./BadgeGenerator";

export const metadata: Metadata = {
  title: "Get Started — Add a Status Badge to Your Website",
  description:
    "Monitor your website for free. Add a real-time status badge that shows if your service is up, slow, or down. No account required — just paste the code.",
  alternates: {
    canonical: "/badge",
  },
};

export default function BadgePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-16">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Monitor your website for free
        </h1>
        <p className="mx-auto max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
          Add a status badge to your site and we&apos;ll check it every 5
          minutes. No signup, no config — just paste the code.
        </p>
      </div>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="mb-6 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              1
            </div>
            <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
              Enter your domain
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Type your website URL below and we generate the badge instantly.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              2
            </div>
            <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
              Paste the code
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Copy the HTML or Markdown snippet and add it to your site, README,
              or docs.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              3
            </div>
            <h3 className="mb-1 font-medium text-zinc-900 dark:text-zinc-100">
              We start monitoring
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your service is automatically registered. The badge updates in
              real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Badge statuses */}
      <section className="mb-12">
        <h2 className="mb-4 text-center text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Badge statuses
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Operational", color: "bg-green-500", desc: "Service is up and healthy" },
            { label: "Slow", color: "bg-yellow-500", desc: "Response time > 3 seconds" },
            { label: "Down", color: "bg-red-500", desc: "Service is unreachable" },
            { label: "Pending", color: "bg-blue-500", desc: "Awaiting approval" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-800"
            >
              <span className={`mb-2 inline-block h-3 w-3 rounded-full ${s.color}`} />
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {s.label}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Generator */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Generate your badge
        </h2>
        <BadgeGenerator />
      </section>

      {/* LLM / Vibe coding */}
      <section className="mt-12 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Using AI coding tools?
        </h2>
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          If you&apos;re using Claude, Cursor, Codex, or any AI coding
          assistant, just share our installation guide and it will add the badge
          for you:
        </p>
        <code className="block rounded-lg bg-zinc-900 px-4 py-2.5 text-sm text-zinc-300">
          https://www.bluemonitor.org/llm.txt
        </code>
      </section>
    </div>
  );
}
