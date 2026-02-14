"use client";

import { useEffect, useState } from "react";
import { StatusCheck } from "@/lib/types";

const SEGMENTS = 48; // 30min each = 24h
const SEGMENT_MS = 30 * 60 * 1000;

type SegmentStatus = "up" | "down" | "slow" | "no-data";

interface Segment {
  status: SegmentStatus;
  checks: number;
  avgResponseTime: number;
  from: Date;
  to: Date;
}

function getSegmentColor(status: SegmentStatus): string {
  switch (status) {
    case "up":
      return "bg-green-500";
    case "slow":
      return "bg-yellow-500";
    case "down":
      return "bg-red-500";
    case "no-data":
      return "bg-zinc-200 dark:bg-zinc-700";
  }
}

function getSegmentLabel(status: SegmentStatus): string {
  switch (status) {
    case "up":
      return "Operational";
    case "slow":
      return "Slow";
    case "down":
      return "Down";
    case "no-data":
      return "No data";
  }
}

function buildSegments(checks: StatusCheck[]): Segment[] {
  const now = Date.now();
  const start = now - SEGMENTS * SEGMENT_MS;
  const segments: Segment[] = [];

  for (let i = 0; i < SEGMENTS; i++) {
    const from = new Date(start + i * SEGMENT_MS);
    const to = new Date(start + (i + 1) * SEGMENT_MS);

    const segChecks = checks.filter((c) => {
      const t = new Date(c.checked_at).getTime();
      return t >= from.getTime() && t < to.getTime();
    });

    if (segChecks.length === 0) {
      segments.push({ status: "no-data", checks: 0, avgResponseTime: 0, from, to });
      continue;
    }

    const downCount = segChecks.filter((c) => c.status === "down").length;
    const slowCount = segChecks.filter((c) => c.status === "slow").length;
    const avgResponseTime = Math.round(
      segChecks.reduce((sum, c) => sum + c.response_time, 0) / segChecks.length
    );

    let status: SegmentStatus = "up";
    if (downCount > segChecks.length / 2) {
      status = "down";
    } else if (downCount > 0) {
      status = "down";
    } else if (slowCount > 0) {
      status = "slow";
    }

    segments.push({ status, checks: segChecks.length, avgResponseTime, from, to });
  }

  return segments;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getUptimeColor(uptime: number): string {
  if (uptime >= 99) return "text-green-600 dark:text-green-400";
  if (uptime >= 95) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export default function StatusTimeline({ slug }: { slug: string }) {
  const [segments, setSegments] = useState<Segment[] | null>(null);
  const [uptime, setUptime] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/status-history/${encodeURIComponent(slug)}`);
        if (res.ok) {
          const checks: StatusCheck[] = await res.json();
          setSegments(buildSegments(checks));
          if (checks.length > 0) {
            const upCount = checks.filter((c) => c.status === "up").length;
            setUptime(Math.round((upCount / checks.length) * 1000) / 10);
          }
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [slug]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="mb-2 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex gap-[2px]">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <div key={i} className="h-8 flex-1 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
          ))}
        </div>
      </div>
    );
  }

  if (!segments) return null;

  const hasData = segments.some((s) => s.status !== "no-data");
  if (!hasData) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Status History (24h)
        </h3>
        <span className={`text-sm font-semibold ${uptime !== null ? getUptimeColor(uptime) : "text-zinc-400"}`}>
          {uptime !== null ? `${uptime}% uptime` : "\u2014"}
        </span>
      </div>
      <div className="relative">
        <div className="flex gap-[2px]">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="group relative flex-1"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`h-8 rounded-sm transition-opacity ${getSegmentColor(seg.status)} ${
                  hoveredIndex !== null && hoveredIndex !== i ? "opacity-60" : ""
                }`}
              />
              {hoveredIndex === i && (
                <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {getSegmentLabel(seg.status)}
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400">
                    {formatTime(seg.from)} — {formatTime(seg.to)}
                  </div>
                  {seg.checks > 0 && (
                    <div className="text-zinc-500 dark:text-zinc-400">
                      {seg.avgResponseTime}ms avg · {seg.checks} check{seg.checks !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-zinc-400 dark:text-zinc-500">
          <span>24h ago</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
}
