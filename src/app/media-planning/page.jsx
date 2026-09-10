"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BagDrawer from "@/components/BagDrawer";
import MdiIcon from "@/components/MdiIcon";
import MediaDetailModal from "@/components/MediaDetailModal";
import CompareModal from "@/components/CompareModal";
import MediaPlanner from "@/components/MediaPlanner";
import AIPlanBreakdown from "@/components/AIPlanBreakdown";
import { useBag } from "@/context/BagContext";
import { mockAdvertisingAssets } from "@/data/mockData";

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { VercelCard } from "@/components/scrollx/vercel-card";

export default function MediaPlanningPage() {
  const router = useRouter();
  const { addToBag, addItemsToBag, removeFromBag, isInBag, setIsBagOpen } = useBag();

  // Wizard parameters states
  const [plannerInputState, setPlannerInputState] = useState(null);

  // Lightweight planning intake popup states
  const [planningIntakeOpen, setPlanningIntakeOpen] = useState(false);
  const [intakeObjective, setIntakeObjective] = useState("Brand Awareness & Reach");
  const [intakeSector, setIntakeSector] = useState("Fintech");
  const [intakeAudience, setIntakeAudience] = useState("Working Professionals");
  const [intakeBudget, setIntakeBudget] = useState("₹2L - ₹10L");

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("otz_planning_intake_dismissed");
    if (!isDismissed) {
      setPlanningIntakeOpen(true);
    }
  }, []);

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem("otz_planning_intake_dismissed", "true");

    let rawBudget = 500000;
    if (intakeBudget === "₹10K - ₹50K") rawBudget = 50000;
    else if (intakeBudget === "₹50K - ₹2L") rawBudget = 200000;
    else if (intakeBudget === "₹2L - ₹10L") rawBudget = 500000;
    else if (intakeBudget === "₹10L+") rawBudget = 1000000;

    const popupState = {
      industrySector: intakeSector || "Fintech",
      targetAudience: [intakeAudience || "Working Professionals"],
      targetCities: ["Mumbai (MMR)", "Bengaluru"],
      campaignObjective: intakeObjective || "Brand Awareness & Reach",
      totalBudget: rawBudget,
      startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      flightDuration: "1 Month",
      creativeReadiness: "ready",
    };

    setPlanningIntakeOpen(false);
    handleGeneratePlan(popupState);
  };

  const handleIntakeSkip = () => {
    sessionStorage.setItem("otz_planning_intake_dismissed", "true");
    setPlanningIntakeOpen(false);
  };

  // Recommendations state coordinates
  const [planningStep, setPlanningStep] = useState(1);
  const [planningResults, setPlanningResults] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleAddPackageToBag = (itemsList) => {
    const bundleItems = itemsList || planningResults?.bundle || [];
    if (!bundleItems || bundleItems.length === 0) return;
    const duration = planningResults?.duration || 1;
    addItemsToBag(bundleItems, duration);
    triggerToast(`✓ Added all ${bundleItems.length} recommended placements to your campaign bag`);
    setIsBagOpen(true);
  };

  // Modals state
  const [activeDetailAsset, setActiveDetailAsset] = useState(null);
  const [selectedCompareAssets, setSelectedCompareAssets] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Filter listings based on user parameters and calculate allocation mixes
  const handleGeneratePlan = (submittedInputState) => {
    if (loadingPlan) return;
    setLoadingPlan(true);
    setPlannerInputState(submittedInputState);

    setTimeout(() => {
      const maxBudgetVal = parseFloat(submittedInputState.totalBudget) || 500000;
      
      // Calculate flight duration multiplier in months
      let durationMonths = 1.0;
      if (submittedInputState.flightDuration === "1 Week") durationMonths = 0.25;
      else if (submittedInputState.flightDuration === "2 Weeks") durationMonths = 0.5;
      else if (submittedInputState.flightDuration === "1 Month") durationMonths = 1.0;
      else if (submittedInputState.flightDuration === "3 Months") durationMonths = 3.0;

      const selectedCities = submittedInputState.targetCities || [];
      const selectedAudiences = submittedInputState.targetAudience || [];
      const selectedSector = submittedInputState.industrySector || "";

      // Helper function to check city match
      const isCityMatch = (assetLocation) => {
        if (!selectedCities.length || selectedCities.includes("Pan-India National Grid")) return true;
        if (!assetLocation) return false;
        const locLower = assetLocation.toLowerCase();
        return (
          selectedCities.some((c) => {
            const cityClean = c.split(" ")[0].toLowerCase();
            return locLower.includes(cityClean);
          }) ||
          locLower.includes("national") ||
          locLower.includes("pan-india")
        );
      };

      // Filter matching assets
      const matchingListings = mockAdvertisingAssets.filter((asset) => {
        const matchCity = isCityMatch(asset.location);
        const matchSector = !selectedSector || (asset.productSector && asset.productSector.toLowerCase() === selectedSector.toLowerCase());
        const matchAudience = !selectedAudiences.length || selectedAudiences.some((aud) => 
          asset.targetAudience && asset.targetAudience.toLowerCase().includes(aud.toLowerCase())
        );
        return matchCity && (matchSector || matchAudience);
      });

      const candidateListings = matchingListings.length > 0 ? matchingListings : mockAdvertisingAssets;

      // Greedy allocation solver
      let currentCost = 0;
      const bundleItems = [];
      const sortedByReach = [...candidateListings].sort((a, b) => {
        const reachA = parseInt(a.reach?.replace(/[^0-9]/g, "")) || 0;
        const reachB = parseInt(b.reach?.replace(/[^0-9]/g, "")) || 0;
        return reachB - reachA;
      });

      for (const asset of sortedByReach) {
        const assetCost = Math.round(asset.price * durationMonths);
        if (currentCost + assetCost <= maxBudgetVal || bundleItems.length === 0) {
          bundleItems.push({
            id: asset.id,
            title: asset.title,
            location: asset.location,
            reach: asset.reach,
            price: asset.price,
            dailyRate: asset.price,
            duration: durationMonths,
            calculatedCost: assetCost,
            image: asset.image,
            category: asset.category || "Mass Media",
            subCategory: asset.subCategory || "OOH",
            channelDomain: asset.subCategory || asset.category || "Mass Media",
            specs: asset.specs || "Standard placement spec size",
          });
          currentCost += assetCost;
        }
      }

      // Scored alternatives
      const scoredAlternatives = mockAdvertisingAssets
        .map((asset) => {
          let score = 0;
          let reasons = [];

          if (isCityMatch(asset.location)) {
            score += 4;
            reasons.push("Target market match");
          }
          if (asset.productSector && selectedSector && asset.productSector.toLowerCase() === selectedSector.toLowerCase()) {
            score += 3;
            reasons.push("Sector match");
          }
          if (selectedAudiences.some((aud) => asset.targetAudience && asset.targetAudience.toLowerCase().includes(aud.toLowerCase()))) {
            score += 3;
            reasons.push("Audience match");
          }
          const assetCost = Math.round(asset.price * durationMonths);
          if (assetCost <= maxBudgetVal) {
            score += 2;
            reasons.push("Within budget limit");
          }

          return {
            id: asset.id,
            title: asset.title,
            location: asset.location,
            reach: asset.reach,
            price: asset.price,
            dailyRate: asset.price,
            duration: durationMonths,
            calculatedCost: assetCost,
            image: asset.image,
            category: asset.category || "Mass Media",
            subCategory: asset.subCategory || "OOH",
            channelDomain: asset.subCategory || asset.category || "Mass Media",
            specs: asset.specs || "Standard placement spec size",
            score,
            reasons: reasons.length > 0 ? reasons : ["Recommended media space"],
          };
        })
        .filter((asset) => !bundleItems.some((b) => b.id === asset.id))
        .sort((a, b) => b.score - a.score);

      const allMatchesFormatted = candidateListings.map((l) => ({
        id: l.id,
        title: l.title,
        location: l.location,
        reach: l.reach,
        price: l.price,
        dailyRate: l.price,
        duration: durationMonths,
        image: l.image,
        category: l.category || "Mass Media",
        subCategory: l.subCategory || "OOH",
        channelDomain: l.subCategory || l.category || "Mass Media",
        specs: l.specs || "Standard placement spec size",
      }));

      setPlanningResults({
        bundle: bundleItems,
        totalCost: currentCost,
        maxBudget: maxBudgetVal,
        duration: durationMonths,
        flightDurationLabel: submittedInputState.flightDuration,
        startDate: submittedInputState.startDate,
        objective: submittedInputState.campaignObjective,
        creativeReadiness: submittedInputState.creativeReadiness,
        cities: selectedCities,
        sector: selectedSector,
        audiences: selectedAudiences,
        alternatives: scoredAlternatives.slice(0, 4),
        allMatches: allMatchesFormatted,
      });

      setLoadingPlan(false);
      setPlanningStep(2);
      triggerToast("✓ AI Media Mix Generated Successfully!");
    }, 600);
  };

  const toggleCompareAsset = (asset) => {
    if (selectedCompareAssets.some((item) => item.id === asset.id)) {
      setSelectedCompareAssets(selectedCompareAssets.filter((item) => item.id !== asset.id));
    } else {
      if (selectedCompareAssets.length >= 3) {
        alert("You can compare up to 3 assets side-by-side.");
        return;
      }
      setSelectedCompareAssets([...selectedCompareAssets, asset]);
    }
  };

  return (
    <div className="theme-dark min-h-screen relative flex flex-col bg-[#0B1E3B] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Background Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Ambient Glow Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 95% 35%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 5% 75%, rgba(19, 42, 79, 0.25) 0%, transparent 55%)",
        }}
      />

      {/* Navbar Component */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* Sliding Sidebar Drawer */}
      <BagDrawer />

      <main className="flex-grow no-print pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          
          {/* Top Return Button */}
          <button
            onClick={() => router.push("/")}
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[rgba(184,199,217,0.18)] hover:text-[var(--action-primary)] transition-all cursor-pointer mb-6 border border-[var(--border-default)]"
          >
            <MdiIcon name="arrow-left" className="text-base" /> Return to Homepage
          </button>

          {/* Wizard Flow Step Router */}
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-4">
            {planningStep === 1 ? (
              /* Step 1: Input wizard form with MediaPlanner */
              <MediaPlanner
                onSubmitPlan={handleGeneratePlan}
                isLoading={loadingPlan}
                initialValues={plannerInputState || {}}
              />
            ) : (
              /* Step 2: Recommendations results */
              <div className="space-y-10 animate-fade-in text-left">
                {/* AI Plan Breakdown (Stage 2 Summary & Stage 3 Refine Sliders) */}
                <AIPlanBreakdown
                  plannerState={plannerInputState}
                  planningResults={planningResults}
                  onAddPackageToBag={handleAddPackageToBag}
                  onAdjustIntake={() => {
                    setPlanningStep(1);
                    setPlanningResults(null);
                  }}
                  triggerToast={triggerToast}
                />

                {/* Split Bento Layout: Recommendations package list + Reach mix chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                  
                  {/* Left Column: Recommendations List */}
                  <div className="lg:col-span-8 rounded-3xl border border-[var(--border-default)] bg-[var(--surface-raised)]/40 p-6 md:p-8 space-y-6 text-left relative overflow-hidden backdrop-blur-md">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-default)] pb-4 gap-4 w-full">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-canvas)] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[var(--action-primary)] border border-[var(--border-default)]">
                          <MdiIcon name="auto-fix" className="text-xs" /> AI Engine Select
                        </span>
                        <h4 className="text-2xl font-black text-white mt-2 font-display">
                          Strategic Recommendation Mix
                        </h4>
                      </div>
                      {planningResults?.bundle?.length > 0 && (
                        <div className="text-left md:text-right">
                          <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-extrabold">Total Bundle Cost</p>
                          <p className="text-2xl font-black text-[var(--action-primary)]">
                            ₹{planningResults.totalCost.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            Remaining Budget: ₹{(planningResults.maxBudget - planningResults.totalCost).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {planningResults?.bundle?.length > 0 ? (
                      <div className="space-y-6">
                        {/* Bundle Breakdown List */}
                        <div className="divide-y divide-[var(--border-default)] bg-[var(--surface-canvas)]/30 rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-inner">
                          {planningResults.bundle.map((asset) => {
                            const inBag = isInBag(asset.id);
                            return (
                              <div key={asset.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-hover)] transition-colors">
                                <div className="flex items-center gap-4">
                                  <div
                                    className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--surface-canvas)] border border-[var(--border-default)] cursor-pointer"
                                    onClick={() => setActiveDetailAsset(asset)}
                                  >
                                    <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" />
                                  </div>
                                  <div>
                                    <h5
                                      className="text-sm font-bold text-white hover:text-[var(--action-primary)] transition-colors cursor-pointer"
                                      onClick={() => setActiveDetailAsset(asset)}
                                    >
                                      {asset.title}
                                    </h5>
                                    <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                                      <MdiIcon name="map-marker" className="text-[10px] text-[var(--action-primary)]" /> {asset.location} &bull; <MdiIcon name="chart-bar" className="text-[10px] text-[var(--action-primary)]" /> {asset.reach}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[var(--border-default)] pt-2 sm:pt-0">
                                  <div className="text-left sm:text-right">
                                    <p className="text-xs font-black text-white">
                                      ₹{(asset.price * planningResults.duration * 30).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-[var(--text-secondary)] font-mono">
                                      ₹{asset.price.toLocaleString()}/day for {planningResults.duration}M
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (inBag) {
                                        removeFromBag(asset.id);
                                        triggerToast(`Removed "${asset.title}" from bag`);
                                      } else {
                                        addToBag(asset, planningResults?.duration || 1);
                                        triggerToast(`✓ Added "${asset.title}" to campaign bag`);
                                      }
                                    }}
                                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                                      inBag
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                                        : "bg-white text-black hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
                                    }`}
                                  >
                                    {inBag ? (
                                      <>
                                        <MdiIcon name="check-bold" className="text-xs text-emerald-400" />
                                        <span>Added ✓</span>
                                      </>
                                    ) : (
                                      <span>Add</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Bulk Action button */}
                        <div className="flex justify-end pt-2">
                          {planningResults.bundle.every((item) => isInBag(item.id)) ? (
                            <button
                              type="button"
                              onClick={() => handleAddPackageToBag(planningResults.bundle)}
                              className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer font-sans"
                            >
                              <MdiIcon name="check-bold" className="text-sm text-emerald-400" /> All Recommended Placements Added ✓
                            </button>
                          ) : (
                            <ShinyButton
                              onClick={() => handleAddPackageToBag(planningResults.bundle)}
                              className="rounded-2xl py-4 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer font-sans shadow-lg hover:shadow-[#FF5A1F]/30"
                            >
                              <MdiIcon name="shopping-outline" className="text-base" /> Add Recommended Package to Bag
                            </ShinyButton>
                          )}
                        </div>

                        {/* Supplementary alternatives row underneath exact mixes */}
                        {planningResults.alternatives && planningResults.alternatives.filter((a) => a.score > 0).length > 0 && (
                          <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Other Placements to Consider:</span>
                            <div className="divide-y divide-[var(--border-default)] bg-[var(--surface-canvas)]/20 rounded-2xl border border-[var(--border-default)] overflow-hidden">
                              {planningResults.alternatives.slice(0, 2).map((asset) => {
                                const inBag = isInBag(asset.id);
                                return (
                                  <div key={asset.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-hover)]/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                      <div
                                        className="h-10 w-14 flex-shrink-0 overflow-hidden rounded bg-[var(--surface-canvas)] border border-[var(--border-default)] cursor-pointer"
                                        onClick={() => setActiveDetailAsset(asset)}
                                      >
                                        <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" />
                                      </div>
                                      <div>
                                        <h5
                                          className="text-xs font-bold text-white hover:text-[var(--action-primary)] transition-colors cursor-pointer"
                                          onClick={() => setActiveDetailAsset(asset)}
                                        >
                                          {asset.title}
                                        </h5>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[9px] text-[var(--text-secondary)]">
                                          <span>{asset.location}</span>
                                          <span>&bull;</span>
                                          <span className="text-[var(--action-primary)] font-bold">{asset.reasons[0]}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                                      <span className="text-xs font-bold text-white">₹{(asset.price * planningResults.duration * 30).toLocaleString()}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (inBag) {
                                            removeFromBag(asset.id);
                                            triggerToast(`Removed "${asset.title}" from bag`);
                                          } else {
                                            addToBag(asset, planningResults?.duration || 1);
                                            triggerToast(`✓ Added "${asset.title}" to campaign bag`);
                                          }
                                        }}
                                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                                          inBag
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                                            : "bg-white text-black hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
                                        }`}
                                      >
                                        {inBag ? (
                                          <>
                                            <MdiIcon name="check-bold" className="text-xs text-emerald-400" />
                                            <span>Added ✓</span>
                                          </>
                                        ) : (
                                          <span>Add</span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* No exact matching plan compiled within budget limits */
                      <div className="space-y-6">
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-3">
                          <MdiIcon name="alert-circle-outline" className="text-xl shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold block text-white mb-0.5">No Exact Match Compiled within Budget</span>
                            <span>We couldn&apos;t fit an exact mix matching sector <strong>{plannerInputState?.industrySector}</strong> and audience <strong>{plannerInputState?.targetAudience?.join(", ")}</strong> for a total budget limit of <strong>₹{planningResults?.maxBudget?.toLocaleString()}</strong>.</span>
                          </div>
                        </div>

                        {planningResults?.alternatives && planningResults.alternatives.filter((a) => a.score > 0).length > 0 ? (
                          <div className="space-y-4">
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Here are the closest alternative plans:</span>
                            <div className="divide-y divide-[var(--border-default)] bg-[var(--surface-canvas)]/30 rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-inner">
                              {planningResults.alternatives.map((asset) => {
                                const inBag = isInBag(asset.id);
                                return (
                                  <div key={asset.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-hover)] transition-colors">
                                    <div className="flex items-center gap-4">
                                      <div
                                        className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--surface-canvas)] border border-[var(--border-default)] cursor-pointer"
                                        onClick={() => setActiveDetailAsset(asset)}
                                      >
                                        <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" />
                                      </div>
                                      <div>
                                        <h5
                                          className="text-sm font-bold text-white hover:text-[var(--action-primary)] transition-colors cursor-pointer"
                                          onClick={() => setActiveDetailAsset(asset)}
                                        >
                                          {asset.title}
                                        </h5>
                                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px]">
                                          <span className="text-[var(--text-secondary)] flex items-center gap-0.5">
                                            <MdiIcon name="map-marker" className="text-[10px] text-[var(--action-primary)]" /> {asset.location}
                                          </span>
                                          <span className="text-slate-400">&bull;</span>
                                          <span className="text-[var(--text-secondary)] flex items-center gap-0.5">
                                            <MdiIcon name="chart-bar" className="text-[10px] text-[var(--action-primary)]" /> {asset.reach}
                                          </span>
                                          <span className="text-slate-400">&bull;</span>
                                          <span className="text-[var(--action-primary)] font-bold uppercase tracking-wider text-[8px] bg-[var(--action-primary)]/10 px-1.5 py-0.5 rounded">
                                            {asset.reasons.join(" · ")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[var(--border-default)] pt-2 sm:pt-0">
                                      <div className="text-left sm:text-right">
                                        <p className="text-xs font-black text-white">
                                          ₹{(asset.price * planningResults.duration * 30).toLocaleString()}
                                        </p>
                                        <p className="text-[9px] text-[var(--text-secondary)] font-mono">
                                          ₹{asset.price.toLocaleString()}/day for {planningResults.duration}M
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (inBag) {
                                            removeFromBag(asset.id);
                                            triggerToast(`Removed "${asset.title}" from bag`);
                                          } else {
                                            addToBag(asset, planningResults?.duration || 1);
                                            triggerToast(`✓ Added "${asset.title}" to campaign bag`);
                                          }
                                        }}
                                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                                          inBag
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                                            : "bg-white text-black hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
                                        }`}
                                      >
                                        {inBag ? (
                                          <>
                                            <MdiIcon name="check-bold" className="text-xs text-emerald-400" />
                                            <span>Added ✓</span>
                                          </>
                                        ) : (
                                          <span>Add</span>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-canvas)]/30 py-12 text-center px-4 font-sans space-y-4">
                            <MdiIcon name="close-circle-outline" className="text-4xl text-[var(--status-error)]" />
                            <h4 className="text-sm font-bold text-white">No Matching Alternative Plans Found</h4>
                            <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed font-medium">
                              We couldn&apos;t compile any nearby media plans matching your sector or target audience.
                            </p>
                            <div className="flex flex-wrap items-center gap-3 justify-center pt-2">
                              <button
                                onClick={() => setPlanningStep(1)}
                                className="rounded-xl border border-[var(--border-default)] hover:border-white px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer bg-transparent"
                              >
                                Adjust Budget / Inputs
                              </button>
                              <button
                                onClick={() => router.push("/media-buying?skipIntake=true")}
                                className="rounded-xl bg-[var(--action-primary)] hover:bg-[var(--action-primary-hover)] text-[#0B1E3B] px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-md"
                              >
                                Browse Marketplace
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Mix Distribution Chart widget */}
                  <div className="lg:col-span-4 space-y-6 w-full">
                    <VercelCard bordered={true} className="bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-3xl text-left p-6">
                      <div className="w-full space-y-4">
                        <p className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-[var(--text-secondary)]">Mix Distribution Summary</p>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-white">OOH & Billboards</span>
                              <span className="text-[#FF5A1F]">55%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF5A1F] rounded-full" style={{ width: "55%" }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-white">Transit & Metro</span>
                              <span className="text-emerald-400">25%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "25%" }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-white">Digital Screens</span>
                              <span className="text-sky-400">20%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-sky-400 rounded-full" style={{ width: "20%" }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-white/10 text-[11px] text-slate-300 font-medium">
                          Estimated Total Impressions: <span className="font-bold text-white font-mono">1.8M+</span>
                        </div>
                      </div>
                    </VercelCard>
                  </div>
                </div>

                {/* Manual Customization Grid */}
                <div className="space-y-6 pt-8 border-t border-[var(--border-default)]">
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                      Recommended Placement Listings
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      Individual inventory assets selected by AI for your target markets ({plannerInputState?.targetCities?.join(", ") || "National Grid"}).
                    </p>
                  </div>

                  {planningResults?.allMatches && planningResults.allMatches.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {planningResults.allMatches.map((asset) => {
                        const inBag = isInBag(asset.id);
                        return (
                          <VercelCard
                            key={asset.id}
                            glowEffect={true}
                            animateOnHover={true}
                            bordered={true}
                            className="group overflow-hidden bg-[#132A4F] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] rounded-[8px] border-white/10"
                          >
                            <div className="w-full flex flex-col h-full">
                              {/* Thumbnail */}
                              <div
                                className="relative aspect-video w-full overflow-hidden bg-[#0B1E3B] cursor-pointer"
                                onClick={() => setActiveDetailAsset(asset)}
                              >
                                <img
                                  src={asset.image}
                                  alt={asset.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <span className="absolute top-3 left-3 rounded-full bg-[#0B1E3B]/80 border border-white/15 px-3 py-1 text-[10px] font-bold text-[#FF5A1F] backdrop-blur-md">
                                  {asset.subCategory || asset.category}
                                </span>
                                <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white border border-emerald-400/30 backdrop-blur-sm">
                                  ✓ Verified Spot
                                </span>
                                <div
                                  className="absolute top-3 right-3 z-10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <label className="flex items-center space-x-1.5 rounded-full bg-[#0B1E3B]/80 px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 backdrop-blur-md cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedCompareAssets.some((item) => item.id === asset.id)}
                                      onChange={() => toggleCompareAsset(asset)}
                                      className="h-3.5 w-3.5 rounded accent-[#FF5A1F] cursor-pointer"
                                    />
                                    <span>Compare</span>
                                  </label>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex flex-1 flex-col p-5 text-left w-full justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-[#FF5A1F] flex items-center mb-1">
                                    <MdiIcon name="map-marker-outline" className="mr-1 text-base" />
                                    {asset.location}
                                  </p>
                                  <h5
                                    className="text-sm font-bold text-white hover:text-[#FF5A1F] transition-colors cursor-pointer font-sans"
                                    onClick={() => setActiveDetailAsset(asset)}
                                  >
                                    {asset.title}
                                  </h5>
                                  <p className="mt-2 text-xs text-slate-300 font-sans">
                                    Est. Reach: <span className="font-semibold text-white font-mono">{asset.reach}</span>
                                  </p>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 w-full">
                                  <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Cost</p>
                                    <p className="text-sm font-black text-white font-mono tabular-nums">
                                      ₹{(asset.price * (planningResults?.duration || 1) * 30).toLocaleString("en-IN")}
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-mono">₹{asset.price.toLocaleString("en-IN")}/day</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (inBag) {
                                        removeFromBag(asset.id);
                                        triggerToast(`Removed "${asset.title}" from bag`);
                                      } else {
                                        addToBag(asset, planningResults?.duration || 1);
                                        triggerToast(`✓ Added "${asset.title}" to campaign bag`);
                                      }
                                    }}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                                      inBag
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                                        : "bg-white text-black hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
                                    }`}
                                  >
                                    {inBag ? (
                                      <>
                                        <MdiIcon name="check-bold" className="text-sm text-emerald-400" />
                                        <span>Added ✓</span>
                                      </>
                                    ) : (
                                      <span>Add to Bag</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </VercelCard>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Visual Detail Modal */}
      {activeDetailAsset && (
        <MediaDetailModal
          assetId={activeDetailAsset.id}
          onClose={() => setActiveDetailAsset(null)}
        />
      )}

      {/* Side-by-side comparison modal */}
      {isCompareOpen && (
        <CompareModal
          selectedAssets={selectedCompareAssets}
          onClose={() => setIsCompareOpen(false)}
          onRemoveAsset={toggleCompareAsset}
        />
      )}

      {/* Floating Comparison trigger widget */}
      {selectedCompareAssets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[#132A4F] border border-white/15 shadow-2xl rounded-2xl px-6 py-4 flex items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#FF5A1F] text-[#0B1E3B] font-bold text-xs size-5 flex items-center justify-center font-mono">
              {selectedCompareAssets.length}
            </span>
            <span className="text-xs font-bold text-white">Assets in comparison</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCompareAssets([])}
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
            <ShinyButton
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-lg shadow-md"
            >
              Compare Side-by-side
            </ShinyButton>
          </div>
        </div>
      )}

      {/* Lightweight Planning Intake Popup Modal */}
      {planningIntakeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
            onClick={handleIntakeSkip}
          ></div>

          {/* Modal Container */}
          <div
            className="relative w-full max-w-md bg-gradient-to-br from-[#132a4f] to-[#0b1e3b] rounded-2xl shadow-2xl z-10 p-6 flex flex-col border border-[var(--border-default)] text-white animate-scale-up"
            style={{ borderRadius: "16px" }}
          >
            {/* Close button */}
            <button
              onClick={handleIntakeSkip}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors z-20 cursor-pointer"
              aria-label="Close modal"
            >
              <MdiIcon name="close" className="text-lg" />
            </button>

            <div className="space-y-6 text-left">
              <div className="space-y-1 pr-6">
                <h2 className="text-xl font-black text-white font-display flex items-center gap-2">
                  <MdiIcon name="auto-fix" className="text-[var(--action-primary)]" />
                  Plan Your Campaign
                </h2>
                <p className="text-xs text-[#A5B5CD]">
                  Provide a few details to instantly customize your media mix.
                </p>
              </div>

              <form onSubmit={handleIntakeSubmit} className="space-y-4">
                {/* Field 1: Campaign Objective */}
                <div className="space-y-1.5">
                  <label htmlFor="intake-objective" className="block text-xs font-bold text-[#A5B5CD] uppercase">
                    Campaign Objective
                  </label>
                  <select
                    id="intake-objective"
                    value={intakeObjective}
                    onChange={(e) => setIntakeObjective(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                    required
                  >
                    <option value="">Select objective...</option>
                    <option value="Awareness">Awareness</option>
                    <option value="Downloads">Downloads</option>
                    <option value="Orders">Orders</option>
                    <option value="Footfall">Footfall</option>
                  </select>
                </div>

                {/* Field 2: Industry / Sector */}
                <div className="space-y-1.5">
                  <label htmlFor="intake-sector" className="block text-xs font-bold text-[#A5B5CD] uppercase">
                    Industry / Sector
                  </label>
                  <select
                    id="intake-sector"
                    value={intakeSector}
                    onChange={(e) => setIntakeSector(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                    required
                  >
                    <option value="">Select industry vertical...</option>
                    <option value="Consumer Tech">Consumer Tech</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Apparel & Fashion">Apparel & Fashion</option>
                    <option value="Automobiles">Automobiles</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                    <option value="FMCG">FMCG</option>
                  </select>
                </div>

                {/* Field 3: Target Audience */}
                <div className="space-y-1.5">
                  <label htmlFor="intake-audience" className="block text-xs font-bold text-[#A5B5CD] uppercase">
                    Target Audience
                  </label>
                  <select
                    id="intake-audience"
                    value={intakeAudience}
                    onChange={(e) => setIntakeAudience(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                    required
                  >
                    <option value="">Select Audience Vertical...</option>
                    <option value="News & Infotainment">News & Infotainment</option>
                    <option value="Food & Hospitality">Food & Hospitality</option>
                    <option value="Music & Entertainment">Music & Entertainment</option>
                    <option value="Sports & Gaming">Sports & Gaming</option>
                    <option value="Wellness & Fitness">Wellness & Fitness</option>
                    <option value="Medical & Healthcare">Medical & Healthcare</option>
                    <option value="Travel & Tourism">Travel & Tourism</option>
                    <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                    <option value="Automobiles">Automobiles</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                {/* Field 4: Budget Range */}
                <div className="space-y-1.5">
                  <label htmlFor="intake-budget" className="block text-xs font-bold text-[#A5B5CD] uppercase">
                    Budget Range
                  </label>
                  <select
                    id="intake-budget"
                    value={intakeBudget}
                    onChange={(e) => setIntakeBudget(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                    required
                  >
                    <option value="">Select budget range...</option>
                    <option value="₹10K - ₹50K">₹10K - ₹50K</option>
                    <option value="₹50K - ₹2L">₹50K - ₹2L</option>
                    <option value="₹2L - ₹10L">₹2L - ₹10L</option>
                    <option value="₹10L+">₹10L+</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <ShinyButton
                    type="submit"
                    className="w-full rounded-xl py-3 text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MdiIcon name="rocket-launch-outline" className="text-sm" /> Customize My Plan
                  </ShinyButton>

                  <button
                    type="button"
                    onClick={handleIntakeSkip}
                    className="w-full text-center text-xs font-bold text-[#A5B5CD] hover:text-white transition-colors py-2 cursor-pointer bg-transparent border-none focus:outline-none"
                  >
                    Skip / Browse without planning
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-bounce-in bg-[#0B1E3B] border border-emerald-500/40 text-emerald-300 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs font-bold font-sans">
          <div className="size-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <MdiIcon name="check" className="text-sm" />
          </div>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <MdiIcon name="close" className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}
