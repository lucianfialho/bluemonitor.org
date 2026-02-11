import { services, categories } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";

export default function Home() {
  const popular = services.slice(0, 12);

  const grouped = categories
    .map((cat) => ({
      ...cat,
      services: services.filter((s) => s.category === cat.slug),
    }))
    .filter((cat) => cat.services.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      {/* Hero */}
      <section className="mb-12 text-center sm:mb-16">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Is it down right now?
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Real-time status monitoring for the services you depend on.
          Check if any website or service is down — instantly.
        </p>
        <div className="flex justify-center">
          <SearchBar />
        </div>
      </section>

      {/* Popular Services */}
      <section className="mb-12 sm:mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Popular Services
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12 sm:mb-16">
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Browse by Category
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {cat.services.length} services monitored
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* All Services */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          All Monitored Services
        </h2>
        {grouped.map((cat) => (
          <div key={cat.slug} className="mb-8">
            <h3 className="mb-3 text-lg font-medium text-zinc-700 dark:text-zinc-300">
              {cat.name}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
