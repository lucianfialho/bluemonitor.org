"use client";

import { useState } from "react";
import { SignedIn } from "@neondatabase/auth/react";

export default function FavoriteButton({
  serviceId,
  initialFavorited = false,
}: {
  serviceId: number;
  initialFavorited?: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    const prev = favorited;
    setFavorited(!prev);

    try {
      if (prev) {
        await fetch(`/api/watchlist/${serviceId}`, { method: "DELETE" });
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId }),
        });
      }
    } catch {
      setFavorited(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignedIn>
      <button
        onClick={toggle}
        disabled={loading}
        className="group/fav inline-flex items-center justify-center rounded-md p-1.5 text-zinc-400 transition-colors hover:text-red-500 disabled:opacity-50 dark:text-zinc-500 dark:hover:text-red-400"
        title={favorited ? "Remove from watchlist" : "Add to watchlist"}
        aria-label={favorited ? "Remove from watchlist" : "Add to watchlist"}
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill={favorited ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>
    </SignedIn>
  );
}
