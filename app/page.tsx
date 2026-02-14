import { getServices, getServiceCount, categories } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";
import SearchBar from "@/components/SearchBar";
import ServiceIcon from "@/components/ServiceIcon";
import Link from "next/link";
import { Service } from "@/lib/types";

export const revalidate = 60;

export default async function Home() {
  const [allServices, serviceCount] = await Promise.all([
    getServices(),
    getServiceCount(),
  ]);
  const popular = allServices.slice(0, 6);
  const marqueeRow1 = allServices.slice(0, 20);
  const marqueeRow2 = allServices.slice(20, 40);

  const grouped = categories
    .map((cat) => ({
      ...cat,
      services: allServices.filter((s: Service) => s.category === cat.slug),
    }))
    .filter((cat) => cat.services.length > 0);

  return (
    <div>
      {/* ─── 1. Hero (split layout) ─── */}
      <section className="px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
              Monitor your SaaS.
              <br />
              Alert your team.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
              Pull-based health checks and push-based heartbeats in one platform
              — with instant alerts and live status badges.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Start monitoring
              </Link>
              <Link
                href="/developers"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Read the docs
                <svg
                  className="h-3.5 w-3.5"
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
              </Link>
            </div>
            <div className="mt-12 max-w-md">
              <p className="mb-3 text-sm text-zinc-400 dark:text-zinc-500">
                Or check if a service is down
              </p>
              <SearchBar services={allServices} />
            </div>
          </div>

          {/* Right — terminal mockup */}
          <div className="hidden lg:block">
            <div className="rounded-2xl bg-zinc-900 p-6 font-mono text-sm leading-relaxed text-zinc-300 shadow-2xl dark:bg-zinc-950">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs text-zinc-500">
                  bluemonitor — health check
                </span>
              </div>
              <div className="text-green-400">
                GET api.stripe.com → 200 OK
              </div>
              <div className="mt-3 space-y-1 text-zinc-500">
                <div>
                  <span className="text-green-400">✓</span> status{" "}
                  <span className="text-zinc-600">· operational</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span> response{" "}
                  <span className="text-zinc-600">· 142ms</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span> uptime{" "}
                  <span className="text-zinc-600">· 99.98%</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span> ssl{" "}
                  <span className="text-zinc-600">· valid (342 days)</span>
                </div>
              </div>
              <div className="mt-4 border-t border-zinc-800 pt-4 text-blue-400">
                POST /api/v1/heartbeat
              </div>
              <div className="mt-2 space-y-1 text-zinc-500">
                <div>
                  <span className="text-green-400">✓</span> database{" "}
                  <span className="text-zinc-600">· 3ms</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span> redis{" "}
                  <span className="text-zinc-600">· 1ms</span>
                </div>
                <div>
                  <span className="text-red-400">✗</span>{" "}
                  <span className="text-red-400">sendgrid</span>{" "}
                  <span className="text-zinc-600">· timeout</span>
                </div>
              </div>
              <div className="mt-3 text-green-400">→ 200 received</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. Logo strip ─── */}
      <section className="border-t border-zinc-100 py-10 dark:border-zinc-800/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Monitoring services teams depend on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {allServices.slice(0, 8).map((s: Service) => (
              <div
                key={s.slug}
                className="flex items-center gap-2.5 opacity-50 grayscale transition hover:opacity-100 hover:grayscale-0"
              >
                <ServiceIcon domain={s.domain} name={s.name} size={20} />
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Stats ─── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">
            How it works
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
            Pull-based health checks and push-based heartbeats — in one
            platform.
          </h2>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-zinc-200 sm:grid-cols-3 dark:bg-zinc-800">
            <div className="bg-white p-8 dark:bg-zinc-950 sm:p-10">
              <p className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
                {serviceCount.toLocaleString()}+
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Services monitored
              </p>
            </div>
            <div className="bg-white p-8 dark:bg-zinc-950 sm:p-10">
              <p className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
                5min
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Check intervals
              </p>
            </div>
            <div className="bg-white p-8 dark:bg-zinc-950 sm:p-10">
              <p className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
                &lt;1min
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Alert delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. [01] MONITOR ─── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">
              [01] Monitor
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
              Know the moment something breaks.
            </h2>

            <div className="mt-10">
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Uptime Monitoring
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  We ping your service every 5 minutes and track response time,
                  status codes, and availability.
                </p>
              </div>
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Heartbeat Push
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Push detailed health data — database, cache, APIs — on a
                  schedule. No public endpoint needed.
                </p>
              </div>
            </div>
          </div>

          {/* Right — terminal blocks */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-900 p-5 font-mono text-xs leading-relaxed text-zinc-300 dark:bg-zinc-950">
              <div className="mb-2 text-green-400">
                GET yourapp.com → 200 OK
              </div>
              <div className="space-y-1 text-zinc-500">
                <div>
                  <span className="text-green-400">✓</span> status{" "}
                  <span className="text-zinc-600">· operational</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span> response{" "}
                  <span className="text-zinc-600">· 142ms</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span> uptime{" "}
                  <span className="text-zinc-600">· 99.98%</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-900 p-5 font-mono text-xs leading-relaxed text-zinc-300 dark:bg-zinc-950">
              <div className="text-blue-400">POST /api/v1/heartbeat</div>
              <div className="mt-2 space-y-1 text-zinc-500">
                <div>
                  <span className="text-green-400">✓</span> database{" "}
                  <span className="text-zinc-600">· 3ms</span>
                </div>
                <div>
                  <span className="text-green-400">✓</span> redis{" "}
                  <span className="text-zinc-600">· 1ms</span>
                </div>
                <div>
                  <span className="text-red-400">✗</span>{" "}
                  <span className="text-red-400">sendgrid</span>{" "}
                  <span className="text-zinc-600">· timeout</span>
                </div>
              </div>
              <div className="mt-2 text-green-400">→ 200 received</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. [02] ALERT ─── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">
              [02] Alert
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
              Stay in the loop — instantly.
            </h2>

            <div className="mt-10">
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Instant Webhooks
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Discord, Slack, and custom webhooks fire the moment a status
                  changes.
                </p>
              </div>
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Smart Events
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Automatic incident detection with down/recovered lifecycle
                  tracking.
                </p>
              </div>
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                  Bot Tracking
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Pro
                  </span>
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Monitor AI crawler activity and get alerted when bots start
                  or stop visiting your site.
                </p>
              </div>
            </div>
          </div>

          {/* Right — alert card mockups */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <svg
                    className="h-4 w-4 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Stripe API is down
                  </div>
                  <div className="text-xs text-zinc-500">
                    Health check failed · 2 min ago
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="h-4 w-4 text-green-500"
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
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Stripe API recovered
                  </div>
                  <div className="text-xs text-zinc-500">
                    Back to normal · just now
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. [03] INTEGRATE ─── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">
              [03] Integrate
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
              Built for developers, by developers.
            </h2>

            <div className="mt-10">
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  REST API
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Full API access to services, incidents, and monitoring data.
                  Simple API key authentication.
                </p>
              </div>
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Status Badges
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Embed live status badges on your README or docs. Real-time
                  availability at a glance.
                </p>
              </div>
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  MCP Server
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Connect AI coding assistants to BlueMonitor data via the Model
                  Context Protocol.
                </p>
              </div>
              <div className="border-t border-zinc-200 py-5 dark:border-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  llm.txt
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Machine-readable status data for AI tools and LLM-powered
                  workflows.
                </p>
              </div>
            </div>
          </div>

          {/* Right — badge + API mockup */}
          <div className="flex flex-col justify-center space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
              <div className="mb-3 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                README.md
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  ● API: operational
                </span>
                <div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    ● Dashboard: operational
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    ● CDN: degraded
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-zinc-900 p-5 font-mono text-xs leading-relaxed text-zinc-300 dark:bg-zinc-950">
              <div className="text-zinc-500">
                GET /api/v1/services/stripe
              </div>
              <div className="mt-3 text-zinc-400">
                {"{"}<br />
                {"  "}<span className="text-blue-400">&quot;status&quot;</span>:{" "}
                <span className="text-green-400">&quot;operational&quot;</span>,
                <br />
                {"  "}<span className="text-blue-400">&quot;uptime&quot;</span>:{" "}
                <span className="text-yellow-400">99.98</span>,<br />
                {"  "}<span className="text-blue-400">&quot;response_ms&quot;</span>:{" "}
                <span className="text-yellow-400">142</span>,<br />
                {"  "}<span className="text-blue-400">&quot;last_check&quot;</span>:{" "}
                <span className="text-green-400">&quot;2s ago&quot;</span>
                <br />
                {"}"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Popular services ─── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">
            Popular
          </p>
          <div className="mt-4 mb-10 flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
              Trending services
            </h2>
            <Link
              href="/categories/ai"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((service: Service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── 8. Categories ─── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">
            Browse
          </p>
          <h2 className="mt-4 mb-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Browse by category
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="rounded-2xl border border-zinc-200 p-5 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {cat.services.length} services
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. Bottom CTA ─── */}
      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl lg:text-6xl">
            Never miss an outage again.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-zinc-500 dark:text-zinc-400">
            Start monitoring for free. Get full access with any of our plans.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center rounded-full bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Start monitoring
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              See our plans
              <svg
                className="h-3.5 w-3.5"
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
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 10. Service marquee ─── */}
      <section className="overflow-hidden pb-8">
        <div className="flex animate-marquee gap-8">
          {[...marqueeRow1, ...marqueeRow1].map(
            (s: Service, i: number) => (
              <div
                key={`r1-${s.slug}-${i}`}
                className="flex shrink-0 items-center gap-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <ServiceIcon domain={s.domain} name={s.name} size={24} />
                </div>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {s.name}
                </span>
              </div>
            ),
          )}
        </div>
        <div className="mt-4 flex animate-marquee-reverse gap-8">
          {[...marqueeRow2, ...marqueeRow2].map(
            (s: Service, i: number) => (
              <div
                key={`r2-${s.slug}-${i}`}
                className="flex shrink-0 items-center gap-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <ServiceIcon domain={s.domain} name={s.name} size={24} />
                </div>
                <span className="whitespace-nowrap text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {s.name}
                </span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
