"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FadeIn, Stagger, StaggerItem } from "../fade-in";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultPlans = [
  {
    name: "Starter Zone Plan",
    monthly: 50000,
    annual: 40000,
    description: "Perfect for local startups checking zone-level footprints.",
    features: ["Up to 2 active zones", "Influencer & OOH placements", "Standard outcome reports", "Basic media bag storage", "Email ops support"],
    cta: "Configure Campaign",
    href: "/media-planning",
  },
  {
    name: "Growth Zone Plan",
    monthly: 200000,
    annual: 160000,
    description: "Built for expanding brands requiring multi-zone reach.",
    highlight: true,
    features: ["Up to 5 active zones", "All 8 media channels access", "Audited placement reports", "Multi-zone campaign bags", "Priority ops desk access", "100% SLA audit verification"],
    cta: "Configure Campaign",
    href: "/media-planning",
  },
  {
    name: "Enterprise Campaign",
    monthly: null,
    annual: null,
    description: "For corporate brands with specific SLA & custom zone networks.",
    features: ["Unlimited active zones", "Dedicated parent billboard routes", "SSO admin consoles", "Host custom verification logs", "SOC 2 audit parameters", "24/7 dedicated ops manager"],
    cta: "Contact Ops Desk",
    href: "https://wa.me/919999999999?text=I%27m%20interested%20in%20Own%20The%20Zone%2520enterprise%2520campaigns",
  },
];

export default function Pricing({
  heading = "Simple, transparent campaign tiers.",
  disclaimer = "All plans scale based on real inventory bookings · Pre-negotiated rate cards applied · Pre-audit checks active",
  plans = defaultPlans,
  className,
}) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className={cn("border-t border-[var(--border-default)] py-24 px-5 text-left relative z-10", className)}>
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <h2 className="mb-10 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {heading}
          </h2>
          <div className="mb-10 flex items-center gap-3">
            <span className={cn("text-xs transition-colors font-bold", !annual ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>Monthly campaign</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn("relative h-6 w-11 rounded-full border border-[var(--border-default)] transition-colors cursor-pointer bg-[var(--surface-subtle)]", annual && "bg-[var(--action-primary)]")}
            >
              <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full transition-transform bg-white shadow-sm", annual ? "translate-x-5" : "translate-x-0")} />
            </button>
            <span className={cn("text-xs transition-colors font-bold", annual ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
              Annual commitment <span className="font-semibold text-emerald-500">–20%</span>
            </span>
          </div>
        </FadeIn>

        <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <StaggerItem key={plan.name} className="h-full">
              <div className={cn("relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 h-full", plan.highlight ? "border-[var(--action-primary)] bg-[var(--surface-raised)] shadow-2xl" : "border-[var(--border-default)] bg-[var(--surface-raised)]/40 hover:border-[var(--text-primary)]/20")}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--action-primary)] bg-[#FF5A1F] px-3.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#0B1E3B]">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className={cn("font-mono text-[9px] uppercase tracking-widest font-extrabold", plan.highlight ? "text-[var(--action-primary)]" : "text-[var(--text-secondary)]")}>{plan.name}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight text-white">
                      {plan.monthly === null ? "Custom" : plan.monthly === 0 ? "Free" : `₹${annual ? (plan.annual / 1000).toFixed(0) : (plan.monthly / 1000).toFixed(0)}K`}
                    </span>
                    {plan.monthly !== null && plan.monthly > 0 && (
                      <span className="text-xs text-[var(--text-secondary)]">/mo avg</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">{plan.description}</p>
                </div>
                <div className="mb-6 h-px bg-[var(--border-default)]" />
                <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                        <Check className="size-2.5" strokeWidth={3} />
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.href.startsWith("http") ? (
                  <a href={plan.href} target="_blank" rel="noopener noreferrer" className={cn("w-full rounded-xl py-3 text-center text-xs font-bold transition-all inline-block", plan.highlight ? "bg-[var(--action-primary)] text-[#0B1E3B] hover:bg-[var(--action-primary-hover)]" : "border border-[var(--border-default)] text-white hover:bg-white/5")}>
                    {plan.cta}
                  </a>
                ) : (
                  <Link href={plan.href} className={cn("w-full rounded-xl py-3 text-center text-xs font-bold transition-all inline-block", plan.highlight ? "bg-[var(--action-primary)] text-[#0B1E3B] hover:bg-[var(--action-primary-hover)]" : "border border-[var(--border-default)] text-white hover:bg-white/5")}>
                    {plan.cta}
                  </Link>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <FadeIn delay={0.2}>
          <p className="mt-8 text-center text-[10px] text-[var(--text-secondary)] leading-relaxed">{disclaimer}</p>
        </FadeIn>
      </div>
    </section>
  );
}
