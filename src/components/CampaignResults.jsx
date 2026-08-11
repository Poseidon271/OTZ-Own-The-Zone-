"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MdiIcon from "@/components/MdiIcon";
import CountUp from "@/components/ui/CountUp";

// Import AI Recommendation Engine Logic
import { getRecommendations, getBudgetAllocation, getExplanations } from "@/lib/LogicEngine";

// Objective labels mapping
const OBJECTIVES = [
  { label: "Brand Awareness", value: "Awareness" },
  { label: "Sales Conversion", value: "Sales" },
  { label: "App Installs", value: "App Downloads" },
  { label: "Lead Generation", value: "Lead Generation" }
];

// Mapping channel details for rendering strategy cards
const CHANNEL_DETAILS = {
  TV: {
    name: "Television (TV)",
    icon: "television",
    execution: "Prime-time video slots & news sponsor tags",
    why: "Offers maximum brand authority and top-of-mind awareness for mass demographics.",
    impact: "Very High Reach"
  },
  OOH: {
    name: "Out-of-Home (OOH)",
    icon: "road-variant",
    execution: "Digital billboards at high-traffic arterial roads",
    why: "Maintains high frequency and geographic precision in major metro hubs.",
    impact: "High Local Frequency"
  },
  Influencer: {
    name: "Influencer Marketing",
    icon: "account-star-outline",
    execution: "Instagram Reels & YouTube product integration",
    why: "Drives authentic trust, direct conversions, and highly targeted demographic appeal.",
    impact: "Strong Trust & CTR"
  },
  Digital: {
    name: "Digital Media",
    icon: "web",
    execution: "Programmatic display, Search, and Social ads",
    why: "Ensures precise retargeting, direct conversions, and robust performance tracking.",
    impact: "High Conversion Rate"
  },
  Radio: {
    name: "Radio",
    icon: "radio",
    execution: "Frequency ads during morning/evening commute times",
    why: "Cost-effective audio placement targeting local commuters and drivers.",
    impact: "Moderate Local Reach"
  },
  Search: {
    name: "Search Ads",
    icon: "magnify",
    execution: "Google Search campaigns & high-intent keyword targeting",
    why: "Captures active search queries directly, converting purchase interest into quality leads.",
    impact: "High Intent & Quality Leads"
  }
};

// Demographic insights based on selected industry
const DEMOGRAPHICS = {
  FMCG: { age: "18 - 45", geo: "Pan-India Urban/Rural", behavior: "Value-conscious, convenience shoppers, household buyers" },
  Fashion: { age: "16 - 32", geo: "Tier 1 & Tier 2 Cities", behavior: "Trend-driven, brand loyal, active social media users" },
  Tech: { age: "18 - 40", geo: "Metro Tech Hubs", behavior: "Early adopters, tech-savvy, convenience lovers" },
  "Real Estate": { age: "28 - 55", geo: "Suburban Metro Areas", behavior: "High income, families, prospective investors" },
  Healthcare: { age: "25 - 60", geo: "National Coverage", behavior: "Health-conscious, safety-first, wellness researchers" }
};

