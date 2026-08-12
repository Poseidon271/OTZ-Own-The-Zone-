"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FadeIn } from "../fade-in";
import { ArrowRight, Sparkles, Search, Rocket, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import StatsCount from "../statscount";

const defaultSteps = [
  {
    number: "01",
    icon: Sparkles,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    title: "State your campaign goal",
    description: "Input your target audience, industry vertical, and budget limit. The planner instantly models your optimal media mix distribution.",
    detail: "Done in less than 60 seconds",
  },
  {
    number: "02",
    icon: Search,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10 border-blue-500/20",
    title: "Discover and customize",
    description: "Browse screen formats, check rate cards, and add placements to your cart. Compare locations side-by-side inside your bag drawer.",
    detail: "12,000+ slots indexed live",
  },
  {
    number: "03",
    icon: Rocket,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    title: "Buy at pre-negotiated rates",
    description: "Book directly through OTZ's institutional accounts. Secure pre-negotiated volume discount rates without back-and-forth emails.",
    detail: "Volume discount rates applied",
  },
  {
    number: "04",
    icon: BarChart2,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Track verified outcomes",
    description: "Monitor execution logs. Host placement checks, SLA audit verification reports, and goal reach progress are compiled on your board.",
    detail: "100% placement verification",
  },
];

const defaultStats = [
  { label: "Connected Channels", value: 8, suffix: "" },
  { label: "Live Placements", value: 12000, suffix: "+" },
  { label: "Audit Verification SLA", value: 100, suffix: "%" },
];

function StepConnector() {
  return (
    <div className="hidden items-center justify-center lg:flex">
      <div className="flex items-center gap-1 text-[var(--border-default)]">
        <div className="h-px w-8 bg-[var(--border-default)]" />
        <ArrowRight className="size-3 text-[var(--text-secondary)]/50" />
      </div>
    </div>
  );
}

export default function HowItWorks({
  heading = "Your campaign, configured",
  headingAccent = "and launched in minutes.",
  description = "From strategy mix planning to final placement auditing — designed to take the friction out of media buying.",
  steps = defaultSteps,
  stats = defaultStats,
  className,
}) {
  const [activeStep, setActiveStep] = useState(null);

  return (
    <section id="how-it-works" className={cn("border-t border-[var(--border-default)] pt-24 px-5 text-left relative z-10 bg-transparent", className)}>
      <div className="mx-auto w-full max-w-7xl">
        <FadeIn>
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl">
            {heading}
            <br />
            <span className="text-[var(--text-secondary)]">{headingAccent}</span>
          </h2>
          <p className="mb-16 max-w-xl text-base text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </FadeIn>

        <div className="flex flex-col gap-4 lg:flex-row lg:gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeStep === i;
            return (
              <React.Fragment key={step.number}>
                <FadeIn delay={i * 0.1} className="flex-1">
                  <motion.div
                    onHoverStart={() => setActiveStep(i)}
                    onHoverEnd={() => setActiveStep(null)}
                    animate={{
                      scale: activeStep === null ? 1 : isActive ? 1.02 : 0.98,
                      opacity: activeStep === null ? 1 : isActive ? 1 : 0.55,
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex flex-col gap-5 rounded-2xl border p-6 transition-colors duration-200 cursor-default h-full text-left",
                      isActive ? "border-[#FF5A1F]/30 bg-[var(--surface-raised)] shadow-lg" : "border-[var(--border-default)] bg-[var(--surface-raised)]/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className={cn("flex size-10 items-center justify-center rounded-xl border", step.iconBg)}>
                        <Icon className={cn("size-5", step.iconColor)} />
                      </div>
                      <span className="font-mono text-xs font-semibold text-[var(--text-secondary)]/50">{step.number}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] uppercase">{step.title}</h3>
                      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{step.description}</p>
                    </div>

                    <div className="mt-auto flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2">
                      <div className="size-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">{step.detail}</span>
                    </div>
                  </motion.div>
                </FadeIn>
                {i < steps.length - 1 && <StepConnector />}
              </React.Fragment>
            );
          })}
        </div>

        <FadeIn delay={0.4}>
          <StatsCount stats={stats} title="SECURED PLACEMENT METRICS" />
        </FadeIn>
      </div>
    </section>
  );
}
