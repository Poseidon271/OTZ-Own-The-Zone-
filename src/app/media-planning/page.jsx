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

  // Lightweight planning intake popup states
  const [planningIntakeOpen, setPlanningIntakeOpen] = useState(false);
  const [intakeObjective, setIntakeObjective] = useState("");
  const [intakeSector, setIntakeSector] = useState("");
  const [intakeAudience, setIntakeAudience] = useState("");
  const [intakeBudget, setIntakeBudget] = useState("");

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("otz_planning_intake_dismissed");
    if (!isDismissed) {
      setPlanningIntakeOpen(true);
    }
  }, []);

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem("otz_planning_intake_dismissed", "true");
    setPlanningProductType(intakeSector);
    setPlanningAudience(intakeAudience);
    
    // Map budget band to raw number
    let rawBudget = "";
    if (intakeBudget === "₹10K - ₹50K") rawBudget = "50000";
    else if (intakeBudget === "₹50K - ₹2L") rawBudget = "200000";
    else if (intakeBudget === "₹2L - ₹10L") rawBudget = "1000000";
    else if (intakeBudget === "₹10L+") rawBudget = "5000000";
    setPlanningBudget(rawBudget);
    
    sessionStorage.setItem("otz_planning_objective", intakeObjective);
    setPlanningIntakeOpen(false);
  };

  const handleIntakeSkip = () => {
    sessionStorage.setItem("otz_planning_intake_dismissed", "true");
    setPlanningIntakeOpen(false);
  };

  // Recommendations state coordinates
  const [planningStep, setPlanningStep] = useState(1);
  const [planningResults, setPlanningResults] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Modals view coordinates
  const [activeDetailAsset, setActiveDetailAsset] = useState(null);
  const [selectedCompareAssets, setSelectedCompareAssets] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Filter listings based on user parameters and calculate allocation mixes
  const generatePlanningRecommendation = (e) => {
    e.preventDefault();
    if (loadingPlan) return;
    setLoadingPlan(true);

    setTimeout(() => {
      const maxBudgetVal = parseFloat(planningBudget) || 0;
      const months = parseInt(planningDuration) || 1;

      // Filter relevant listings matching sector and audience from mockAdvertisingAssets
      const matchingListings = mockAdvertisingAssets.filter((asset) => {
        const matchSector = !planningProductType || (asset.productSector && asset.productSector.toLowerCase() === planningProductType.toLowerCase());
        const matchAudience = !planningAudience || (asset.targetAudience && asset.targetAudience.toLowerCase() === planningAudience.toLowerCase());
        return matchSector && matchAudience;
      });

      // Greedy allocation mix solver
      let currentCost = 0;
      const bundleItems = [];
      const sortedByReach = [...matchingListings].sort((a, b) => {
        const reachA = parseInt(a.reach?.replace(/[^0-9]/g, "")) || 0;
        const reachB = parseInt(b.reach?.replace(/[^0-9]/g, "")) || 0;
        return reachB - reachA; // high reach priority
      });

      for (const asset of sortedByReach) {
        const assetCost = asset.price * months * 30; // Daily cost * days duration
        if (currentCost + assetCost <= maxBudgetVal) {
          bundleItems.push({
            id: asset.id,
            title: asset.title,
            location: asset.location,
            reach: asset.reach,
            price: asset.price,
            image: asset.image,
            category: asset.category,
            subCategory: asset.subCategory,
            specs: asset.specs || "Standard placement spec size",
          });
          currentCost += assetCost;
        }
      }

      // Compile scored alternative recommendations
      const scoredAlternatives = mockAdvertisingAssets
        .map((asset) => {
          let score = 0;
          let reasons = [];

          // 1. Sector match
          if (asset.productSector && planningProductType && asset.productSector.toLowerCase() === planningProductType.toLowerCase()) {
            score += 3;
            reasons.push("Same sector");
          }
          // 2. Audience match
          if (asset.targetAudience && planningAudience && asset.targetAudience.toLowerCase() === planningAudience.toLowerCase()) {
            score += 3;
            reasons.push("Same audience");
          }
          // 3. Budget proximity (price check)
          const assetTotalCost = asset.price * months * 30;
          if (assetTotalCost <= maxBudgetVal) {
            score += 2;
            reasons.push("Within budget limit");
          } else if (assetTotalCost <= maxBudgetVal * 1.5) {
            score += 1;
            reasons.push("Near budget range");
          }

          return {
            id: asset.id,
            title: asset.title,
            location: asset.location,
            reach: asset.reach,
            price: asset.price,
            image: asset.image,
            category: asset.category,
            subCategory: asset.subCategory,
            specs: asset.specs || "Standard placement spec size",
            score,
            reasons: reasons.length > 0 ? reasons : ["Similar media space"],
          };
        })
        .filter((asset) => {
          // Exclude assets already in the bundle
          return !bundleItems.some((b) => b.id === asset.id);
        })
        .sort((a, b) => b.score - a.score);

      setPlanningResults({
        bundle: bundleItems,
        totalCost: currentCost,
        maxBudget: maxBudgetVal,
        duration: months,
        alternatives: scoredAlternatives.slice(0, 4), // Top 4 closest matches
        allMatches: matchingListings.map((l) => ({
          id: l.id,
          title: l.title,
          location: l.location,
          reach: l.reach,
          price: l.price,
          image: l.image,
          category: l.category,
          subCategory: l.subCategory,
          specs: l.specs || "Standard placement spec size",
        })),
      });
      setLoadingPlan(false);
      setPlanningStep(2);
    }, 800);
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
    <div className="theme-dark min-h-screen relative flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Ambient Glow Gradients Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 95% 35%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 5% 75%, rgba(19, 42, 79, 0.25) 0%, transparent 55%)"
        }}
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
                      <label htmlFor="planning-sector" className="block text-sm font-bold text-[var(--text-secondary)]">
                        1. Product Sector
                      </label>
                      <select
                        id="planning-sector"
                        value={planningProductType}
                        onChange={(e) => setPlanningProductType(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm text-white cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
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
                      <label htmlFor="planning-audience" className="block text-sm font-bold text-[var(--text-secondary)]">
                        2. Target Audience Vertical
                      </label>
                      <select
                        id="planning-audience"
                        value={planningAudience}
                        onChange={(e) => setPlanningAudience(e.target.value)}
                        className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm text-white cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
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
                      <label htmlFor="planning-budget" className="block text-sm font-bold text-[var(--text-secondary)]">
                        3. Maximum Budget Allocation (₹)
                      </label>
                      <div className="relative rounded-2xl shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5">
                          <span className="text-sm font-bold text-[var(--text-secondary)]">₹</span>
                        </div>
                        <input
                          id="planning-budget"
                          type="number"
                          value={planningBudget}
                          onChange={(e) => setPlanningBudget(e.target.value)}
                          placeholder="e.g. 500000"
                          min="1000"
                          className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] py-3.5 pl-9 pr-4 text-sm text-white font-semibold outline-none focus:border-[var(--action-primary)]"
                          required
                        />
                      </div>
                    </div>

                    {/* Input 4: Campaign Duration (Months) */}
                    <div className="space-y-3">
                      <label htmlFor="planning-duration" className="block text-sm font-bold text-[var(--text-secondary)]">
                        4. Campaign Booking Duration
                      </label>
                      <select
                        id="planning-duration"
                        value={planningDuration}
                        onChange={(e) => setPlanningDuration(parseInt(e.target.value))}
                        className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm text-white cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
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
                      disabled={loadingPlan}
                      className="w-full rounded-2xl py-4 text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loadingPlan ? (
                        <>
                          <MdiIcon name="loading" className="text-base mr-1.5 animate-spin" />
                          <span>Generating Strategy Plan...</span>
                        </>
                      ) : (
                        <>
                          <MdiIcon name="rocket-launch-outline" className="text-base mr-1.5" />
                          <span>Generate Strategy Plan</span>
                        </>
                      )}
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
                                      ? "bg-rose-500/10 text-rose-450 border border-rose-900/30 hover:bg-rose-600 hover:text-white"
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
                                          } else {
                                            addToBag(asset);
                                            updateDuration(asset.id, planningResults.duration);
                                          }
                                        }}
                                        className={`rounded px-2.5 py-1 text-[9px] font-bold cursor-pointer transition-colors ${inBag
                                          ? "bg-rose-500/10 text-rose-450 border border-rose-900/30 hover:bg-rose-600 hover:text-white"
                                          : "bg-white/5 text-white border border-white/10 hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
                                          }`}
                                      >
                                        {inBag ? "Remove" : "Add"}
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
                        {/* Summary Warning block */}
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-3">
                          <MdiIcon name="alert-circle-outline" className="text-xl shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold block text-white mb-0.5">No Exact Match Compiled within Budget</span>
                            <span>We couldn&apos;t fit an exact mix matching sector <strong>{planningProductType}</strong> and audience <strong>{planningAudience}</strong> for a total budget limit of <strong>₹{planningResults?.maxBudget.toLocaleString()}</strong>.</span>
                          </div>
                        </div>

                        {planningResults.alternatives && planningResults.alternatives.filter((a) => a.score > 0).length > 0 ? (
                          /* Render closest scored alternatives list */
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
                                          } else {
                                            addToBag(asset);
                                            updateDuration(asset.id, planningResults.duration);
                                          }
                                        }}
                                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${inBag
                                          ? "bg-rose-500/10 text-rose-450 border border-rose-900/30 hover:bg-rose-600 hover:text-white"
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
                          </div>
                        ) : (
                          /* True Empty State layout */
                          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--surface-canvas)]/30 py-12 text-center px-4 font-sans space-y-4">
                            <MdiIcon name="close-circle-outline" className="text-4xl text-[var(--status-error)]" />
                            <h4 className="text-sm font-bold text-white">No Matching Alternative Plans Found</h4>
                            <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed font-medium">
                              We couldn&apos;t compiling any nearby media plans matching your sector or target audience.
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
    </div>
  );
}
