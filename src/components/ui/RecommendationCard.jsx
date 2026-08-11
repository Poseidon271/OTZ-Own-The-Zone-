"use client";

import React, { useState } from "react";
import MdiIcon from "@/components/MdiIcon";

export default function RecommendationCard({
  recommendedChannels = [],
  selectedChannels = [],
  autoSelectEnabled = false,
  onToggleAutoSelect,
  budgetAllocation = [],
  explanations = []
}) {
  const [explainOpen, setExplainOpen] = useState(false);

  if (recommendedChannels.length === 0) return null;

  // Inline styling to guarantee premium glassmorphic aesthetics and bypass legacy CSS overrides
  const cardStyle = {
    background: "rgba(18, 24, 34, 0.65)",
    border: "1px solid rgba(139, 92, 246, 0.25)",
    boxShadow: "0 0 50px rgba(139, 92, 246, 0.08), 0 0 50px rgba(59, 130, 246, 0.08), 0 20px 40px rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)"
  };

  const badgeStyle = {
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
    border: "1px solid rgba(139, 92, 246, 0.4)",
    boxShadow: "0 0 15px rgba(139, 92, 246, 0.15)"
  };

  const channelNames = {
    TV: "Television (TV)",
    OOH: "Out-of-Home (OOH)",
    Influencer: "Influencer Marketing",
    Digital: "Digital Media",
    Search: "Search Ads",
    Radio: "Radio"
  };

  const colors = [
    "bg-violet-500", // Will map to frost-primary but custom bar styles bypass if needed
    "bg-blue-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-amber-500"
  ];

  const colorHexes = [
    "#8B5CF6", // violet
    "#3B82F6", // blue
    "#06B6D4", // cyan
    "#10B981", // emerald
    "#F59E0B"  // amber
  ];

  return (
    <div
      style={cardStyle}
      className="rounded-3xl p-6 sm:p-7 space-y-6 relative overflow-hidden transition-all duration-500 animate-scale-up border"
    >
      {/* Decorative neon ambient blobs inside the card */}
      <div
        className="absolute -top-24 -right-24 h-48 w-48 rounded-full blur-[80px] pointer-events-none"
        style={{ background: "rgba(139, 92, 246, 0.12)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-[80px] pointer-events-none"
        style={{ background: "rgba(59, 130, 246, 0.1)" }}
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-start gap-3">
          <div
            style={badgeStyle}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-violet-400"
          >
            <MdiIcon name="auto-fix" className="text-xl animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-400">AI recommendation</p>
            </div>
            <h3 className="text-xl font-black text-white mt-0.5">
              AI Recommended Channels
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Based on your campaign goal and industry benchmarks
            </p>
          </div>
        </div>

        {/* Toggle option */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-2.5 px-4.5 w-fit">
          <div className="text-left">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">Auto-Apply</span>
            <span className="text-xs font-bold text-slate-200 block">Sync Recommendations</span>
          </div>
          <button
            type="button"
            onClick={onToggleAutoSelect}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              autoSelectEnabled ? "bg-violet-600" : "bg-white/10"
            }`}
            style={autoSelectEnabled ? { backgroundColor: "#8B5CF6" } : {}}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                autoSelectEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Recommended chips list */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Recommended Mix</span>
        <div className="flex flex-wrap gap-2.5">
          {recommendedChannels.map((channel) => {
            const isSelected = selectedChannels.includes(channel);
            return (
              <div
                key={channel}
                className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold border"
                style={{
                  background: isSelected ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.03)",
                  borderColor: isSelected ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.08)",
                  boxShadow: isSelected ? "0 0 15px rgba(139, 92, 246, 0.25)" : "none",
                  color: isSelected ? "#fff" : "rgba(255, 255, 255, 0.7)"
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                <span>{channelNames[channel] || channel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auto Budget Weighting Visualization */}
      {budgetAllocation.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">AI Budget Weighting</span>
            <span className="text-[10px] text-slate-500 font-bold">Recommended channels receive priority</span>
          </div>

          <div className="space-y-2.5">
            {/* Segmented bar */}
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-white/5 border border-white/5 shadow-inner">
              {budgetAllocation.map((alloc, idx) => (
                <div
                  key={alloc.channel}
                  className="h-full"
                  style={{
                    width: `${alloc.percentage}%`,
                    background: colorHexes[idx % colorHexes.length]
                  }}
                  title={`${channelNames[alloc.channel] || alloc.channel}: ${alloc.percentage}%`}
                />
              ))}
            </div>

            {/* Micro Percent Labels */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {budgetAllocation.map((alloc, idx) => (
                <div key={alloc.channel} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorHexes[idx % colorHexes.length] }}
                  />
                  <span className="text-[11px] font-bold text-slate-200">
                    {channelNames[alloc.channel] || alloc.channel}:
                  </span>
                  <span className="text-[11px] font-black text-violet-400">
                    {alloc.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Explainability Accordion ("Why these channels?") */}
      {explanations.length > 0 && (
        <div className="pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={() => setExplainOpen(!explainOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white py-1 transition-colors cursor-pointer select-none"
          >
            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-400">
              <MdiIcon name="comment-question-outline" className="text-sm" /> Why these channels?
            </span>
            <MdiIcon
              name={explainOpen ? "chevron-up" : "chevron-down"}
              className="text-base transition-transform duration-200"
            />
          </button>

          {explainOpen && (
            <div className="mt-3.5 space-y-3 pl-1 animate-fade-in">
              {explanations.map((exp) => (
                <div
                  key={exp.channel}
                  className="p-3.5 rounded-2xl border bg-white/5 space-y-1"
                  style={{
                    borderColor: exp.isSpecific ? "rgba(139, 92, 246, 0.25)" : "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    <span className="text-xs font-black text-slate-200">
                      {channelNames[exp.channel] || exp.channel}
                    </span>
                    {exp.isSpecific && (
                      <span
                        className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                        style={{
                          background: "rgba(139, 92, 246, 0.25)",
                          color: "#c084fc",
                          border: "1px solid rgba(139, 92, 246, 0.3)"
                        }}
                      >
                        Targeted Overrides
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400 font-medium pl-3.5">
                    {exp.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Static premium Microcopy */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-white/5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
        <span>Recommended based on industry benchmarks</span>
        <span className="hidden sm:inline">&bull;</span>
        <span>Optimized for campaign goals</span>
        <span className="hidden sm:inline">&bull;</span>
        <span>Manual customizations allowed</span>
      </div>
    </div>
  );
}
