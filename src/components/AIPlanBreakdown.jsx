"use client";

import React, { useState, useEffect, useMemo } from "react";
import MdiIcon from "@/components/MdiIcon";

// Default channel definitions
const INITIAL_CHANNELS = [
  {
    id: "ooh",
    name: "OOH & Billboards",
    icon: "billboard",
    color: "#FF5A1F",
    share: 40,
    locked: false,
    excluded: false,
    reachMultiplier: 4.8, // Unique reach per rupee allocated
    impressionMultiplier: 13.6,
    defaultRationale:
      "High-visibility premium outdoor placements across major transit corridors provide max brand recall and top-of-mind dominance.",
  },
  {
    id: "digital",
    name: "Digital & OTT Media",
    icon: "cellphone-play",
    color: "#84CC16",
    share: 25,
    locked: false,
    excluded: false,
    reachMultiplier: 5.2,
    impressionMultiplier: 15.0,
    defaultRationale:
      "Targeted video interstitials & banner placements across high-engagement OTT platforms and digital news networks.",
  },
  {
    id: "transit",
    name: "Transit Advertising",
    icon: "bus-side",
    color: "#06B6D4",
    share: 20,
    locked: false,
    excluded: false,
    reachMultiplier: 4.2,
    impressionMultiplier: 11.8,
    defaultRationale:
      "Metro station wraps, bus shelter ads, and fleet wraps offering repeated daily commuter touchpoints.",
  },
  {
    id: "radio",
    name: "Radio & Audio Spots",
    icon: "radio-handheld",
    color: "#A855F7",
    share: 15,
    locked: false,
    excluded: false,
    reachMultiplier: 3.6,
    impressionMultiplier: 9.2,
    defaultRationale:
      "Prime time audio spots on leading regional FM stations capturing drive-time audiences and local shoppers.",
  },
];

// Scenario presets
const SCENARIOS = [
  {
    id: "maximize_reach",
    label: "Maximize Reach",
    icon: "bullhorn-outline",
    weights: { ooh: 50, digital: 25, transit: 15, radio: 10 },
    description: "Prioritize mass OOH and digital video placements for maximum unique audience coverage.",
  },
  {
    id: "hyperlocal",
    label: "High Frequency / Hyperlocal",
    icon: "map-marker-radius-outline",
    weights: { ooh: 25, digital: 20, transit: 40, radio: 15 },
    description: "Focus on transit networks & localized audio to build high repeat frequency in target hubs.",
  },
  {
    id: "cost_optimized",
    label: "Cost Optimized",
    icon: "lightning-bolt-outline",
    weights: { ooh: 20, digital: 45, transit: 15, radio: 20 },
    description: "Maximize digital CPM efficiencies and FM spots for high ROI within budget constraints.",
  },
];

