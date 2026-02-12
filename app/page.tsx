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

  const floatingIcons = allServices.slice(0, 10);

  return (
    <div>
      {/* ─── Hero ─── */}
      <section className="px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl lg:text-7xl">
            Monitor your SaaS.
            <br />
            Alert your team.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-xl">
            Pull-based health checks and push-based heartbeats in one platform
            — with instant alerts and live status badges.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center rounded-full bg-zinc-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Start monitoring
            </Link>
            <Link
              href="/developers"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
          <div className="mx-auto mt-14 max-w-lg">
            <p className="mb-3 text-sm text-zinc-400 dark:text-zinc-500">
              Or check if a service is down
            </p>
            <SearchBar services={allServices} />
          </div>
        </div>
      </section>

      {/* ─── Social proof strip ─── */}
      <section className="border-t border-zinc-100 py-10 dark:border-zinc-800/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
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

      {/* ─── Features ─── */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
            Everything you need to stay on top of your stack.
          </h2>

          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {/* Uptime Monitoring */}
            <div className="overflow-hidden rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-6 rounded-xl bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-300 dark:bg-zinc-950">
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
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Uptime Monitoring
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                We ping your service every 5 minutes and track response time,
                status codes, and availability.
              </p>
            </div>

            {/* Heartbeat Push */}
            <div className="overflow-hidden rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-6 rounded-xl bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-300 dark:bg-zinc-950">
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
                <div className="mt-2 text-green-400">
                  → 200 received
                </div>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Heartbeat Push
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Push detailed health data — database, cache, APIs — on a
                schedule. No public endpoint needed.
              </p>
            </div>

            {/* Instant Alerts */}
            <div className="overflow-hidden rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-6 space-y-3">
                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
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
                <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-zinc-900">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
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
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Instant Alerts
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Discord, Slack, and custom webhooks fire the moment a status
                changes.
              </p>
            </div>

            {/* Status Badges */}
            <div className="overflow-hidden rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-6 rounded-xl bg-white p-5 shadow-sm dark:bg-zinc-900">
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
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Status Badges
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Embed live status badges on your README or docs. Real-time
                availability at a glance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Floating icons + stat ─── */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {floatingIcons.map((s: Service, i: number) => {
            const positions = [
              { top: "8%", left: "10%" },
              { top: "14%", right: "12%" },
              { top: "30%", left: "4%" },
              { top: "36%", right: "6%" },
              { top: "52%", left: "16%" },
              { top: "58%", right: "14%" },
              { top: "74%", left: "8%" },
              { top: "70%", right: "10%" },
              { top: "42%", left: "24%" },
              { top: "46%", right: "22%" },
            ];
            const pos = positions[i];
            return (
              <div
                key={s.slug}
                className="absolute flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md dark:bg-zinc-800"
                style={pos}
              >
                <ServiceIcon domain={s.domain} name={s.name} size={32} />
              </div>
            );
          })}
        </div>

        <div className="relative text-center">
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            A growing catalog of
          </p>
          <p className="mt-2 text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-7xl lg:text-8xl">
            {serviceCount.toLocaleString()}+
          </p>
          <p className="mt-1 text-lg text-zinc-500 dark:text-zinc-400">
            services monitored
          </p>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="mx-auto max-w-lg text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
            Up and running in minutes.
          </h2>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                1
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Add your service
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Submit your domain or import from our catalog of{" "}
                {serviceCount.toLocaleString()}+ monitored services.
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                2
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Configure monitoring
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                We ping your domain automatically, or push heartbeats with
                detailed dependency checks from your service.
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800/50 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900">
                3
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Get alerted
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                Receive instant notifications via Discord, Slack, or custom
                webhooks when something goes wrong.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Popular services ─── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Popular services
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

      {/* ─── Categories ─── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Browse by category
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grouped.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="rounded-2xl bg-zinc-100 p-5 transition-colors hover:bg-zinc-200/70 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
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

      {/* ─── Bottom CTA ─── */}
      <section className="px-4 pt-20 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl lg:text-5xl">
            Never miss an outage again.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-zinc-500 dark:text-zinc-400">
            Start monitoring for free. Get full access with any of our plans.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center rounded-full bg-zinc-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Start monitoring
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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

      {/* ─── Service marquee ─── */}
      <section className="mt-16 overflow-hidden pb-8 sm:mt-20">
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

      {/* ─── Developer CTA ─── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-zinc-100 p-8 text-center dark:bg-zinc-800/50 sm:p-14">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-3xl">
              Built for developers
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-zinc-500 dark:text-zinc-400">
              REST API, status badges, webhook integrations, and{" "}
              <code className="rounded-md bg-zinc-200/70 px-1.5 py-0.5 text-xs dark:bg-zinc-700">
                llm.txt
              </code>{" "}
              for AI coding tools.
            </p>
            <Link
              href="/developers"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Explore the API
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
    </div>
  );
}
