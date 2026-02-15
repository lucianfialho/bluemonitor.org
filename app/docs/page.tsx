import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Get started with BlueMonitor. Framework guides, API reference, and everything you need to monitor your SaaS.",
  alternates: {
    canonical: "/docs",
  },
};

const frameworks = [
  {
    slug: "nextjs",
    name: "Next.js",
    description: "App Router, Vercel Cron, and edge-ready health checks.",
  },
  {
    slug: "express",
    name: "Express",
    description: "Middleware-based health endpoint with node-cron heartbeats.",
  },
  {
    slug: "hono",
    name: "Hono",
    description: "Lightweight health route for edge runtimes and Cloudflare.",
  },
  {
    slug: "fastapi",
    name: "FastAPI",
    description: "Async health endpoint with APScheduler heartbeats.",
  },
  {
    slug: "rails",
    name: "Rails",
    description: "Health check route with ActiveJob heartbeat scheduling.",
  },
  {
    slug: "laravel",
    name: "Laravel",
    description: "Health endpoint with Laravel Scheduler heartbeats.",
  },
];

export default function DocsOverview() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.bluemonitor.org",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Documentation",
                item: "https://www.bluemonitor.org/docs",
              },
            ],
          }),
        }}
      />
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        Documentation
      </h1>
      <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
        Everything you need to add monitoring to your SaaS. Pick your framework
        to get started, or jump to the API reference.
      </p>

      {/* Quick start */}
      <section className="mt-12">
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          How it works
        </h2>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          BlueMonitor monitors your service in two ways. Use one or both.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-800/50">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
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
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Uptime monitoring (pull)
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              We ping your service every 5 minutes and track response time and
              status code. Add an optional{" "}
              <code className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                /api/health
              </code>{" "}
              endpoint for better accuracy.
            </p>
          </div>
          <div className="rounded-2xl bg-zinc-100 p-5 dark:bg-zinc-800/50">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
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
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Heartbeat push
            </h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Your service pushes detailed health data (database, cache, APIs)
              to BlueMonitor on a schedule. No public endpoint needed.
            </p>
          </div>
        </div>
      </section>

      {/* Framework guides */}
      <section className="mt-16">
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          Framework guides
        </h2>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Step-by-step setup for your stack. Each guide covers health endpoints,
          heartbeat push, status badges, and cron scheduling.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {frameworks.map((fw) => (
            <Link
              key={fw.slug}
              href={`/docs/${fw.slug}`}
              className="group rounded-2xl bg-zinc-100 p-5 transition-colors hover:bg-zinc-200/70 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {fw.name}
                <svg
                  className="ml-1.5 inline h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {fw.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* API reference link */}
      <section className="mt-16">
        <Link
          href="/docs/api"
          className="group block rounded-2xl bg-zinc-100 p-6 transition-colors hover:bg-zinc-200/70 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
        >
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            API Reference
            <svg
              className="ml-1.5 inline h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            REST API endpoints, authentication, rate limits, status badges, and
            error codes.
          </p>
        </Link>
      </section>
    </div>
  );
}
