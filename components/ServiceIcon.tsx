"use client";

import { useState } from "react";

export default function ServiceIcon({
  domain,
  name,
  size = 32,
  className = "",
}: {
  domain: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span className={className}>
        {name.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={className}
      onError={() => setError(true)}
    />
  );
}
