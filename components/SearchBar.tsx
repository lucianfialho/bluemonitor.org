"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { services } from "@/lib/services";
import ServiceIcon from "./ServiceIcon";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filtered = query.length > 0
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.domain.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search for a service... (e.g. ChatGPT, Discord, Netflix)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.length > 0 && setOpen(true)}
          className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-12 pr-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {filtered.map((service) => (
            <button
              key={service.slug}
              onClick={() => {
                router.push(`/status/${service.slug}`);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <ServiceIcon domain={service.domain} name={service.name} size={20} />
              </div>
              <div>
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {service.name}
                </div>
                <div className="text-xs text-zinc-500">{service.domain}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
