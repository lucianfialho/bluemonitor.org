import { Metadata } from "next";
import Link from "next/link";
import { changelog } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "See what's new in BlueMonitor — latest features, improvements, and fixes.",
  alternates: { canonical: "/changelog" },
};

const tagStyles: Record<string, string> = {
  feature:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  improvement:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  fix: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
};

function groupByMonth(
  entries: typeof changelog
): { label: string; entries: typeof changelog }[] {
  const groups: Map<string, typeof changelog> = new Map();
  for (const entry of entries) {
    const d = new Date(entry.date + "T00:00:00");
    const label = d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const existing = groups.get(label);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(label, [entry]);
    }
  }
  return Array.from(groups, ([label, entries]) => ({ label, entries }));
}

export default function ChangelogPage() {
  const grouped = groupByMonth(changelog);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://www.bluemonitor.org",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Changelog",
                item: "https://www.bluemonitor.org/changelog",
              },
            ],
          }),
        }}
      />
      <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/"
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Changelog</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Changelog
      </h1>
      <p className="mb-10 text-sm text-zinc-500 dark:text-zinc-400">
        New features, improvements, and fixes shipped to BlueMonitor.
      </p>

      <div className="space-y-10">
        {grouped.map((group) => (
          <section key={group.label}>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {group.label}
            </h2>
            <div className="space-y-4">
              {group.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <time className="text-xs text-zinc-400 dark:text-zinc-500">
                      {new Date(entry.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </time>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tagStyles[entry.tag]}`}
                    >
                      {entry.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {entry.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {entry.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
