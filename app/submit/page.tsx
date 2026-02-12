import { Metadata } from "next";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit your SaaS — BlueMonitor",
  description:
    "Get your SaaS monitored on BlueMonitor. We track uptime, response time, and notify users when something goes wrong.",
  alternates: {
    canonical: "/submit",
  },
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Submit your SaaS
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Get your SaaS monitored on BlueMonitor. We&apos;ll track uptime,
        response time, and notify users when something goes wrong.
      </p>
      <SubmitForm />
    </div>
  );
}
