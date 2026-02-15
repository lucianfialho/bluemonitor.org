import { Metadata } from "next";
import Link from "next/link";
import { getRecentIncidents } from "@/lib/services";
import IncidentList from "@/components/IncidentList";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Recent Incidents",
  description:
    "Live feed of service outages and incidents across 500+ platforms. See which services are currently affected.",
  alternates: {
    canonical: "/incidents",
  },
};

export default async function IncidentsPage() {
  const incidents = await getRecentIncidents(100);

  // Group by date
  const grouped = new Map<string, typeof incidents>();
  for (const inc of incidents) {
    const date = new Date(inc.started_at).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const existing = grouped.get(date) || [];
    existing.push(inc);
    grouped.set(date, existing);
  }

  const activeCount = incidents.filter((i) => i.status !== "resolved").length;

  return (
    <div>
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
                name: "Incidents",
                item: "https://www.bluemonitor.org/incidents",
              },
            ],
          }),
        }}
      />
      {/* Hero */}
      <section className="px-4 pt-20 pb-12 sm:px-6 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500">
            <Link
              href="/"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100">Incidents</span>
          </nav>

          <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
            Recent Incidents.
          </h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
            Live feed of outages and incidents reported by services we monitor.
            {activeCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                {activeCount} active
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <div className="mx-auto max-w-3xl">
          {incidents.length === 0 ? (
            <div className="rounded-2xl bg-green-50 p-8 text-center dark:bg-green-950/30">
              <div className="mb-2 text-2xl">All clear</div>
              <p className="text-sm text-green-700 dark:text-green-400">
                No incidents reported across all monitored services.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {Array.from(grouped.entries()).map(([date, dayIncidents]) => (
                <section key={date}>
                  <h2 className="mb-4 text-sm font-semibold text-zinc-400 dark:text-zinc-500">
                    {date}
                  </h2>
                  <IncidentList incidents={dayIncidents} showService />
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
