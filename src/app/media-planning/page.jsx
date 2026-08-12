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

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { VercelCard } from "@/components/scrollx/vercel-card";
import { AnimatedCounter } from "@/components/scrollx/statscount";
import { AnalyticsIllustration } from "@/components/scrollx/feature-illustrations";

export default function MediaPlanningPage() {
  const router = useRouter();
  const { addToBag, addItemsToBag, removeFromBag, isInBag, setIsBagOpen, updateDuration } = useBag();

  // Wizard parameters states
  const [planningProductType, setPlanningProductType] = useState("");
  const [planningAudience, setPlanningAudience] = useState("");
  const [planningBudget, setPlanningBudget] = useState("");
  const [planningDuration, setPlanningDuration] = useState(1);

  // Recommendations state coordinates
  const [planningStep, setPlanningStep] = useState(1);
  const [planningResults, setPlanningResults] = useState(null);

  // Modals view coordinates
  const [activeDetailAsset, setActiveDetailAsset] = useState(null);
  const [selectedCompareAssets, setSelectedCompareAssets] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Filter listings based on user parameters and calculate allocation mixes
  const generatePlanningRecommendation = (e) => {
    e.preventDefault();
    const maxBudgetVal = parseFloat(planningBudget) || 0;
    const months = parseInt(planningDuration) || 1;

    // Filter relevant listings matching target audience niche tag
    const matchingListings = mockAdvertisingAssets.filter((asset) => {
      const matchAudience =
        !planningAudience ||
        asset.niche_tags.toLowerCase().includes(planningAudience.toLowerCase()) ||
        asset.media_type.toLowerCase().includes(planningAudience.toLowerCase());
      return matchAudience;
    });

    // Greedy allocation mix solver
    let currentCost = 0;
    const bundleItems = [];
    const sortedByReach = [...matchingListings].sort((a, b) => {
      const reachA = parseInt(a.visibility_metric.replace(/[^0-9]/g, "")) || 0;
      const reachB = parseInt(b.visibility_metric.replace(/[^0-9]/g, "")) || 0;
      return reachB - reachA; // high reach priority
    });

    for (const asset of sortedByReach) {
      const assetCost = asset.raw_price * months * 30; // Daily cost * days duration
      if (currentCost + assetCost <= maxBudgetVal) {
        bundleItems.push({
          id: asset.id,
          title: asset.title,
          location: asset.geography,
          reach: asset.visibility_metric,
          price: asset.raw_price,
          image: asset.rateCardName,
          category: asset.media_type,
          subCategory: asset.parent_network,
        });
        currentCost += assetCost;
      }
    }

    setPlanningResults({
      bundle: bundleItems,
      totalCost: currentCost,
      maxBudget: maxBudgetVal,
      duration: months,
      allMatches: matchingListings.map((l) => ({
        id: l.id,
        title: l.title,
        location: l.geography,
        reach: l.visibility_metric,
        price: l.raw_price,
        image: l.rateCardName,
        category: l.media_type,
        subCategory: l.parent_network,
      })),
    });
    setPlanningStep(2);
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
    <div className="flex min-h-screen flex-col bg-[var(--surface-canvas)] text-slate-900 dark:text-slate-100 selection:bg-violet-500 selection:text-white transition-colors duration-200 relative overflow-hidden">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Navbar Component */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* Sliding Sidebar Drawer */}
      <BagDrawer />

      <main className="flex-grow no-print pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Return Button */}
          <button
            onClick={() => router.push("/")}
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[rgba(184,199,217,0.18)] hover:text-[var(--action-primary)] transition-all cursor-pointer mb-6 border border-[var(--border-default)]"
          >
            <MdiIcon name="arrow-left" className="text-base" /> Return to Homepage
          </button>

          {/* Below Section: Wizard Flow */}
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-6">
            {planningStep === 1 ? (
              /* Step 1: Input wizard form */
              <VercelCard bordered={true} className="p-2 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-3xl">
                <form
                  onSubmit={generatePlanningRecommendation}
                  className="w-full p-6 space-y-8 text-left"
                >
                  <div className="border-b border-[var(--border-default)] pb-4">
                    <h3 className="text-2xl font-black text-white font-display">
                      Media Strategy Advisor
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
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
                        className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm dark:text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
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

                    {/* Dropdown 2: Target Audience Vertical */}
                    <div className="space-y-3">
                      <label htmlFor="planning-audience" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                        2. Target Audience Vertical
                      </label>
                      <select
                        id="planning-audience"
                        value={planningAudience}
                        onChange={(e) => setPlanningAudience(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm dark:text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
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
                          className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] py-3.5 pl-9 pr-4 text-sm dark:text-slate-200 font-semibold outline-none focus:border-[var(--action-primary)]"
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
                        className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm dark:text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
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
                  <div className="pt-4 border-t border-[var(--border-default)]">
                    <ShinyButton
                      type="submit"
                      className="w-full rounded-2xl py-4 text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <MdiIcon name="rocket-launch-outline" className="text-base mr-1.5" /> Generate Strategy Plan
                    </ShinyButton>
                  </div>
                </form>
              </VercelCard>
            ) : (
              /* Step 2: Recommendations results */
              <div className="space-y-10 animate-fade-in text-left">
                {/* Summary Header */}
                <VercelCard bordered={true} className="p-1 bg-[var(--surface-raised)]/60 rounded-3xl text-left w-full h-full">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 w-full">
                    <div>
                      <h3 className="text-xl font-black text-white font-display">
                        Campaign Planning Strategy
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5">
                        Parameters: Sector <span className="font-semibold text-white">&ldquo;{planningProductType}&rdquo;</span> &rarr; Target Audience <span className="font-semibold text-white">&ldquo;{planningAudience}&rdquo;</span> over <span className="font-semibold text-white">{planningResults?.duration} {planningResults?.duration === 1 ? 'month' : 'months'}</span>.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPlanningStep(1);
                        setPlanningResults(null);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] hover:bg-[var(--surface-hover)] px-4.5 py-2 text-xs font-bold text-white cursor-pointer transition-colors shadow-sm"
                    >
                      <MdiIcon name="cog-outline" className="text-base text-[var(--action-primary)]" /> Adjust Parameters
                    </button>
                  </div>
                </VercelCard>

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
                      {planningResults?.bundle.length > 0 && (
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

                    {planningResults?.bundle.length > 0 ? (
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
                                      } else {
                                        addToBag(asset);
                                        updateDuration(asset.id, planningResults.duration);
                                      }
                                    }}
                                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${inBag
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-900/30 hover:bg-rose-600 hover:text-white"
                                      : "bg-white text-black hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
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
                            <ShinyButton
                              onClick={() => {
                                addItemsToBag(planningResults.bundle);
                                planningResults.bundle.forEach((item) => {
                                  updateDuration(item.id, planningResults.duration);
                                });
                                setIsBagOpen(true);
                              }}
                              className="rounded-2xl py-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer font-sans"
                            >
                              <MdiIcon name="shopping-outline" className="text-base" /> Add Recommended Package to Bag
                            </ShinyButton>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-canvas)]/30 py-12 text-center px-4 font-sans space-y-3">
                        <MdiIcon name="alert-outline" className="text-3xl text-amber-500" />
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          Budget constraints too restrictive
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
                          We couldn&apos;t fit any single asset matching this sector and audience combination within your total budget of **₹{planningResults?.maxBudget.toLocaleString()}** for **{planningResults?.duration} {planningResults?.duration === 1 ? 'month' : 'months'}** (minimum cost per asset: ₹{Math.min(...(planningResults?.allMatches.map(a => a.price * planningResults.duration * 30) || [0])).toLocaleString()}). Try increasing your budget or choosing matching assets manually below.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Mix Distribution Chart widget */}
                  <div className="lg:col-span-4 space-y-6 w-full">
                    <VercelCard bordered={true} className="bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-3xl text-left">
                      <div className="w-full">
                        <p className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-[var(--text-secondary)] mb-2">Mix Distribution Chart</p>
                        <AnalyticsIllustration />
                      </div>
                    </VercelCard>
                  </div>
                </div>

                {/* Manual Customization Grid */}
                <div className="space-y-6 pt-8 border-t border-[var(--border-default)]">
                  <div className="text-center md:text-left">
                    <h4 className="text-2xl font-black text-white font-display uppercase tracking-tight">
                      Explore All Available Matches
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Browse through all available advertisement listings for this sector and target vertical. Build a custom campaign mix manually.
                    </p>
                  </div>

                  {planningResults?.allMatches && planningResults.allMatches.length > 0 ? (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 w-full">
                      {planningResults.allMatches.map((asset) => {
                        const inBag = isInBag(asset.id);
                        return (
                          <VercelCard
                            key={asset.id}
                            glowEffect={true}
                            animateOnHover={true}
                            bordered={true}
                            className="group overflow-hidden bg-[var(--surface-raised)]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] w-full"
                          >
                            <div className="w-full flex flex-col h-full">
                              {/* Image Container */}
                              <div
                                className="relative aspect-video w-full overflow-hidden bg-[var(--surface-canvas)] cursor-pointer"
                                onClick={() => setActiveDetailAsset(asset)}
                              >
                                <img
                                  src={asset.image}
                                  alt={asset.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 border border-[var(--border-default)] px-3 py-1 text-[10px] font-bold text-[var(--action-primary)] backdrop-blur-md">
                                  {asset.subCategory || asset.category}
                                </span>
                                <span className="absolute bottom-3 left-3 rounded-full bg-emerald-550/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white border border-emerald-400/30 backdrop-blur-sm shadow-sm select-none">
                                  ✓ Verified Spot
                                </span>
                                <div
                                  className="absolute top-3 right-3 z-10"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <label className="flex items-center space-x-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/85 px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 backdrop-blur-md cursor-pointer transition-colors shadow-sm select-none">
                                    <input
                                      type="checkbox"
                                      checked={selectedCompareAssets.some((item) => item.id === asset.id)}
                                      onChange={() => toggleCompareAsset(asset)}
                                      className="h-3.5 w-3.5 rounded border-slate-350 accent-[var(--action-primary)] cursor-pointer"
                                    />
                                    <span>Compare</span>
                                  </label>
                                </div>
                              </div>
                              {/* Info Container */}
                              <div className="flex flex-1 flex-col pt-6 text-left w-full">
                                <div className="flex-1">
                                  <p className="text-xs font-semibold text-[var(--action-primary)] flex items-center mb-1.5">
                                    <MdiIcon name="map-marker-outline" className="mr-1 text-base" />
                                    {asset.location}
                                  </p>
                                  <h3
                                    className="text-base font-bold text-white hover:text-[var(--action-primary)] transition-colors cursor-pointer"
                                    onClick={() => setActiveDetailAsset(asset)}
                                  >
                                    {asset.title}
                                  </h3>
                                  <p className="mt-2 text-xs text-[var(--text-secondary)]">
                                    Est. Reach: <span className="font-semibold text-white">{asset.reach}</span>
                                  </p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-[var(--border-default)] pt-4 w-full">
                                  <div>
                                    <p className="text-[10px] text-[var(--text-secondary)] font-bold">Estimated Cost</p>
                                    <p className="text-base font-black text-white">
                                      ₹{(asset.price * planningResults.duration * 30).toLocaleString()}
                                      <span className="text-[10px] font-normal text-[var(--text-secondary)]">/total</span>
                                    </p>
                                    <p className="text-[9px] text-[var(--text-secondary)] font-mono">₹{asset.price.toLocaleString()}/day</p>
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
                                    className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${inBag
                                      ? "bg-rose-500/10 text-rose-400 border border-rose-900/30 hover:bg-rose-650 hover:text-white"
                                      : "bg-white text-black hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
                                      }`}
                                  >
                                    {inBag ? "Remove" : "Add to Bag"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </VercelCard>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-canvas)]/30 py-20 text-center px-4 font-sans">
                      <span className="text-3xl">🫙</span>
                      <h4 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                        No Matching Placements Found
                      </h4>
                      <p className="mt-2 text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed font-medium">
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

      {/* Visual Detail Modal drawer */}
      {activeDetailAsset && (
        <MediaDetailModal
          assetId={activeDetailAsset.id}
          onClose={() => setActiveDetailAsset(null)}
        />
      )}

      {/* Side-by-side comparison modal overlay */}
      {isCompareOpen && (
        <CompareModal
          selectedAssets={selectedCompareAssets}
          onClose={() => setIsCompareOpen(false)}
          onRemoveAsset={toggleCompareAsset}
        />
      )}

      {/* Sticky float Comparison trigger widget */}
      {selectedCompareAssets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[var(--surface-raised)] border border-[var(--border-default)] shadow-2xl rounded-2xl px-6 py-4 flex items-center justify-between gap-6 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--action-primary)] text-[#0B1E3B] font-bold text-xs size-5 flex items-center justify-center">
              {selectedCompareAssets.length}
            </span>
            <span className="text-xs font-bold text-[var(--text-primary)]">Assets in comparison</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCompareAssets([])}
              className="text-xs font-bold text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
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
