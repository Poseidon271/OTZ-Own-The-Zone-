"use client";

import React, { useState, useMemo } from "react";
import MdiIcon from "@/components/MdiIcon";

// Preserved digital LED pricing configuration for backward compatibility
export const DIGITAL_LED_CONFIG = {
  id: "digital_led",
  label: "Digital LED Screen",
  cpmLow: 80,
  cpmHigh: 190,
  icon: "monitor-dashboard",
};

// Media Type Configuration with realistic CPM rates (in INR)
// Exactly 8 selectable media types
const MEDIA_TYPES = [
  {
    id: "ooh",
    label: "Billboard / OOH / DOOH",
    cpmLow: 45,
    cpmHigh: 190,
    staticCpmLow: 45,
    staticCpmHigh: 110,
    digitalCpmLow: 80,
    digitalCpmHigh: 190,
    icon: "billboard",
  },
  {
    id: "transit",
    label: "Transit / Metro / Bus Wrap",
    cpmLow: 35,
    cpmHigh: 85,
    icon: "bus-clock",
  },
  {
    id: "radio",
    label: "Radio Slot",
    cpmLow: 50,
    cpmHigh: 130,
    icon: "radio-tower",
    audienceUnit: "listeners",
    sliderLabel: "3. Daily Listeners",
  },
  {
    id: "retail",
    label: "Mall / Retail Display",
    cpmLow: 70,
    cpmHigh: 170,
    icon: "storefront-outline",
  },
  {
    id: "cinema",
    label: "Cinema Screen",
    cpmLow: 110,
    cpmHigh: 240,
    icon: "movie-open",
  },
  {
    id: "print",
    label: "Print Media",
    icon: "newspaper-variant-outline",
    audienceUnit: "readers",
    sliderLabel: "3. Daily Readers / Circulation",
  },
  {
    id: "influencer",
    label: "Influencer Marketing",
    icon: "account-group",
    audienceUnit: "views",
    sliderLabel: "3. Daily Reach / Impressions",
  },
  {
    id: "events",
    label: "Events & IP",
    icon: "ticket-confirmation-outline",
    audienceUnit: "attendees",
    sliderLabel: "3. Daily Footfall / Attendees",
  },
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
  const [oohFormat, setOohFormat] = useState("all"); // "all" | "static" | "digital"

  const currentMedia = MEDIA_TYPES.find((m) => m.id === selectedMediaType) || MEDIA_TYPES[0];
  const isRadio = selectedMediaType === "radio";
  const audienceUnit = currentMedia.audienceUnit || (isRadio ? "listeners" : "views");
  const sliderLabel = currentMedia.sliderLabel || (isRadio ? "3. Daily Listeners" : "3. Daily Footfall / Impressions");

  // Recompute earnings estimates smoothly based on controls
  const earningsEstimate = useMemo(() => {
    const media = currentMedia;
    const tier = LOCATION_TIERS.find((t) => t.id === selectedTier) || LOCATION_TIERS[0];

    // Determine effective CPM rates
    let cpmLow = media.cpmLow;
    let cpmHigh = media.cpmHigh;

    if (media.id === "ooh") {
      if (oohFormat === "static") {
        cpmLow = media.staticCpmLow;
        cpmHigh = media.staticCpmHigh;
      } else if (oohFormat === "digital") {
        cpmLow = media.digitalCpmLow;
        cpmHigh = media.digitalCpmHigh;
      }
    }

    // If pricing is not configured for this media format, use the established fallback state
    if (typeof cpmLow !== "number" || typeof cpmHigh !== "number") {
      return {
        hasPricing: false,
        lowFormatted: null,
        highFormatted: null,
        statusText: "Rate Card on Request",
        message:
          "Algorithmic monthly CPM estimation is currently not configured for this media format. List your inventory to receive custom advertiser rate cards and direct corporate proposals.",
      };
    }

    const monthlyImpressions = dailyImpressions * 30;
    // Occupancy fill estimate: ~40% for low, ~75% for high demand
    const lowEst = (monthlyImpressions / 1000) * cpmLow * tier.multiplier * 0.40;
    const highEst = (monthlyImpressions / 1000) * cpmHigh * tier.multiplier * 0.75;

    return {
      hasPricing: true,
      lowFormatted: formatINR(lowEst),
      highFormatted: formatINR(highEst),
      rawLow: lowEst,
      rawHigh: highEst,
    };
  }, [currentMedia, selectedTier, dailyImpressions, oohFormat]);

  const handleClaimRevenue = () => {
    window.dispatchEvent(
      new CustomEvent("open-lead-popup", {
        detail: {
          intent: "host",
          mediaType: selectedMediaType,
          subType: selectedMediaType === "ooh" ? oohFormat : undefined,
        },
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
            {earningsEstimate.hasPricing ? "Live Algorithmic Rate" : "Custom Rate Card"}
          </span>
        </div>

        {/* 1. Media Type Selector - Accommodates all 8 options */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            1. Select Media Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MEDIA_TYPES.map((media) => {
              const isSelected = selectedMediaType === media.id;
              return (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => setSelectedMediaType(media.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-sans transition-all cursor-pointer min-h-[76px] ${
                    isSelected
                      ? "bg-[#FF5A1F]/15 border-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/10"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <MdiIcon
                    name={media.icon}
                    className={`text-xl mb-1 shrink-0 ${isSelected ? "text-[#FF5A1F]" : "text-slate-400"}`}
                  />
                  <span className="font-medium text-center leading-tight line-clamp-2 px-0.5">
                    {media.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Outdoor Format Sub-Selector (Preserves both Static Billboard and Digital LED Screen pricing rules) */}
        {selectedMediaType === "ooh" && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300">
                Outdoor Format Coverage
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {oohFormat === "all"
                  ? "₹45 – ₹190 CPM (Combined Static & DOOH)"
                  : oohFormat === "static"
                  ? "₹45 – ₹110 CPM (Traditional Static)"
                  : "₹80 – ₹190 CPM (Digital LED DOOH)"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setOohFormat("all")}
                className={`py-1.5 px-2 rounded font-sans transition-all cursor-pointer text-center ${
                  oohFormat === "all"
                    ? "bg-[#FF5A1F] text-[#0B1E3B] font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                All (Static + DOOH)
              </button>
              <button
                type="button"
                onClick={() => setOohFormat("static")}
                className={`py-1.5 px-2 rounded font-sans transition-all cursor-pointer text-center ${
                  oohFormat === "static"
                    ? "bg-[#FF5A1F] text-[#0B1E3B] font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                Static Billboards
              </button>
              <button
                type="button"
                onClick={() => setOohFormat("digital")}
                className={`py-1.5 px-2 rounded font-sans transition-all cursor-pointer text-center ${
                  oohFormat === "digital"
                    ? "bg-[#FF5A1F] text-[#0B1E3B] font-bold"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                Digital LED Screens
              </button>
            </div>
          </div>
        )}

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
              {sliderLabel}
            </label>
            <span className="tabular-nums font-mono font-bold text-sm text-[#FF5A1F] bg-[#FF5A1F]/10 px-2.5 py-0.5 rounded border border-[#FF5A1F]/20">
              {formatNumber(dailyImpressions)} {audienceUnit} / day
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
            <span>10,000 {audienceUnit}</span>
            <span>500,000 {audienceUnit}</span>
            <span>1,000,000+ {audienceUnit}</span>
          </div>
        </div>

        {/* Dynamic Calculation Output Card */}
        <div className="mt-6 pt-6 border-t border-white/10 bg-[#0B1E3B]/90 rounded-lg p-5 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                ESTIMATED MONTHLY EARNINGS
              </span>
              {earningsEstimate.hasPricing ? (
                <div className="tabular-nums font-bold text-2xl md:text-3xl text-white mt-1 tracking-tight">
                  {earningsEstimate.lowFormatted} – {earningsEstimate.highFormatted}{" "}
                  <span className="text-sm font-sans font-normal text-slate-400">/ mo</span>
                </div>
              ) : (
                <div className="mt-1 space-y-1">
                  <div className="font-bold text-2xl md:text-3xl text-white tracking-tight flex items-center gap-2">
                    <span>{earningsEstimate.statusText}</span>
                  </div>
                  <p className="text-xs text-slate-400 max-w-md">
                    {earningsEstimate.message}
                  </p>
                </div>
              )}
            </div>
            <div className="text-right sm:text-right text-[11px] font-mono text-emerald-400 flex items-center sm:justify-end gap-1 shrink-0">
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
