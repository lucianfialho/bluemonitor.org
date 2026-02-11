"use client";

type Status = "up" | "down" | "slow" | "checking" | "unknown";

const statusConfig: Record<Status, { label: string; bg: string; dot: string }> = {
  up: { label: "Operational", bg: "bg-green-500/10 text-green-600 dark:text-green-400", dot: "bg-green-500" },
  down: { label: "Down", bg: "bg-red-500/10 text-red-600 dark:text-red-400", dot: "bg-red-500" },
  slow: { label: "Slow", bg: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", dot: "bg-yellow-500" },
  checking: { label: "Checking...", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400", dot: "bg-blue-500 animate-pulse" },
  unknown: { label: "Unknown", bg: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400", dot: "bg-zinc-500" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${config.bg}`}>
      <span className={`h-2 w-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
