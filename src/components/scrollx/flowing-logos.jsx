"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function FlowingLogos({ logos, className, speed = "28s" }) {
  const doubled = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className={cn("relative flex overflow-hidden w-full", className)}>
      <div
        className="flex shrink-0 items-center gap-14 pr-14"
        style={{ animation: `marquee ${speed} linear infinite` }}
      >
        {doubled.map((logo, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-3 text-[var(--text-secondary)] transition-colors duration-300 hover:text-[var(--text-primary)]"
          >
            {logo.icon && <span className="size-5">{logo.icon}</span>}
            <span className="text-base md:text-lg font-bold tracking-tight font-display">
              {logo.name}
            </span>
          </div>
        ))}
      </div>

      <div
        className="flex shrink-0 items-center gap-14 pr-14"
        aria-hidden
        style={{ animation: `marquee ${speed} linear infinite` }}
      >
        {doubled.map((logo, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-3 text-[var(--text-secondary)] transition-colors duration-300 hover:text-[var(--text-primary)]"
          >
            {logo.icon && <span className="size-5">{logo.icon}</span>}
            <span className="text-base md:text-lg font-bold tracking-tight font-display">
              {logo.name}
            </span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[var(--surface-canvas)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[var(--surface-canvas)] to-transparent" />
    </div>
  );
}
