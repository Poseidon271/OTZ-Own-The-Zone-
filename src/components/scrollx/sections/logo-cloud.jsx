"use client";

import React from "react";
import { FlowingLogos } from "../flowing-logos";
import { FadeIn } from "../fade-in";
import { cn } from "@/lib/utils";

const defaultLogos = [
  { name: "Star Sports" },
  { name: "PVR Cinemas" },
  { name: "Red FM 93.5" },
  { name: "Times of India OOH" },
  { name: "Inox Leisure" },
  { name: "Mid-day Print" },
  { name: "Bandra billboard" },
  { name: "Juhu Digital screen" },
];

export default function LogoCloud({
  label = "TRUSTED MEDIA CHANNELS & ZONE PLACEMENTS CONNECTED",
  logos = defaultLogos,
  className,
}) {
  return (
    <section className={cn("border-y border-[var(--border-default)] py-14", className)}>
      <FadeIn>
        <p className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-secondary)]">
          {label}
        </p>
      </FadeIn>
      <div className="relative overflow-hidden w-full">
        <FlowingLogos logos={logos} />
      </div>
    </section>
  );
}
