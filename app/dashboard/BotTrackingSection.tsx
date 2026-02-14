"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_COLORS, type BotCategory } from "@/lib/bots";

interface TimelinePoint {
  hour_bucket: string;
  count: number;
}

interface BotEntry {
  bot_name: string;
  bot_category: BotCategory;
  count: number;
}

interface CategoryEntry {
  bot_category: BotCategory;
  count: number;
}

interface PageEntry {
  path: string;
  count: number;
}

interface BotData {
  timeline: TimelinePoint[];
  by_bot: BotEntry[];
  by_category: CategoryEntry[];
  top_pages: PageEntry[];
}

function AreaChart({ points }: { points: { x: number; y: number }[] }) {
  if (points.length < 2) return null;

  const width = 600;
  const height = 120;
  const pad = { top: 8, right: 8, bottom: 8, left: 8 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const maxY = Math.max(...points.map((p) => p.y), 1) * 1.1;

  const mapped = points.map((p, i) => ({
    x: pad.left + (i / (points.length - 1)) * cw,
    y: pad.top + ch - (p.y / maxY) * ch,
  }));

  const line = mapped.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${mapped[mapped.length - 1].x} ${height - pad.bottom} L ${mapped[0].x} ${height - pad.bottom} Z`;

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#botGrad)" />
      <path d={line} fill="none" stroke="rgb(139, 92, 246)" strokeWidth="1.5" />
    </svg>
  );
}

function HorizontalBar({ entries, max }: { entries: BotEntry[]; max: number }) {
  return (
    <div className="space-y-2">
      {entries.slice(0, 10).map((entry) => (
        <div key={entry.bot_name}>
          <div className="mb-0.5 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{entry.bot_name}</span>
            <span className="text-zinc-500">{entry.count.toLocaleString()}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${Math.max((entry.count / max) * 100, 2)}%`,
                backgroundColor: CATEGORY_COLORS[entry.bot_category] || "#6b7280",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BotTrackingSection({
  isPro,
  domains,
}: {
  isPro: boolean;
  domains: string[];
}) {
  const [selectedDomain, setSelectedDomain] = useState(domains[0] || "");
  const [period, setPeriod] = useState<"7d" | "30d">("7d");
  const [data, setData] = useState<BotData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedDomain || !isPro) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bot-visits/${encodeURIComponent(selectedDomain)}?period=${period}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, period, isPro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Update selected domain when domains list changes
  useEffect(() => {
    if (domains.length > 0 && !domains.includes(selectedDomain)) {
      setSelectedDomain(domains[0]);
    }
  }, [domains, selectedDomain]);

  // Free user: locked state
  if (!isPro) {
    return (
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Bot Tracking
          </h2>
          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            PRO
          </span>
        </div>
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            See which bots crawl your site
          </p>
          <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
            Track Googlebot, GPTBot, ClaudeBot, and 25+ other bots. See crawl frequency, top pages, and trends over time.
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            Upgrade to Pro
          </Link>
        </div>
      </section>
    );
  }

  const totalVisits = data?.by_category.reduce((sum, c) => sum + c.count, 0) ?? 0;
  const hasData = data && totalVisits > 0;
  const maxBotCount = data?.by_bot[0]?.count ?? 1;

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Bot Tracking
          </h2>
          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            PRO
          </span>
        </div>
        {hasData && (
          <div className="flex items-center gap-2">
            {domains.length > 1 && (
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700">
              {(["7d", "30d"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    period === p
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  } ${p === "7d" ? "rounded-l-lg" : "rounded-r-lg"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading...
        </div>
      ) : !hasData ? (
        /* Empty state: Pro but no data yet */
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="mb-2 text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
            No bot visits recorded yet
          </p>
          <p className="mb-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Add the bot tracking middleware to your app to start tracking crawlers.
          </p>
          <div className="mx-auto max-w-lg rounded-lg bg-zinc-950 p-4">
            <p className="mb-2 text-xs font-medium text-zinc-400">Next.js middleware.ts</p>
            <pre className="overflow-x-auto text-xs text-zinc-300">
{`import { identifyBot } from "./lib/bot-detect";

export function middleware(request) {
  const ua = request.headers.get("user-agent") || "";
  const bot = identifyBot(ua);
  if (bot) {
    fetch("https://www.bluemonitor.org/api/v1/bot-visits", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${process.env.BLUEMONITOR_API_KEY}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: "your-domain.com",
        visits: [{ bot_name: bot.name,
          bot_category: bot.category,
          path: request.nextUrl.pathname,
          user_agent: ua }],
      }),
    }).catch(() => {});
  }
}`}
            </pre>
          </div>
          <p className="mt-3 text-center text-xs text-zinc-500">
            See the{" "}
            <Link href="/docs" className="text-blue-600 hover:underline dark:text-blue-400">
              setup docs
            </Link>{" "}
            for full instructions and other frameworks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Timeline chart */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bot Visits Over Time</h3>
              <span className="text-xs text-zinc-500">{totalVisits.toLocaleString()} total visits</span>
            </div>
            <AreaChart
              points={data.timeline.map((t, i) => ({ x: i, y: t.count }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Top bots */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Top Bots</h3>
              <HorizontalBar entries={data.by_bot} max={maxBotCount} />
            </div>

            {/* Category summary */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">By Category</h3>
              <div className="space-y-3">
                {data.by_category.map((cat) => (
                  <div key={cat.bot_category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat.bot_category] || "#6b7280" }}
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {CATEGORY_LABELS[cat.bot_category] || cat.bot_category}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {cat.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top pages */}
          {data.top_pages.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Top Pages</h3>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {data.top_pages.map((page) => (
                  <div key={page.path} className="flex items-center justify-between px-5 py-2.5">
                    <span className="truncate text-sm text-zinc-700 dark:text-zinc-300">{page.path}</span>
                    <span className="ml-4 shrink-0 text-sm text-zinc-500">{page.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
