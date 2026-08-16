"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import BagDrawer from "@/components/BagDrawer";
import CompareModal from "@/components/CompareModal";
import { useBag } from "@/context/BagContext";

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { VercelCard } from "@/components/scrollx/vercel-card";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToBag, removeFromBag, isInBag, setIsBagOpen } = useBag();

  // Route pre-params check to skip intake flow if deep-linking
  const hasParams = searchParams.get("q") || searchParams.get("channel") || searchParams.get("goal") || searchParams.get("step") === "2" || searchParams.get("skipIntake") === "true";
  const [buyingStep, setBuyingStep] = useState(hasParams ? 2 : 1);

  // Intake States
  const [intakeObjective, setIntakeObjective] = useState("");
  const [intakeGeo, setIntakeGeo] = useState("");
  const [intakeMediaType, setIntakeMediaType] = useState("");
  const [intakePriceBand, setIntakePriceBand] = useState("");
  const [hasActiveIntake, setHasActiveIntake] = useState(false);

  // Main catalog / user state
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
  const [selectedMediaType, setSelectedMediaType] = useState(() => searchParams.get("channel") || "");
  const [selectedNiche, setSelectedNiche] = useState(() => {
    const goalParam = searchParams.get("goal");
    if (goalParam) {
      const gp = goalParam.toLowerCase();
      if (gp === "awareness") return "FMCG";
      if (gp === "app downloads") return "Technology & SaaS";
      if (gp === "sales") return "Fashion & Lifestyle";
    }
    return "";
  });
  const [selectedGeo, setSelectedGeo] = useState("");
  const [selectedPriceBand, setSelectedPriceBand] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState("");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Comparison State
  const [selectedCompareAssets, setSelectedCompareAssets] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Empty state sourcing form
  const [sourcingMessage, setSourcingMessage] = useState("");
  const [sourcingBudget, setSourcingBudget] = useState("");
  const [sourcingSent, setSourcingSent] = useState(false);
  const [sourcingError, setSourcingError] = useState("");

  // Static options
  const mediaTypes = ["OOH", "TV", "Radio", "Cinema", "Digital", "Influencer", "Print"];
  const niches = ["FMCG", "Technology & SaaS", "Corporate & B2B", "Automobile", "Education", "Real Estate", "Sports & Gaming", "Healthcare", "Fashion & Lifestyle"];
  const geographies = ["Mumbai", "Delhi NCR", "Bengaluru", "National Grid", "Regional South", "Regional West"];
  const priceBands = ["Under ₹10K", "₹10K - ₹50K", "₹50K - ₹2L", "₹2L - ₹10L", "₹10L+"];
  const reachBands = ["Under 100K", "100K - 500K", "500K - 2M", "2M+"];

  // Load session & items
  useEffect(() => {
    let active = true;
    const loadMarketplace = async () => {
      try {
        // Fetch session
        const authRes = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-session" })
        });
        const authData = await authRes.json();
        if (!active) return;
        if (authData.user) {
          setUser(authData.user);
          // Apply pre-filters if brand user holds preferences
          if (authData.user.role === "brand" && authData.user.profile) {
            const p = authData.user.profile;
            if (p.niche && !selectedNiche) setSelectedNiche(p.niche);
            if (p.budget_band && !selectedPriceBand) setSelectedPriceBand(p.budget_band);
            if (p.geography && !selectedGeo) setSelectedGeo(p.geography);
          }
        }

        // Fetch listings catalog
        const listRes = await fetch("/api/listings");
        const listData = await listRes.json();
        if (active && listData.listings) {
          // Moderation: only show approved listings
          const approved = listData.listings.filter((l) => l.state === "published");
          setListings(approved);
        }
      } catch (err) {
        console.error("Failed to compile marketplace assets", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadMarketplace();
    return () => { active = false; };
  }, []);

  // Parse visibility metric count helper
  const parseVisibilityCount = (reachStr) => {
    if (!reachStr) return 0;
    const num = parseInt(reachStr.replace(/[^0-9]/g, "")) || 0;
    if (reachStr.toLowerCase().includes("k")) return num * 1000;
    if (reachStr.toLowerCase().includes("m")) return num * 1000000;
    return num;
  };

  // GREEDY FILTER & SORT LOGIC
  const filteredAndSortedListings = useMemo(() => {
    let result = listings.filter((item) => {
      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const netMatch = item.parent_network?.toLowerCase().includes(query);
        const tagsMatch = item.niche_tags?.some((t) => t.toLowerCase().includes(query));
        if (!titleMatch && !netMatch && !tagsMatch) return false;
      }

      // Media Type
      if (selectedMediaType && item.media_type !== selectedMediaType) {
        return false;
      }

      // Niche
      if (selectedNiche && !item.niche_tags?.includes(selectedNiche)) {
        return false;
      }

      // Geography
      if (selectedGeo && !item.geography?.includes(selectedGeo)) {
        return false;
      }

      // Price Band
      if (selectedPriceBand) {
        const price = item.raw_price || 0;
        if (selectedPriceBand === "Under ₹10K" && price >= 10000) return false;
        if (selectedPriceBand === "₹10K - ₹50K" && (price < 10000 || price > 50000)) return false;
        if (selectedPriceBand === "₹50K - ₹2L" && (price < 50000 || price > 200000)) return false;
        if (selectedPriceBand === "₹2L - ₹10L" && (price < 200000 || price > 1000000)) return false;
        if (selectedPriceBand === "₹10L+" && price < 1000000) return false;
      }

      // Reach / Visibility
      if (selectedVisibility) {
        const reachNum = parseVisibilityCount(item.visibility_metric);
        if (selectedVisibility === "Under 100K" && reachNum >= 100000) return false;
        if (selectedVisibility === "100K - 500K" && (reachNum < 100000 || reachNum > 500000)) return false;
        if (selectedVisibility === "500K - 2M" && (reachNum < 500000 || reachNum > 2000000)) return false;
        if (selectedVisibility === "2M+" && reachNum < 2000000) return false;
      }

      // Verified
      if (onlyVerified && !item.verified) {
        return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "price-low") return a.raw_price - b.raw_price;
      if (sortBy === "price-high") return b.raw_price - a.raw_price;
      if (sortBy === "visibility") {
        return parseVisibilityCount(b.visibility_metric) - parseVisibilityCount(a.visibility_metric);
      }
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      // Relevance
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [listings, searchQuery, selectedMediaType, selectedNiche, selectedGeo, selectedPriceBand, selectedVisibility, onlyVerified, sortBy]);

  // Intake Submission
  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    setHasActiveIntake(true);
    setSelectedGeo(intakeGeo);
    setSelectedMediaType(intakeMediaType);
    setSelectedPriceBand(intakePriceBand);

    // Map objective to niches tags if possible
    if (intakeObjective === "Downloads") setSelectedNiche("Technology & SaaS");
    else if (intakeObjective === "Orders") setSelectedNiche("Fashion & Lifestyle");
    else if (intakeObjective === "Awareness") setSelectedNiche("FMCG");
    else setSelectedNiche("");

    setBuyingStep(2);
  };

  const handleSkipIntake = () => {
    setHasActiveIntake(false);
    setBuyingStep(2);
  };

  // Compare toggles
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

  const mapListingToBagItem = (item) => ({
    id: item.id,
    title: item.title,
    location: item.geography?.[0] || "",
    reach: item.visibility_metric,
    price: item.raw_price,
    image: item.image_url || item.image,
    category: item.media_type,
    subCategory: item.parent_network,
    specs: item.specifications || "Standard placements specs",
    availability: item.availability || { "Nov": true, "Dec": true, "Jan": true }
  });

  // Sourcing enquiry
  const handleSourcingSubmit = async (e) => {
    e.preventDefault();
    if (!sourcingMessage.trim()) {
      setSourcingError("Please enter your requirements details.");
      return;
    }

    if (!user) {
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
      return;
    }

    setSourcingError("");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "sourcing",
          source: "marketplace-empty-state",
          message: `[CUSTOM SOURCING REQUEST]\nBudget: ${sourcingBudget || "Not Specified"}\nDetails: ${sourcingMessage}\nSearch Attempted: q="${searchQuery}" media="${selectedMediaType}" geo="${selectedGeo}"`
        })
      });

      const data = await res.json();
      if (data.success) {
        setSourcingSent(true);
        setSourcingMessage("");
      } else {
        setSourcingError(data.error || "Request failed.");
      }
    } catch (err) {
      setSourcingError("Failed to connect to the server.");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedMediaType("");
    setSelectedNiche("");
    setSelectedGeo("");
    setSelectedPriceBand("");
    setSelectedVisibility("");
    setOnlyVerified(false);
    setHasActiveIntake(false);
  };

  return (
    <div className="theme-dark min-h-screen flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] relative overflow-hidden font-sans">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar onLogoClick={() => router.push("/")} />
      <BagDrawer />

      {isCompareOpen && (
        <CompareModal
          selectedAssets={selectedCompareAssets.map(mapListingToBagItem)}
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        {buyingStep === 1 ? (
          /* Step 1: Intake Wizard Form */
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-6">
            {/* Hero / Intro */}
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-8">
              <h1 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-[1.15]">
                Discover & Book Premium <span className="text-[var(--action-primary)]">Media Placements</span>
              </h1>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Explore verified rates, compare reach stats, and reserve offline or digital spaces instantly. Bypass broker markups and start building your campaign layout.
              </p>
            </div>

            <VercelCard bordered={true} className="p-2 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-3xl">
              <form
                onSubmit={handleIntakeSubmit}
                className="w-full p-6 space-y-8 text-left"
              >
                <div className="border-b border-[var(--border-default)] pb-4">
                  <h3 className="text-2xl font-black text-white font-display">
                    Media Buying Intake
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Provide a few details to customize the available spaces in our catalog.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Objective select */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      Campaign Objective
                    </label>
                    <select
                      value={intakeObjective}
                      onChange={(e) => setIntakeObjective(e.target.value)}
                      className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select campaign objective...</option>
                      <option value="Awareness">Awareness</option>
                      <option value="Downloads">Downloads</option>
                      <option value="Orders">Orders / Sales</option>
                      <option value="Footfall">Footfall</option>
                    </select>
                  </div>

                  {/* Location / Geography select */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      Location / Target Area
                    </label>
                    <select
                      value={intakeGeo}
                      onChange={(e) => setIntakeGeo(e.target.value)}
                      className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select Region...</option>
                      {geographies.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Media Type / Channel select */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      Media Type / Channel
                    </label>
                    <select
                      value={intakeMediaType}
                      onChange={(e) => setIntakeMediaType(e.target.value)}
                      className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select Media Type...</option>
                      {mediaTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget select */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      Budget Range
                    </label>
                    <select
                      value={intakePriceBand}
                      onChange={(e) => setIntakePriceBand(e.target.value)}
                      className="w-full rounded-2xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-4 py-3.5 text-sm text-slate-200 cursor-pointer font-medium outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select budget range...</option>
                      {priceBands.map((pb) => (
                        <option key={pb} value={pb}>{pb}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="pt-4 border-t border-[var(--border-default)] flex flex-col gap-2">
                  <ShinyButton
                    type="submit"
                    className="w-full rounded-2xl py-4 text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MdiIcon name="shopping-outline" className="text-base mr-1.5" /> Buy Media Placements
                  </ShinyButton>
                  <button
                    type="button"
                    onClick={handleSkipIntake}
                    className="w-full text-center text-xs font-bold text-[#A5B5CD] hover:text-white transition-colors py-2 cursor-pointer bg-transparent border-none focus:outline-none"
                  >
                    Skip Intake / Browse Catalog directly
                  </button>
                </div>
              </form>
            </VercelCard>
          </div>
        ) : (
          /* Step 2: Catalog Results view */
          <div className="space-y-6">
            {/* Breadcrumbs Return Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[rgba(184,199,217,0.18)] hover:text-[var(--action-primary)] transition-all cursor-pointer border border-[var(--border-default)]"
              >
                <MdiIcon name="arrow-left" className="text-base" /> Return to Homepage
              </button>

              {hasActiveIntake && (
                <button
                  onClick={() => setBuyingStep(1)}
                  className="text-xs font-bold text-[var(--action-primary)] hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
                >
                  <MdiIcon name="pencil" /> Modify Intake Details
                </button>
              )}
            </div>

            {/* Active Intake Banner */}
            {hasActiveIntake && (
              <div className="p-4 bg-[var(--surface-raised)]/60 border border-[var(--border-default)] rounded-2xl flex flex-wrap items-center gap-4 text-xs">
                <span className="font-bold text-[var(--action-primary)] uppercase tracking-wider text-[10px]">INTAKE CAMPAIGN:</span>
                {intakeObjective && (
                  <span className="bg-[#0B1E3B] px-3 py-1 rounded-full border border-[var(--border-default)] text-white font-bold shadow-sm">
                    Objective: {intakeObjective}
                  </span>
                )}
                {selectedGeo && (
                  <span className="bg-[#0B1E3B] px-3 py-1 rounded-full border border-[var(--border-default)] text-white font-bold shadow-sm">
                    Geo: {selectedGeo}
                  </span>
                )}
                {selectedMediaType && (
                  <span className="bg-[#0B1E3B] px-3 py-1 rounded-full border border-[var(--border-default)] text-white font-bold shadow-sm">
                    Media: {selectedMediaType}
                  </span>
                )}
                {selectedPriceBand && (
                  <span className="bg-[#0B1E3B] px-3 py-1 rounded-full border border-[var(--border-default)] text-white font-bold shadow-sm">
                    Budget: {selectedPriceBand}
                  </span>
                )}
              </div>
            )}

            {/* Main Marketplace catalog layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left sidebar filters */}
              <aside className="lg:col-span-3 space-y-6 text-left">
                <VercelCard bordered={true} className="p-1 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl">
                  <div className="p-4 space-y-5 w-full">
                    <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4 w-full">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Faceted Filters</h3>
                      <button
                        onClick={handleResetFilters}
                        className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--action-primary)] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <MdiIcon name="close-circle-outline" /> Clear
                      </button>
                    </div>

                    {/* Media Type */}
                    <div className="space-y-2 w-full">
                      <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Media Type</label>
                      <select
                        value={selectedMediaType}
                        onChange={(e) => setSelectedMediaType(e.target.value)}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                      >
                        <option value="">All Media Types</option>
                        {mediaTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Audience Niche */}
                    <div className="space-y-2 w-full">
                      <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Audience Niche</label>
                      <select
                        value={selectedNiche}
                        onChange={(e) => setSelectedNiche(e.target.value)}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                      >
                        <option value="">All Niches</option>
                        {niches.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    {/* Geography */}
                    <div className="space-y-2 w-full">
                      <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Geography</label>
                      <select
                        value={selectedGeo}
                        onChange={(e) => setSelectedGeo(e.target.value)}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                      >
                        <option value="">All Regions</option>
                        {geographies.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Price Band */}
                    <div className="space-y-2 w-full">
                      <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Price Band</label>
                      <select
                        value={selectedPriceBand}
                        onChange={(e) => setSelectedPriceBand(e.target.value)}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                      >
                        <option value="">All Budgets</option>
                        {priceBands.map((pb) => (
                          <option key={pb} value={pb}>{pb}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reach Bands */}
                    <div className="space-y-2 w-full">
                      <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">Est. Monthly Reach</label>
                      <select
                        value={selectedVisibility}
                        onChange={(e) => setSelectedVisibility(e.target.value)}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                      >
                        <option value="">All Reach Bands</option>
                        {reachBands.map((rb) => (
                          <option key={rb} value={rb}>{rb}</option>
                        ))}
                      </select>
                    </div>

                    {/* Verified Placements Toggle */}
                    <div className="flex items-center gap-2.5 pt-2 border-t border-[var(--border-default)] w-full">
                      <input
                        id="filter-verified"
                        type="checkbox"
                        checked={onlyVerified}
                        onChange={(e) => setOnlyVerified(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-[var(--border-default)] bg-[var(--surface-canvas)] accent-[var(--action-primary)] cursor-pointer"
                      />
                      <label htmlFor="filter-verified" className="text-xs font-bold text-[var(--text-secondary)] cursor-pointer select-none">
                        Verified Placements Only
                      </label>
                    </div>
                  </div>
                </VercelCard>
              </aside>

              {/* Right column items list */}
              <section className="lg:col-span-9 space-y-6 text-left">
                {/* Search query input */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative flex-grow w-full">
                    <span className="absolute inset-y-0 left-4 flex items-center text-[var(--text-secondary)]">
                      <MdiIcon name="magnify" className="text-xl" />
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search billboard locations, news channels, radio networks..."
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)]/40 text-white placeholder-slate-400 focus:outline-none focus:border-[var(--action-primary)] text-sm"
                    />
                  </div>

                  {/* Sort select */}
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <span className="text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">Sort by</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm font-semibold cursor-pointer"
                    >
                      <option value="relevance">Relevance (Verified First)</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="visibility">Reach: Highest First</option>
                      <option value="newest">Newest Listed</option>
                    </select>
                  </div>
                </div>

                {/* Counter match count */}
                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-1">
                  <span>Inventory Catalog</span>
                  <span>{filteredAndSortedListings.length} Match{filteredAndSortedListings.length !== 1 ? "es" : ""} found</span>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-80 bg-[var(--surface-raised)] rounded-xl border border-[var(--border-default)] animate-pulse" />
                    ))}
                  </div>
                ) : filteredAndSortedListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {filteredAndSortedListings.map((item) => {
                      const isAdded = isInBag(item.id);
                      return (
                        <VercelCard
                          key={item.id}
                          glowEffect={true}
                          animateOnHover={true}
                          bordered={true}
                          className="group overflow-hidden bg-[var(--surface-raised)]/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] w-full text-left cursor-pointer"
                          onClick={() => router.push(`/listings/${item.id}`)}
                        >
                          <div className="w-full flex flex-col h-full justify-between">
                            <div>
                              {/* Thumbnail 16:9 */}
                              <div className="relative aspect-[16/9] w-full bg-[var(--surface-canvas)] overflow-hidden border-b border-[var(--border-default)]">
                                <img
                                  src={item.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"}
                                  alt={item.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border border-[var(--border-default)]">
                                  {item.media_type}
                                </span>
                                {item.verified && (
                                  <span className="absolute top-3 right-3 bg-emerald-555 text-[#0B1E3B] text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-emerald-400/20">
                                    <MdiIcon name="check-decagram" /> Verified
                                  </span>
                                )}
                              </div>

                              {/* Info Content */}
                              <div className="p-5 space-y-2">
                                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                  {item.parent_network}
                                </p>
                                <h4 className="text-base font-bold text-white leading-snug line-clamp-2">
                                  {item.title}
                                </h4>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {item.niche_tags?.map(t => (
                                    <span key={t} className="bg-[var(--surface-canvas)] text-[var(--text-secondary)] text-[10px] font-bold px-2 py-0.5 rounded border border-[var(--border-default)]">
                                      {t}
                                    </span>
                                  ))}
                                  {item.geography?.map(g => (
                                    <span key={g} className="bg-[var(--surface-canvas)] text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-[var(--border-default)]">
                                      {g}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Compare / Cart Footer actions */}
                            <div className="px-5 pb-5 pt-3 border-t border-[var(--border-default)] space-y-4">
                              <div className="flex items-center justify-between text-xs w-full">
                                <div>
                                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block leading-none">Reach</span>
                                  <span className="text-sm font-black text-white mt-1 block">{item.visibility_metric}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block leading-none">Price Band</span>
                                  <span className="text-sm font-black text-[var(--action-primary)] tabular-nums mt-1 block">{item.price_band}</span>
                                </div>
                              </div>

                              {/* Interactive Actions Grid */}
                              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                {/* Compare checkbox */}
                                <div 
                                  className="flex items-center gap-1.5 cursor-pointer no-print" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCompareAsset(item);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    id={`compare-${item.id}`}
                                    checked={selectedCompareAssets.some((c) => c.id === item.id)}
                                    onChange={() => {}} // handled by div click
                                    className="h-3.5 w-3.5 accent-[var(--action-primary)] rounded cursor-pointer"
                                  />
                                  <label htmlFor={`compare-${item.id}`} className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-white cursor-pointer select-none">
                                    Compare
                                  </label>
                                </div>

                                {/* Cart toggle button */}
                                {isAdded ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromBag(item.id);
                                    }}
                                    className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 text-[10px] font-bold hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 transition-all cursor-pointer no-print flex items-center gap-1"
                                  >
                                    <MdiIcon name="check-bold" /> Added
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToBag(mapListingToBagItem(item));
                                      setIsBagOpen(true);
                                    }}
                                    className="rounded-lg bg-white/5 border border-white/10 hover:border-white/30 text-white px-3 py-1.5 text-[10px] font-bold transition-all cursor-pointer no-print flex items-center gap-1"
                                  >
                                    <MdiIcon name="plus" /> Add to Bag
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </VercelCard>
                      );
                    })}
                  </div>
                ) : (
                  /* No matches found empty state */
                  <VercelCard bordered={true} className="p-1 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl text-left w-full">
                    <div className="p-6 space-y-6 w-full">
                      <div className="text-center py-4 space-y-2">
                        <div className="h-14 w-14 bg-red-500/10 text-[var(--status-error)] rounded-full flex items-center justify-center mx-auto text-3xl border border-red-500/20">
                          <MdiIcon name="close-circle-outline" />
                        </div>
                        <h4 className="text-lg font-bold text-white font-display">No Matches in the Active Catalog</h4>
                        <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                          We couldn&apos;t find listings matching your specific parameters. Tap a relaxation filter below to expand your criteria.
                        </p>
                      </div>

                      {/* Nearest Filter Relaxations */}
                      <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
                        <span className="text-[10px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Nearest Filter Relaxations</span>
                        <div className="flex flex-wrap gap-3">
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white hover:bg-[var(--surface-hover)] px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Clear Search Query (&ldquo;{searchQuery}&rdquo;)
                            </button>
                          )}
                          {selectedMediaType && (
                            <button
                              onClick={() => setSelectedMediaType("")}
                              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white hover:bg-[var(--surface-hover)] px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Remove Media Type: {selectedMediaType}
                            </button>
                          )}
                          {selectedNiche && (
                            <button
                              onClick={() => setSelectedNiche("")}
                              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white hover:bg-[var(--surface-hover)] px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Remove Niche: {selectedNiche}
                            </button>
                          )}
                          {selectedGeo && (
                            <button
                              onClick={() => setSelectedGeo("")}
                              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white hover:bg-[var(--surface-hover)] px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Remove Geography: {selectedGeo}
                            </button>
                          )}
                          {selectedPriceBand && (
                            <button
                              onClick={() => setSelectedPriceBand("")}
                              className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white hover:bg-[var(--surface-hover)] px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              Remove Budget Limit: {selectedPriceBand}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sourcing request form */}
                      <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Request Media Not Listed</h4>
                          <p className="text-xs text-[var(--text-secondary)]">
                            Let our operations sourcing desk verify and secure this inventory for you.
                          </p>
                        </div>

                        {sourcingSent ? (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3">
                            <MdiIcon name="check-circle" className="text-xl" />
                            <span className="text-xs font-bold">Your sourcing demand has been logged in the ops pipeline.</span>
                          </div>
                        ) : (
                          <form onSubmit={handleSourcingSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
                            <div className="md:col-span-8 w-full">
                              <input
                                type="text"
                                value={sourcingMessage}
                                onChange={(e) => setSourcingMessage(e.target.value)}
                                placeholder="Tell us what inventory you are looking for (e.g. Bandra LED, Star Plus primetime, TRS integration)..."
                                className="w-full h-11 px-4 rounded-lg border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[var(--action-primary)]"
                              />
                            </div>
                            <div className="md:col-span-4 flex gap-2 w-full">
                              <select
                                value={sourcingBudget}
                                onChange={(e) => setSourcingBudget(e.target.value)}
                                className="h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-xs font-semibold flex-grow cursor-pointer"
                              >
                                <option value="">Select budget...</option>
                                <option value="₹10K - ₹50K">₹10K - ₹50K</option>
                                <option value="₹50K - ₹2L">₹50K - ₹2L</option>
                                <option value="₹2L - ₹10L">₹2L - ₹10L</option>
                                <option value="₹10L+">₹10L+</option>
                              </select>
                              <ShinyButton
                                type="submit"
                                className="px-5 shrink-0 h-11"
                              >
                                <MdiIcon name="send" />
                              </ShinyButton>
                            </div>
                            {sourcingError && (
                              <p className="md:col-span-12 text-xs text-[var(--status-error)] font-bold">{sourcingError}</p>
                            )}
                          </form>
                        )}
                      </div>
                    </div>
                  </VercelCard>
                )}
              </section>
            </div>

            {/* Floating comparison trigger bar */}
            {selectedCompareAssets.length > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#0B1E3B] border border-[var(--border-default)] rounded-full px-6 py-3.5 flex items-center gap-4 shadow-2xl animate-fade-in no-print">
                <span className="text-xs font-bold text-white">
                  {selectedCompareAssets.length} Slot{selectedCompareAssets.length > 1 ? 's' : ''} Selected
                </span>
                <button
                  onClick={() => setSelectedCompareAssets([])}
                  className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer bg-transparent border-none focus:outline-none"
                >
                  Clear
                </button>
                <div className="h-4 w-px bg-[var(--border-default)]"></div>
                <ShinyButton
                  onClick={() => setIsCompareOpen(true)}
                  className="rounded-xl px-4 py-1.5 text-xs font-bold shadow cursor-pointer font-sans"
                >
                  Compare Side-by-side
                </ShinyButton>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-white text-sm animate-pulse">Loading Marketplace...</div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
