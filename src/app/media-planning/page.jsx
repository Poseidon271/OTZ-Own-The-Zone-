"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BagDrawer from "@/components/BagDrawer";
import MdiIcon from "@/components/MdiIcon";
import MediaDetailModal from "@/components/MediaDetailModal";
import CompareModal from "@/components/CompareModal";
import { useBag } from "@/context/BagContext";
import { mockAdvertisingAssets } from "@/data/mockData";

export default function MediaPlanningPage() {
  const router = useRouter();
  const { addToBag, addItemsToBag, removeFromBag, isInBag, setIsBagOpen, updateDuration } = useBag();

  // Wizard parameters states
  const [planningProductType, setPlanningProductType] = useState("");
  const [planningAudience, setPlanningAudience] = useState("");
  const [planningBudget, setPlanningBudget] = useState("");
  const [planningDuration, setPlanningDuration] = useState(1); // 1-12 months
  const [planningResults, setPlanningResults] = useState(null);
  const [planningStep, setPlanningStep] = useState(1); // 1: input wizard, 2: recommendation results

  const [activeDetailAsset, setActiveDetailAsset] = useState(null);
  const [selectedCompareAssets, setSelectedCompareAssets] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareAlertMessage, setCompareAlertMessage] = useState("");

  // Clear comparison alerts automatically
  useEffect(() => {
    if (compareAlertMessage) {
      const timer = setTimeout(() => {
        setCompareAlertMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [compareAlertMessage]);

  const toggleCompareAsset = (asset) => {
    if (selectedCompareAssets.some((item) => item.id === asset.id)) {
      setSelectedCompareAssets((prev) => prev.filter((item) => item.id !== asset.id));
    } else {
      if (selectedCompareAssets.length >= 3) {
        setCompareAlertMessage("You can compare a maximum of 3 assets at a time.");
        return;
      }
      setSelectedCompareAssets((prev) => [...prev, asset]);
    }
  };

  const generatePlanningRecommendation = (e) => {
    if (e) e.preventDefault();
    if (!planningProductType || !planningAudience || !planningBudget) {
      return;
    }

    const budgetVal = parseFloat(planningBudget) || 0;
    const durationMonths = parseInt(planningDuration) || 1;

    // Filter items where productSector matches Dropdown 1 AND targetAudience matches Dropdown 2
    const matchingItems = mockAdvertisingAssets.filter(
      (asset) =>
        asset.productSector === planningProductType &&
        asset.targetAudience === planningAudience
    );

    // Sort matching items by daily price descending to prioritize premium assets
    const sorted = [...matchingItems].sort((a, b) => b.price - a.price);

    const bundle = [];
    let currentTotalCost = 0;

    for (const asset of sorted) {
      const assetCost = asset.price * durationMonths * 30;
      if (currentTotalCost + assetCost <= budgetVal) {
        bundle.push(asset);
        currentTotalCost += assetCost;
      }
    }

    setPlanningResults({
      bundle,
      allMatches: matchingItems,
      totalCost: currentTotalCost,
      maxBudget: budgetVal,
      duration: durationMonths
    });
    setPlanningStep(2);
  };

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-slate-900 dark:text-slate-100 selection:bg-violet-500 selection:text-white transition-colors duration-200">
      {/* Navbar Component */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* Sliding Sidebar Drawer */}
      <BagDrawer />

      <main className="flex-grow no-print pt-28 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Button */}
          <button
            onClick={() => router.push("/")}
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[rgba(184,199,217,0.18)] hover:text-[var(--accent-hover)] transition-all cursor-pointer mb-6"
          >
            <MdiIcon name="arrow-left" className="text-base" /> Return to Marketplace
          </button>



          {/* Below Section: Wizard Flow */}
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-6">
            {planningStep === 1 ? (
              /* Step 1: Input wizard form */
              <form
                onSubmit={generatePlanningRecommendation}
                className="rounded-3xl frost-card p-8 space-y-8"
              >
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Media Strategy Advisor
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                    Configure your campaign requirements to find budget-optimized inventory match options.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dropdown 1: Product Sector */}
                  <div className="space-y-3">
                    <label htmlFor="planning-sector" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      1. Product Sector
                    </label>
                    <select
                      id="planning-sector"
                      value={planningProductType}
                      onChange={(e) => setPlanningProductType(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[var(--glass-bg)] px-4 py-3.5 text-sm dark:text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--accent-primary)]"
                      required
                    >
                      <option value="">Select Product Sector...</option>
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
                      <option value="FMCG">FMCG</option>
                    </select>
                  </div>

                  {/* Dropdown 2: Target Audience Vertical */}
                  <div className="space-y-3">
                    <label htmlFor="planning-audience" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      2. Target Audience Vertical
                    </label>
                    <select
                      id="planning-audience"
                      value={planningAudience}
                      onChange={(e) => setPlanningAudience(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[var(--glass-bg)] px-4 py-3.5 text-sm dark:text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--accent-primary)]"
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

                  {/* Input 3: Maximum Budget Allocation */}
                  <div className="space-y-3">
                    <label htmlFor="planning-budget" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      3. Maximum Budget Allocation (₹)
                    </label>
                    <div className="relative rounded-2xl shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5">
                        <span className="text-sm font-bold text-slate-500">₹</span>
                      </div>
                      <input
                        id="planning-budget"
                        type="number"
                        value={planningBudget}
                        onChange={(e) => setPlanningBudget(e.target.value)}
                        placeholder="e.g. 500000"
                        min="1000"
                        className="w-full rounded-2xl border border-white/10 bg-[var(--glass-bg)] py-3.5 pl-9 pr-4 text-sm dark:text-slate-200 font-semibold outline-none focus:border-[var(--accent-primary)]"
                        required
                      />
                    </div>
                  </div>

                  {/* Input 4: Campaign Duration (Months) */}
                  <div className="space-y-3">
                    <label htmlFor="planning-duration" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                      4. Campaign Booking Duration
                    </label>
                    <select
                      id="planning-duration"
                      value={planningDuration}
                      onChange={(e) => setPlanningDuration(parseInt(e.target.value))}
                      className="w-full rounded-2xl border border-white/10 bg-[var(--glass-bg)] px-4 py-3.5 text-sm dark:text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--accent-primary)]"
                      required
                    >
                      {[...Array(12).keys()].map((i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} {i + 1 === 1 ? "Month" : "Months"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)] px-6 py-4 text-sm font-bold text-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MdiIcon name="rocket-launch-outline" className="text-lg" /> Generate Strategy Plan
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Recommendations results */
              <div className="space-y-10 animate-fade-in">
                {/* Summary Header */}
                <div className="rounded-3xl frost-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Campaign Planning Strategy
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5">
                      Parameters: Sector <span className="font-semibold text-slate-350">&ldquo;{planningProductType}&rdquo;</span> &rarr; Target Audience <span className="font-semibold text-slate-350">&ldquo;{planningAudience}&rdquo;</span> over <span className="font-semibold text-slate-350">{planningResults?.duration} {planningResults?.duration === 1 ? 'month' : 'months'}</span>.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPlanningStep(1);
                      setPlanningResults(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4.5 py-2 text-xs font-bold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] cursor-pointer transition-colors shadow-sm"
                  >
                    <MdiIcon name="cog-outline" className="text-base" /> Adjust Parameters
                  </button>
                </div>

                {/* Our Smart Strategic Recommendation Container */}
                <div className="rounded-3xl frost-card p-6 md:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--accent-primary)] border border-white/10">
                        <MdiIcon name="auto-fix" className="text-xs" /> AI Engine Select
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                        Our Smart Strategic Recommendation
                      </h4>
                    </div>
                    {planningResults?.bundle.length > 0 && (
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-slate-450 uppercase tracking-widest font-extrabold">Total Bundle Cost</p>
                        <p className="text-2xl font-black text-[var(--accent-primary)]">
                          ₹{planningResults.totalCost.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Remaining Budget: ₹{(planningResults.maxBudget - planningResults.totalCost).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {planningResults?.bundle.length > 0 ? (
                    <div className="space-y-6">
                      {/* Bundle Breakdown List */}
                      <div className="divide-y divide-white/10 bg-white/5 rounded-2xl border border-white/10 overflow-hidden shadow-inner">
                        {planningResults.bundle.map((asset) => {
                          const inBag = isInBag(asset.id);
                          return (
                            <div key={asset.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <div
                                  className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950 border border-white/10 cursor-pointer"
                                  onClick={() => setActiveDetailAsset(asset)}
                                >
                                  <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" />
                                </div>
                                <div>
                                  <h5
                                    className="text-sm font-bold text-slate-800 dark:text-white hover:text-[var(--accent-hover)] transition-colors cursor-pointer"
                                    onClick={() => setActiveDetailAsset(asset)}
                                  >
                                    {asset.title}
                                  </h5>
                                  <p className="text-[11px] text-slate-450 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                    <MdiIcon name="map-marker" className="text-[10px]" /> {asset.location} &bull; <MdiIcon name="chart-bar" className="text-[10px]" /> {asset.reach}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                                <div className="text-left sm:text-right">
                                  <p className="text-xs font-black text-slate-900 dark:text-white">
                                    ₹{(asset.price * planningResults.duration * 30).toLocaleString()}
                                  </p>
                                  <p className="text-[9px] text-slate-400">
                                    ₹{asset.price.toLocaleString()}/day for {planningResults.duration}M
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (inBag) {
                                      removeFromBag(asset.id);
                                    } else {
                                      addToBag(asset);
                                      updateDuration(asset.id, planningResults.duration);
                                    }
                                  }}
                                  className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${inBag
                                    ? "bg-rose-500/10 text-rose-450 border border-rose-900/30 hover:bg-rose-600 hover:text-white"
                                    : "bg-white text-black hover:bg-[var(--accent-hover)]"
                                    }`}
                                >
                                  {inBag ? "Remove" : "Add"}
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
                            disabled
                            className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-not-allowed opacity-90 font-sans"
                          >
                            <MdiIcon name="check-bold" className="text-sm" /> All Items Added to Bag
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              addItemsToBag(planningResults.bundle);
                              planningResults.bundle.forEach((item) => {
                                updateDuration(item.id, planningResults.duration);
                              });
                              setIsBagOpen(true);
                            }}
                            className="rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)] hover:shadow-lg text-black! px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer font-sans"
                          >
                            <MdiIcon name="shopping-outline" className="text-base" /> Add Recommended Package to Bag
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-center px-4 font-sans space-y-3">
                      <MdiIcon name="alert-outline" className="text-3xl text-amber-500" />
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">
                        Budget constraints too restrictive
                      </h4>
                      <p className="text-xs text-slate-405 dark:text-slate-400 max-w-md leading-relaxed">
                        We couldn&apos;t fit any single asset matching this sector and audience combination within your total budget of **₹{planningResults?.maxBudget.toLocaleString()}** for **{planningResults?.duration} {planningResults?.duration === 1 ? 'month' : 'months'}** (minimum cost per asset: ₹{Math.min(...(planningResults?.allMatches.map(a => a.price * planningResults.duration * 30) || [0])).toLocaleString()}). Try increasing your budget or choosing matching assets manually below.
                      </p>
                    </div>
                  )}
                </div>

                {/* Manual Customization Grid */}
                <div className="space-y-6 pt-8 border-t border-white/10">
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Explore All Available Matches
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Browse through all available advertisement listings for this sector and target vertical. Build a custom campaign mix manually.
                    </p>
                  </div>

                  {planningResults?.allMatches && planningResults.allMatches.length > 0 ? (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                      {planningResults.allMatches.map((asset) => {
                        const inBag = isInBag(asset.id);
                        return (
                          <div
                            key={asset.id}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                          >
                            {/* Image Container */}
                            <div
                              className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950 cursor-pointer"
                              onClick={() => setActiveDetailAsset(asset)}
                            >
                              <img
                                src={asset.image}
                                alt={asset.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                              <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 border border-white/10 px-3 py-1 text-xs font-semibold text-[var(--accent-primary)] backdrop-blur-md">
                                {asset.subCategory || asset.category}
                              </span>
                              <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white border border-emerald-400/30 backdrop-blur-sm shadow-sm select-none">
                                ✓ Verified Spot
                              </span>
                              <div
                                className="absolute top-3 right-3 z-10"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <label className="flex items-center space-x-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold text-white border border-white/20 backdrop-blur-md cursor-pointer transition-colors shadow-sm select-none">
                                  <input
                                    type="checkbox"
                                    checked={selectedCompareAssets.some((item) => item.id === asset.id)}
                                    onChange={() => toggleCompareAsset(asset)}
                                    className="h-3.5 w-3.5 rounded border-slate-350 accent-[var(--accent-primary)] cursor-pointer"
                                  />
                                  <span>Compare</span>
                                </label>
                              </div>
                            </div>
                            {/* Info Container */}
                            <div className="flex flex-1 flex-col p-6">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-[var(--accent-primary)] flex items-center mb-1.5">
                                  <MdiIcon name="map-marker-outline" className="mr-1 text-base text-[var(--accent-primary)]" />
                                  {asset.location}
                                </p>
                                <h3
                                  className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-hover)] transition-colors cursor-pointer"
                                  onClick={() => setActiveDetailAsset(asset)}
                                >
                                  {asset.title}
                                </h3>
                                <p className="mt-2 text-xs text-slate-400">
                                  Est. Reach: <span className="font-semibold text-slate-300">{asset.reach}</span>
                                </p>
                              </div>
                              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                                <div>
                                  <p className="text-xs text-slate-505 font-bold">Estimated Cost</p>
                                  <p className="text-lg font-black text-[var(--text-primary)]">
                                    ₹{(asset.price * planningResults.duration * 30).toLocaleString()}
                                    <span className="text-xs font-normal text-slate-400">/total</span>
                                  </p>
                                  <p className="text-[10px] text-slate-505 font-medium">₹{asset.price.toLocaleString()}/day</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (inBag) {
                                      removeFromBag(asset.id);
                                    } else {
                                      addToBag(asset);
                                      updateDuration(asset.id, planningResults.duration);
                                    }
                                  }}
                                  className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${inBag
                                    ? "bg-rose-500/10 text-rose-450 border border-rose-900/30 hover:bg-rose-650 hover:text-white"
                                    : "bg-white text-black hover:bg-[var(--accent-hover)]"
                                    }`}
                                >
                                  {inBag ? "Remove from Bag" : "Add to Bag"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-20 text-center px-4 font-sans">
                      <span className="text-3xl">🫙</span>
                      <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                        No Matching Placements Found
                      </h4>
                      <p className="mt-2 text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
                        We couldn&apos;t find any advertising assets matching sector **{planningProductType}** and target vertical **{planningAudience}**.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Comparison Action Bar */}
      {selectedCompareAssets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl px-4 no-print animate-slide-up">
          <div className="frost-card flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl p-4 backdrop-blur-md transition-all">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {selectedCompareAssets.map((asset) => (
                  <div key={asset.id} className="relative group/thumb">
                    <img
                      src={asset.image}
                      alt={asset.title}
                      className="h-10 w-10 rounded-full object-cover border-2 border-slate-900 shadow-md"
                    />
                    <button
                      onClick={() => setSelectedCompareAssets(prev => prev.filter(item => item.id !== asset.id))}
                      className="absolute -top-1 -right-1 hidden group-hover/thumb:flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] shadow cursor-pointer font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold text-slate-400">
                <span className="font-extrabold text-[var(--text-primary)]">
                  {selectedCompareAssets.length}
                </span>
                /3 Items Selected
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setSelectedCompareAssets([])}
                className="flex-1 sm:flex-none text-xs font-bold text-slate-400 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="flex-1 sm:flex-none rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-black px-5 py-2.5 text-xs font-bold shadow-lg transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MdiIcon name="scale-balance" className="text-lg" /> Compare Side-by-Side
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <MediaDetailModal
        asset={activeDetailAsset}
        onClose={() => setActiveDetailAsset(null)}
      />

      {/* Comparison Modal */}
      <CompareModal
        selectedAssets={selectedCompareAssets}
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

      {/* Toast Alert */}
      {compareAlertMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-4 animate-toast-slide-in no-print">
          <div className="flex items-center justify-between gap-3 bg-red-950/90 border border-red-900/50 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-red-200 text-sm font-semibold">
              <MdiIcon name="alert-circle-outline" className="text-xl text-red-500" />
              <span>{compareAlertMessage}</span>
            </div>
            <button
              onClick={() => setCompareAlertMessage("")}
              className="text-red-400 hover:text-red-200 cursor-pointer"
            >
              <MdiIcon name="close" className="text-base" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-transparent py-8 text-center text-xs text-slate-400 dark:text-slate-400 font-medium transition-colors duration-200 no-print">
        <p>&copy; {new Date().getFullYear()} OTZ Marketplace Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
