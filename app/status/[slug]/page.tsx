import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { services, getServiceBySlug, getRelatedServices, getCategoryBySlug } from "@/lib/services";
import StatusChecker from "@/components/StatusChecker";
import ServiceIcon from "@/components/ServiceIcon";

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return { title: "Service Not Found — BlueMonitor" };
  }

  return {
    title: `Is ${service.name} Down? — Real-Time Status`,
    description: `Check if ${service.name} is down right now. Real-time status monitoring, response time, and outage history for ${service.name}.`,
    alternates: {
      canonical: `/status/${service.slug}`,
    },
    openGraph: {
      title: `Is ${service.name} Down? — BlueMonitor`,
      description: `Check if ${service.name} is down right now. Real-time status monitoring for ${service.name}.`,
      type: "website",
    },
  };
}

function FAQSection({ name }: { name: string }) {
  const faqs = [
    {
      question: `Is ${name} down right now?`,
      answer: `This page shows the real-time status of ${name}. The status is checked automatically by pinging ${name}'s servers. If the status shows "Down", it means ${name} is currently experiencing issues.`,
    },
    {
      question: `Why is ${name} not working?`,
      answer: `${name} may not be working due to server outages, scheduled maintenance, network issues, or high traffic. Check the current status above for real-time information.`,
    },
    {
      question: `How do I check if ${name} is down for everyone?`,
      answer: `BlueMonitor checks ${name}'s servers from our monitoring infrastructure. If the status shows "Down" here, it's likely down for everyone. If it shows "Up" but you can't access it, the issue may be on your end.`,
    },
    {
      question: `What should I do if ${name} is down?`,
      answer: `If ${name} is down, you can: wait a few minutes and try again, check their official social media for updates, clear your browser cache, or try using a different network connection.`,
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-lg border border-zinc-200 dark:border-zinc-800"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {faq.question}
            </summary>
            <p className="px-4 pb-3 text-sm text-zinc-600 dark:text-zinc-400">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const related = getRelatedServices(slug);
  const category = getCategoryBySlug(service.category);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Is ${service.name} Down?`,
    description: `Check if ${service.name} is down right now. Real-time status monitoring, response time, and outage history for ${service.name}.`,
    url: `https://www.bluemonitor.org/status/${service.slug}`,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: `Is ${service.name} down right now?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `This page shows the real-time status of ${service.name}. The status is checked automatically by pinging ${service.name}'s servers.`,
          },
        },
        {
          "@type": "Question",
          name: `Why is ${service.name} not working?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${service.name} may not be working due to server outages, scheduled maintenance, network issues, or high traffic.`,
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Home
          </Link>
          <span>/</span>
          {category && (
            <>
              <Link
                href={`/categories/${service.category}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-zinc-900 dark:text-zinc-100">{service.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-10 rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-2xl font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              <ServiceIcon domain={service.domain} name={service.name} size={40} />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Is {service.name} Down?
          </h1>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            Real-time status check for{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {service.domain}
            </span>
          </p>
          <StatusChecker domain={service.domain} />
        </div>

        {/* About */}
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            About {service.name} Status
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            BlueMonitor checks {service.name} ({service.domain}) by sending automated requests to its servers.
            If the service responds within a normal timeframe and returns a successful status code, it&apos;s marked as operational.
            Response times over 3 seconds indicate the service is slow, and connection failures or server errors indicate the service may be down.
          </p>
        </section>

        {/* FAQ */}
        <div className="mb-10">
          <FAQSection name={service.name} />
        </div>

        {/* Related Services */}
        {related.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Related Services
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/status/${rel.slug}`}
                  className="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-blue-300 hover:bg-blue-50/50 dark:border-zinc-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {rel.name}
                  </div>
                  <div className="text-sm text-zinc-500">{rel.domain}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
