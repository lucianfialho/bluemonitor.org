import { Metadata } from "next";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Submit a Service — BlueMonitor",
  description:
    "Submit a service or website to be monitored on BlueMonitor. Help us expand our coverage.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Submit a Service
      </h1>
      <p className="mb-8 text-zinc-600 dark:text-zinc-400">
        Can&apos;t find a service you&apos;re looking for? Submit it below and
        we&apos;ll add it to our monitoring list.
      </p>
      <SubmitForm />
    </div>
  );
}
