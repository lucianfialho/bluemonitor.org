import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServices, getServiceBySlug, getRelatedServices, getCategoryBySlug, getIncidentsBySlug } from "@/lib/services";
import StatusChecker from "@/components/StatusChecker";
import StatusTimeline from "@/components/StatusTimeline";
import IncidentList from "@/components/IncidentList";
import ServiceIcon from "@/components/ServiceIcon";
import FavoriteButton from "@/components/FavoriteButton";
import HeartbeatChecks from "@/components/HeartbeatChecks";

export async function generateStaticParams() {
  // Don't pre-render at build time to avoid overwhelming the DB.
  // Pages are generated on-demand with ISR (revalidate = 60).
  return [];
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

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
      url: `https://www.bluemonitor.org/status/${service.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `Is ${service.name} Down? — BlueMonitor`,
      description: `Check if ${service.name} is down right now. Real-time status monitoring for ${service.name}.`,
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
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const [related, incidents] = await Promise.all([
    getRelatedServices(slug),
    getIncidentsBySlug(slug),
  ]);
  const category = getCategoryBySlug(service.category);

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${service.name} down right now?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `This page shows the real-time status of ${service.name}. The status is checked automatically by pinging ${service.name}'s servers. If the status shows "Down", it means ${service.name} is currently experiencing issues.`,
        },
      },
      {
        "@type": "Question",
        name: `Why is ${service.name} not working?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${service.name} may not be working due to server outages, scheduled maintenance, network issues, or high traffic. Check the current status above for real-time information.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I check if ${service.name} is down for everyone?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `BlueMonitor checks ${service.name}'s servers from our monitoring infrastructure. If the status shows "Down" here, it's likely down for everyone. If it shows "Up" but you can't access it, the issue may be on your end.`,
        },
      },
      {
        "@type": "Question",
        name: `What should I do if ${service.name} is down?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `If ${service.name} is down, you can: wait a few minutes and try again, check their official social media for updates, clear your browser cache, or try using a different network connection.`,
        },
      },
    ],
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.bluemonitor.org",
      },
      ...(category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: category.name,
              item: `https://www.bluemonitor.org/categories/${service.category}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: service.name,
              item: `https://www.bluemonitor.org/status/${service.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: service.name,
              item: `https://www.bluemonitor.org/status/${service.slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
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
          <div className="mb-2 flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
              Is {service.name} Down?
            </h1>
            {service.id && <FavoriteButton serviceId={service.id} />}
          </div>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            Real-time status check for{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {service.domain}
            </span>
          </p>
          <StatusChecker domain={service.domain} />
          {service.status_page_url && (
            <a
              href={service.status_page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              Official {service.name} Status Page
            </a>
          )}
        </div>

        {/* Heartbeat Info */}
        {service.last_heartbeat_at && (
          <div className="mb-10 rounded-2xl border border-purple-200 bg-purple-50/50 p-6 dark:border-purple-900 dark:bg-purple-950/20">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                Push Monitoring Active
              </h3>
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                HEARTBEAT
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400">Status</p>
                <p className="mt-0.5 text-sm font-semibold text-purple-900 dark:text-purple-100">
                  {service.current_status === "up"
                    ? "Operational"
                    : service.current_status === "slow"
                      ? "Slow"
                      : service.current_status === "down"
                        ? "Down"
                        : service.current_status ?? "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400">Latency</p>
                <p className="mt-0.5 text-sm font-semibold text-purple-900 dark:text-purple-100">
                  {service.current_response_time !== null && service.current_response_time !== undefined
                    ? `${service.current_response_time}ms`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400">Last Heartbeat</p>
                <p className="mt-0.5 text-sm font-semibold text-purple-900 dark:text-purple-100">
                  {new Date(service.last_heartbeat_at).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-purple-500 dark:text-purple-400">
              This service reports its health directly to BlueMonitor via heartbeat push.
              If no heartbeat is received for 10 minutes, the service is marked as down.
            </p>
          </div>
        )}

        {/* Health Checks Detail + Charts */}
        {service.last_heartbeat_at && (
          <div className="mb-10">
            <HeartbeatChecks slug={service.slug} currentChecks={service.last_health_data ?? null} />
          </div>
        )}

        {/* Status Timeline */}
        <div className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <StatusTimeline slug={service.slug} />
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

        {/* Recent Incidents */}
        {service.feed_url && (
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Incidents
            </h2>
            <IncidentList incidents={incidents} />
          </section>
        )}

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
