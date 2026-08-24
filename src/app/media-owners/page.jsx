"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import RevenueCalculator from "@/components/RevenueCalculator";
import MdiIcon from "@/components/MdiIcon";
import { motion, AnimatePresence } from "framer-motion";
import { ColumnLines } from "@/components/scrollx/column-lines";

// Channels data for Block 4
const ACCEPTED_CHANNELS = [
  { id: "ooh", title: "OOH & Billboards", count: "3,400+ Spaces", icon: "billboard" },
  { id: "transit", title: "Transit & Aviation", count: "1,200+ Fleets", icon: "bus-clock" },
  { id: "cinema", title: "Cinema Screens", count: "450+ Multiplexes", icon: "movie-open" },
  { id: "radio", title: "Radio & FM", count: "180+ Stations", icon: "radio-tower" },
  { id: "tv", title: "Television & OTT", count: "95+ Channels", icon: "television" },
  { id: "print", title: "Print Media", count: "60+ Dailies", icon: "newspaper-variant-outline" },
  { id: "digital", title: "Digital & CTV", count: "2,100+ Screens", icon: "monitor-dashboard" },
  { id: "influencer", title: "Influencers", count: "1,500+ Creators", icon: "account-group" },
  { id: "events", title: "Events & IP", count: "350+ Annual Events", icon: "ticket-confirmation-outline" },
  { id: "venue", title: "Captive & Venue Media", count: "800+ Malls & Parks", icon: "storefront-outline" },
];

// Testimonials data for Block 8
const OWNER_SPOTLIGHTS = [
  {
    name: "Vikram Malhotra",
    role: "Outdoor Agency Operator",
    location: "Andheri, Mumbai",
    assetCount: "12 Unipoles & Digital Screens",
    quote: "Before OTZ, 30% of our billboard inventory sat unsold during Q2. With direct corporate booking requests on OTZ, our annual occupancy reached 94% with automated T+7 escrow payouts.",
    verified: "Verified Media Owner",
    avatar: "VM"
  },
  {
    name: "Rajesh Sivaraman",
    role: "Cinema Advertising Manager",
    location: "South India Regional Cluster",
    assetCount: "42 PVR INOX Cinema Screens",
    quote: "The ability to set minimum floor rates and accept or decline requests in 1 tap gave us 100% control over our screen inventory without any agency exclusivity lock-in.",
    verified: "Verified Network Operator",
    avatar: "RS"
  },
  {
    name: "Ananya Deshmukh",
    role: "Captive Venue Network Lead",
    location: "Bengaluru Tech Parks",
    assetCount: "85 Tech Park Lobby Displays",
    quote: "Uploading geo-tagged mounting proof right from our field team's mobile phone triggers instant bank settlements. Zero paperwork, direct corporate POs.",
    verified: "Verified Enterprise Host",
    avatar: "AD"
  }
];

// Portal UI Preview Tabs data for Block 9
const PORTAL_TABS = [
  { id: "calendar", label: "Availability Calendar", icon: "calendar-month" },
  { id: "inbox", label: "Booking Request Inbox", icon: "inbox-arrow-down" },
  { id: "proof", label: "Proof of Execution", icon: "camera-account" },
  { id: "payouts", label: "Payout Ledger", icon: "cash-fast" },
];

// FAQ Accordion data for Block 10
const FAQ_ITEMS = [
  {
    q: "How does the 15% commission work?",
    a: "OTZ charges a transparent 15% service fee deducted upon campaign payout. When a corporate buyer pays ₹1,00,000 for your inventory, you receive net ₹85,000 + applicable GST directly in your bank account. There are zero hidden fees, zero listing charges, and no monthly subscription costs."
  },
  {
    q: "Do I need to provide exclusive listing rights to OTZ?",
    a: "No! You retain 100% non-exclusive ownership over all your assets. You can continue selling inventory through direct sales teams or local agents. Simply update your availability calendar in the OTZ portal anytime you book a site independently."
  },
  {
    q: "Who is responsible for mounting and production costs?",
    a: "Production and mounting charges are billed directly to the advertiser or selected media production partner as separate line items. As a media owner, you receive the full agreed space rental payout."
  },
  {
    q: "What happens if an advertiser cancels mid-flight?",
    a: "All campaign payments are locked in escrow prior to campaign launch. Cancellation policies are strictly enforced: if an advertiser cancels within 48 hours of flighting or mid-flight, standard non-refundable tier rules apply and your slot payout is guaranteed."
  },
  {
    q: "What documents are required for KYC and verification?",
    a: "Verification takes under 24 hours. You need: (1) Business GSTIN / PAN registration, (2) Proof of display license or municipal authorization/lease agreement for the site, and (3) Cancelled cheque for bank payout settlement."
  },
  {
    q: "When and how are payouts deposited?",
    a: "Payouts are disbursed via automated NEFT/RTGS bank transfer within T+7 business days after campaign go-live and verification of geo-tagged mounting proof. Full UTR tracking and TDS deduction receipts are updated live in your portal ledger."
  }
];

