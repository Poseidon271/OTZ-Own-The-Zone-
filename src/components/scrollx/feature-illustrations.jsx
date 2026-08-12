"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, Zap, Shield, BarChart2, Bot, Link2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

function useLoop(ms) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

const INFERENCE_STEPS = [
  { label: "Parameters analyzed", latency: null },
  { label: "Media mix optimized", latency: "142ms" },
  { label: "Zone spots allocated", latency: "210ms" },
];

const INTEGRATIONS = [
  { name: "Times OOH", color: "bg-orange-500" },
  { name: "Star TV", color: "bg-blue-500" },
  { name: "PVR Cinemas", color: "bg-foreground" },
  { name: "Red FM", color: "bg-red-500" },
  { name: "Daily News", color: "bg-indigo-500" },
  { name: "Social Media", color: "bg-pink-500" },
];

const BAR_TARGETS = [55, 72, 48, 88, 65, 95, 78];
const INITIAL_BARS = BAR_TARGETS.map(() => 0);

const AGENT_STEPS = ["Targeting match", "Budget allocation", "Creative rendering", "Rate negotiated", "Live in Zone ✓"];
const REGION_DELAYS = [0.3, 1.1, 0.7, 1.6, 0.0];

export function InferenceIllustration() {
  const loop = useLoop(4000);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const resetId = setTimeout(() => setStep(0), 0);
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
    ];
    return () => {
      clearTimeout(resetId);
      timers.forEach(clearTimeout);
    };
  }, [loop]);

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-2 font-mono text-[11px] text-[var(--text-secondary)]">
        <Zap className="size-3 text-amber-500 animate-pulse" />
        POST /campaign/plan
      </div>
      <div className="flex flex-col gap-1.5">
        {INFERENCE_STEPS.map((s, i) => (
          <motion.div
            key={s.label}
            animate={{ opacity: step >= i ? 1 : 0.25 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2.5"
          >
            <AnimatePresence mode="wait">
              {step >= i ? (
                <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div key="circle" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Circle className="size-3.5 shrink-0 text-[var(--border-default)]" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="flex-1 text-xs text-[var(--text-primary)] text-left">{s.label}</span>
            {s.latency && step >= i && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-500"
              >
                {s.latency}
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2">
        <span className="text-[11px] text-[var(--text-secondary)]">P99 optimization latency</span>
        <motion.span
          key={step}
          animate={{ opacity: step === 3 ? 1 : 0.3 }}
          className="font-mono text-sm font-bold text-[var(--text-primary)]"
        >
          210ms
        </motion.span>
      </div>
    </div>
  );
}

export function IntegrationsIllustration() {
  const loop = useLoop(5000);
  const [connected, setConnected] = useState([]);

  useEffect(() => {
    const resetId = setTimeout(() => setConnected([]), 0);
    const timers = INTEGRATIONS.map((_, i) =>
      setTimeout(() => setConnected((prev) => [...prev, i]), 400 + i * 350)
    );
    return () => {
      clearTimeout(resetId);
      timers.forEach(clearTimeout);
    };
  }, [loop]);

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-5">
      <div className="grid grid-cols-3 gap-2">
        {INTEGRATIONS.map((int, i) => (
          <motion.div
            key={int.name}
            animate={{ opacity: connected.includes(i) ? 1 : 0.25, scale: connected.includes(i) ? 1 : 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)]/40 py-3"
          >
            <div className={cn("size-5 rounded-md", int.color)} />
            <span className="text-[10px] text-[var(--text-secondary)]">{int.name}</span>
            {connected.includes(i) && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="size-1.5 rounded-full bg-emerald-500" />
            )}
          </motion.div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2">
        <div className="flex items-center gap-2">
          <Link2 className="size-3.5 text-[var(--text-secondary)]" />
          <span className="text-xs text-[var(--text-secondary)]">Channels Connected</span>
        </div>
        <motion.span
          animate={{ opacity: 1 }}
          className="font-mono text-sm font-bold text-[var(--text-primary)]"
        >
          {connected.length}/12+
        </motion.span>
      </div>
    </div>
  );
}

export function SecurityIllustration() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="flex items-center justify-center">
        <div className="relative flex size-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
          <Shield className="size-7 text-emerald-500" />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border border-emerald-500/40"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {["100% SLA Audit Verification", "Negotiated Volume Rates", "Audited Placement Reports", "Host Verification Logs"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-left">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
            <span className="text-xs text-[var(--text-primary)]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsIllustration() {
  const loop = useLoop(4500);
  const [bars, setBars] = useState(INITIAL_BARS);

  useEffect(() => {
    const resetId = setTimeout(() => setBars(INITIAL_BARS), 0);
    const timers = BAR_TARGETS.map((target, i) =>
      setTimeout(() => {
        setBars((prev) => {
          const next = [...prev];
          next[i] = target;
          return next;
        });
      }, 200 + i * 120)
    );
    return () => {
      clearTimeout(resetId);
      timers.forEach(clearTimeout);
    };
  }, [loop]);

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="flex items-end gap-1.5 h-16">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            animate={{ height: `${h}%` }}
            initial={{ height: "0%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 rounded-sm bg-[var(--action-primary)]/40"
            style={{ minHeight: 2 }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Anomalies", val: "0", color: "text-emerald-500" },
          { label: "Placements", val: "8", color: "text-[var(--text-primary)]" },
          { label: "Goal Progress", val: "68%", color: "text-amber-500" },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-subtle)]/40 px-2 py-2 text-center">
            <p className={cn("text-sm font-black", m.color)}>{m.val}</p>
            <p className="text-[10px] text-[var(--text-secondary)]">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgentsIllustration() {
  const loop = useLoop(5500);
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    const resetId = setTimeout(() => setActiveStep(-1), 0);
    const timers = AGENT_STEPS.map((_, i) =>
      setTimeout(() => setActiveStep(i), 600 + i * 700)
    );
    return () => {
      clearTimeout(resetId);
      timers.forEach(clearTimeout);
    };
  }, [loop]);

  return (
    <div className="flex h-full flex-col justify-center gap-2 p-5 text-left">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--surface-subtle)] px-3 py-2">
        <Bot className="size-3.5 text-[var(--action-primary)]" />
        <span className="font-mono text-[11px] text-[var(--text-secondary)]">otz-engine:deploy-campaign</span>
      </div>
      <div className="flex flex-col gap-1">
        {AGENT_STEPS.map((step, i) => (
          <motion.div
            key={step}
            animate={{ opacity: activeStep >= i ? 1 : 0.2 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{ background: activeStep === i ? "var(--surface-canvas)" : "transparent" }}
          >
            <motion.div
              animate={{ scale: activeStep === i ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className={cn("size-1.5 shrink-0 rounded-full", activeStep > i ? "bg-emerald-500" : activeStep === i ? "bg-[var(--action-primary)]" : "bg-[var(--border-default)]")}
            />
            <span className="text-xs text-[var(--text-primary)]">{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function EdgeIllustration() {
  const regions = [
    { name: "Andheri West", x: 22, y: 42, active: true },
    { name: "Bandra Metro", x: 48, y: 32, active: true },
    { name: "South Mumbai", x: 78, y: 55, active: true },
    { name: "Juhu Cinema", x: 10, y: 50, active: false },
    { name: "Goregaon Mall", x: 30, y: 72, active: false },
  ];

  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="relative h-24 w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-subtle)]/30 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {regions.map((r, idx) => (
          <div key={r.name} className="absolute" style={{ left: `${r.x}%`, top: `${r.y}%` }}>
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, delay: REGION_DELAYS[idx] }}
              className={cn("absolute -inset-2 rounded-full", r.active ? "bg-emerald-500/20" : "bg-[var(--text-secondary)]/10")}
            />
            <div className={cn("size-2 rounded-full", r.active ? "bg-emerald-500" : "bg-[var(--text-secondary)]/40")} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-secondary)]">Active Media Zones</span>
        <span className="font-mono text-sm font-bold text-[var(--text-primary)]">12,000+</span>
      </div>
    </div>
  );
}
