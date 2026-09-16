"use client";

import React from "react";
import { motion } from "framer-motion";
import MdiIcon from "@/components/MdiIcon";

export default function IntroScreen() {
  return (
    <section className="relative z-10 min-h-screen min-h-[100svh] flex flex-col justify-between items-center px-6 pt-28 pb-10 max-w-7xl mx-auto w-full text-center select-none">
      {/* Top spacing placeholder to balance the floating Navbar */}
      <div className="h-6 w-full" aria-hidden="true" />

      {/* Main Center Section: Tagline & Supporting Copy */}
      <div className="flex flex-col items-center justify-center my-auto max-w-5xl py-8">
        
        {/* Supporting tag / Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--surface-raised)]/50 text-xs font-bold uppercase tracking-wider text-[#A5B5CD] backdrop-blur-md shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--action-primary)] animate-pulse" />
            Plan · Find · Buy · Produce
          </span>
        </motion.div>

        {/* Primary Tagline Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.12] tracking-tight text-center max-w-4xl"
        >
          The go-to<br />
          marketing engine<br />
          for <span className="text-[var(--action-primary)]">new-age brands</span>.
        </motion.h1>
      </div>

      {/* Subtle Bottom Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col items-center gap-1.5 text-[#677E9E] pb-2 pointer-events-none"
      >
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#677E9E]">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <MdiIcon
            name="chevron-down"
            className="text-xl text-[var(--action-primary)]"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
