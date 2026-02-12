import { Metadata } from "next";
import BadgeGenerator from "./BadgeGenerator";

export const metadata: Metadata = {
  title: "Status Badge — BlueMonitor",
  description:
    "Get a free status badge for your website. Show your visitors that your service is monitored in real-time.",
  alternates: {
    canonical: "/badge",
  },
};

export default function BadgePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Status Badge
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Add a real-time status badge to your website. It shows your current
        status and automatically registers your service on BlueMonitor.
      </p>
      <BadgeGenerator />
    </div>
  );
}
