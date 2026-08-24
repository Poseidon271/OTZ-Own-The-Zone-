"use client";

import React, { useState, useMemo } from "react";
import MdiIcon from "@/components/MdiIcon";

// Media Type Configuration with realistic CPM rates (in INR)
const MEDIA_TYPES = [
  { id: "ooh", label: "Billboard / OOH", cpmLow: 45, cpmHigh: 110, icon: "billboard" },
  { id: "digital_led", label: "Digital LED Screen", cpmLow: 80, cpmHigh: 190, icon: "monitor-dashboard" },
  { id: "transit", label: "Transit / Metro / Bus Wrap", cpmLow: 35, cpmHigh: 85, icon: "bus-clock" },
  { id: "radio", label: "Radio Slot", cpmLow: 50, cpmHigh: 130, icon: "radio-tower" },
  { id: "retail", label: "Mall / Retail Display", cpmLow: 70, cpmHigh: 170, icon: "storefront-outline" },
  { id: "cinema", label: "Cinema Screen", cpmLow: 110, cpmHigh: 240, icon: "movie-open" },
];

// Location Tier Configuration
const LOCATION_TIERS = [
  { id: "tier_1", label: "Tier 1 Metros", subtext: "Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata", multiplier: 1.0 },
  { id: "tier_2", label: "Tier 2 Growth Hubs", subtext: "Pune, Ahmedabad, Chandigarh, Jaipur, Lucknow, Kochi", multiplier: 0.70 },
  { id: "tier_3", label: "Tier 3 Regional", subtext: "Nashik, Indore, Nagpur, Coimbatore, Patna, Surat", multiplier: 0.45 },
];

// Helper to format Indian currency values nicely
function formatINR(val) {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    const lakhs = (val / 100000).toFixed(2);
    return `₹${lakhs.replace(/\.00$/, '')} Lakh`;
  }
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

// Helper to format impression count nicely
function formatNumber(val) {
  return val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val.toLocaleString("en-IN");
}

export default function RevenueCalculator() {
  const [selectedMediaType, setSelectedMediaType] = useState(MEDIA_TYPES[0].id);
  const [selectedTier, setSelectedTier] = useState(LOCATION_TIERS[0].id);
  const [dailyImpressions, setDailyImpressions] = useState(50000);

  // Recompute earnings estimates smoothly based on controls
  const earningsEstimate = useMemo(() => {
    const media = MEDIA_TYPES.find((m) => m.id === selectedMediaType) || MEDIA_TYPES[0];
    const tier = LOCATION_TIERS.find((t) => t.id === selectedTier) || LOCATION_TIERS[0];

    const monthlyImpressions = dailyImpressions * 30;
    // Occupancy fill estimate: ~40% for low, ~75% for high demand
    const lowEst = (monthlyImpressions / 1000) * media.cpmLow * tier.multiplier * 0.40;
    const highEst = (monthlyImpressions / 1000) * media.cpmHigh * tier.multiplier * 0.75;

    return {
      lowFormatted: formatINR(lowEst),
      highFormatted: formatINR(highEst),
      rawLow: lowEst,
      rawHigh: highEst,
    };
  }, [selectedMediaType, selectedTier, dailyImpressions]);

  const handleClaimRevenue = () => {
    window.dispatchEvent(
      new CustomEvent("open-lead-popup", {
        detail: { intent: "host", mediaType: selectedMediaType },
      })
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Main Interactive Widget Card */}
      <div className="bg-[#101828]/80 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[10px] shadow-2xl space-y-6 text-left">
        
        {/* Header Title */}
        <div className="border-b border-white/10 pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
              Inventory Revenue Estimator
            </h3>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Select your asset profile to project monthly revenue potential
            </p>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F] text-[10px] font-mono font-semibold uppercase tracking-wider">
            Live Algorithmic Rate
          </span>
        </div>

        {/* 1. Media Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            1. Select Media Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MEDIA_TYPES.map((media) => {
              const isSelected = selectedMediaType === media.id;
              return (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => setSelectedMediaType(media.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-sans transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FF5A1F]/15 border-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/10"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <MdiIcon
                    name={media.icon}
                    className={`text-xl mb-1 ${isSelected ? "text-[#FF5A1F]" : "text-slate-400"}`}
                  />
                  <span className="font-medium text-center leading-tight line-clamp-1">
                    {media.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Location Tier */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            2. Location Tier
          </label>
          <div className="relative">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full bg-[#0B1E3B] border border-white/15 rounded-md px-4 py-2.5 text-sm text-white font-sans focus:outline-none focus:border-[#FF5A1F] appearance-none cursor-pointer pr-10"
            >
              {LOCATION_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id} className="bg-[#0B1E3B] text-white">
                  {tier.label} — {tier.subtext}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <MdiIcon name="chevron-down" className="text-lg" />
            </div>
          </div>
        </div>

        {/* 3. Daily Impressions / Footfall Slider */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              3. Daily Footfall / Impressions
            </label>
            <span className="tabular-nums font-mono font-bold text-sm text-[#FF5A1F] bg-[#FF5A1F]/10 px-2.5 py-0.5 rounded border border-[#FF5A1F]/20">
              {formatNumber(dailyImpressions)} views / day
            </span>
          </div>

          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={dailyImpressions}
            onChange={(e) => setDailyImpressions(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#FF5A1F] focus:outline-none"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400 tabular-nums">
            <span>10,000 views</span>
            <span>500,000 views</span>
            <span>1,000,000+ views</span>
          </div>
        </div>

        {/* Dynamic Calculation Output Card */}
        <div className="mt-6 pt-6 border-t border-white/10 bg-[#0B1E3B]/90 rounded-lg p-5 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                ESTIMATED MONTHLY EARNINGS
              </span>
              <div className="tabular-nums font-bold text-2xl md:text-3xl text-white mt-1 tracking-tight">
                {earningsEstimate.lowFormatted} – {earningsEstimate.highFormatted} <span className="text-sm font-sans font-normal text-slate-400">/ mo</span>
              </div>
            </div>
            <div className="text-right sm:text-right text-[11px] font-mono text-emerald-400 flex items-center sm:justify-end gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Zero Agency Commissions
            </div>
          </div>

          <button
            type="button"
            onClick={handleClaimRevenue}
            className="w-full bg-[#FF5A1F] hover:bg-[#E64E15] active:scale-[0.99] text-[#0B1E3B] font-display font-bold text-sm tracking-wider uppercase rounded-[6px] h-[48px] px-6 shadow-lg shadow-[#FF5A1F]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>CLAIM THIS REVENUE — LIST ASSET</span>
            <MdiIcon name="arrow-right" className="text-lg" />
          </button>
        </div>
      </div>

      {/* Value Proof Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="flex items-center justify-center gap-2 bg-[#101828]/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-sans text-slate-200">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="font-medium">Direct Corporate POs</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-[#101828]/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-sans text-slate-200">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="font-medium">Automated Escrow Payouts</span>
        </div>
        <div className="flex items-center justify-center gap-2 bg-[#101828]/60 border border-white/10 rounded-lg py-2.5 px-3 text-xs font-sans text-slate-200">
          <span className="text-emerald-400 font-bold">✓</span>
          <span className="font-medium">Geo-Tagged Proof of Execution</span>
        </div>
      </div>
    </div>
  );
}
