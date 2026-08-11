"use client";

import React, { useState, useMemo, useEffect } from "react";
import MdiIcon from "@/components/MdiIcon";
import Results from "@/components/ui/Results";
import { mediaInventory } from "@/lib/data";
import CampaignResults from "@/components/CampaignResults";

// Import AI Goal-to-Channel logic and UI elements
import { getRecommendations, getBudgetAllocation, getExplanations } from "@/lib/LogicEngine";
import RecommendationCard from "@/components/ui/RecommendationCard";
import ChannelChip from "@/components/ui/ChannelChip";

const INDUSTRIES = [
  { label: "FMCG", value: "FMCG" },
  { label: "Fashion", value: "Fashion" },
  { label: "Technology", value: "Tech" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Healthcare", value: "Healthcare" }
];

const OBJECTIVES = [
  { label: "Brand Awareness", value: "Awareness" },
  { label: "Sales Conversion", value: "Sales" },
  { label: "App Installs", value: "App Downloads" },
  { label: "Lead Generation", value: "Lead Generation" }
];

const CHANNELS = [
  { label: "Television (TV)", value: "TV" },
  { label: "Out-of-Home (OOH)", value: "OOH" },
  { label: "Influencer Marketing", value: "Influencer" },
  { label: "Digital Media", value: "Digital" },
  { label: "Radio", value: "Radio" },
  { label: "Search Ads", value: "Search" }
];

export default function CampaignFilters() {
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // AI recommendations auto-apply state
  const [autoSelectEnabled, setAutoSelectEnabled] = useState(true);

  // Toggle selection helper
  const toggleSelect = (value, list, setList) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleClearAll = () => {
    setSelectedIndustries([]);
    setSelectedObjectives([]);
    setSelectedChannels([]);
    setAutoSelectEnabled(true);
    setHasGenerated(false);
  };

  // Dynamically compute recommendation parameters
  const recommendedChannels = useMemo(() => {
    return getRecommendations(selectedIndustries, selectedObjectives);
  }, [selectedIndustries, selectedObjectives]);

  const budgetAllocation = useMemo(() => {
    return getBudgetAllocation(selectedChannels, recommendedChannels);
  }, [selectedChannels, recommendedChannels]);

  const explanations = useMemo(() => {
    return getExplanations(selectedIndustries, selectedObjectives, recommendedChannels);
  }, [selectedIndustries, selectedObjectives, recommendedChannels]);

  // Sync recommended channels when they change (if autoSelect is enabled)
  const [prevRecChannels, setPrevRecChannels] = useState(recommendedChannels);
  if (recommendedChannels !== prevRecChannels) {
    setPrevRecChannels(recommendedChannels);
    if (autoSelectEnabled && recommendedChannels.length > 0) {
      setSelectedChannels(recommendedChannels);
    }
  }

  const handleChannelClick = (value) => {
    // When user manually configures selections, toggle off autoSelect
    setAutoSelectEnabled(false);
    if (selectedChannels.includes(value)) {
      setSelectedChannels(selectedChannels.filter((item) => item !== value));
    } else {
      setSelectedChannels([...selectedChannels, value]);
    }
  };

  const handleToggleAutoSelect = () => {
    const nextVal = !autoSelectEnabled;
    setAutoSelectEnabled(nextVal);
    if (nextVal && recommendedChannels.length > 0) {
      setSelectedChannels(recommendedChannels);
    }
  };

  // Filter Inventory based on selections
  const filteredResults = useMemo(() => {
    return mediaInventory.filter((item) => {
      const industryMatch = selectedIndustries.length === 0 || selectedIndustries.includes(item.industry);
      const objectiveMatch = selectedObjectives.length === 0 || selectedObjectives.includes(item.goal);
      const channelMatch = selectedChannels.length === 0 || selectedChannels.includes(item.media);
      return industryMatch && objectiveMatch && channelMatch;
    });
  }, [selectedIndustries, selectedObjectives, selectedChannels]);

  // Strategy Hint generation
  const activeHints = useMemo(() => {
    const hints = [];
    if (selectedObjectives.includes("Awareness")) {
      hints.push("TV and OOH are highly recommended to achieve maximum reach and brand recall.");
    }
    if (selectedObjectives.includes("Sales")) {
      hints.push("Influencer collaborations combined with Digital ad retargeting perform best for direct sale conversions.");
    }
    if (selectedObjectives.includes("App Downloads")) {
      hints.push("In-app advertising and influencer campaigns with custom promo codes maximize app download rates.");
    }
    if (selectedObjectives.includes("Lead Generation")) {
      hints.push("Digital search campaigns and social media lead forms combined with BTL activations generate high-quality inquiries.");
    }
    return hints;
  }, [selectedObjectives]);

  const hasSelections = selectedIndustries.length > 0 || selectedObjectives.length > 0 || selectedChannels.length > 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-fade-in">
      {/* Filters Glassmorphic Card Container */}
      <div 
        className="frost-glass rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        style={{
          border: "1px solid rgba(139, 92, 246, 0.15)",
          boxShadow: "0 0 50px rgba(139, 92, 246, 0.05), 0 0 50px rgba(59, 130, 246, 0.05), 0 20px 40px rgba(0, 0, 0, 0.4)"
        }}
      >
        {/* Glow Effects */}
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-violet-650/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

        {/* Header and Clear Action */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[var(--accent-primary)]">precision console</p>
            </div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-white via-[#B8C7D9] to-[var(--accent-primary)] bg-clip-text text-transparent mt-1">
              Campaign Filters
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Refine your media strategy with precision inputs
            </p>
          </div>

          {hasSelections && (
            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 border border-white/5 bg-white/5 hover:bg-rose-500/10 px-3.5 py-2 rounded-xl cursor-pointer"
            >
              <MdiIcon name="close-circle-outline" className="text-sm" /> Clear All
            </button>
          )}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Microcopy & Live Summary & Action */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Narrow your campaign direction by audience, outcome, and channel. Choose multiple criteria to filter the inventory.
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Select one or more options to generate a tailored media plan.
              </p>
            </div>

            {/* Live Summary Box */}
            {hasSelections && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 shadow-inner backdrop-blur-sm animate-scale-up">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[var(--accent-primary)]">
                  <MdiIcon name="file-document-edit-outline" className="text-xs" />
                  <span>Strategy Summary</span>
                </div>
                <div className="text-xs text-slate-300 space-y-2 max-h-36 overflow-y-auto">
                  {selectedIndustries.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Industries:</span>
                      <span className="text-slate-200">{selectedIndustries.map(v => INDUSTRIES.find(i=>i.value===v)?.label).join(", ")}</span>
                    </div>
                  )}
                  {selectedObjectives.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Objectives:</span>
                      <span className="text-slate-200">{selectedObjectives.map(v => OBJECTIVES.find(o=>o.value===v)?.label).join(", ")}</span>
                    </div>
                  )}
                  {selectedChannels.length > 0 && (
                    <div>
                      <span className="text-slate-500 font-bold block mb-0.5">Channels:</span>
                      <span className="text-slate-200">{selectedChannels.map(v => CHANNELS.find(c=>c.value===v)?.label).join(", ")}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Matched Assets</span>
                  <span className="font-extrabold text-[var(--accent-primary)]">{filteredResults.length} Placements</span>
                </div>
              </div>
            )}

            {/* Sticky Generate Button for Desktop */}
            <div className="hidden lg:block pt-4">
              <button
                onClick={() => setHasGenerated(true)}
                disabled={!hasSelections}
                className={`w-full rounded-2xl py-4 text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  hasSelections
                    ? "bg-gradient-to-r from-violet-600 via-indigo-650 to-blue-600 text-white shadow-violet-650/20 hover:shadow-violet-650/30 hover:scale-[1.02] hover:brightness-110"
                    : "bg-white/5 text-slate-500 cursor-not-allowed shadow-none"
                }`}
                style={hasSelections ? {
                  boxShadow: "0 0 25px rgba(139, 92, 246, 0.25)"
                } : {}}
              >
                <MdiIcon name="lightning-bolt" className="text-base animate-pulse" /> Generate Media Plan
              </button>
            </div>
          </div>

          {/* Right Column: Filter Groups */}
          <div className="lg:col-span-8 space-y-6">
            {/* Group 1: Industry */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-3">
                <MdiIcon name="office-building" className="text-slate-400 text-sm" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">1. Industry Context</h4>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {INDUSTRIES.map((ind) => {
                  const isSelected = selectedIndustries.includes(ind.value);
                  return (
                    <button
                      key={ind.value}
                      onClick={() => toggleSelect(ind.value, selectedIndustries, setSelectedIndustries)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-violet-600/35 to-blue-600/35 text-white border border-violet-500/50 scale-[1.03]"
                          : "border border-white/5 bg-white/5 text-slate-300 hover:border-blue-500/20 hover:bg-white/10 hover:-translate-y-0.5"
                      }`}
                      style={isSelected ? {
                        boxShadow: "0 0 12px rgba(139, 92, 246, 0.25)"
                      } : {}}
                    >
                      {isSelected && <MdiIcon name="check" className="text-xs text-[var(--accent-primary)]" />}
                      {ind.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2: Campaign Objective */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-3">
                <MdiIcon name="bullseye-arrow" className="text-slate-400 text-sm" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">2. Campaign Objective</h4>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {OBJECTIVES.map((obj) => {
                  const isSelected = selectedObjectives.includes(obj.value);
                  return (
                    <button
                      key={obj.value}
                      onClick={() => toggleSelect(obj.value, selectedObjectives, setSelectedObjectives)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-violet-600/35 to-blue-600/35 text-white border border-violet-500/50 scale-[1.03]"
                          : "border border-white/5 bg-white/5 text-slate-300 hover:border-blue-500/20 hover:bg-white/10 hover:-translate-y-0.5"
                      }`}
                      style={isSelected ? {
                        boxShadow: "0 0 12px rgba(139, 92, 246, 0.25)"
                      } : {}}
                    >
                      {isSelected && <MdiIcon name="check" className="text-xs text-[var(--accent-primary)]" />}
                      {obj.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Recommendation Card */}
            {recommendedChannels.length > 0 && (
              <RecommendationCard
                recommendedChannels={recommendedChannels}
                selectedChannels={selectedChannels}
                autoSelectEnabled={autoSelectEnabled}
                onToggleAutoSelect={handleToggleAutoSelect}
                budgetAllocation={budgetAllocation}
                explanations={explanations}
              />
            )}

            {/* Group 3: Media Channels */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors duration-300">
              <div className="flex items-center gap-2 mb-3">
                <MdiIcon name="rss" className="text-slate-400 text-sm" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">3. Media Channels</h4>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {CHANNELS.map((ch) => {
                  const isSelected = selectedChannels.includes(ch.value);
                  const isRecommended = recommendedChannels.includes(ch.value);
                  const alloc = budgetAllocation.find((a) => a.channel === ch.value);
                  const percentage = alloc ? alloc.percentage : null;
                  return (
                    <ChannelChip
                      key={ch.value}
                      label={ch.label}
                      value={ch.value}
                      isSelected={isSelected}
                      isRecommended={isRecommended}
                      percentage={percentage}
                      onClick={() => handleChannelClick(ch.value)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Mobile-only CTA */}
            <div className="block lg:hidden pt-4">
              <button
                onClick={() => setHasGenerated(true)}
                disabled={!hasSelections}
                className={`w-full rounded-2xl py-4 text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  hasSelections
                    ? "bg-gradient-to-r from-violet-600 via-indigo-650 to-blue-600 text-white shadow-violet-650/20 hover:shadow-violet-650/30"
                    : "bg-white/5 text-slate-500 cursor-not-allowed shadow-none"
                }`}
                style={hasSelections ? {
                  boxShadow: "0 0 25px rgba(139, 92, 246, 0.25)"
                } : {}}
              >
                <MdiIcon name="lightning-bolt" className="text-base" /> Generate Media Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Strategy Results Section */}
      {hasGenerated && (
        <CampaignResults
          selectedIndustries={selectedIndustries}
          selectedObjectives={selectedObjectives}
          selectedChannels={selectedChannels}
          onRefine={() => {
            setHasGenerated(false);
            const container = document.getElementById("campaign-filters");
            if (container) {
              container.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      )}
    </div>
  );
}