export default function MediaOwnersLandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("calendar");
  const [openFaq, setOpenFaq] = useState(null);

  const handleOpenOnboarding = () => {
    window.dispatchEvent(
      new CustomEvent("open-lead-popup", { detail: { intent: "host" } })
    );
  };

  const handleOpenLogin = () => {
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", { detail: { mode: "login", role: "host" } })
    );
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen w-full bg-[#0B1E3B] bg-[linear-gradient(to_right,#1E293B15_1px,transparent_1px),linear-gradient(to_bottom,#1E293B15_1px,transparent_1px)] bg-[size:4rem_4rem] text-white selection:bg-[#FF5A1F] selection:text-[#0B1E3B] relative flex flex-col overflow-hidden font-sans theme-dark">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.035}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Ambient Glow Gradients */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(19, 42, 79, 0.4) 0%, transparent 55%), radial-gradient(circle at 15% 60%, rgba(19, 42, 79, 0.4) 0%, transparent 55%)",
        }}
      />

      {/* Global Navbar */}
      <Navbar onLogoClick={() => router.push("/")} />

      <div className="relative z-10 flex-grow pt-28 pb-20 max-w-7xl mx-auto w-full px-6 space-y-24">
        
        {/* ========================================================================= */}
        {/* BLOCK 1: HERO SECTION */}
        {/* ========================================================================= */}
        <section className="max-w-4xl mx-auto text-center pt-8 pb-12 px-4 md:px-6">
          {/* Tag/Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15] mb-6"
          >
            Your empty weeks are costing you.<br />
            <span className="text-[#FF5A1F]">List your media on OTZ</span> and get booked.
          </motion.h1>

          {/* Subtitle / Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Direct corporate demand, guaranteed payout timelines, and complete control over your rate cards and availability.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={handleOpenOnboarding}
              className="bg-[#FF5A1F] text-[#0B1E3B] font-bold px-7 py-3.5 rounded-[6px] hover:opacity-90 transition-all shadow-md flex items-center gap-2 cursor-pointer text-sm md:text-base"
            >
              <span>LIST YOUR MEDIA — FREE</span>
              <MdiIcon name="arrow-right" className="text-lg" />
            </button>

            <button
              type="button"
              onClick={handleOpenLogin}
              className="border border-white/20 text-white font-medium px-7 py-3.5 rounded-[6px] hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer text-sm md:text-base"
            >
              <MdiIcon name="account-key-outline" className="text-lg text-slate-300" />
              <span>MEDIA OWNER LOGIN</span>
            </button>
          </motion.div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 2: LIVE PROOF STRIP */}
        {/* ========================================================================= */}
        <section className="bg-[#101828]/80 backdrop-blur border border-white/10 rounded-[10px] p-6 md:p-8 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="pt-2 sm:pt-0">
              <div className="tabular-nums font-mono font-bold text-3xl md:text-4xl text-white">850+</div>
              <div className="text-xs font-sans text-slate-400 mt-1 uppercase font-semibold">Verified Media Owners</div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="tabular-nums font-mono font-bold text-3xl md:text-4xl text-white">28</div>
              <div className="text-xs font-sans text-slate-400 mt-1 uppercase font-semibold">Cities Active</div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="tabular-nums font-mono font-bold text-3xl md:text-4xl text-[#FF5A1F]">₹14.2 Cr</div>
              <div className="text-xs font-sans text-slate-400 mt-1 uppercase font-semibold">Payouts Disbursed</div>
            </div>
            <div className="pt-4 sm:pt-0">
              <div className="tabular-nums font-mono font-bold text-3xl md:text-4xl text-emerald-400">T+7</div>
              <div className="text-xs font-sans text-slate-400 mt-1 uppercase font-semibold">Avg. Settlement Window</div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 3: HOW IT WORKS (4-STEP SEQUENTIAL FLOW) */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
              SIMPLE 4-STEP ONBOARDING
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              How Media Owners Get Booked on OTZ
            </h2>
            <p className="font-sans text-slate-300 text-sm md:text-base">
              From inventory listing to automated bank payouts in 4 seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "List (5 Mins)",
                desc: "Channel-branched, photo-first form. Upload site specs, pricing, and high-res photos.",
                icon: "clipboard-plus-outline"
              },
              {
                step: "02",
                title: "Get Verified (24h SLA)",
                desc: "Fast entity & display licence verification by our dedicated ops verification team.",
                icon: "shield-check-outline"
              },
              {
                step: "03",
                title: "Receive Bookings",
                desc: "Accept or decline direct corporate brand requests via portal dashboard & WhatsApp.",
                icon: "bell-ring-outline"
              },
              {
                step: "04",
                title: "Get Paid (T+7)",
                desc: "Upload geo-tagged mounting proof and receive automated bank settlements within 7 days.",
                icon: "bank-transfer-in"
              }
            ].map((item, idx) => (
              <div
                key={item.step}
                className="bg-[#101828]/60 border border-white/10 rounded-[10px] p-6 space-y-4 relative group hover:border-[#FF5A1F]/50 transition-all text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="w-10 h-10 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] flex items-center justify-center">
                    <MdiIcon name={item.icon} className="text-xl" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400 bg-white/5 px-2 py-1 rounded">
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">{item.title}</h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 4: CHANNELS ACCEPTED GRID */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
              ACCEPTING ALL MEDIA FORMATS
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Channels & Formats We Monetize
            </h2>
            <p className="font-sans text-slate-300 text-sm md:text-base">
              Whether you operate unipoles, cinema screens, transit wraps, or digital networks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {ACCEPTED_CHANNELS.map((ch) => (
              <div
                key={ch.id}
                className="bg-[#101828]/80 border border-white/10 hover:border-[#FF5A1F]/60 p-4 rounded-[10px] text-center space-y-2 group transition-all cursor-pointer"
                onClick={handleOpenOnboarding}
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-white/5 group-hover:bg-[#FF5A1F]/10 text-slate-300 group-hover:text-[#FF5A1F] flex items-center justify-center transition-colors">
                  <MdiIcon name={ch.icon} className="text-xl" />
                </div>
                <h4 className="font-display font-bold text-xs text-white leading-tight">{ch.title}</h4>
                <p className="font-mono text-[10px] text-slate-400">{ch.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 5: COMMISSION & PAYOUT TRANSPARENCY CARD */}
        {/* ========================================================================= */}
        <section className="bg-[#101828]/90 border border-white/10 rounded-[10px] p-8 md:p-10 shadow-2xl text-left space-y-8">
          <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
                TRANSPARENT PRICING MODEL
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-white mt-1">
                Zero Listing Fee • 15% Platform Commission
              </h2>
            </div>
            <span className="px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider self-start md:self-auto">
              ✓ Guaranteed Payout Formula
            </span>
          </div>

          {/* Worked calculation example */}
          <div className="bg-[#0B1E3B] border border-white/10 rounded-lg p-6 space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
              WORKED PAYOUT EXAMPLE (CAMPAIGN BOOKING OF ₹1,00,000)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <span className="text-xs font-sans text-slate-400 block mb-1">Buyer Pays</span>
                <span className="tabular-nums font-mono font-bold text-xl text-white">₹1,00,000</span>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <span className="text-xs font-sans text-slate-400 block mb-1">OTZ Fee (15%)</span>
                <span className="tabular-nums font-mono font-bold text-xl text-[#FF5A1F]">₹15,000</span>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                <span className="text-xs font-sans text-emerald-400 block mb-1">Net to Media Owner</span>
                <span className="tabular-nums font-mono font-bold text-2xl text-emerald-400">₹85,000 + GST</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs font-sans text-slate-300">
            <div className="flex items-center gap-2">
              <MdiIcon name="check-circle" className="text-emerald-400 text-lg" />
              <span>Zero Listing or Registration Charges</span>
            </div>
            <div className="flex items-center gap-2">
              <MdiIcon name="check-circle" className="text-emerald-400 text-lg" />
              <span>No Exclusivity or Lock-in Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <MdiIcon name="check-circle" className="text-emerald-400 text-lg" />
              <span>Strict T+7 Settlement After Campaign Go-Live</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 6: WHAT YOU CONTROL (OWNER AUTONOMY MATRIX) */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
              TOTAL OPERATOR AUTONOMY
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              What You Control as a Media Owner
            </h2>
            <p className="font-sans text-slate-300 text-sm md:text-base">
              You maintain 100% authority over your assets, pricing, and schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              {
                title: "Your Rates",
                subtitle: "Card & Floor Rates",
                desc: "Set published card rates for public booking alongside private minimum floor rates for automated spot fill.",
                icon: "currency-inr"
              },
              {
                title: "Your Calendar",
                subtitle: "Availability & Holds",
                desc: "Block dates for your own sales team, hold slots for direct clients, or mark unsold slots active for OTZ demand.",
                icon: "calendar-clock"
              },
              {
                title: "Your Exclusions",
                subtitle: "Category & Competitor No-Gos",
                desc: "Declare prohibited advertiser categories (e.g. alcohol, gambling, or direct competitors to your venue).",
                icon: "cancel"
              },
              {
                title: "Your Acceptance",
                subtitle: "1-Tap Reservation Approval",
                desc: "Review campaign creative, advertiser profile, and flight dates before accepting or declining with one tap.",
                icon: "thumb-up-outline"
              }
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[#101828]/60 border border-white/10 rounded-[10px] p-6 space-y-3 hover:border-[#FF5A1F]/50 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] flex items-center justify-center">
                  <MdiIcon name={item.icon} className="text-xl" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">{item.title}</h3>
                <span className="text-xs font-mono text-[#FF5A1F] block">{item.subtitle}</span>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 7: INTERACTIVE EARNINGS ESTIMATOR WIDGET */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
              CALCULATE YOUR REVENUE
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Interactive Revenue Calculator
            </h2>
            <p className="font-sans text-slate-300 text-sm md:text-base">
              Select your media specs to project potential monthly earnings from corporate advertisers.
            </p>
          </div>

          <RevenueCalculator />
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 8: MEDIA OWNER SPOTLIGHTS / TESTIMONIALS */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
              PARTNER SUCCESS STORIES
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Trusted by 850+ Verified Operators
            </h2>
            <p className="font-sans text-slate-300 text-sm md:text-base">
              Hear from media owners monetizing inventory on OTZ Marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {OWNER_SPOTLIGHTS.map((spot, i) => (
              <div
                key={i}
                className="bg-[#101828]/80 border border-white/10 rounded-[10px] p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase">
                      ✓ {spot.verified}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{spot.location}</span>
                  </div>
                  <p className="font-sans text-xs text-slate-200 leading-relaxed italic">
                    &ldquo;{spot.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1E3B] border border-[#FF5A1F] text-white flex items-center justify-center font-bold text-xs">
                    {spot.avatar}
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-white">{spot.name}</div>
                    <div className="text-[11px] font-sans text-slate-400">{spot.role} • {spot.assetCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 9: LOGGED-IN PORTAL UI PREVIEW */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
              OWNER CONSOLE PREVIEW
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Inside the OTZ Media Owner Portal
            </h2>
            <p className="font-sans text-slate-300 text-sm md:text-base">
              A powerful dashboard built specifically for asset management and instant payouts.
            </p>
          </div>

          {/* Interactive Portal Preview Container */}
          <div className="bg-[#101828] border border-white/10 rounded-[10px] p-6 md:p-8 shadow-2xl text-left space-y-6">
            {/* Tabs Header */}
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
              {PORTAL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#FF5A1F] text-[#0B1E3B] shadow-md"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <MdiIcon name={tab.icon} className="text-base" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Preview Content */}
            <div className="bg-[#0B1E3B] border border-white/10 rounded-lg p-6 min-h-[220px]">
              {activeTab === "calendar" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span className="font-bold text-white uppercase">August 2026 Availability Grid</span>
                    <span className="text-emerald-400">● Green = Booked (OTZ Escrow) | ○ Grey = Open Slot</span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="text-slate-400 py-1 font-bold">{d}</div>
                    ))}
                    {Array.from({ length: 31 }).map((_, idx) => {
                      const day = idx + 1;
                      const isBooked = [3, 4, 5, 6, 7, 8, 9, 14, 15, 16, 17, 21, 22, 23, 24, 25, 26, 27].includes(day);
                      return (
                        <div
                          key={day}
                          className={`p-2.5 rounded border text-xs font-bold ${
                            isBooked
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                              : "bg-white/5 border-white/10 text-slate-300 hover:border-slate-500"
                          }`}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "inbox" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-300 uppercase font-bold">New Booking Request (1 Pending)</span>
                    <span className="text-xs font-mono text-[#FF5A1F] bg-[#FF5A1F]/10 px-2 py-0.5 rounded border border-[#FF5A1F]/30">
                      ⏱ 18h 42m remaining to accept
                    </span>
                  </div>
                  <div className="bg-[#101828] border border-white/10 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-display font-bold text-white">Swiggy Instamart — Q3 Metro Billboard Flight</div>
                      <div className="text-xs font-sans text-slate-300 mt-1">
                        Dates: Aug 25 – Sep 10 • Site: Bandra West Unipole #04 • Budget: <span className="font-mono text-white font-bold">₹2,40,000</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90">
                        Accept Booking
                      </button>
                      <button type="button" className="px-3 py-2 rounded border border-white/20 text-xs text-slate-300 hover:bg-white/10">
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "proof" && (
                <div className="space-y-3">
                  <span className="text-xs font-mono text-slate-300 uppercase font-bold block">Geo-Tagged Mounting Audit</span>
                  <div className="bg-[#101828] border border-white/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded flex items-center justify-center text-slate-400">
                      <MdiIcon name="camera" className="text-2xl" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono">LAT: 19.1176° N, LONG: 72.8461° E</div>
                      <div className="text-xs text-slate-300 mt-0.5">Timestamp: 2026-08-20 08:30:12 IST • Verification Status: <span className="text-emerald-400 font-bold">PASSED</span></div>
                      <div className="text-[11px] text-slate-400 mt-1">Settlement trigger activated. Payout scheduled for T+7 bank transfer.</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "payouts" && (
                <div className="space-y-3">
                  <span className="text-xs font-mono text-slate-300 uppercase font-bold block">Payout Ledger & Settlement History</span>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-[#101828] border border-white/10 rounded p-3 flex justify-between items-center">
                      <div>
                        <div className="text-white font-bold">UTR #928401928301 — Samsung Galaxy Launch</div>
                        <div className="text-slate-400 text-[10px]">TDS Deducted (1% Section 194C): ₹2,100 • Disbursed: 18 Aug 2026</div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold text-sm">₹2,07,900</div>
                        <div className="text-[10px] text-slate-400">SETTLED (NEFT)</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 10: MEDIA OWNER FAQ ACCORDION */}
        {/* ========================================================================= */}
        <section className="space-y-8 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <span className="text-[#FF5A1F] font-mono text-xs font-bold uppercase tracking-widest">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Media Owner FAQ
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#101828] border border-white/10 rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex justify-between items-center font-display font-bold text-sm md:text-base text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <MdiIcon
                      name="chevron-down"
                      className={`text-xl transition-transform duration-200 text-[#FF5A1F] ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 font-sans text-xs md:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BLOCK 11: TWO-TRACK BOTTOM CTA */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-[#101828] via-[#0B1E3B] to-[#101828] border border-[#FF5A1F]/30 rounded-[10px] p-8 md:p-12 text-center space-y-8 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
              Ready to Fill Your Unsold Inventory?
            </h2>
            <p className="font-sans text-slate-300 text-sm md:text-base">
              Join 850+ verified media owners getting direct corporate demand. Zero listing fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            {/* Track A: Self-Serve */}
            <div className="bg-[#0B1E3B] border border-white/10 rounded-lg p-6 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-[#FF5A1F] uppercase font-bold">TRACK A — INDEPENDENT OPERATORS</span>
                <h3 className="font-display font-bold text-xl text-white mt-1">List 1–20 Sites Instantly</h3>
                <p className="font-sans text-xs text-slate-300 mt-2 leading-relaxed">
                  Self-serve onboarding in 5 minutes. Upload photos, set rate cards, and receive bookings.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenOnboarding}
                className="w-full bg-[#FF5A1F] hover:bg-[#E64E15] text-[#0B1E3B] font-display font-bold text-xs uppercase tracking-wider rounded h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>START FREE LISTING</span>
                <MdiIcon name="arrow-right" />
              </button>
            </div>

            {/* Track B: Enterprise */}
            <div className="bg-[#0B1E3B] border border-white/10 rounded-lg p-6 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase font-bold">TRACK B — ENTERPRISE & NETWORKS</span>
                <h3 className="font-display font-bold text-xl text-white mt-1">Institutional & Network API</h3>
                <p className="font-sans text-xs text-slate-300 mt-2 leading-relaxed">
                  50+ sites or custom CMS network? Bulk CSV ingestion and dedicated key account management.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenOnboarding}
                className="w-full border border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 font-display font-bold text-xs uppercase tracking-wider rounded h-[46px] flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>TALK TO PARTNERSHIPS TEAM</span>
                <MdiIcon name="account-group-outline" />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs font-mono text-slate-400">
        <p>© {new Date().getFullYear()} OTZ Marketplace. Media Owner PRD Section 4.1 Specification Compliant.</p>
      </footer>
    </main>
  );
}
