"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_COLORS, type BotCategory } from "@/lib/bots";

interface ScatterPoint {
  hour: number;
  day: string;
  category: string;
  count: number;
}

const ALL_CATEGORIES: BotCategory[] = ["search_engine", "ai_crawler", "social", "seo", "monitoring"];

function hashDay(day: string): number {
  let h = 0;
  for (let i = 0; i < day.length; i++) {
    h = ((h << 5) - h + day.charCodeAt(i)) | 0;
  }
  return ((h % 1000) / 1000 + 1) % 1; // 0..1
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function BotVisitsScatter({ isPro, domain }: { isPro: boolean; domain: string }) {
  const [period, setPeriod] = useState<"7d" | "30d">("7d");
  const [points, setPoints] = useState<ScatterPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenCategories, setHiddenCategories] = useState<Set<string>>(new Set());
  const [hoverPoint, setHoverPoint] = useState<ScatterPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchData = useCallback(async () => {
    if (!isPro) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bot-visits/scatter?period=${period}&domain=${encodeURIComponent(domain)}`);
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points || []);
      }
    } finally {
      setLoading(false);
    }
  }, [period, isPro, domain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleCategory = (cat: string) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Locked state
  if (!isPro) {
    return (
      <section className="mb-6">
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Bot Activity Overview
          </p>
          <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
            See when bots are most active across all your services with a scatter plot visualization.
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

  const visiblePoints = points.filter((p) => !hiddenCategories.has(p.category));
  const activeCategories = [...new Set(points.map((p) => p.category))];

  // SVG dimensions
  const width = 600;
  const height = 220;
  const pad = { top: 16, right: 16, bottom: 32, left: 44 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const maxCount = Math.max(...visiblePoints.map((p) => p.count), 1);
  const yTicks = [0, Math.round(maxCount / 2), maxCount];
  const xHourLabels = [0, 4, 8, 12, 16, 20];

  const dotX = (hour: number, day: string) => {
    const jitter = (hashDay(day) - 0.5) * (cw / 24) * 0.6;
    return pad.left + (hour / 23) * cw + jitter;
  };
  const dotY = (count: number) => pad.top + ch - (count / maxCount) * ch;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || visiblePoints.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * width;
    const my = ((e.clientY - rect.top) / rect.height) * height;

    let closest: ScatterPoint | null = null;
    let closestDist = Infinity;
    for (const p of visiblePoints) {
      const px = dotX(p.hour, p.day);
      const py = dotY(p.count);
      const dist = Math.hypot(px - mx, py - my);
      if (dist < closestDist && dist < 20) {
        closestDist = dist;
        closest = p;
      }
    }
    if (closest) {
      setHoverPoint(closest);
      setHoverPos({ x: dotX(closest.hour, closest.day), y: dotY(closest.count) });
    } else {
      setHoverPoint(null);
      setHoverPos(null);
    }
  };

  return (
    <section className="mb-6">
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Bot Activity
            </h3>
            <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
              PRO
            </span>
          </div>
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

        {/* Content */}
        <div className="px-5 pb-4">
          {loading ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-zinc-500">
              Loading...
            </div>
          ) : points.length === 0 ? (
            <div className="flex h-[220px] flex-col items-center justify-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No bot visits recorded yet.
              </p>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Bot data will appear here once your services start receiving crawlers.
              </p>
            </div>
          ) : (
            <>
              <svg
                ref={svgRef}
                width={width}
                height={height}
                className="w-full"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { setHoverPoint(null); setHoverPos(null); }}
              >
                {/* Y-axis gridlines + labels */}
                {yTicks.map((tick) => {
                  const y = pad.top + ch - (tick / maxCount) * ch;
                  return (
                    <g key={tick}>
                      <line
                        x1={pad.left} y1={y} x2={width - pad.right} y2={y}
                        stroke="currentColor" strokeOpacity="0.08"
                      />
                      <text x={pad.left - 6} y={y + 3} textAnchor="end" className="fill-zinc-400 text-[9px]">
                        {formatNumber(tick)}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis hour labels */}
                {xHourLabels.map((h) => {
                  const x = pad.left + (h / 23) * cw;
                  return (
                    <text key={h} x={x} y={height - 6} textAnchor="middle" className="fill-zinc-400 text-[9px]">
                      {h}h
                    </text>
                  );
                })}

                {/* Dots */}
                {visiblePoints.map((p, i) => {
                  const cx = dotX(p.hour, p.day);
                  const cy = dotY(p.count);
                  const color = CATEGORY_COLORS[p.category as BotCategory] || "#6b7280";
                  const isHovered = hoverPoint === p;
                  return (
                    <circle
                      key={`${p.day}-${p.hour}-${p.category}-${i}`}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 5 : 4}
                      fill={color}
                      opacity={isHovered ? 1 : 0.7}
                      stroke={isHovered ? "white" : "none"}
                      strokeWidth={isHovered ? 1.5 : 0}
                      className="transition-opacity"
                    />
                  );
                })}

                {/* Hover tooltip */}
                {hoverPoint && hoverPos && (() => {
                  const tooltipW = 120;
                  const tooltipH = 64;
                  const tx = hoverPos.x > width / 2 ? hoverPos.x - tooltipW - 8 : hoverPos.x + 8;
                  const ty = Math.max(pad.top, Math.min(hoverPos.y - tooltipH / 2, height - pad.bottom - tooltipH));
                  const categoryLabel = CATEGORY_LABELS[hoverPoint.category as BotCategory] || hoverPoint.category;

                  return (
                    <foreignObject x={tx} y={ty} width={tooltipW} height={tooltipH}>
                      <div className="rounded-md bg-zinc-900/95 px-2.5 py-2 text-[10px] leading-relaxed text-white shadow-lg dark:bg-zinc-800/95">
                        <div className="font-medium">
                          {new Date(hoverPoint.day).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          {" "}at {hoverPoint.hour}:00
                        </div>
                        <div className="mt-0.5 flex items-center gap-1">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[hoverPoint.category as BotCategory] || "#6b7280" }}
                          />
                          {categoryLabel}
                        </div>
                        <div className="mt-0.5 font-semibold">{hoverPoint.count.toLocaleString()} visits</div>
                      </div>
                    </foreignObject>
                  );
                })()}
              </svg>

              {/* Category legend */}
              <div className="mt-2 flex flex-wrap gap-2">
                {ALL_CATEGORIES.filter((cat) => activeCategories.includes(cat)).map((cat) => {
                  const hidden = hiddenCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        hidden
                          ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full transition-opacity"
                        style={{
                          backgroundColor: CATEGORY_COLORS[cat],
                          opacity: hidden ? 0.3 : 1,
                        }}
                      />
                      {CATEGORY_LABELS[cat]}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
