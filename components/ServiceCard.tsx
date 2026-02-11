import Link from "next/link";
import { Service } from "@/lib/types";
import ServiceIcon from "./ServiceIcon";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/status/${service.slug}`}
      className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-lg font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        <ServiceIcon domain={service.domain} name={service.name} size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {service.name}
        </h3>
        <p className="truncate text-sm text-zinc-500 dark:text-zinc-500">
          {service.domain}
        </p>
      </div>
      <svg
        className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5 dark:text-zinc-600"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
