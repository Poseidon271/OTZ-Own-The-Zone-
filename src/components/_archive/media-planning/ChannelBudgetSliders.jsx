"use client";

import React, { useState, useMemo } from "react";
import MdiIcon from "@/components/MdiIcon";

export const INITIAL_CHANNELS = [
  {
    id: "ooh",
    name: "OOH & Billboards",
    icon: "billboard",
    color: "#FF5A1F",
    share: 40,
    locked: false,
    excluded: false,
    reachMultiplier: 4.8,
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

export const SCENARIOS = [
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

export default function ChannelBudgetSliders({
  totalBudget = 500000,
  plannerState = {},
  onChannelsChange,
  triggerToast,
}) {
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [activeScenario, setActiveScenario] = useState("maximize_reach");

  const formatINR = (val) => `₹${Math.round(val).toLocaleString("en-IN")}`;
  const formatCompactMetric = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString("en-IN");
  };

  const handleSliderChange = (changedId, newShareVal) => {
    const targetVal = Math.max(0, Math.min(100, Number(newShareVal)));

    setChannels((prevChannels) => {
      const changedChannel = prevChannels.find((c) => c.id === changedId);
      if (!changedChannel || changedChannel.locked || changedChannel.excluded) {
        return prevChannels;
      }

      const otherUnlocked = prevChannels.filter(
        (c) => c.id !== changedId && !c.locked && !c.excluded
      );

      if (otherUnlocked.length === 0) return prevChannels;

      const totalLockedOrExcluded = prevChannels
        .filter((c) => c.id !== changedId && (c.locked || c.excluded))
        .reduce((sum, c) => sum + (c.excluded ? 0 : c.share), 0);

      const maxAllowed = 100 - totalLockedOrExcluded;
      const actualTarget = Math.min(targetVal, maxAllowed);
      const delta = actualTarget - changedChannel.share;
      const currentOtherTotal = otherUnlocked.reduce((sum, c) => sum + c.share, 0);

      const updated = prevChannels.map((ch) => {
        if (ch.id === changedId) return { ...ch, share: actualTarget };
        if (ch.locked || ch.excluded) return ch;

        let newShare = ch.share;
        if (currentOtherTotal > 0) {
          const ratio = ch.share / currentOtherTotal;
          newShare = Math.max(0, ch.share - delta * ratio);
        } else {
          newShare = Math.max(0, (100 - actualTarget - totalLockedOrExcluded) / otherUnlocked.length);
        }
        return { ...ch, share: Math.round(newShare * 10) / 10 };
      });

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

      if (onChannelsChange) onChannelsChange(updated);
      return updated;
    });
  };

  const toggleLock = (channelId) => {
    setChannels((prev) => {
      const updated = prev.map((c) => (c.id === channelId ? { ...c, locked: !c.locked } : c));
      if (onChannelsChange) onChannelsChange(updated);
      return updated;
    });
  };

  const toggleExclude = (channelId) => {
    setChannels((prev) => {
      const target = prev.find((c) => c.id === channelId);
      if (!target) return prev;

      const WillBeExcluded = !target.excluded;
      const releasedShare = target.share;
      const activeOthers = prev.filter((c) => c.id !== channelId && !c.excluded && !c.locked);

      if (WillBeExcluded && activeOthers.length === 0) return prev;

      const updated = prev.map((c) => {
        if (c.id === channelId) {
          return { ...c, excluded: WillBeExcluded, share: WillBeExcluded ? 0 : 15, locked: false };
        }
        if (!WillBeExcluded || c.locked || c.excluded) return c;
        const otherSum = activeOthers.reduce((sum, item) => sum + item.share, 0);
        const addShare = otherSum > 0 ? (c.share / otherSum) * releasedShare : releasedShare / activeOthers.length;
        return { ...c, share: Math.round((c.share + addShare) * 10) / 10 };
      });

      if (onChannelsChange) onChannelsChange(updated);
      return updated;
    });
  };

  const applyScenario = (scenario) => {
    setActiveScenario(scenario.id);
    setChannels((prev) => {
      const updated = prev.map((c) => ({
        ...c,
        share: scenario.weights[c.id] || 0,
        locked: false,
        excluded: false,
      }));
      if (onChannelsChange) onChannelsChange(updated);
      return updated;
    });
    if (triggerToast) triggerToast(`Applied "${scenario.label}" AI scenario weighting`);
  };

  return (
    <div className="rounded-[10px] bg-[#0B1E3B] border border-white/10 p-6 md:p-8 backdrop-blur-md shadow-2xl space-y-6 text-left font-sans">
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

                <div className="w-full bg-[#0B1E3B] h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${ch.excluded ? 0 : ch.share}%`,
                      backgroundColor: ch.color,
                    }}
                  />
                </div>

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

                  <div className="flex items-center justify-between text-xs font-mono text-slate-300 pt-1">
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

              <div className="p-3 bg-[#0B1E3B]/60 rounded-[6px] border border-white/5 text-[11px] text-slate-300 font-sans leading-relaxed">
                <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#FF5A1F] block mb-0.5 flex items-center gap-1">
                  <MdiIcon name="auto-fix" className="text-xs" /> AI Mix Rationale
                </span>
                Allocated {ch.share}% budget for targeted placements to drive campaign goals.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
