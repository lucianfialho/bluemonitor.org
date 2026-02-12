import type { Metadata } from "next";
import Link from "next/link";
import WaitlistForm from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "BlueMonitor pricing plans. Monitor services for free or upgrade to Pro for higher limits and priority alerts.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals keeping an eye on a few services.",
    features: [
      "3 services in watchlist",
      "2 webhook notifications",
      "Discord, Slack & custom webhooks",
      "15 API requests / min",
      "Status badge embeds",
      "Community support",
    ],
    cta: "Get Started",
    ctaHref: "/auth/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    description: "For teams and power users who need more.",
    features: [
      "Unlimited watchlist",
      "10 webhook notifications",
      "Priority alert delivery",
      "60 API requests / min",
      "1-minute recheck interval",
      "MCP integration for AI assistants",
      "Priority support",
    ],
    cta: "Join Waitlist",
    ctaHref: null,
    highlighted: true,
  },
];

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
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 sm:p-8 ${
                plan.highlighted
                  ? "bg-zinc-900 text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800/50"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                  Coming Soon
                </span>
              )}

              <h2
                className={`text-lg font-semibold ${
                  plan.highlighted
                    ? ""
                    : "text-zinc-900 dark:text-zinc-100"
                }`}
              >
                {plan.name}
              </h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span
                    className={`text-sm ${
                      plan.highlighted
                        ? "text-zinc-400 dark:text-zinc-500"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>
              <p
                className={`mt-2 text-sm ${
                  plan.highlighted
                    ? "text-zinc-400 dark:text-zinc-500"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-start gap-2 text-sm ${
                      plan.highlighted
                        ? "text-zinc-300 dark:text-zinc-600"
                        : "text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <svg
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.highlighted
                          ? "text-white dark:text-zinc-900"
                          : "text-zinc-900 dark:text-zinc-100"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.ctaHref ? (
                  <Link
                    href={plan.ctaHref}
                    className={`block w-full rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-white text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <WaitlistForm />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
