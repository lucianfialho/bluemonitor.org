"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, CATEGORY_COLORS, BOT_ICONS, type BotCategory } from "@/lib/bots";
import type { AIVisibilityResult } from "@/lib/ai-visibility";

// ---- Types ----

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

interface PageWithBots {
  path: string;
  count: number;
  bots: { bot_name: string; bot_category: string; count: number }[];
}

interface ComparisonData {
  previous_total: number;
  previous_by_category: CategoryEntry[];
}

interface BotData {
  timeline: TimelinePoint[];
  timeline_by_category: Record<string, { hour_bucket: string; count: number }[]>;
  by_bot: BotEntry[];
  by_category: CategoryEntry[];
  top_pages: PageEntry[];
  pages_with_bots: PageWithBots[];
  ai_visibility?: AIVisibilityResult;
  comparison?: ComparisonData;
}

// ---- Helpers ----

const ALL_CATEGORIES: BotCategory[] = ["search_engine", "ai_crawler", "social", "seo", "monitoring"];

function formatDate(dateStr: string, short?: boolean): string {
  const d = new Date(dateStr);
  if (short) return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric" });
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

// Monotone cubic interpolation — compute tangents for smooth curves
function monotoneCubic(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) return `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}`;

  const n = points.length;
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x);
    dy.push(points[i + 1].y - points[i].y);
    m.push(dy[i] / dx[i]);
  }

  const tangents: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      tangents.push(0);
    } else {
      tangents.push((m[i - 1] + m[i]) / 2);
    }
  }
  tangents.push(m[n - 2]);

  // Fritsch-Carlson monotonicity
  for (let i = 0; i < n - 1; i++) {
    if (Math.abs(m[i]) < 1e-6) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
    } else {
      const alpha = tangents[i] / m[i];
      const beta = tangents[i + 1] / m[i];
      const s = alpha * alpha + beta * beta;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        tangents[i] = t * alpha * m[i];
        tangents[i + 1] = t * beta * m[i];
      }
    }
  }

  let path = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const d = dx[i] / 3;
    const cp1x = points[i].x + d;
    const cp1y = points[i].y + tangents[i] * d;
    const cp2x = points[i + 1].x - d;
    const cp2y = points[i + 1].y - tangents[i + 1] * d;
    path += `C${cp1x},${cp1y},${cp2x},${cp2y},${points[i + 1].x},${points[i + 1].y}`;
  }
  return path;
}

// ---- DeltaBadge ----

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return <span className="text-[10px] font-medium text-red-500">new</span>;

  const pct = ((current - previous) / previous) * 100;
  const isUp = pct > 0;
  const display = `${isUp ? "+" : ""}${pct.toFixed(0)}%`;

  return (
    <span className={`text-[10px] font-medium ${isUp ? "text-red-500" : "text-green-500"}`}>
      {display}
    </span>
  );
}

// ---- AreaChart (improved with axes, tooltips, smooth curves) ----

