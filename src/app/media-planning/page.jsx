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
  const { addToBag, addItemsToBag, removeFromBag, isInBag, setIsBagOpen, updateDuration } = useBag();

  // Intake State
  const [plannerState, setPlannerState] = useState({
    industrySector: "Fintech",
    targetAudience: ["Working Professionals"],
    targetCities: ["Mumbai (MMR)", "Bengaluru"],
    campaignObjective: "Brand Awareness & Reach",
    totalBudget: 500000,
    startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    flightDuration: "1 Month",
    creativeReadiness: "ready",
  });

  // Flow & State
  const [planningStep, setPlanningStep] = useState(1);
  const [planningResults, setPlanningResults] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modals state
  const [activeDetailAsset, setActiveDetailAsset] = useState(null);
  const [selectedCompareAssets, setSelectedCompareAssets] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Generate AI Plan handler from Stage 1 Form
  const handleGenerateAIPlan = (inputState) => {
    setPlannerState(inputState);
    setLoadingPlan(true);

    setTimeout(() => {
      const maxBudgetVal = Number(inputState.totalBudget) || 500000;
      
      // Parse duration in months
      let durationMonths = 1.0;
      if (inputState.flightDuration === "1 Week") durationMonths = 0.25;
      else if (inputState.flightDuration === "2 Weeks") durationMonths = 0.5;
      else if (inputState.flightDuration === "1 Month") durationMonths = 1.0;
      else if (inputState.flightDuration === "3 Months") durationMonths = 3.0;

      // Filter matching assets
      const matchingListings = mockAdvertisingAssets.filter((asset) => {
        const matchSector =
          !inputState.industrySector ||
          (asset.productSector &&
            asset.productSector.toLowerCase().includes(inputState.industrySector.toLowerCase())) ||
          (asset.category &&
            asset.category.toLowerCase().includes(inputState.industrySector.toLowerCase()));

        const matchAudience =
          !inputState.targetAudience ||
          inputState.targetAudience.length === 0 ||
          inputState.targetAudience.some((aud) =>
            asset.targetAudience
              ? asset.targetAudience.toLowerCase().includes(aud.toLowerCase())
              : true
          );

        return matchSector || matchAudience;
      });

      const pool = matchingListings.length >= 2 ? matchingListings : mockAdvertisingAssets;

      // Greedy allocation solver
      let currentCost = 0;
      const bundleItems = [];
      const sortedByReach = [...pool].sort((a, b) => {
        const reachA = parseInt(a.reach?.replace(/[^0-9]/g, "")) || 0;
        const reachB = parseInt(b.reach?.replace(/[^0-9]/g, "")) || 0;
        return reachB - reachA;
      });

      for (const asset of sortedByReach) {
        const days = durationMonths * 30;
        const assetCost = asset.price * days;
        if (currentCost + assetCost <= maxBudgetVal || bundleItems.length < 2) {
          bundleItems.push({
            id: asset.id,
            title: asset.title,
            location: asset.location,
            reach: asset.reach,
            price: asset.price,
            dailyRate: asset.price,
            duration: durationMonths,
            image: asset.image,
            category: asset.category,
            subCategory: asset.subCategory || asset.category,
            specs: asset.specs || "Standard placement spec size",
            channelDomain: asset.category || "OOH & Billboards",
          });
          currentCost += assetCost;
        }
      }

      setPlanningResults({
        bundle: bundleItems,
        totalCost: currentCost,
        maxBudget: maxBudgetVal,
        duration: durationMonths,
        allMatches: pool.map((l) => ({
          id: l.id,
          title: l.title,
          location: l.location,
          reach: l.reach,
          price: l.price,
          dailyRate: l.price,
          duration: durationMonths,
          image: l.image,
          category: l.category,
          subCategory: l.subCategory || l.category,
          specs: l.specs || "Standard placement spec size",
          channelDomain: l.category || "OOH & Billboards",
        })),
      });

      setLoadingPlan(false);
      setPlanningStep(2);
      triggerToast("✓ AI Media Mix Generated Successfully!");
    }, 600);
  };

  // Batch Add Package to Cart Handler
  const handleAddPackageToBag = (bundle) => {
    const itemsToAdd = bundle || planningResults?.bundle || [];
    if (itemsToAdd.length > 0) {
      addItemsToBag(itemsToAdd);
      setIsBagOpen(true);
      triggerToast(`✓ Added ${itemsToAdd.length} recommended placements to Bag!`);
    }
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

      {/* Toast Floating Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 animate-bounce bg-[#84CC16] text-[#0B1E3B] font-extrabold px-5 py-3 rounded-[8px] shadow-2xl text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
          <MdiIcon name="check-circle" className="text-lg" />
          <span>{toastMessage}</span>
        </div>
      )}

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
              /* Stage 1: Intake Form */
              <MediaPlanner
                initialValues={plannerState}
                onSubmitPlan={handleGenerateAIPlan}
                isLoading={loadingPlan}
              />
            ) : (
              /* Stage 2 & 3: AI Mix Strategy Breakdown & Rebalancer */
              <div className="space-y-10 animate-fade-in">
                <AIPlanBreakdown
                  plannerState={plannerState}
                  planningResults={planningResults}
                  onAddPackageToBag={handleAddPackageToBag}
                  onAdjustIntake={() => setPlanningStep(1)}
                  triggerToast={triggerToast}
                />

                {/* Individual Matching Assets Section */}
                <div className="space-y-6 pt-8 border-t border-white/10 text-left">
                  <div>
                    <h4 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                      Recommended Placement Listings
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      Individual inventory assets selected by AI for your target markets ({plannerState.targetCities?.join(", ")}).
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
                                        triggerToast("Removed placement from bag");
                                      } else {
                                        addToBag(asset);
                                        updateDuration(asset.id, planningResults?.duration || 1);
                                        triggerToast("✓ Placement added to bag");
                                      }
                                    }}
                                    className={`rounded-[6px] px-3.5 py-2 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                                      inBag
                                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600 hover:text-white"
                                        : "bg-[#FF5A1F] text-[#0B1E3B] hover:opacity-90 font-mono uppercase"
                                    }`}
                                  >
                                    {inBag ? "Added ✓" : "Add"}
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
    </div>
  );
}
