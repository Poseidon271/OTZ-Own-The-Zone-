"use client";

import React from "react";
import MdiIcon from "@/components/MdiIcon";
import RevenueCalculator from "@/components/RevenueCalculator";
import { motion } from "framer-motion";

export default function MediaOwnersHero() {
  const handleListMedia = () => {
    window.dispatchEvent(
      new CustomEvent("open-lead-popup", {
        detail: { intent: "host" },
      })
    );
  };

  const handleSignInRegister = () => {
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", {
        detail: { mode: "login", role: "host" },
      })
    );
  };

  return (
    <section className="relative w-full max-w-4xl mx-auto text-center py-12 md:py-16 px-4 md:px-6">
      {/* Tag/Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-block mb-4 border border-[#FF5A1F]/30 px-3 py-1 rounded-[4px] bg-[#FF5A1F]/10"
      >
        <span className="font-mono text-xs uppercase tracking-widest text-[#FF5A1F] font-bold">
          [ FOR MEDIA OWNERS & ASSET OPERATORS ]
        </span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6"
      >
        Your empty weeks are costing you.<br />
        <span className="text-[#FF5A1F]">List your media on OTZ</span> and get booked.
      </motion.h1>

      {/* Subtitle / Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-sans text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
      >
        Direct corporate demand, guaranteed payout timelines, and complete control over your rate cards and availability.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        {/* Primary Button */}
        <button
          type="button"
          onClick={handleListMedia}
          className="bg-[#FF5A1F] text-[#0B1E3B] font-bold px-7 py-3.5 rounded-[6px] hover:opacity-90 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
        >
          <span>LIST YOUR MEDIA — FREE</span>
          <MdiIcon name="arrow-right" className="text-lg" />
        </button>

        {/* Secondary Action */}
        <button
          type="button"
          onClick={handleSignInRegister}
          className="border border-white/20 text-white font-medium px-7 py-3.5 rounded-[6px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm md:text-base"
        >
          <MdiIcon name="account-outline" className="text-lg text-slate-300" />
          <span>MEDIA OWNER LOGIN</span>
        </button>
      </motion.div>
    </section>
  );
}
