export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  tag: "feature" | "improvement" | "fix";
}

export const changelog: ChangelogEntry[] = [
  {
    id: "2026-02-14-30d-uptime-pro",
    date: "2026-02-14",
    title: "30-day uptime window for Pro users",
    description:
      "Pro plans now show uptime percentages over a rolling 30-day window instead of 24 hours, giving you a much clearer picture of long-term reliability.",
    tag: "feature",
  },
  {
    id: "2026-02-13-24h-uptime",
    date: "2026-02-13",
    title: "24-hour uptime percentage",
    description:
      "Every service on your dashboard and public status pages now displays a 24-hour uptime percentage so you can spot issues at a glance.",
    tag: "feature",
  },
  {
    id: "2026-02-12-og-images",
    date: "2026-02-12",
    title: "Custom OG images for status pages",
    description:
      "Shared links now render with branded Open Graph images featuring the real BlueMonitor logo, cached for fast delivery.",
    tag: "improvement",
  },
  {
    id: "2026-02-11-fix-nan-uptime",
    date: "2026-02-11",
    title: "Fix NaN uptime display",
    description:
      "Resolved a bug where uptime percentages could display as NaN due to a SQL numeric type mismatch.",
    tag: "fix",
  },
];
