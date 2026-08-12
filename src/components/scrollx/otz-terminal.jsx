"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const defaultCommands = [
  { text: "> otz-engine deploy --campaign-mix", color: "text-[var(--text-secondary)]" },
  { text: "... media.search(): 12,450 placement slots matched", color: "text-[#FF5A1F]" },
  { text: "... audience.optimize(): matching Sports & Gaming", color: "text-[#FF5A1F]" },
  { text: "... inventory.match(): negotiated rates applied", color: "text-[#FF5A1F]" },
  { text: "... creative.render(): HTML5 and MP4 assets initialized", color: "text-[#FF5A1F]" },
  { text: "✓ campaign.launch(): 8 zones active in Mumbai (1.2s)", color: "text-emerald-500 font-bold" }
];

export function OtzTerminal({ commands = defaultCommands, className }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % (commands.length + 2));
    }, 1500);

    return () => clearInterval(interval);
  }, [commands.length]);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] font-mono text-xs text-left shadow-lg w-full", className)}>
      {/* Terminal Title Bar */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-[var(--surface-raised)]/60 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400/70" />
          <div className="size-2.5 rounded-full bg-yellow-400/70" />
          <div className="size-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="mx-auto rounded border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-0.5 text-[9px] text-[var(--text-secondary)]">
          app.ownthezone.com/engine
        </div>
      </div>
      
      {/* Terminal Lines output panel */}
      <div className="p-4 space-y-2.5 min-h-36">
        <AnimatePresence>
          {commands.map((cmd, i) => {
            const isVisible = step >= i;
            if (!isVisible) return null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn("leading-5 font-mono", cmd.color)}
              >
                {cmd.text}
                {step === i && i < commands.length - 1 && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="ml-0.5 inline-block h-3.5 w-1.5 bg-[var(--text-primary)] align-middle"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
