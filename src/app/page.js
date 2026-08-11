"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

export default function Home() {
  const router = useRouter();

  // Helper to open the LeadPopup onboarding flow
  const triggerOnboarding = (intent) => {
    window.dispatchEvent(
      new CustomEvent("open-lead-popup", { detail: { intent } })
    );
  };

  return (
    <div
      className="theme-dark min-h-screen relative flex flex-col text-[var(--text-primary)] overflow-hidden font-sans"
      style={{
        background: "radial-gradient(circle at 95% 35%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 5% 75%, rgba(19, 42, 79, 0.35) 0%, transparent 55%), #081225"
      }}
    >

      {/* Global Navbar */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* Main Container */}
      <main className="relative z-10 flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col justify-center gap-16">
        
        {/* Split Section: Text Copy vs Interactive Map widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Column Left: Value Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <p className="text-xs uppercase font-extrabold tracking-[0.2em] text-[var(--action-primary)] font-display">
              THE NEW AGE MARKETING ENGINE
            </p>

            <h1 className="text-white font-display text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight">
              State your goal.<br />
              We light up your<br />
              <span className="relative inline-block px-4 py-1.5 mt-2.5 mr-2">
                {/* Corner Brackets around zone */}
                <span className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--action-primary)]" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--action-primary)]" />
                <span className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--action-primary)]" />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--action-primary)]" />
                <span className="text-[var(--action-primary)]">zone</span>
              </span>.
            </h1>

            <p className="text-sm md:text-base text-[#A5B5CD] leading-relaxed max-w-xl font-medium">
              Tell OTZ your niche, goal and budget — <span className="text-white font-extrabold">awareness, downloads, orders or footfall</span> — and the engine plans your media mix, buys the inventory, produces the creative and proves the outcome.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => triggerOnboarding("brand")}
                className="btn-primary px-8 font-bold focus-ring shadow-lg"
                style={{ color: "#0B1E3B" }}
              >
                Plan my campaign &rarr;
              </button>
              
              <button
                onClick={() => router.push("/media-buying")}
                className="btn-secondary px-8 font-bold border border-white/20 text-white rounded-lg h-11 inline-flex items-center justify-center hover:bg-white/5 transition-colors focus-ring"
              >
                Browse media inventory
              </button>
            </div>

            {/* Stats row with vertical separators */}
            <div className="grid grid-cols-3 gap-6 pt-6 max-w-lg">
              <div className="border-l border-white/20 pl-4 space-y-1">
                <span className="text-2xl md:text-3xl font-display font-black text-white block">8</span>
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block">
                  media channels,<br />one plan
                </span>
              </div>

              <div className="border-l border-white/20 pl-4 space-y-1">
                <span className="text-2xl md:text-3xl font-display font-black text-[#FF5A1F] block">₹1L–₹1Cr</span>
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block">
                  budgets,<br />goal-led
                </span>
              </div>

              <div className="border-l border-white/20 pl-4 space-y-1">
                <span className="text-2xl md:text-3xl font-display font-black text-[#2BD67B] block">100%</span>
                <span className="text-[10px] uppercase font-bold text-[#677E9E] leading-tight block">
                  campaigns<br />reported vs goal
                </span>
              </div>
            </div>
          </div>

          {/* Column Right: Interactive Media Map Card */}
          <div className="lg:col-span-5">
            <div
              className="p-6 rounded-3xl border border-white/10 shadow-2xl space-y-6"
              style={{
                background: "linear-gradient(135deg, rgba(19, 42, 79, 0.4) 0%, rgba(11, 30, 59, 0.6) 100%)",
                backdropFilter: "blur(12px)"
              }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-[#A5B5CD]">
                  Your media map &mdash; Mumbai · App downloads
                </span>
                
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#2BD67B] bg-[#2BD67B]/10 px-2.5 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2BD67B] animate-pulse" /> Live
                </span>
              </div>

              {/* Grid 2x4 list of slots */}
              <div className="grid grid-cols-2 gap-3.5">
                
                {/* 1. OOH Andheri (Owned) */}
                <div className="p-3 bg-[#0B1E3B]/80 rounded-xl border border-[#FF5A1F]/40 relative pt-5 shadow-sm">
                  <span className="absolute top-1.5 right-2 text-[8px] font-black uppercase tracking-wider text-[#FF5A1F]">OWNED</span>
                  <span className="text-[9px] font-extrabold text-[#677E9E] block">OOH</span>
                  <span className="text-xs font-bold text-white block truncate">Andheri Metro</span>
                </div>

                {/* 2. TV Star Sports */}
                <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-white/5 shadow-sm">
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
                <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-white/5 shadow-sm">
                  <span className="text-[9px] font-extrabold text-[#677E9E] block">RADIO</span>
                  <span className="text-xs font-bold text-white block truncate">FM Drive-time</span>
                </div>

                {/* 5. Digital CTV */}
                <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-white/5 shadow-sm">
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
                <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-white/5 shadow-sm">
                  <span className="text-[9px] font-extrabold text-[#677E9E] block">CINEMA</span>
                  <span className="text-xs font-bold text-white block truncate">PVR West</span>
                </div>

                {/* 8. Print Daily */}
                <div className="p-3 bg-[#0B1E3B]/40 rounded-xl border border-white/5 shadow-sm">
                  <span className="text-[9px] font-extrabold text-[#677E9E] block">PRINT</span>
                  <span className="text-xs font-bold text-white block truncate">City daily</span>
                </div>
              </div>

              {/* Goal Progress widget */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#A5B5CD]">Goal progress &mdash; App downloads</span>
                  <span className="font-mono font-bold text-[#2BD67B]">68% of target</span>
                </div>

                <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden flex border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#2BD67B] rounded-full"
                    style={{ width: "68%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Services grid columns */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
          
          {/* Card 1: Media Planning */}
          <div
            className="p-6 rounded-2xl border border-white/5 space-y-4"
            style={{ background: "rgba(19, 42, 79, 0.25)" }}
          >
            <div className="h-10 w-10 bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] rounded-lg flex items-center justify-center text-lg">
              <MdiIcon name="bullseye-arrow" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Media Planning</h3>
              <p className="text-xs text-[#A5B5CD] leading-relaxed">
                Goal-led, AI-assisted plans across influencer, OOH, TV, digital, print, radio, cinema and IP events.
              </p>
            </div>
          </div>

          {/* Card 2: Inventory Buying */}
          <div
            className="p-6 rounded-2xl border border-white/5 space-y-4"
            style={{ background: "rgba(19, 42, 79, 0.25)" }}
          >
            <div className="h-10 w-10 bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] rounded-lg flex items-center justify-center text-lg">
              <MdiIcon name="checkbox-marked-circle-outline" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Inventory Buying</h3>
              <p className="text-xs text-[#A5B5CD] leading-relaxed">
                Search property-level inventory yourself, or buy through OTZ&apos;s negotiated rates.
              </p>
            </div>
          </div>

          {/* Card 3: Production */}
          <div
            className="p-6 rounded-2xl border border-white/5 space-y-4"
            style={{ background: "rgba(19, 42, 79, 0.25)" }}
          >
            <div className="h-10 w-10 bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] rounded-lg flex items-center justify-center text-lg">
              <MdiIcon name="plus" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Production</h3>
              <p className="text-xs text-[#A5B5CD] leading-relaxed">
                Ad films, creatives and content produced to fit every zone you own.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 bg-black/40 backdrop-blur-md">
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
