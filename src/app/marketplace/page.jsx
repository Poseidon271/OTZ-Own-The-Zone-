"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BagDrawer from "@/components/BagDrawer";
import MdiIcon from "@/components/MdiIcon";
import { ColumnLines } from "@/components/scrollx/column-lines";
import { getAllMagazines } from "@/lib/magazineData";
import { getAllNewspapers } from "@/lib/newspaperData";
import {
  Newspaper,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ChevronRight
} from "lucide-react";

export default function MarketplaceLandingPage() {
  const router = useRouter();

  const magazineCount = useMemo(() => {
    return getAllMagazines().length;
  }, []);

  const newspaperCount = useMemo(() => {
    return getAllNewspapers().length;
  }, []);

  return (
    <div
      className="theme-dark min-h-screen relative flex flex-col text-[var(--text-primary)] font-sans antialiased overflow-x-hidden"
      style={{
        backgroundColor: "var(--surface-canvas)"
      }}
    >
      {/* Background ScrollX Grid Lines covering the entire page continuously */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.035}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Subtle Atmospheric Ambient Glow Gradients Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 90% 20%, rgba(255, 90, 31, 0.09) 0%, transparent 45%), radial-gradient(circle at 10% 65%, rgba(19, 42, 79, 0.35) 0%, transparent 55%)",
        }}
      />

      {/* Global Navbar */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* HERO SECTION: Marketplace Header */}
      <section className="relative z-10 pt-28 sm:pt-32 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-left">
        {/* Breadcrumb Navigation: Home / Marketplace */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-xs text-[#A5B5CD] font-medium">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center space-x-2">
              <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
              <span className="text-[#FF5A1F] font-semibold">Marketplace</span>
            </li>
          </ol>
        </nav>

        {/* Heading Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/15 px-2.5 py-1 rounded-full border border-[#FF5A1F]/30">
            <span>Verified Media Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display">
            Print Advertising Marketplace
          </h1>

          <p className="text-sm sm:text-base text-[#A5B5CD] max-w-3xl leading-relaxed">
            Discover newspapers and magazines, compare advertising placements and find the right publications to reach your audience.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT AREA: Unified Midnight Zone Canvas */}
      <main className="relative z-10 flex-grow py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12 text-left">
        {/* Main Category Section: Explore Print Media */}
        <section aria-labelledby="print-media-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
            <div>
              <h2 id="print-media-heading" className="text-2xl sm:text-3xl font-bold text-white font-display">
                Explore Print Media
              </h2>
              <p className="text-sm text-[#A5B5CD] mt-1">
                Discover advertising opportunities across leading newspapers and magazines.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#A5B5CD] bg-[#132A4F] px-3.5 py-1.5 rounded-lg border border-[#1E375C] shadow-sm shrink-0">
              Primary Category: <strong className="text-white ml-1 font-mono tracking-wider">PRINT</strong>
            </div>
          </div>

          {/* TWO PRIMARY SUBCATEGORY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            {/* CARD 1: NEWSPAPER */}
            <article className="group bg-[#0F2444] hover:bg-[#132A4F] rounded-xl border border-[#1E375C] hover:border-[#FF5A1F]/60 shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200 flex flex-col justify-between overflow-hidden text-left">
              <div>
                {/* Visual Header Image Container */}
                <div className="relative h-56 w-full bg-[#0B1E3B] overflow-hidden border-b border-[#1E375C]">
                  <img
                    src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=900"
                    alt="Newspaper print advertising"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {/* Subtle blend vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2444] via-transparent to-transparent opacity-60 pointer-events-none" />

                  <div className="absolute top-4 left-4 bg-[#0B1E3B]/90 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-bold text-white border border-[#1E375C] shadow-sm flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span className="font-mono tracking-wider text-[11px]">DAILY &amp; REGIONAL EDITIONS</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white font-display group-hover:text-[#FF5A1F] transition-colors">
                      Newspaper
                    </h3>
                    <span className="text-xs font-semibold text-[#A5B5CD] bg-[#132A4F] px-2.5 py-1 rounded border border-[#1E375C]">
                      {newspaperCount} Publications
                    </span>
                  </div>

                  <p className="text-sm text-[#A5B5CD] leading-relaxed">
                    Explore newspaper advertising opportunities across national, regional and local publications.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1.5 text-xs text-[#A5B5CD]">
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5">Front Page Jackets</span>
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5">Full Pages</span>
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5">Half Pages</span>
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5 font-mono">10 Languages</span>
                  </div>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="p-6 pt-0">
                <Link
                  href="/marketplace/newspaper"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-sm font-bold tracking-wide transition-colors shadow-sm"
                >
                  <span>Explore Newspapers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>

            {/* CARD 2: MAGAZINE */}
            <article className="group bg-[#0F2444] hover:bg-[#132A4F] rounded-xl border border-[#1E375C] hover:border-[#FF5A1F]/60 shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200 flex flex-col justify-between overflow-hidden text-left">
              <div>
                {/* Visual Header Image Container */}
                <div className="relative h-56 w-full bg-[#0B1E3B] overflow-hidden border-b border-[#1E375C]">
                  <img
                    src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=900"
                    alt="Magazine print advertising"
                    className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {/* Subtle blend vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2444] via-transparent to-transparent opacity-60 pointer-events-none" />

                  <div className="absolute top-4 left-4 bg-[#0B1E3B]/90 backdrop-blur-xs px-2.5 py-1 rounded text-xs font-bold text-white border border-[#1E375C] shadow-sm flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#FF5A1F]" />
                    <span className="font-mono tracking-wider text-[11px]">PERIODICALS &amp; GLOSSIES</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white font-display group-hover:text-[#FF5A1F] transition-colors">
                      Magazine
                    </h3>
                    <span className="text-xs font-semibold text-[#A5B5CD] bg-[#132A4F] px-2.5 py-1 rounded border border-[#1E375C]">
                      {magazineCount} Publications
                    </span>
                  </div>

                  <p className="text-sm text-[#A5B5CD] leading-relaxed">
                    Discover magazines across business, lifestyle, fashion, news, entertainment and more.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1.5 text-xs text-[#A5B5CD]">
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5">Inside Covers</span>
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5">Double Spreads</span>
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5">Back Covers</span>
                    <span className="bg-[#132A4F]/70 border border-[#1E375C] rounded px-2.5 py-0.5 font-mono">11 Categories</span>
                  </div>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="p-6 pt-0">
                <Link
                  href="/marketplace/magazine"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-sm font-bold tracking-wide transition-colors shadow-sm"
                >
                  <span>Explore Magazines</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Commercial Standards Section */}
        <section aria-labelledby="standards-heading" className="pt-6 border-t border-[#1E375C] space-y-4">
          <h3 id="standards-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-[#677E9E]">
            OTZ Commercial Standards for Print Inventory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F2444] p-5 rounded-xl border border-[#1E375C] shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#132A4F] border border-[#1E375C] text-[#FF5A1F] flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-[#FF5A1F]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-display">Audited Circulation &amp; Readership</h4>
                <p className="text-xs text-[#A5B5CD] leading-relaxed">
                  Every newspaper and magazine profile references certified audit numbers from the Audit Bureau of Circulations (ABC) and IRS benchmarks.
                </p>
              </div>
            </div>

            <div className="bg-[#0F2444] p-5 rounded-xl border border-[#1E375C] shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#132A4F] border border-[#1E375C] text-[#FF5A1F] flex items-center justify-center shrink-0 shadow-xs">
                <FileCheck2 className="w-5 h-5 text-[#FF5A1F]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-display">Transparent Card Rates</h4>
                <p className="text-xs text-[#A5B5CD] leading-relaxed">
                  Real publisher card rates, page dimensions, bleed requirements and material deadlines published transparently before booking.
                </p>
              </div>
            </div>

            <div className="bg-[#0F2444] p-5 rounded-xl border border-[#1E375C] shadow-sm flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#132A4F] border border-[#1E375C] text-[#2BD67B] flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-[#2BD67B]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-display">Proof of Performance Guarantee</h4>
                <p className="text-xs text-[#A5B5CD] leading-relaxed">
                  Physical publisher voucher copies and digital publication proofs delivered directly to your dashboard for every live insertion.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bag Drawer */}
      <BagDrawer />

      {/* Global OTZ Midnight Zone Footer */}
      <footer className="relative z-10 border-t border-[#1E375C] py-10 px-6 bg-[#0B1E3B] text-[#A5B5CD]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-display font-black tracking-wider text-white text-base">OWN THE ZONE</span>
            <span className="text-xs text-[#677E9E]">© {new Date().getFullYear()}</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#A5B5CD]">
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/for-brands" className="hover:text-white transition-colors">For Brands</Link>
            <Link href="/for-media-owners" className="hover:text-white transition-colors">For Media Owners</Link>
            <Link href="/marketplace/newspaper" className="hover:text-white transition-colors">Newspapers</Link>
            <Link href="/marketplace/magazine" className="hover:text-white transition-colors">Magazines</Link>
            <a
              href="https://wa.me/919999999999?text=I%27m%20interested%20in%20Own%20The%20Zone%20print%20marketplace"
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