export default function AIPlanBreakdown({
  plannerState = {},
  planningResults = null,
  onAddPackageToBag,
  onAdjustIntake,
  triggerToast,
}) {
  const totalBudget = useMemo(() => {
    return Number(plannerState?.totalBudget) || 500000;
  }, [plannerState]);

  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [activeScenario, setActiveScenario] = useState("maximize_reach");

  // Format currency
  const formatINR = (val) => {
    return `₹${Math.round(val).toLocaleString("en-IN")}`;
  };

  // Format metric numbers (e.g. 2.4M, 850K)
  const formatCompactMetric = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toLocaleString("en-IN");
  };

  // Compute total reach & impressions based on allocated channel budgets
  const summaryMetrics = useMemo(() => {
    let totalReach = 0;
    let totalImpressions = 0;

    channels.forEach((ch) => {
      if (!ch.excluded) {
        const chBudget = (ch.share / 100) * totalBudget;
        totalReach += chBudget * (ch.reachMultiplier / 1000);
        totalImpressions += chBudget * (ch.impressionMultiplier / 1000);
      }
    });

    return {
      blendedReach: Math.round(totalReach),
      totalImpressions: Math.round(totalImpressions),
    };
  }, [channels, totalBudget]);

  // Rebalance channel shares when one channel slider changes
  const handleSliderChange = (changedId, newShareVal) => {
    const targetVal = Math.max(0, Math.min(100, Number(newShareVal)));

    setChannels((prevChannels) => {
      const changedChannel = prevChannels.find((c) => c.id === changedId);
      if (!changedChannel || changedChannel.locked || changedChannel.excluded) {
        return prevChannels;
      }

      // Calculate total share of other active & unlocked channels
      const otherUnlocked = prevChannels.filter(
        (c) => c.id !== changedId && !c.locked && !c.excluded
      );

      if (otherUnlocked.length === 0) {
        return prevChannels;
      }

      const totalLockedOrExcluded = prevChannels
        .filter((c) => c.id !== changedId && (c.locked || c.excluded))
        .reduce((sum, c) => sum + (c.excluded ? 0 : c.share), 0);

      // Max allowed for this channel
      const maxAllowed = 100 - totalLockedOrExcluded;
      const actualTarget = Math.min(targetVal, maxAllowed);

      const delta = actualTarget - changedChannel.share;
      const currentOtherTotal = otherUnlocked.reduce((sum, c) => sum + c.share, 0);

      const updated = prevChannels.map((ch) => {
        if (ch.id === changedId) {
          return { ...ch, share: actualTarget };
        }
        if (ch.locked || ch.excluded) {
          return ch;
        }

        let newShare = ch.share;
        if (currentOtherTotal > 0) {
          const ratio = ch.share / currentOtherTotal;
          newShare = Math.max(0, ch.share - delta * ratio);
        } else {
          newShare = Math.max(0, (100 - actualTarget - totalLockedOrExcluded) / otherUnlocked.length);
        }
        return { ...ch, share: Math.round(newShare * 10) / 10 };
      });

      // Normalize to ensure exact 100% sum
      const totalSum = updated.reduce((sum, c) => sum + (c.excluded ? 0 : c.share), 0);
      if (Math.abs(totalSum - 100) > 0.01 && otherUnlocked.length > 0) {
        const diff = 100 - totalSum;
        const firstUnlockedIndex = updated.findIndex(
          (c) => c.id !== changedId && !c.locked && !c.excluded
        );
        if (firstUnlockedIndex !== -1) {
          updated[firstUnlockedIndex].share = Math.max(
            0,
            Math.round((updated[firstUnlockedIndex].share + diff) * 10) / 10
          );
        }
      }

      return updated;
    });
  };

  // Toggle channel lock state
  const toggleLock = (channelId) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, locked: !c.locked } : c))
    );
  };

  // Toggle channel exclude state
  const toggleExclude = (channelId) => {
    setChannels((prev) => {
      const target = prev.find((c) => c.id === channelId);
      if (!target) return prev;

      const WillBeExcluded = !target.excluded;
      const releasedShare = target.share;

      const activeOthers = prev.filter(
        (c) => c.id !== channelId && !c.excluded && !c.locked
      );

      if (WillBeExcluded && activeOthers.length === 0) {
        return prev; // Cannot exclude if no other unlocked channels exist
      }

      return prev.map((c) => {
        if (c.id === channelId) {
          return { ...c, excluded: WillBeExcluded, share: WillBeExcluded ? 0 : 15, locked: false };
        }
        if (!WillBeExcluded) {
          return c; // Keep existing when unexcluding
        }
        if (c.locked || c.excluded) {
          return c;
        }
        const otherSum = activeOthers.reduce((sum, item) => sum + item.share, 0);
        const addShare = otherSum > 0 ? (c.share / otherSum) * releasedShare : releasedShare / activeOthers.length;
        return { ...c, share: Math.round((c.share + addShare) * 10) / 10 };
      });
    });
  };

  // Apply scenario prompt variation
  const applyScenario = (scenario) => {
    setActiveScenario(scenario.id);
    setChannels((prev) =>
      prev.map((c) => {
        const newWeight = scenario.weights[c.id] || 0;
        return { ...c, share: newWeight, locked: false, excluded: false };
      })
    );
    if (triggerToast) {
      triggerToast(`Applied "${scenario.label}" AI scenario weighting`);
    }
  };

  // Export shareable plan
  const handleExportPlan = () => {
    if (triggerToast) {
      triggerToast("✓ Generating shareable media plan PDF & link...");
    }
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.print();
      }
    }, 400);
  };

  // Custom AI Rationale tailored to planner intake parameters
  const getCustomRationale = (ch) => {
    const objective = plannerState?.campaignObjective || "Brand Awareness & Reach";
    const sector = plannerState?.industrySector || "Fintech";
    const cities = plannerState?.targetCities?.join(", ") || "Target Markets";

    if (ch.id === "ooh") {
      return `Allocated ${ch.share}% budget for high-impact billboards in ${cities} to drive ${objective.toLowerCase()} for ${sector}.`;
    }
    if (ch.id === "digital") {
      return `Allocated ${ch.share}% to targeted video & interstitial ads capturing high-intent ${sector} consumers online.`;
    }
    if (ch.id === "transit") {
      return `Allocated ${ch.share}% to transit shelters & metro networks in ${cities} for high daily repeat exposure.`;
    }
    if (ch.id === "radio") {
      return `Allocated ${ch.share}% to regional drive-time audio spots for local market frequency.`;
    }
    return ch.defaultRationale;
  };

  return (
    <div className="w-full space-y-8 text-left font-sans animate-fade-in">
      
      {/* 1. DYNAMIC PLAN SUMMARY BAR (STAGE 2 HEADER METRICS) */}
      <div className="rounded-[10px] bg-[#0B1E3B] border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#FF5A1F]/20 text-[#FF5A1F] text-[10px] font-mono font-bold px-2.5 py-1 rounded border border-[#FF5A1F]/30 uppercase">
                {plannerState?.campaignObjective || "Brand Awareness"}
              </span>
              <span className="bg-white/10 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase">
                {plannerState?.flightDuration || "1 Month"}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase">
                Start: {plannerState?.startDate || "Upcoming"}
              </span>
              {plannerState?.creativeReadiness === "need_production" && (
                <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase">
                  + OTZ Production Assistance
                </span>
              )}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white font-display">
              Stage 2: AI Media Mix Strategy Breakdown
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              Markets: <span className="font-semibold text-white">{plannerState?.targetCities?.join(", ") || "Pan-India"}</span> &bull; Sector: <span className="font-semibold text-white">{plannerState?.industrySector || "All"}</span> &bull; Target Audience: <span className="font-semibold text-white">{plannerState?.targetAudience?.join(", ") || "General Consumers"}</span>
            </p>
          </div>

          {/* Adjust Intake Button */}
          <button
            type="button"
            onClick={onAdjustIntake}
            className="inline-flex items-center gap-2 rounded-[6px] border border-white/15 bg-[#132A4F] hover:bg-[#183665] px-4 py-2.5 text-xs font-bold text-white cursor-pointer transition-all shadow-sm self-start lg:self-auto"
          >
            <MdiIcon name="cog-outline" className="text-base text-[#FF5A1F]" />
            <span>Adjust Intake Parameters</span>
          </button>
        </div>

        {/* SUMMARY METRICS GRID (TABULAR-NUMS FONT-MONO) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Total Budget */}
          <div className="bg-[#132A4F] rounded-[8px] p-4 border border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Total Allocated Budget
            </span>
            <div className="text-2xl md:text-3xl font-black text-[#FF5A1F] tabular-nums font-mono">
              {formatINR(totalBudget)}
            </div>
            <span className="text-[10px] text-slate-400 font-sans">
              100% allocated across {channels.filter((c) => !c.excluded).length} channels
            </span>
          </div>

          {/* Projected Reach */}
          <div className="bg-[#132A4F] rounded-[8px] p-4 border border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Projected Blended Reach
            </span>
            <div className="text-2xl md:text-3xl font-black text-[#84CC16] tabular-nums font-mono">
              {formatCompactMetric(summaryMetrics.blendedReach)}{" "}
              <span className="text-xs font-normal text-slate-300">consumers</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">
              Unique reach estimate for targeted markets
            </span>
          </div>

          {/* Estimated Impressions */}
          <div className="bg-[#132A4F] rounded-[8px] p-4 border border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
              Estimated Impressions
            </span>
            <div className="text-2xl md:text-3xl font-black text-white tabular-nums font-mono">
              {formatCompactMetric(summaryMetrics.totalImpressions)}{" "}
              <span className="text-xs font-normal text-slate-300">views</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">
              Cumulative ad impressions across flight
            </span>
          </div>

        </div>
      </div>

      {/* 2. STAGE 3: INTERACTIVE REBALANCER & SCENARIO COMPARATOR */}
      <div className="rounded-[10px] bg-[#0B1E3B] border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6">
        
        {/* Stage 3 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#84CC16]/10 border border-[#84CC16]/30 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#84CC16]">
              <MdiIcon name="tune-vertical" className="text-xs" /> Stage 3: Refine & Rebalance Mix
            </span>
            <h4 className="text-xl font-black text-white font-display mt-1.5">
              Live Channel Budget Rebalancer
            </h4>
            <p className="text-xs text-slate-300 font-sans">
              Drag sliders to adjust channel weights. Total allocation automatically rebalances to 100%.
            </p>
          </div>

          {/* Scenario Variations */}
          <div className="flex flex-wrap items-center gap-2">
            {SCENARIOS.map((sc) => {
              const isActive = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => applyScenario(sc)}
                  className={`rounded-[6px] px-3 py-1.5 text-xs font-sans font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-[#FF5A1F] text-[#0B1E3B] border-[#FF5A1F] shadow-md"
                      : "bg-[#132A4F] text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                  }`}
                  title={sc.description}
                >
                  <MdiIcon name={sc.icon} className="text-xs" />
                  <span>{sc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CHANNEL SLIDERS & CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((ch) => {
            const chBudget = (ch.share / 100) * totalBudget;
            const chReach = Math.round(chBudget * (ch.reachMultiplier / 1000));

            return (
              <div
                key={ch.id}
                className={`rounded-[8px] p-5 border transition-all flex flex-col justify-between space-y-4 ${
                  ch.excluded
                    ? "bg-[#132A4F]/40 border-white/5 opacity-50"
                    : "bg-[#132A4F] border-white/10 shadow-lg hover:border-white/20"
                }`}
              >
                <div>
                  {/* Channel Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-8 rounded-md flex items-center justify-center font-bold"
                        style={{ backgroundColor: `${ch.color}20`, color: ch.color }}
                      >
                        <MdiIcon name={ch.icon} className="text-lg" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                          {ch.name}
                          {ch.locked && (
                            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono font-bold">
                              LOCKED 🔒
                            </span>
                          )}
                          {ch.excluded && (
                            <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded font-mono font-bold">
                              EXCLUDED ✕
                            </span>
                          )}
                        </h5>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Est. Reach: {formatCompactMetric(chReach)}
                        </span>
                      </div>
                    </div>

                    {/* Share Percentage Badge */}
                    <div className="text-right">
                      <div
                        className="text-lg font-black font-mono tabular-nums"
                        style={{ color: ch.excluded ? "#94A3B8" : ch.color }}
                      >
                        {ch.share.toFixed(1)}%
                      </div>
                      <div className="text-xs font-mono font-bold text-white tabular-nums">
                        {formatINR(chBudget)}
                      </div>
                    </div>
                  </div>

                  {/* Visual Share Bar */}
                  <div className="w-full bg-[#0B1E3B] h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full transition-all duration-300 rounded-full"
                      style={{
                        width: `${ch.excluded ? 0 : ch.share}%`,
                        backgroundColor: ch.color,
                      }}
                    />
                  </div>

                  {/* Range Slider Controls */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.5"
                      disabled={ch.locked || ch.excluded}
                      value={ch.share}
                      onChange={(e) => handleSliderChange(ch.id, e.target.value)}
                      className="w-full accent-[#FF5A1F] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    />

                    {/* Action Controls: Lock & Exclude Switches */}
                    <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
                      {/* Lock Toggle */}
                      <button
                        type="button"
                        disabled={ch.excluded}
                        onClick={() => toggleLock(ch.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors border ${
                          ch.locked
                            ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                            : "bg-[#0B1E3B] text-slate-300 border-white/10 hover:text-white"
                        }`}
                      >
                        <MdiIcon name={ch.locked ? "lock" : "lock-open-outline"} className="text-xs" />
                        <span>{ch.locked ? "Unlock" : "Lock Share"}</span>
                      </button>

                      {/* Exclude Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExclude(ch.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors border ${
                          ch.excluded
                            ? "bg-red-500/20 text-red-300 border-red-500/40"
                            : "bg-[#0B1E3B] text-slate-300 border-white/10 hover:text-red-400"
                        }`}
                      >
                        <MdiIcon name={ch.excluded ? "plus" : "close"} className="text-xs" />
                        <span>{ch.excluded ? "Include Channel" : "Exclude"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI MIX RATIONALE BLOCK */}
                <div className="p-3 bg-[#0B1E3B]/60 rounded-[6px] border border-white/5 text-[11px] text-slate-300 font-sans leading-relaxed">
                  <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#FF5A1F] block mb-0.5 flex items-center gap-1">
                    <MdiIcon name="auto-fix" className="text-xs" /> AI Mix Rationale
                  </span>
                  {getCustomRationale(ch)}
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTION CTA ROW */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Export Shareable Plan */}
          <button
            type="button"
            onClick={handleExportPlan}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[6px] border border-white/15 bg-[#132A4F] hover:bg-[#183665] px-5 py-3 text-xs font-bold text-white cursor-pointer transition-all shadow-sm font-sans"
          >
            <MdiIcon name="file-pdf-box" className="text-base text-red-400" />
            <span>Export Shareable Plan (PDF / Link)</span>
          </button>

          {/* Add Recommended Package to Bag */}
          <button
            type="button"
            onClick={() => {
              if (onAddPackageToBag && planningResults?.bundle) {
                onAddPackageToBag(planningResults.bundle);
              }
            }}
            className="w-full sm:w-auto bg-[#FF5A1F] text-[#0B1E3B] font-bold h-[44px] px-6 rounded-[6px] hover:opacity-90 cursor-pointer border-none flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-[#FF5A1F]/30"
          >
            <MdiIcon name="shopping-outline" className="text-base font-bold" />
            <span>ADD RECOMMENDED PACKAGE TO BAG</span>
          </button>

        </div>

      </div>

    </div>
  );
}
