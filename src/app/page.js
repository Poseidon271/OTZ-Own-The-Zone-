"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import { motion } from "framer-motion";

// Import ScrollX primitives & Sections
import { ColumnLines } from "@/components/scrollx/column-lines";
import { VercelCard } from "@/components/scrollx/vercel-card";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { AnimatedCounter } from "@/components/scrollx/statscount";
import { Announcement } from "@/components/scrollx/announcement";
import LogoCloud from "@/components/scrollx/sections/logo-cloud";
import Features from "@/components/scrollx/sections/features";
import HowItWorks from "@/components/scrollx/sections/how-it-works";
import FAQ from "@/components/scrollx/sections/faq";
import Testimonials from "@/components/scrollx/sections/testimonials";
import Vendors from "@/components/scrollx/sections/vendors";
import CTA from "@/components/scrollx/sections/cta";

// Hero Dashboard Widget Data
const chartBars = [38, 60, 44, 78, 56, 88, 72, 95, 68, 100, 82, 86];

const events = [
  { label: "Campaign activated", time: "2m ago", color: "bg-emerald-500" },
  { label: "Ad creative produced", time: "14m ago", color: "bg-blue-400" },
  { label: "Zone booked: OOH Andheri", time: "1h ago", color: "bg-yellow-400" },
  { label: "Goal reached: Cinema Juhu", time: "3h ago", color: "bg-violet-400" },
];

const metrics = [
  { label: "Active campaigns", val: "12", trend: "+3 today" },
  { label: "SLA Match accuracy", val: "99.4%", trend: "↑ 2.1%" },
];

export default function Home() {
  const router = useRouter();



  return (
    <div
      className="theme-dark min-h-screen relative flex flex-col text-[var(--text-primary)] overflow-hidden font-sans"
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

      {/* Main Container */}
      <main className="relative z-10 flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col justify-center gap-24">
        
        {/* Split Section: Text Copy vs Interactive Map widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Column Left: Value Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Announcement badge="GA" href="/media-planning">
                AI Strategy Planner, now live in Mumbai
              </Announcement>
            </motion.div>

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
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 z-20 w-full max-w-xl"
            >
              <button
                onClick={() => router.push("/media-buying?skipIntake=true")}
                className="rounded-xl border border-[var(--border-default)] hover:border-[var(--action-primary)]/50 hover:bg-[#132a4f]/20 bg-[var(--surface-raised)]/40 px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 focus-ring cursor-pointer flex items-center justify-center gap-2 group shadow-md"
              >
                <MdiIcon name="magnify" className="text-base text-[var(--action-primary)] group-hover:scale-110 transition-transform" />
                <span>Find Media</span>
              </button>
              
              <button
                onClick={() => router.push("/media-planning")}
                className="rounded-xl border border-[var(--border-default)] hover:border-[var(--action-primary)]/50 hover:bg-[#132a4f]/20 bg-[var(--surface-raised)]/40 px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 focus-ring cursor-pointer flex items-center justify-center gap-2 group shadow-md"
              >
                <MdiIcon name="auto-fix" className="text-base text-[var(--action-primary)] group-hover:scale-110 transition-transform" />
                <span>Plan Media</span>
              </button>

              <button
                onClick={() => router.push("/media-buying")}
                className="rounded-xl border border-[var(--border-default)] hover:border-[var(--action-primary)]/50 hover:bg-[#132a4f]/20 bg-[var(--surface-raised)]/40 px-5 py-3.5 text-sm font-bold text-white transition-all duration-300 focus-ring cursor-pointer flex items-center justify-center gap-2 group shadow-md"
              >
                <MdiIcon name="shopping-outline" className="text-base text-[var(--action-primary)] group-hover:scale-110 transition-transform" />
                <span>Buy Media</span>
              </button>
            </motion.div>

            {/* Stats row with vertical separators and Animated Counter */}
            <div className="grid grid-cols-3 gap-6 pt-6 max-w-lg items-end">
              <div className="border-l border-[var(--border-default)] pl-4 space-y-1">
                <AnimatedCounter
                  value={8}
                  className="text-left items-start"
                />
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block mt-2">
                  media channels,<br />one plan
                </span>
              </div>

              <div className="border-l border-[var(--border-default)] pl-4 space-y-1">
                <span className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-[#FF5A1F] block leading-none">₹1L–₹1Cr</span>
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block mt-3">
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

        {/* ScrollX Animated SaaS Dashboard Mockup adapted to Campaign Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="w-full relative z-10"
        >
          <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--surface-raised)]/40 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-[var(--border-default)] bg-[var(--surface-raised)]/60 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400/70" />
                <div className="size-2.5 rounded-full bg-yellow-400/70" />
                <div className="size-2.5 rounded-full bg-emerald-400/70" />
              </div>
              <div className="mx-auto rounded border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-0.5 font-mono text-[9px] text-[var(--text-secondary)]">
                app.ownthezone.com/dashboard/analytics
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 text-left">
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)]/60 p-4">
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-extrabold">
                    ACTIVE ZONE PLACEMENTS REACH &bull; LAST 30 DAYS
                  </p>
                  <div className="flex h-24 items-end gap-1">
                    {chartBars.map((h, i) => (
                      <div key={i} className="relative flex-1 overflow-hidden rounded-sm bg-white/10" style={{ height: `${h}%` }}>
                        <div className="absolute inset-x-0 bottom-0 rounded-sm bg-[var(--action-primary)]/70" style={{ height: `${h * 0.65}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-[var(--text-secondary)]">184,291 estimated impressions</span>
                    <span className="text-xs font-bold text-emerald-500">↑ 23% week-over-week</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {metrics.map((m) => (
                    <div key={m.label} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)]/60 p-4">
                      <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-extrabold">{m.label}</p>
                      <p className="text-xl font-bold text-white leading-tight">{m.val}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-emerald-500">{m.trend}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-1 flex-col rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)]/60 p-4">
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-extrabold">Recent Live Events</p>
                  <div className="flex flex-col gap-3">
                    {events.map((e, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className={`size-1.5 shrink-0 rounded-full ${e.color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-white leading-tight">{e.label}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">{e.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)]/60 p-4">
                  <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-[var(--text-secondary)] font-extrabold">CAMPAIGN SLA STATUS</p>
                  <p className="text-xl font-bold text-white leading-tight">99.9% verified</p>
                  <div className="mt-3 flex gap-0.5">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className={`h-4 flex-1 rounded-sm ${i === 11 ? "bg-yellow-400/50" : "bg-emerald-500/60"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Logo Cloud connected network marquee */}
        <LogoCloud />

        {/* Bento features grid for planning, buying, production */}
        <Features />

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
