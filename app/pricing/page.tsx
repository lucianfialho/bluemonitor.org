import type { Metadata } from "next";
import PricingCards from "./PricingCards";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "BlueMonitor pricing plans. Monitor services for free or upgrade to Pro for higher limits and priority alerts.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing — BlueMonitor",
    description:
      "Monitor services for free or upgrade to Pro for higher limits and priority alerts.",
    url: "https://www.bluemonitor.org/pricing",
  },
};

export default function PricingPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                name: "BlueMonitor Pro",
                description:
                  "Professional SaaS monitoring with unlimited watchlist, 10 webhooks, 300 API req/min, 1-minute recheck interval, 30-day history, and MCP integration.",
                brand: { "@type": "Brand", name: "BlueMonitor" },
                offers: [
                  {
                    "@type": "Offer",
                    name: "Pro Monthly",
                    price: "9",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/InStock",
                    url: "https://www.bluemonitor.org/pricing",
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "9",
                      priceCurrency: "USD",
                      unitText: "MONTH",
                    },
                  },
                  {
                    "@type": "Offer",
                    name: "Pro Annual",
                    price: "84",
                    priceCurrency: "USD",
                    priceValidUntil: "2026-12-31",
                    availability: "https://schema.org/InStock",
                    url: "https://www.bluemonitor.org/pricing",
                    priceSpecification: {
                      "@type": "UnitPriceSpecification",
                      price: "7",
                      priceCurrency: "USD",
                      unitText: "MONTH",
                    },
                  },
                ],
              },
              {
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
                    name: "Pricing",
                    item: "https://www.bluemonitor.org/pricing",
                  },
                ],
              },
            ],
          }),
        }}
      />
      {/* Hero */}
      <section className="px-4 pt-20 pb-12 text-center sm:px-6 sm:pt-28 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl lg:text-7xl">
            Simple, transparent pricing.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 sm:text-xl">
            Start monitoring for free. Upgrade when you need more.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-20 sm:px-6 sm:pb-28">
        <PricingCards />
      </section>
    </div>
  );
}
