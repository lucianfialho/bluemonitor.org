import { Metadata } from "next";
import Link from "next/link";
import { getRecentIncidents } from "@/lib/services";
import IncidentList from "@/components/IncidentList";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Recent Incidents — BlueMonitor",
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Incidents</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Recent Incidents
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Live feed of outages and incidents reported by services we monitor.
          {activeCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {activeCount} active
            </span>
          )}
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-950/30">
          <div className="mb-2 text-2xl">All clear</div>
          <p className="text-sm text-green-700 dark:text-green-400">
            No incidents reported across all monitored services.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([date, dayIncidents]) => (
            <section key={date}>
              <h2 className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {date}
              </h2>
              <IncidentList incidents={dayIncidents} showService />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
