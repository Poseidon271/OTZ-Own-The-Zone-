"use client";

import React from "react";
import { cn } from "@/lib/utils";

function TestimonialCard({ item }) {
  return (
    <div className="mx-3 flex h-[180px] w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 text-left">
      <p className="line-clamp-4 text-xs leading-relaxed text-[var(--text-primary)]">
        &ldquo;{item.quote}&rdquo;
      </p>
      <div className="flex items-center gap-3 border-t border-[var(--border-default)] pt-4 w-full">
        <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[var(--surface-subtle)] flex items-center justify-center">
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="object-cover h-full w-full"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[var(--text-secondary)]">
              {item.name.slice(0, 2)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
            {item.name}
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] truncate">
            {item.role}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ items, speed, direction }) {
  const doubled = [...items, ...items, ...items, ...items];

  return (
    <div
      className="flex w-max"
      style={{
        animation: `marquee ${speed} linear infinite`,
        animationDirection: direction === "right" ? "reverse" : "normal",
      }}
    >
      {doubled.map((item, i) => (
        <TestimonialCard key={i} item={item} />
      ))}
    </div>
  );
}

export function KineticTestimonials({ rows, speeds = ["30s", "30s"], className }) {
  return (
    <div className={cn("relative overflow-hidden w-full", className)}>
      <div className="flex flex-col gap-4">
        {rows.map((row, idx) => (
          <div key={idx} className="relative overflow-hidden w-full">
            <Row
              items={row}
              speed={speeds[idx] || "30s"}
              direction={idx % 2 === 0 ? "left" : "right"}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[var(--surface-canvas)] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[var(--surface-canvas)] to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