function AreaChart({
  points,
  dates,
}: {
  points: { x: number; y: number }[];
  dates?: string[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  if (points.length < 2) return null;

  const width = 600;
  const height = 180;
  const pad = { top: 12, right: 12, bottom: 28, left: 44 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const maxY = Math.max(...points.map((p) => p.y), 1) * 1.1;

  const mapped = points.map((p, i) => ({
    x: pad.left + (i / (points.length - 1)) * cw,
    y: pad.top + ch - (p.y / maxY) * ch,
  }));

  const line = monotoneCubic(mapped);
  const area = `${line}L${mapped[mapped.length - 1].x},${height - pad.bottom}L${mapped[0].x},${height - pad.bottom}Z`;

  // Y-axis ticks
  const yTicks = [0, Math.round(maxY / 2), Math.round(maxY)];

  // X-axis labels (pick ~5 evenly spaced)
  const xLabelCount = Math.min(5, points.length);
  const xLabels: { idx: number; label: string }[] = [];
  if (dates && dates.length > 0) {
    for (let i = 0; i < xLabelCount; i++) {
      const idx = Math.round((i / (xLabelCount - 1)) * (points.length - 1));
      xLabels.push({ idx, label: formatDate(dates[idx], true) });
    }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const relX = mouseX - pad.left;
    const idx = Math.round((relX / cw) * (points.length - 1));
    if (idx >= 0 && idx < points.length) {
      setHoverIdx(idx);
    }
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <linearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis ticks */}
      {yTicks.map((tick) => {
        const y = pad.top + ch - (tick / maxY) * ch;
        return (
          <g key={tick}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="currentColor" strokeOpacity="0.08" />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" className="fill-zinc-400 text-[9px]">
              {formatNumber(tick)}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {xLabels.map(({ idx, label }) => (
        <text
          key={idx}
          x={mapped[idx]?.x ?? 0}
          y={height - 4}
          textAnchor="middle"
          className="fill-zinc-400 text-[9px]"
        >
          {label}
        </text>
      ))}

      <path d={area} fill="url(#botGrad)" />
      <path d={line} fill="none" stroke="rgb(139, 92, 246)" strokeWidth="1.5" />

      {/* Hover tooltip */}
      {hoverIdx !== null && mapped[hoverIdx] && (
        <g>
          <line
            x1={mapped[hoverIdx].x} y1={pad.top}
            x2={mapped[hoverIdx].x} y2={height - pad.bottom}
            stroke="rgb(139, 92, 246)" strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.5"
          />
          <circle cx={mapped[hoverIdx].x} cy={mapped[hoverIdx].y} r="3.5" fill="rgb(139, 92, 246)" stroke="white" strokeWidth="1.5" />
          <rect
            x={mapped[hoverIdx].x - 24} y={mapped[hoverIdx].y - 22}
            width="48" height="18" rx="4"
            fill="rgb(24, 24, 27)" fillOpacity="0.9"
          />
          <text
            x={mapped[hoverIdx].x} y={mapped[hoverIdx].y - 10}
            textAnchor="middle" className="fill-white text-[10px] font-medium"
          >
            {points[hoverIdx].y.toLocaleString()}
          </text>
        </g>
      )}
    </svg>
  );
}

// ---- MultiSeriesAreaChart ----

function MultiSeriesAreaChart({
  seriesData,
  allDates,
}: {
  seriesData: Record<string, { hour_bucket: string; count: number }[]>;
  allDates: string[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const categories = Object.keys(seriesData) as BotCategory[];
  if (categories.length === 0 || allDates.length < 2) return null;

  const width = 600;
  const height = 180;
  const pad = { top: 12, right: 12, bottom: 28, left: 44 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  // Build indexed series per category
  const dateIndex = new Map(allDates.map((d, i) => [d, i]));
  const series: Record<string, number[]> = {};
  let globalMax = 1;

  for (const cat of categories) {
    const arr = new Array(allDates.length).fill(0);
    for (const pt of seriesData[cat]) {
      const idx = dateIndex.get(pt.hour_bucket);
      if (idx !== undefined) arr[idx] = pt.count;
    }
    series[cat] = arr;
    const catMax = Math.max(...arr);
    if (catMax > globalMax) globalMax = catMax;
  }
  globalMax *= 1.1;

  const yTicks = [0, Math.round(globalMax / 2), Math.round(globalMax)];
  const xLabelCount = Math.min(5, allDates.length);
  const xLabels: { idx: number; label: string }[] = [];
  for (let i = 0; i < xLabelCount; i++) {
    const idx = Math.round((i / (xLabelCount - 1)) * (allDates.length - 1));
    xLabels.push({ idx, label: formatDate(allDates[idx], true) });
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    const relX = mouseX - pad.left;
    const idx = Math.round((relX / cw) * (allDates.length - 1));
    if (idx >= 0 && idx < allDates.length) setHoverIdx(idx);
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIdx(null)}
    >
      {/* Y-axis ticks */}
      {yTicks.map((tick) => {
        const y = pad.top + ch - (tick / globalMax) * ch;
        return (
          <g key={tick}>
            <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="currentColor" strokeOpacity="0.08" />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" className="fill-zinc-400 text-[9px]">
              {formatNumber(tick)}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {xLabels.map(({ idx, label }) => {
        const x = pad.left + (idx / (allDates.length - 1)) * cw;
        return (
          <text key={idx} x={x} y={height - 4} textAnchor="middle" className="fill-zinc-400 text-[9px]">
            {label}
          </text>
        );
      })}

      {/* Series */}
      {categories.map((cat) => {
        const color = CATEGORY_COLORS[cat] || "#6b7280";
        const arr = series[cat];
        const mapped = arr.map((v, i) => ({
          x: pad.left + (i / (allDates.length - 1)) * cw,
          y: pad.top + ch - (v / globalMax) * ch,
        }));
        const linePath = monotoneCubic(mapped);
        const areaPath = `${linePath}L${mapped[mapped.length - 1].x},${height - pad.bottom}L${mapped[0].x},${height - pad.bottom}Z`;

        return (
          <g key={cat}>
            <defs>
              <linearGradient id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#grad-${cat})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Hover */}
      {hoverIdx !== null && (
        <g>
          <line
            x1={pad.left + (hoverIdx / (allDates.length - 1)) * cw}
            y1={pad.top}
            x2={pad.left + (hoverIdx / (allDates.length - 1)) * cw}
            y2={height - pad.bottom}
            stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3,3"
          />
          {categories.map((cat) => {
            const val = series[cat][hoverIdx];
            const x = pad.left + (hoverIdx / (allDates.length - 1)) * cw;
            const y = pad.top + ch - (val / globalMax) * ch;
            const color = CATEGORY_COLORS[cat] || "#6b7280";
            return (
              <circle key={cat} cx={x} cy={y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
            );
          })}
          {/* Tooltip box */}
          {(() => {
            const x = pad.left + (hoverIdx / (allDates.length - 1)) * cw;
            const tooltipX = x > width / 2 ? x - 90 : x + 8;
            return (
              <foreignObject x={tooltipX} y={pad.top} width="82" height={categories.length * 16 + 20}>
                <div className="rounded bg-zinc-900/90 px-2 py-1.5 text-[9px] text-white dark:bg-zinc-800/95">
                  <div className="mb-1 font-medium">{formatDate(allDates[hoverIdx], true)}</div>
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                      <span className="truncate">{series[cat][hoverIdx]}</span>
                    </div>
                  ))}
                </div>
              </foreignObject>
            );
          })()}
        </g>
      )}
    </svg>
  );
}

// ---- DonutChart ----

function DonutChart({
  entries,
  onCategoryClick,
  activeCategory,
  comparison,
}: {
  entries: CategoryEntry[];
  onCategoryClick: (cat: BotCategory | null) => void;
  activeCategory: BotCategory | null;
  comparison?: ComparisonData;
}) {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  if (total === 0) return null;

  const size = 140;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 52;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = entries.map((entry) => {
    const pct = entry.count / total;
    const dashLen = pct * circumference;
    const seg = { ...entry, dashLen, offset, pct };
    offset += dashLen;
    return seg;
  });

  const prevMap = new Map<string, number>();
  if (comparison) {
    for (const c of comparison.previous_by_category) {
      prevMap.set(c.bot_category, c.count);
    }
  }

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {segments.map((seg) => (
          <circle
            key={seg.bot_category}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={CATEGORY_COLORS[seg.bot_category] || "#6b7280"}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dashLen} ${circumference - seg.dashLen}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            className="transition-opacity"
            opacity={activeCategory && activeCategory !== seg.bot_category ? 0.3 : 1}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-zinc-900 text-lg font-bold dark:fill-zinc-100">
          {formatNumber(total)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="fill-zinc-400 text-[9px]">
          total visits
        </text>
      </svg>

      <div className="flex flex-col gap-1.5 min-w-0">
        {entries.map((entry) => {
          const prev = prevMap.get(entry.bot_category) ?? 0;
          const isActive = activeCategory === entry.bot_category;
          return (
            <button
              key={entry.bot_category}
              onClick={() => onCategoryClick(isActive ? null : entry.bot_category)}
              className={`flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                isActive ? "bg-zinc-100 dark:bg-zinc-800" : ""
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[entry.bot_category] || "#6b7280" }}
              />
              <span className="truncate text-xs text-zinc-700 dark:text-zinc-300">
                {CATEGORY_LABELS[entry.bot_category] || entry.bot_category}
              </span>
              <span className="ml-auto shrink-0 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                {entry.count.toLocaleString()}
              </span>
              {comparison && <DeltaBadge current={entry.count} previous={prev} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- BotIcon ----

function BotIcon({ botName, size = 16 }: { botName: string; size?: number }) {
  const src = BOT_ICONS[botName];
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-sm"
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

// ---- HorizontalBar ----

function HorizontalBar({ entries, max }: { entries: BotEntry[]; max: number }) {
  return (
    <div className="space-y-2">
      {entries.slice(0, 10).map((entry) => (
        <div key={entry.bot_name}>
          <div className="mb-0.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
              <BotIcon botName={entry.bot_name} />
              {entry.bot_name}
            </span>
            <span className="text-zinc-500">{entry.count.toLocaleString()}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-2 rounded-full transition-all"
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

// ---- ExpandablePageRow ----

function ExpandablePageRow({
  page,
  expanded,
  onToggle,
}: {
  page: PageWithBots;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Category dots for this page
  const cats = [...new Set(page.bots.map((b) => b.bot_category))];

  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      >
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="min-w-0 flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
          {page.path}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {cats.map((cat) => (
            <span
              key={cat}
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[cat as BotCategory] || "#6b7280" }}
            />
          ))}
        </span>
        <span className="shrink-0 text-sm tabular-nums text-zinc-500">
          {page.count.toLocaleString()}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-2 dark:border-zinc-800 dark:bg-zinc-800/30">
          <div className="space-y-1.5 pl-6">
            {page.bots
              .sort((a, b) => b.count - a.count)
              .map((bot) => (
                <div key={bot.bot_name} className="flex items-center gap-2 text-xs">
                  <BotIcon botName={bot.bot_name} size={14} />
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[bot.bot_category as BotCategory] || "#6b7280" }}
                  />
                  <span className="text-zinc-600 dark:text-zinc-400">{bot.bot_name}</span>
                  <span className="ml-auto tabular-nums text-zinc-500">{bot.count.toLocaleString()}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- FilterBar ----

function FilterBar({
  categoryFilter,
  botNameFilter,
  showComparison,
  bots,
  onCategoryChange,
  onBotNameChange,
  onComparisonToggle,
  onClear,
}: {
  categoryFilter: BotCategory | null;
  botNameFilter: string | null;
  showComparison: boolean;
  bots: BotEntry[];
  onCategoryChange: (cat: BotCategory | null) => void;
  onBotNameChange: (name: string | null) => void;
  onComparisonToggle: () => void;
  onClear: () => void;
}) {
  const filteredBots = categoryFilter
    ? bots.filter((b) => b.bot_category === categoryFilter)
    : bots;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {ALL_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(categoryFilter === cat ? null : cat)}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            categoryFilter === cat
              ? "text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
          style={categoryFilter === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : undefined}
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: categoryFilter === cat ? "white" : CATEGORY_COLORS[cat] }}
          />
          {CATEGORY_LABELS[cat]}
        </button>
      ))}

      {categoryFilter && filteredBots.length > 0 && (
        <select
          value={botNameFilter || ""}
          onChange={(e) => onBotNameChange(e.target.value || null)}
          className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          <option value="">All bots</option>
          {filteredBots.map((b) => (
            <option key={b.bot_name} value={b.bot_name}>
              {b.bot_name} ({b.count})
            </option>
          ))}
        </select>
      )}

      {(categoryFilter || botNameFilter) && (
        <button
          onClick={onClear}
          className="rounded-full px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
        >
          Clear filters
        </button>
      )}

      <div className="ml-auto">
        <button
          onClick={onComparisonToggle}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            showComparison
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          }`}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Compare
        </button>
      </div>
    </div>
  );
}

// ---- Empty State with Framework Selector ----

const FRAMEWORKS = [
  {
    key: "nextjs",
    label: "Next.js",
    file: "middleware.ts",
    code: `import { identifyBot } from "./lib/bot-detect";

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
}`,
  },
  {
    key: "express",
    label: "Express",
    file: "middleware/botTracker.js",
    code: `const { identifyBot } = require("./bot-detect");

module.exports = function botTracker(req, res, next) {
  const ua = req.headers["user-agent"] || "";
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
          path: req.path, user_agent: ua }],
      }),
    }).catch(() => {});
  }
  next();
};`,
  },
  {
    key: "hono",
    label: "Hono",
    file: "src/middleware/bot.ts",
    code: `import { identifyBot } from "./bot-detect";
import type { MiddlewareHandler } from "hono";

export const botTracker: MiddlewareHandler = async (c, next) => {
  const ua = c.req.header("user-agent") || "";
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
          path: new URL(c.req.url).pathname,
          user_agent: ua }],
      }),
    }).catch(() => {});
  }
  await next();
};`,
  },
  {
    key: "fastapi",
    label: "FastAPI",
    file: "middleware/bot_tracker.py",
    code: `import httpx
from bot_detect import identify_bot

async def bot_tracker_middleware(request, call_next):
    ua = request.headers.get("user-agent", "")
    bot = identify_bot(ua)
    if bot:
        async with httpx.AsyncClient() as client:
            await client.post(
                "https://www.bluemonitor.org/api/v1/bot-visits",
                headers={"Authorization": f"Bearer {API_KEY}"},
                json={"domain": "your-domain.com",
                      "visits": [{"bot_name": bot["name"],
                        "bot_category": bot["category"],
                        "path": str(request.url.path),
                        "user_agent": ua}]},
            )
    return await call_next(request)`,
  },
  {
    key: "rails",
    label: "Rails",
    file: "app/middleware/bot_tracker.rb",
    code: `class BotTracker
  def initialize(app)
    @app = app
  end

  def call(env)
    ua = env["HTTP_USER_AGENT"] || ""
    bot = identify_bot(ua)
    if bot
      Thread.new do
        Net::HTTP.post(
          URI("https://www.bluemonitor.org/api/v1/bot-visits"),
          { domain: "your-domain.com",
            visits: [{ bot_name: bot[:name],
              bot_category: bot[:category],
              path: env["PATH_INFO"],
              user_agent: ua }] }.to_json,
          "Authorization" => "Bearer #{ENV['BLUEMONITOR_API_KEY']}",
          "Content-Type" => "application/json"
        )
      end
    end
    @app.call(env)
  end
end`,
  },
  {
    key: "laravel",
    label: "Laravel",
    file: "app/Http/Middleware/BotTracker.php",
    code: `<?php
namespace App\\Http\\Middleware;

use Closure;
use Illuminate\\Http\\Request;

class BotTracker
{
    public function handle(Request $request, Closure $next)
    {
        $ua = $request->userAgent() ?? '';
        $bot = identifyBot($ua);
        if ($bot) {
            Http::withToken(env('BLUEMONITOR_API_KEY'))
                ->post('https://www.bluemonitor.org/api/v1/bot-visits', [
                    'domain' => 'your-domain.com',
                    'visits' => [[
                        'bot_name' => $bot['name'],
                        'bot_category' => $bot['category'],
                        'path' => $request->path(),
                        'user_agent' => $ua,
                    ]],
                ]);
        }
        return $next($request);
    }
}`,
  },
] as const;

function EmptyStateWithFrameworks() {
  const [activeTab, setActiveTab] = useState<string>("nextjs");
  const fw = FRAMEWORKS.find((f) => f.key === activeTab) || FRAMEWORKS[0];

  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-5 py-8 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      </div>
      <p className="mb-2 text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
        No bot visits recorded yet
      </p>
      <p className="mb-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Add the bot tracking middleware to your app to start tracking crawlers.
      </p>

      {/* Framework tabs */}
      <div className="mx-auto max-w-lg">
        <div className="mb-3 flex flex-wrap gap-1">
          {FRAMEWORKS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveTab(f.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === f.key
                  ? "bg-purple-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg bg-zinc-950 p-4">
          <p className="mb-2 text-xs font-medium text-zinc-400">{fw.file}</p>
          <pre className="overflow-x-auto text-xs leading-relaxed text-zinc-300">
            {fw.code}
          </pre>
        </div>

        <p className="mt-3 text-center text-xs text-zinc-500">
          See the{" "}
          <Link href={`/docs/${fw.key}`} className="text-purple-600 hover:underline dark:text-purple-400">
            full {fw.label} setup guide
          </Link>{" "}
          for detailed instructions.
        </p>
      </div>
    </div>
  );
}

// ---- AIVisibilityCard ----

function AIVisibilityCard({ data }: { data: AIVisibilityResult }) {
  const { score, label, trend, trend_pct, visiting_bots, missing_bots, breakdown } = data;

  // Gauge SVG params
  const radius = 54;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const gaugeColor = score <= 30 ? "#ef4444" : score <= 60 ? "#eab308" : "#22c55e";

  const trendArrow = trend === "up" ? "\u2197" : trend === "down" ? "\u2198" : "\u2192";
  const trendColor = trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-zinc-400";

  const breakdownItems = [
    { label: "Diversity", value: breakdown.diversity, max: 30 },
    { label: "Frequency", value: breakdown.frequency, max: 30 },
    { label: "Coverage", value: breakdown.coverage, max: 20 },
    { label: "Trend", value: breakdown.trend, max: 20 },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">AI Visibility Score</h3>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <span className="text-sm">{trendArrow}</span>
          <span className="text-xs font-medium">
            {trend_pct > 0 ? "+" : ""}{trend_pct}% vs prev period
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Left: Gauge */}
        <div className="flex shrink-0 justify-center">
          <div className="relative">
            <svg width="120" height="120" viewBox="0 0 128 128">
              <circle
                cx="64" cy="64" r={radius}
                fill="none" stroke="currentColor" strokeOpacity="0.08"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="64" cy="64" r={radius}
                fill="none" stroke={gaugeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={`${progress} ${circumference - progress}`}
                strokeDashoffset={circumference * 0.25}
                strokeLinecap="round"
                transform="rotate(-90 64 64)"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{score}</span>
              <span className="text-[10px] font-medium" style={{ color: gaugeColor }}>{label}</span>
            </div>
          </div>
        </div>

        {/* Right: Bot lists */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Visiting */}
          {visiting_bots.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Crawling your site ({visiting_bots.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visiting_bots.map((bot) => (
                  <span key={bot} className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-300">
                    <BotIcon botName={bot} size={12} />
                    {bot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing */}
          {missing_bots.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Not detected ({missing_bots.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missing_bots.map((bot) => (
                  <span key={bot} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
                    <BotIcon botName={bot} size={12} />
                    {bot}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Breakdown bars */}
      <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
        {breakdownItems.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.label}</span>
              <span className="text-[11px] font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                {item.value}/{item.max}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${(item.value / item.max) * 100}%`,
                  backgroundColor: gaugeColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Main Component ----

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
  const [categoryFilter, setCategoryFilter] = useState<BotCategory | null>(null);
  const [botNameFilter, setBotNameFilter] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [chartMode, setChartMode] = useState<"total" | "by_category">("total");
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    if (!selectedDomain || !isPro) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ period });
      if (categoryFilter) params.set("category", categoryFilter);
      if (botNameFilter) params.set("bot_name", botNameFilter);
      if (showComparison) params.set("compare", "true");
      const res = await fetch(`/api/bot-visits/${encodeURIComponent(selectedDomain)}?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDomain, period, isPro, categoryFilter, botNameFilter, showComparison]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (domains.length > 0 && !domains.includes(selectedDomain)) {
      setSelectedDomain(domains[0]);
    }
  }, [domains, selectedDomain]);

  // Reset bot name filter when category changes
  useEffect(() => {
    setBotNameFilter(null);
  }, [categoryFilter]);

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

  // All unique dates from timeline for multi-series chart
  const allDates = data?.timeline.map((t) => t.hour_bucket) ?? [];

  const togglePage = (path: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Bot Tracking
          </h2>
          <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
            PRO
          </span>
          {hasData && showComparison && data.comparison && (
            <DeltaBadge current={totalVisits} previous={data.comparison.previous_total} />
          )}
        </div>
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
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading...
        </div>
      ) : !hasData ? (
        <EmptyStateWithFrameworks />
      ) : (
        <>
          {/* Filter bar */}
          <FilterBar
            categoryFilter={categoryFilter}
            botNameFilter={botNameFilter}
            showComparison={showComparison}
            bots={data.by_bot}
            onCategoryChange={setCategoryFilter}
            onBotNameChange={setBotNameFilter}
            onComparisonToggle={() => setShowComparison((v) => !v)}
            onClear={() => {
              setCategoryFilter(null);
              setBotNameFilter(null);
            }}
          />

          <div className="space-y-4">
            {/* AI Visibility Score */}
            {data.ai_visibility && data.ai_visibility.score > 0 && (
              <AIVisibilityCard data={data.ai_visibility} />
            )}

            {/* Timeline chart */}
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bot Visits Over Time</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{totalVisits.toLocaleString()} total</span>
                  <div className="flex rounded-md border border-zinc-200 dark:border-zinc-700">
                    <button
                      onClick={() => setChartMode("total")}
                      className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        chartMode === "total"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                      } rounded-l-md`}
                    >
                      Total
                    </button>
                    <button
                      onClick={() => setChartMode("by_category")}
                      className={`px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        chartMode === "by_category"
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                      } rounded-r-md`}
                    >
                      By Category
                    </button>
                  </div>
                </div>
              </div>

              {chartMode === "total" ? (
                <AreaChart
                  points={data.timeline.map((t, i) => ({ x: i, y: t.count }))}
                  dates={allDates}
                />
              ) : (
                <>
                  <MultiSeriesAreaChart
                    seriesData={data.timeline_by_category}
                    allDates={allDates}
                  />
                  {/* Legend */}
                  <div className="mt-2 flex flex-wrap gap-3">
                    {Object.keys(data.timeline_by_category).map((cat) => (
                      <div key={cat} className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat as BotCategory] || "#6b7280" }}
                        />
                        {CATEGORY_LABELS[cat as BotCategory] || cat}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Donut + Top Bots row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Donut chart (category summary) */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">By Category</h3>
                <DonutChart
                  entries={data.by_category}
                  onCategoryClick={setCategoryFilter}
                  activeCategory={categoryFilter}
                  comparison={showComparison ? data.comparison : undefined}
                />
              </div>

              {/* Top bots */}
              <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">Top Bots</h3>
                <HorizontalBar entries={data.by_bot} max={maxBotCount} />
              </div>
            </div>

            {/* Top pages (expandable) */}
            {data.pages_with_bots.length > 0 && (
              <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Top Pages</h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {data.pages_with_bots.map((page) => (
                    <ExpandablePageRow
                      key={page.path}
                      page={page}
                      expanded={expandedPages.has(page.path)}
                      onToggle={() => togglePage(page.path)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
