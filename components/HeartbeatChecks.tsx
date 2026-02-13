"use client";

import { useEffect, useState } from "react";

interface CheckSnapshot {
  status: string;
  latency?: number;
  message?: string;
}

interface HistoryPoint {
  check_name: string;
  status: string;
  latency: number | null;
  message: string | null;
  checked_at: string;
}

// Group history by check name
interface CheckTimeline {
  name: string;
  points: { time: Date; latency: number; status: string }[];
  currentStatus: string;
  currentLatency: number | null;
  currentMessage: string | null;
}

const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  ok: {
    dot: "bg-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-400",
  },
  error: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
  },
  degraded: {
    dot: "bg-yellow-500",
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    text: "text-yellow-700 dark:text-yellow-400",
  },
};

function getStatusColor(status: string) {
  return STATUS_COLORS[status] || STATUS_COLORS["error"];
}

function MiniChart({ points, maxLatency }: { points: { time: Date; latency: number; status: string }[]; maxLatency: number }) {
  if (points.length < 2) return null;

  const width = 320;
  const height = 60;
  const padding = { top: 4, right: 4, bottom: 4, left: 4 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const yMax = Math.max(maxLatency * 1.1, 10);

  const pathPoints = points.map((p, i) => {
    const x = padding.left + (i / (points.length - 1)) * chartW;
    const y = padding.top + chartH - (p.latency / yMax) * chartH;
    return { x, y, status: p.status };
  });

  const linePath = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pathPoints[pathPoints.length - 1].x} ${height - padding.bottom} L ${pathPoints[0].x} ${height - padding.bottom} Z`;

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#latencyGrad)" />
      <path d={linePath} fill="none" stroke="rgb(99, 102, 241)" strokeWidth="1.5" />
      {/* Error dots */}
      {pathPoints.map((p, i) =>
        points[i].status !== "ok" ? (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="rgb(239, 68, 68)" />
        ) : null
      )}
    </svg>
  );
}

export default function HeartbeatChecks({
  slug,
  currentChecks,
}: {
  slug: string;
  currentChecks: Record<string, CheckSnapshot> | null;
}) {
  const [timelines, setTimelines] = useState<CheckTimeline[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/heartbeat-history/${encodeURIComponent(slug)}`);
        if (!res.ok) return;

        const data: HistoryPoint[] = await res.json();

        // Group by check_name
        const grouped = new Map<string, { time: Date; latency: number; status: string }[]>();
        for (const point of data) {
          if (!grouped.has(point.check_name)) {
            grouped.set(point.check_name, []);
          }
          grouped.get(point.check_name)!.push({
            time: new Date(point.checked_at),
            latency: point.latency ?? 0,
            status: point.status,
          });
        }

        const result: CheckTimeline[] = [];
        for (const [name, points] of grouped) {
          const current = currentChecks?.[name];
          result.push({
            name,
            points,
            currentStatus: current?.status ?? points[points.length - 1]?.status ?? "ok",
            currentLatency: current?.latency ?? points[points.length - 1]?.latency ?? null,
            currentMessage: current?.message ?? null,
          });
        }

        // Sort: errors first, then alphabetically
        result.sort((a, b) => {
          if (a.currentStatus !== "ok" && b.currentStatus === "ok") return -1;
          if (a.currentStatus === "ok" && b.currentStatus !== "ok") return 1;
          return a.name.localeCompare(b.name);
        });

        setTimelines(result);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [slug, currentChecks]);

  // If no current checks and no history, show nothing
  if (!loading && !timelines?.length && !currentChecks) return null;

  // Show current checks snapshot even without history
  if (!loading && !timelines?.length && currentChecks) {
    const entries = Object.entries(currentChecks);
    if (entries.length === 0) return null;

    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Health Checks
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.map(([name, check]) => {
            const colors = getStatusColor(check.status);
            return (
              <div
                key={name}
                className={`rounded-lg border border-zinc-100 p-3 dark:border-zinc-800 ${colors.bg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                    {name}
                  </span>
                  <span className={`ml-auto text-xs font-medium ${colors.text}`}>
                    {check.status}
                  </span>
                </div>
                {check.latency !== undefined && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {check.latency}ms
                  </p>
                )}
                {check.message && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {check.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!timelines || timelines.length === 0) return null;

  // Find global max latency across all checks for consistent scale
  const globalMaxLatency = Math.max(
    ...timelines.flatMap((t) => t.points.map((p) => p.latency)),
    1
  );

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Health Checks
        </h3>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Last 24h
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {timelines.map((timeline) => {
          const colors = getStatusColor(timeline.currentStatus);
          const checkMaxLatency = Math.max(...timeline.points.map((p) => p.latency), 1);

          return (
            <div
              key={timeline.name}
              className={`rounded-lg border border-zinc-100 p-3 dark:border-zinc-800`}
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                  {timeline.name}
                </span>
                <span className={`ml-auto text-xs font-medium ${colors.text}`}>
                  {timeline.currentStatus}
                </span>
              </div>

              {timeline.currentLatency !== null && (
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {timeline.currentLatency}ms
                </p>
              )}

              {timeline.currentMessage && (
                <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                  {timeline.currentMessage}
                </p>
              )}

              {/* Mini latency chart */}
              {timeline.points.length >= 2 && (
                <div className="mt-2 overflow-hidden rounded">
                  <MiniChart points={timeline.points} maxLatency={checkMaxLatency} />
                </div>
              )}

              {/* Min/Max/Avg stats */}
              {timeline.points.length > 0 && (
                <div className="mt-1 flex gap-3 text-[10px] text-zinc-400 dark:text-zinc-500">
                  <span>
                    min {Math.min(...timeline.points.map((p) => p.latency))}ms
                  </span>
                  <span>
                    avg{" "}
                    {Math.round(
                      timeline.points.reduce((s, p) => s + p.latency, 0) /
                        timeline.points.length
                    )}
                    ms
                  </span>
                  <span>
                    max {Math.max(...timeline.points.map((p) => p.latency))}ms
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
