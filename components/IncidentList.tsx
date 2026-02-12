import { Incident } from "@/lib/types";

const severityStyles = {
  minor: "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30",
  major: "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30",
  critical: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
};

const severityDot = {
  minor: "bg-yellow-500",
  major: "bg-orange-500",
  critical: "bg-red-500",
};

const statusLabel: Record<string, string> = {
  investigating: "Investigating",
  identified: "Identified",
  monitoring: "Monitoring",
  resolved: "Resolved",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "just now";
}

export default function IncidentList({
  incidents,
  showService = false,
}: {
  incidents: Incident[];
  showService?: boolean;
}) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
        No incidents reported in the last 30 days.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className={`rounded-lg border p-4 ${severityStyles[inc.severity]}`}
        >
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${severityDot[inc.severity]}`} />
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {inc.title}
              </h3>
            </div>
            <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              {timeAgo(inc.started_at)}
            </span>
          </div>
          {inc.description && (
            <p className="mb-2 pl-4 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {inc.description}
            </p>
          )}
          <div className="flex items-center gap-3 pl-4 text-xs text-zinc-500 dark:text-zinc-400">
            {showService && inc.service_name && (
              <a
                href={`/status/${inc.service_slug}`}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {inc.service_name}
              </a>
            )}
            <span>{formatDate(inc.started_at)} at {formatTime(inc.started_at)}</span>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {statusLabel[inc.status] || inc.status}
            </span>
            {inc.source_url && (
              <a
                href={inc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Source
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