export default function CampaignResults({
  selectedIndustries,
  selectedObjectives,
  selectedChannels,
  onRefine
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // Targets based on objectives
  const targetReach = useMemo(() => {
    return selectedObjectives.includes("Awareness") ? 4250000 : 1580000;
  }, [selectedObjectives]);

  const targetImpressions = useMemo(() => {
    return targetReach * 3.5;
  }, [targetReach]);

  const targetCtr = useMemo(() => {
    return selectedObjectives.includes("Sales") ? 5.2 : 2.8;
  }, [selectedObjectives]);

  const targetConversions = useMemo(() => {
    return Math.round(targetReach * (targetCtr / 100) * 0.15);
  }, [targetReach, targetCtr]);

  const loadingTexts = [
    "Analyzing placement inventory...",
    "Optimizing budget allocation...",
    "Estimating campaign outcomes...",
    "Generating strategic AI recommendations...",
    "Assembling your dashboard..."
  ];

  // Loading simulation
  useEffect(() => {
    // Loop through texts
    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 900);

    const loadTimer = setTimeout(() => {
      setLoading(false);
      clearInterval(textInterval);
    }, 4500);

    return () => {
      clearTimeout(loadTimer);
      clearInterval(textInterval);
    };
  }, []);

  // Determine channels list to display (fall back to all if none selected)
  const channelsToShow = selectedChannels.length > 0 ? selectedChannels : ["Digital", "Influencer", "TV"];

  // Compute explanations and recommended channels dynamically
  const recommendedChannels = useMemo(() => {
    return getRecommendations(selectedIndustries, selectedObjectives);
  }, [selectedIndustries, selectedObjectives]);

  const explanations = useMemo(() => {
    return getExplanations(selectedIndustries, selectedObjectives, recommendedChannels);
  }, [selectedIndustries, selectedObjectives, recommendedChannels]);

  // Budget allocations summing up to 100% using our LogicEngine
  const budgetAllocation = useMemo(() => {
    return getBudgetAllocation(channelsToShow, recommendedChannels);
  }, [channelsToShow, recommendedChannels]);

  // Select dominant demographics profile
  const demoProfile = useMemo(() => {
    const primaryInd = selectedIndustries[0] || "FMCG";
    return DEMOGRAPHICS[primaryInd] || DEMOGRAPHICS.FMCG;
  }, [selectedIndustries]);

  // Render shimmer skeleton loading state
  if (loading) {
    return (
      <div className="frost-glass rounded-3xl p-8 shadow-2xl relative overflow-hidden max-w-5xl mx-auto w-full animate-pulse space-y-8"
        style={{
          border: "1px solid rgba(139, 92, 246, 0.15)",
          boxShadow: "0 0 50px rgba(139, 92, 246, 0.05)"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" 
          style={{ animationDuration: "1.5s" }}
        />
        
        {/* Loading header */}
        <div className="flex flex-col items-center justify-center py-10 space-y-4">
          <div className="h-12 w-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <p className="text-sm font-bold text-violet-400 select-none tracking-wide">
            {loadingTexts[loadingTextIndex]}
          </p>
          <h3 className="text-xl font-black text-slate-300">Crafting your media strategy...</h3>
        </div>

        {/* Shimmer skeleton modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-44 bg-white/5 rounded-2xl border border-white/5" />
          <div className="h-44 bg-white/5 rounded-2xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-dashboard-slide-in no-print">
      {/* 1. Top Summary Bar */}
      <div 
        className="frost-glass rounded-2xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
        style={{
          border: "1px solid rgba(139, 92, 246, 0.12)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)"
        }}
      >
        {/* Industry summary */}
        <div className="flex items-center gap-2 px-3 py-1">
          <MdiIcon name="office-building" className="text-violet-400 text-base" />
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Industry Profile</span>
            <span className="text-xs font-black text-slate-200">
              {selectedIndustries.length > 0 ? selectedIndustries.join(", ") : "FMCG (Default)"}
            </span>
          </div>
        </div>

        {/* Goal summary */}
        <div className="flex items-center gap-2 px-3 py-1">
          <MdiIcon name="bullseye-arrow" className="text-violet-400 text-base" />
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Campaign Goal</span>
            <span className="text-xs font-black text-slate-200">
              {selectedObjectives.length > 0 
                ? selectedObjectives.map(o => OBJECTIVES.find(i=>i.value===o)?.label || o).join(", ") 
                : "Awareness"}
            </span>
          </div>
        </div>

        {/* Channels Summary */}
        <div className="flex items-center gap-2 px-3 py-1">
          <MdiIcon name="rss" className="text-violet-400 text-base" />
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Active Channels</span>
            <span className="text-xs font-black text-slate-200">
              {channelsToShow.map(c => CHANNEL_DETAILS[c]?.name || c).join(" + ")}
            </span>
          </div>
        </div>

        {/* Budget Summary */}
        <div className="flex items-center gap-2 px-3 py-1">
          <MdiIcon name="chart-pie" className="text-violet-400 text-base" />
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">Split Ratio</span>
            <span className="text-xs font-black text-slate-200">
              {budgetAllocation.map(b => `${b.percentage}% ${b.channel}`).join(" : ")}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Budget Allocation & AI recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. Budget Allocation (Hero Card - 12 Cols) */}
        <div 
          className="lg:col-span-12 frost-glass rounded-3xl p-6 sm:p-7 shadow-xl space-y-6"
          style={{ border: "1px solid rgba(139, 92, 246, 0.12)" }}
        >
          <div className="flex items-center gap-2">
            <MdiIcon name="wallet-giftcard" className="text-violet-400 text-xl" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Budget Allocation</h3>
          </div>

          {/* Segmented Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="h-5 w-full rounded-full overflow-hidden flex bg-white/5 shadow-inner">
              {budgetAllocation.map((alloc, idx) => {
                // Color array mapping
                const colors = [
                  "linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)", // violet
                  "linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)", // blue
                  "linear-gradient(90deg, #06B6D4 0%, #0891B2 100%)", // cyan
                  "linear-gradient(90deg, #059669 0%, #10B981 100%)", // emerald
                  "linear-gradient(90deg, #D97706 0%, #F59E0B 100%)"  // amber
                ];
                return (
                  <div
                    key={alloc.channel}
                    className="h-full relative group"
                    style={{
                      width: `${alloc.percentage}%`,
                      background: colors[idx % colors.length]
                    }}
                    title={`${alloc.channel}: ${alloc.percentage}%`}
                  >
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors" />
                  </div>
                );
              })}
            </div>
            
            {/* Allocation Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {budgetAllocation.map((alloc, idx) => {
                const colors = [
                  "bg-violet-500",
                  "bg-blue-500",
                  "bg-cyan-500",
                  "bg-emerald-500",
                  "bg-amber-500"
                ];
                return (
                  <div key={alloc.channel} className="flex items-center gap-2.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${colors[idx % colors.length]}`} />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block leading-tight">
                        {CHANNEL_DETAILS[alloc.channel]?.name || alloc.channel}
                      </span>
                      <span className="text-[10px] text-slate-450 font-bold">
                        {alloc.percentage}% split ratio
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI Strategy Rationale Card */}
      {explanations.length > 0 && (
        <div 
          className="frost-glass rounded-3xl p-6 sm:p-7 shadow-xl space-y-5"
          style={{ 
            border: "1px solid rgba(139, 92, 246, 0.12)",
            background: "rgba(18, 24, 34, 0.55)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
          }}
        >
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
            <MdiIcon name="auto-fix" className="text-violet-400 text-xl animate-pulse" />
            <div>
              <h3 className="text-lg font-black text-white leading-tight">AI Strategy Rationale</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5 font-sans">Explainability insights based on target goals and industry</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {explanations.map((exp) => (
              <div 
                key={exp.channel}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5"
                style={exp.isSpecific ? { borderColor: "rgba(139, 92, 246, 0.25)" } : {}}
              >
                <div className="flex items-center gap-2">
                  <MdiIcon name={CHANNEL_DETAILS[exp.channel]?.icon || "rss"} className="text-violet-400 text-base" />
                  <span className="text-xs font-black text-slate-200">
                    {CHANNEL_DETAILS[exp.channel]?.name || exp.channel}
                  </span>
                  {exp.isSpecific && (
                    <span 
                      className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white animate-pulse"
                      style={{ background: "rgba(139, 92, 246, 0.25)", color: "#c084fc", border: "1px solid rgba(139, 92, 246, 0.3)" }}
                    >
                      AI Optimized
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                  {exp.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Audience Insights & Expected Outcomes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Audience Insights Card */}
        <div 
          className="frost-glass rounded-3xl p-6 sm:p-7 shadow-xl space-y-6"
          style={{ border: "1px solid rgba(139, 92, 246, 0.12)" }}
        >
          <div className="flex items-center gap-2">
            <MdiIcon name="account-group" className="text-violet-400 text-xl" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Audience Target Profile</h3>
          </div>

          <div className="space-y-4 pt-2">
            {/* Age */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300">
                <MdiIcon name="calendar-range" className="text-base" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-505 block">Target Age Group</span>
                <span className="text-sm font-extrabold text-slate-200">{demoProfile.age} Years</span>
              </div>
            </div>

            {/* Geography */}
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300">
                <MdiIcon name="earth" className="text-base" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-505 block">Geographic Distribution</span>
                <span className="text-sm font-extrabold text-slate-200">{demoProfile.geo}</span>
              </div>
            </div>

            {/* Behavior */}
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 mt-1">
                <MdiIcon name="brain" className="text-base" />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-505 block">Behavioral Characteristics</span>
                <span className="text-xs text-slate-350 leading-relaxed mt-0.5 block">{demoProfile.behavior}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Outcomes Metrics Grid */}
        <div 
          className="frost-glass rounded-3xl p-6 sm:p-7 shadow-xl space-y-6"
          style={{ border: "1px solid rgba(139, 92, 246, 0.12)" }}
        >
          <div className="flex items-center gap-2">
            <MdiIcon name="chart-box-outline" className="text-violet-400 text-xl" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Projected Campaign Impact</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Stat 1: Reach */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <MdiIcon name="account-multiple-outline" className="text-violet-400 text-lg mb-1 mx-auto" />
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Est. Reach</span>
              <CountUp
                from={0}
                to={targetReach}
                separator=","
                duration={1.5}
                className="text-lg sm:text-xl font-black text-slate-200"
              />
            </div>

            {/* Stat 2: Impressions */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <MdiIcon name="eye-outline" className="text-violet-400 text-lg mb-1 mx-auto" />
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Est. Impressions</span>
              <CountUp
                from={0}
                to={targetImpressions}
                separator=","
                duration={1.5}
                className="text-lg sm:text-xl font-black text-slate-200"
              />
            </div>

            {/* Stat 3: CTR */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <MdiIcon name="gesture-tap" className="text-violet-400 text-lg mb-1 mx-auto" />
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Avg. CTR</span>
              <span className="text-lg sm:text-xl font-black text-slate-200 flex justify-center items-center gap-0.5">
                <CountUp
                  from={0}
                  to={targetCtr}
                  duration={1.5}
                />
                <span>%</span>
              </span>
            </div>

            {/* Stat 4: Conversions */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <MdiIcon name="check-circle-outline" className="text-violet-400 text-lg mb-1 mx-auto" />
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Est. Conversions</span>
              <CountUp
                from={0}
                to={targetConversions}
                separator=","
                duration={1.5}
                className="text-lg sm:text-xl font-black text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation CTA to Media Buying */}
      <div className="flex justify-center pt-6">
        <button
          onClick={() => router.push("/media-buying")}
          className="rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-650 to-blue-600 hover:scale-[1.02] text-white px-8 py-4 text-sm font-bold shadow-lg transition-all duration-300 cursor-pointer flex items-center gap-2"
          style={{ boxShadow: "0 0 25px rgba(139, 92, 246, 0.25)" }}
        >
          <MdiIcon name="cart-outline" className="text-base" /> Proceed to Media Buying
        </button>
      </div>

    </div>
  );
}
