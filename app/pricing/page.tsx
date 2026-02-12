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
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="mb-12 text-center sm:mb-16">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Start monitoring for free. Upgrade when you need more.
        </p>
      </div>

      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 ${
              plan.highlighted
                ? "border-blue-600 bg-white shadow-lg shadow-blue-100 dark:border-blue-500 dark:bg-zinc-900 dark:shadow-blue-950"
                : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                Coming Soon
              </span>
            )}

            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {plan.name}
            </h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {plan.period}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {plan.description}
            </p>

            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400"
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
                  className={`block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
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
    </div>
  );
}

