import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { categories, getCategoryBySlug, getServicesByCategory } from "@/lib/services";
import ServiceCard from "@/components/ServiceCard";

export async function generateStaticParams() {
  return categories.map((cat) => ({
    slug: cat.slug,
  }));
}

export const dynamicParams = false;
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  const label = category.name.toLowerCase().replace(/\s*services?\s*$/i, "");

  return {
    title: `${category.name} Status — Is It Down?`,
    description: `Check the real-time status of ${label} services. Monitor uptime, response times, and outages for popular ${label} platforms.`,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} Status — BlueMonitor`,
      description: `Check the real-time status of ${label} services. Monitor uptime and outages for popular ${label} platforms.`,
      url: `https://www.bluemonitor.org/categories/${category.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${category.name} Status — BlueMonitor`,
      description: `Real-time status monitoring for ${label} services.`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryServices = await getServicesByCategory(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
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
                name: category.name,
                item: `https://www.bluemonitor.org/categories/${category.slug}`,
              },
            ],
          }),
        }}
      />
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Home
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{category.name}</span>
      </nav>

      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
        {category.name}
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        {category.description}. Monitor the real-time status of {categoryServices.length} services.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categoryServices.map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>

      {/* Other categories */}
      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Other Categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter((c) => c.slug !== slug)
            .map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
              >
                {cat.name}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
