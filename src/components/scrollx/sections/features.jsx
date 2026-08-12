"use client";

import React from "react";
import { FadeIn } from "../fade-in";
import { Zap, Shield, BarChart2, Link2, Bot, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Import illustrations
import {
  InferenceIllustration,
  IntegrationsIllustration,
  SecurityIllustration,
  AnalyticsIllustration,
  AgentsIllustration,
  EdgeIllustration,
} from "../feature-illustrations";

const defaultFeatures = [
  {
    title: "Campaign Mix Planning",
    description: "Goal-led, AI-assisted plans allocating budget mixes across multiple zones in seconds.",
    viz: InferenceIllustration,
    icon: Zap,
    iconColor: "text-yellow-500",
    badge: "AI Strategy",
    span: "lg:col-span-2"
  },
  {
    title: "Audience SLA Verification",
    description: "Audit verification, negotiated rates, and placement checks built-in from day one.",
    viz: SecurityIllustration,
    icon: Shield,
    iconColor: "text-emerald-500",
    badge: "SLA Audited"
  },
  {
    title: "Real-Time Campaign Performance",
    description: "Actionable reporting metrics tracking impressions, progress, and goals without complicated dashboards.",
    viz: AnalyticsIllustration,
    icon: BarChart2,
    iconColor: "text-violet-500",
    badge: "Goal Tracking"
  },
  {
    title: "Unified Media Channels",
    description: "Connect to TV, OOH, Digital, Radio, Cinema, IP Events, and Print with negotiated bulk volumes.",
    viz: IntegrationsIllustration,
    icon: Link2,
    iconColor: "text-blue-500",
    badge: "8 Channels",
    span: "lg:col-span-2"
  },
  {
    title: "Creative Production Engine",
    description: "Ad films and creatives dynamically generated to fit each specific zone you buy. (COMING SOON)",
    viz: AgentsIllustration,
    icon: Bot,
    iconColor: "text-orange-500",
    badge: "Asset Engine"
  },
  {
    title: "Live Zone Placements",
    description: "Metropolitan billboard networks, metro trains, and movie screens ready to book.",
    viz: EdgeIllustration,
    icon: Zap,
    iconColor: "text-emerald-500",
    badge: "12,000+ Spots"
  },
];

export default function Features({
  heading = "Everything you need.",
  headingAccent = "To own your zone.",
  description = "One engine to plan, buy, and verify your offline and digital campaigns. All your placements managed inside one secure workspace.",
  features = defaultFeatures,
  className,
}) {
  return (
    <section id="features" className={cn("border-t border-[var(--border-default)] py-28 px-5 text-left", className)}>
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
            {heading}
            <br />
            <span className="text-[var(--text-secondary)]">{headingAccent}</span>
          </h2>
          <p className="mb-16 max-w-xl text-base text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:auto-rows-fr">
          {features.map((feat, i) => {
            const Viz = feat.viz;
            const Icon = feat.icon;
            return (
              <FadeIn key={feat.title} delay={i * 0.05}>
                <div className={cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-raised)] transition-all duration-300 hover:border-[#FF5A1F]/30 hover:shadow-[0_12px_24px_rgba(0,0,0,0.35)]", feat.span)}>
                  <div className="flex flex-col justify-between gap-4 p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex size-9 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)]">
                        <Icon className={cn("size-4", feat.iconColor)} />
                      </div>
                      <span className="rounded-full border border-[var(--border-default)] bg-[var(--surface-subtle)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                        {feat.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{feat.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">{feat.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto min-h-80 border-t border-[var(--border-default)] bg-[var(--surface-canvas)]/30">
                    <Viz />
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
