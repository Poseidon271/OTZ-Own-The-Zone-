"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import { motion } from "framer-motion";
import IntroScreen from "@/components/IntroScreen";

// Import ScrollX primitives & Sections
import { ColumnLines } from "@/components/scrollx/column-lines";
import { VercelCard } from "@/components/scrollx/vercel-card";
import { AnimatedCounter } from "@/components/scrollx/statscount";
import HowItWorks from "@/components/scrollx/sections/how-it-works";
import FAQ from "@/components/scrollx/sections/faq";
import Testimonials from "@/components/scrollx/sections/testimonials";
import Vendors from "@/components/scrollx/sections/vendors";
import CTA from "@/components/scrollx/sections/cta";

export default function Home() {
  const router = useRouter();

  return (
    <div
      className="theme-dark min-h-screen relative flex flex-col text-[var(--text-primary)] font-sans"
      style={{
        backgroundColor: "var(--surface-canvas)"
      }}
    >
      {/* Background ScrollX Grid Lines & Noise Overlay */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.035}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Ambient Glow Gradients Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 95% 35%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 5% 75%, rgba(19, 42, 79, 0.25) 0%, transparent 55%)"
        }}
      />

      {/* Global Navbar */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* SECTION 1: Brand Tagline Intro Section */}
      <IntroScreen />

      {/* SECTION 2: Existing OTZ Homepage Container */}
      <main className="relative z-10 flex-grow pt-16 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col justify-center gap-24">
        
        {/* Split Section: Text Copy vs Interactive Map widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Column Left: Value Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white font-display text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight"
            >
              State your goal.<br />
              We light up your<br />
              <span className="relative inline-block px-4 py-1.5 mt-2.5 mr-2">
                {/* Corner Brackets around zone */}
                <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--action-primary)]" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--action-primary)]" />
                <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--action-primary)]" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--action-primary)]" />
                <span className="text-[var(--action-primary)] font-display">zone</span>
              </span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm md:text-base text-[#A5B5CD] leading-relaxed max-w-xl font-medium"
            >
              Tell OTZ your niche, goal and budget — <span className="text-white font-extrabold">awareness, downloads, orders or footfall</span> — and the engine plans your media mix, buys the inventory, produces the creative and proves the outcome.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 z-20 w-full max-w-xl"
            >
              <button
                onClick={() => router.push("/for-brands")}
                className="rounded-xl border border-[#FF5A1F] hover:bg-[#FF5A1F]/90 bg-[#FF5A1F] px-6 py-3.5 text-sm font-bold text-[#0B1E3B] transition-all duration-300 focus-ring cursor-pointer flex items-center justify-center gap-2 group shadow-md"
              >
                <MdiIcon name="bullhorn-outline" className="text-base text-[#0B1E3B]" />
                <span>For Brands</span>
              </button>
              
              <button
                onClick={() => router.push("/media-owners")}
                className="rounded-xl border border-[var(--border-default)] hover:border-[var(--action-primary)]/50 hover:bg-[#132a4f]/20 bg-[var(--surface-raised)]/40 px-6 py-3.5 text-sm font-bold text-white transition-all duration-300 focus-ring cursor-pointer flex items-center justify-center gap-2 group shadow-md"
              >
                <MdiIcon name="office-building-marker-outline" className="text-base text-[var(--action-primary)] group-hover:scale-110 transition-transform" />
                <span>For Media Owners</span>
              </button>
            </motion.div>

            {/* Stats row with vertical separators and Animated Counter */}
            <div className="grid grid-cols-3 gap-6 pt-6 max-w-lg items-end">
              <div className="border-l border-[var(--border-default)] pl-4 space-y-1">
                <AnimatedCounter
                  value={10}
                  className="text-left items-start"
                />
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block mt-2">
                  media zones,<br />one plan
                </span>
              </div>

              <div className="border-l border-[var(--border-default)] pl-4 space-y-1">
                <span className="text-2xl sm:text-3xl font-display font-black text-[#FF5A1F] block leading-tight">
                  ₹10K–<br />₹1Cr
                </span>
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block mt-2">
                  budgets,<br />goal-led
                </span>
              </div>

              <div className="border-l border-[var(--border-default)] pl-4 space-y-1">
                <AnimatedCounter
                  value={100}
                  suffix="%"
                  className="text-left items-start"
                />
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block mt-2">
                  campaigns<br />reported vs goal
                </span>
              </div>
            </div>
          </div>

          {/* Column Right: Interactive Media Map Card wrapped in VercelCard */}
          <div className="lg:col-span-5">
            <VercelCard
              glowEffect={true}
              animateOnHover={true}
              bordered={true}
              className="rounded-3xl border border-[var(--border-default)] bg-gradient-to-br from-[#132a4f]/40 to-[#0b1e3b]/60 backdrop-blur-md text-left w-full h-full min-h-50"
            >
              <div className="w-full space-y-6">
                {/* Card Header */}
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border-default)] w-full">
                  <span className="text-xs font-bold text-[#A5B5CD]">
                    Your media map &mdash; Mumbai · App downloads
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#2BD67B] bg-[#2BD67B]/10 px-2.5 py-0.5 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2BD67B] animate-pulse" /> Live
                  </span>
                </div>

                {/* Grid 2x4 list of slots */}
                <div className="grid grid-cols-2 gap-3.5 w-full">
                  
                  {/* 1. OOH Andheri (Owned) */}
                  <div className="p-3 bg-[#0B1E3B]/80 rounded-xl border border-[#FF5A1F]/40 relative pt-5 shadow-sm">
                    <span className="absolute top-1.5 right-2 text-[8px] font-black uppercase tracking-wider text-[#FF5A1F]">OWNED</span>
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">OOH</span>
                    <span className="text-xs font-bold text-white block truncate">Andheri Metro</span>
                  </div>

                  {/* 2. TV Star Sports */}
                  <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-[var(--border-default)] shadow-sm">
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">TV</span>
                    <span className="text-xs font-bold text-white block truncate">STAR &rsaquo; Star Sports</span>
                  </div>

                  {/* 3. Event (Featured) */}
                  <div className="p-3 bg-[#0B1E3B]/80 rounded-xl border border-amber-500/40 relative pt-5 shadow-sm">
                    <span className="absolute top-1.5 right-2 text-[8px] font-black uppercase tracking-wider text-amber-400">FEATURED</span>
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">EVENT</span>
                    <span className="text-xs font-bold text-white block truncate">IP: Zone Fest</span>
                  </div>

                  {/* 4. Radio Drive-Time */}
                  <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-[var(--border-default)] shadow-sm">
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">RADIO</span>
                    <span className="text-xs font-bold text-white block truncate">FM Drive-time</span>
                  </div>

                  {/* 5. Digital CTV */}
                  <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-[var(--border-default)] shadow-sm">
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">DIGITAL</span>
                    <span className="text-xs font-bold text-white block truncate">CTV bundle</span>
                  </div>

                  {/* 6. Influencer (Owned) */}
                  <div className="p-3 bg-[#0B1E3B]/80 rounded-xl border border-[#FF5A1F]/40 relative pt-5 shadow-sm">
                    <span className="absolute top-1.5 right-2 text-[8px] font-black uppercase tracking-wider text-[#FF5A1F]">OWNED</span>
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">INFLUENCER</span>
                    <span className="text-xs font-bold text-white block truncate">@creator_xyz</span>
                  </div>

                  {/* 7. Cinema PVR */}
                  <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-[var(--border-default)] shadow-sm">
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">CINEMA</span>
                    <span className="text-xs font-bold text-white block truncate">PVR West</span>
                  </div>

                  {/* 8. Print Daily */}
                  <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-[var(--border-default)] shadow-sm">
                    <span className="text-[9px] font-extrabold text-[#677E9E] block">PRINT</span>
                    <span className="text-xs font-bold text-white block truncate">City daily</span>
                  </div>
                </div>

                {/* Goal Progress widget */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-default)] w-full">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#A5B5CD]">Goal progress &mdash; App downloads</span>
                    <span className="font-mono font-bold text-[#2BD67B]">68% of target</span>
                  </div>

                  <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex border border-[var(--border-default)]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#2BD67B] rounded-full"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>
              </div>
            </VercelCard>
          </div>
        </div>

        {/* How it works connection workflow */}
        <HowItWorks />

        {/* Questions Accordion faq */}
        <FAQ />

        {/* Testimonials kinetic quote carousels */}
        <Testimonials />

        {/* For Vendors / Media Owners conversion section */}
        <Vendors />

        {/* CTA final callout section */}
        <CTA />

      </main>

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-[var(--border-default)] py-12 px-6 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display font-black tracking-wider text-white">OWN THE ZONE</span>
            <span className="text-caption-default text-[var(--text-tertiary)]">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-caption-default text-[#677E9E]">
            <a href="/about" className="hover:text-white transition-colors">About Us</a>
            <a href="/about#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/about#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a
              href="https://wa.me/919999999999?text=I%27m%20interested%20in%20Own%20The%20Zone%20campaigns"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#2BD67B] hover:text-[#25be6d] font-bold"
            >
              <MdiIcon name="whatsapp" className="text-base" /> Chat with Ops
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
