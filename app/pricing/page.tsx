import type { Metadata } from "next";
import PricingCards from "./PricingCards";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "BlueMonitor pricing plans. Monitor services for free or upgrade to Pro for higher limits and priority alerts.",
};

export default function PricingPage() {
  return (
    <div>
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
