"use client";

import React from "react";
import Link from "next/link";
import { FadeIn } from "../fade-in";
import { ShinyButton } from "../shiny-button";
import { ArrowRight } from "lucide-react";
import { VercelCard } from "../vercel-card";
import { cn } from "@/lib/utils";

export default function CTA({
  headline = "Ready to own your zone?",
  description = "Join hundreds of brands planning media mixes, buying verified placements, and tracking outcomes on autopilot.",
  primaryCtaText = "Plan my campaign",
  secondaryCtaText = "Browse inventory",
  secondaryCtaHref = "/media-buying",
  disclaimer = "Transparent pricing · Audited placement reports · Dedicated ops desk support",
  className,
}) {
  const triggerOnboarding = () => {
    window.dispatchEvent(
      new CustomEvent("open-lead-popup", { detail: { intent: "brand" } })
    );
  };

  return (
    <section id="contact" className={cn("border-t border-[var(--border-default)] py-24 px-5 text-left relative z-10 bg-transparent", className)}>
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <VercelCard className="w-full rounded-2xl bg-gradient-to-br from-[#132a4f]/20 to-[#0b1e3b]/40 backdrop-blur-md">
            <div className="relative z-10 flex flex-col items-center gap-6 text-center py-4">
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">{headline}</h2>
              <p className="max-w-md text-xs leading-relaxed text-[var(--text-secondary)]">{description}</p>
              <div className="flex flex-col items-center gap-3 sm:flex-row mt-2">
                <ShinyButton onClick={triggerOnboarding} className="gap-2 px-7 py-3 font-bold text-xs">
                  {primaryCtaText} <ArrowRight className="size-3.5" />
                </ShinyButton>
                <Link href={secondaryCtaHref} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-7 py-3 text-xs font-semibold text-[var(--text-primary)] transition-all hover:border-[var(--text-primary)]/35 hover:bg-[var(--surface-hover)] focus-ring">
                  {secondaryCtaText}
                </Link>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)]/50 mt-2">{disclaimer}</p>
            </div>
          </VercelCard>
        </FadeIn>
      </div>
    </section>
  );
}
