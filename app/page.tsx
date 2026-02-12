import { getServices, getServiceCount, categories } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { Service } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const [allServices, serviceCount] = await Promise.all([
    getServices(),
    getServiceCount(),
  ]);
  const popular = allServices.slice(0, 6);

  const grouped = categories
    .map((cat) => ({
      ...cat,
      services: allServices.filter((s: Service) => s.category === cat.slug),
    }))
    .filter((cat) => cat.services.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      {/* Hero — Product pitch */}
      <section className="mb-16 text-center sm:mb-20">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
          Monitor your SaaS.{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Alert your team.
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Pull-based health checks and push-based heartbeats in one platform.
          Get instant alerts via webhooks and embed live status badges anywhere.
        </p>
        <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
          >
            Start monitoring
          </Link>
          <Link
            href="/developers"
            className="inline-flex items-center rounded-lg border border-zinc-300 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-offset-zinc-950"
          >
            Read the docs
          </Link>
        </div>
        <div className="mx-auto max-w-xl">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-500">
            Or check if a service is down
          </p>
          <SearchBar services={allServices} />
        </div>
      </section>

      {/* Feature grid — 4 cards */}
      <section className="mb-16 sm:mb-20">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
              Health Checks
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              We call your <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">/api/health</code> and parse each dependency — database, cache, third-party APIs.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
              Heartbeat Push
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Your service pushes status to us on a schedule. No public endpoint needed — perfect for cron jobs and internal services.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <svg className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
              Instant Alerts
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Discord, Slack, and custom webhooks fire the moment a status changes. Never miss an outage again.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
              Status Badges
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Embed a live status badge on your README or docs. Shows real-time availability powered by our checks.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="mb-16 sm:mb-20">
        <h2 className="mb-8 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              1
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
              Add your service
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Submit your domain or import from our catalog of {serviceCount.toLocaleString()}+ services.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              2
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
              Configure monitoring
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Set up a health endpoint for pull checks or push heartbeats from your service.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              3
            </div>
            <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
              Get alerted
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Receive instant notifications via Discord, Slack, or webhooks when something goes wrong.
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="mb-16 sm:mb-20">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 divide-zinc-200 dark:divide-zinc-800">
            <div className="px-6 py-5 text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {serviceCount.toLocaleString()}+
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Services monitored
              </div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {categories.length}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Categories
              </div>
            </div>
            <div className="px-6 py-5 text-center">
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                5 min
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Check interval
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular services — compact grid */}
      <section className="mb-16 sm:mb-20">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Monitoring {serviceCount.toLocaleString()}+ services
          </h2>
          <Link
            href="/categories/ai"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((service: Service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-16 sm:mb-20">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Browse by Category
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {cat.services.length} services monitored
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Developer CTA */}
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50 sm:p-12">
        <h2 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Built for developers
        </h2>
        <p className="mx-auto mb-6 max-w-lg text-zinc-600 dark:text-zinc-400">
          REST API, status badges, webhook integrations, and{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">
            llm.txt
          </code>{" "}
          for AI coding tools. Everything you need to integrate monitoring into your workflow.
        </p>
        <Link
          href="/developers"
          className="inline-flex items-center rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Explore the API
        </Link>
      </section>
    </div>
  );
}
