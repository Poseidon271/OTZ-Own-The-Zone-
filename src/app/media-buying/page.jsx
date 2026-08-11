"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
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

  // Empty state sourcing form
  const [sourcingMessage, setSourcingMessage] = useState("");
  const [sourcingBudget, setSourcingBudget] = useState("");
  const [sourcingSent, setSourcingSent] = useState(false);
  const [sourcingError, setSourcingError] = useState("");

  // Load listings & auth session
  useEffect(() => {
    // Fetch user
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-session" })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          // If brand user is logged in, pre-apply brand profile default filters if no URL parameters are active
          const isUrlEmpty = !searchParams.get("goal") && !searchParams.get("channel") && !searchParams.get("q");
          if (data.user.role === "brand" && data.user.profile && isUrlEmpty) {
            const prof = data.user.profile;
            if (prof.niche) setSelectedNiche(prof.niche);
            if (prof.budget_band) setSelectedPriceBand(prof.budget_band);
            if (prof.geography) setSelectedGeo(prof.geography);
          }
        }
      });

    // Fetch listings
    fetch("/api/listings")
      .then((res) => res.json())
      .then((data) => {
        if (data.listings) {
          setListings(data.listings);
        }
      })
      .catch((err) => console.error("Error loading listings", err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  // Filters taxonomy lists
  const mediaTypes = ["OOH", "Digital", "Influencer-Creator", "Event or Venue", "TV", "Radio", "Print"];
  const niches = [
    "FMCG", "Fashion & Lifestyle", "Technology & SaaS", 
    "Real Estate & Infrastructure", "Healthcare & Wellness", "Automobiles",
    "Entertainment & Sports", "Finance & Insurance", "Food & Hospitality"
  ];
  const geographies = ["Mumbai", "Delhi-NCR", "Pan-India"];
  const priceBands = ["₹10K - ₹50K", "₹50K - ₹2L", "₹2L - ₹10L", "₹10L+"];
  const visibilityBands = ["< 100K views", "100K - 500K views", "500K - 2M views", "2M+ views"];

  // Helper to parse visibility strings for sorting
  const parseVisibilityCount = (reachStr) => {
    const num = parseFloat(reachStr);
    const isM = reachStr.toLowerCase().includes("m");
    const isK = reachStr.toLowerCase().includes("k");
    if (isM) return num * 1000000;
    if (isK) return num * 1000;
    return num || 0;
  };

  // Filter & Sort Logic
  const filteredAndSortedListings = useMemo(() => {
    // 1. Filter
    let result = listings.filter((item) => {
      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const parentMatch = item.parent_network?.toLowerCase().includes(query);
        const geoMatch = item.geography?.some(g => g.toLowerCase().includes(query));
        const tagMatch = item.niche_tags?.some(t => t.toLowerCase().includes(query));
        if (!titleMatch && !parentMatch && !geoMatch && !tagMatch) return false;
      }

      // Media Type Filter
      if (selectedMediaType && item.media_type !== selectedMediaType) return false;

      // Niche Filter
      if (selectedNiche && !item.niche_tags?.includes(selectedNiche)) return false;

      // Geo Filter
      if (selectedGeo && !item.geography?.includes(selectedGeo) && !item.geography?.includes("Pan-India")) return false;

      // Price Band Filter
      if (selectedPriceBand && item.price_band !== selectedPriceBand) return false;

      // Visibility Filter
      if (selectedVisibility) {
        const count = parseVisibilityCount(item.visibility_metric);
        if (selectedVisibility === "< 100K views" && count >= 100000) return false;
        if (selectedVisibility === "100K - 500K views" && (count < 100000 || count > 500000)) return false;
        if (selectedVisibility === "500K - 2M views" && (count < 500000 || count > 2000000)) return false;
        if (selectedVisibility === "2M+ views" && count < 2000000) return false;
      }

      // Verification Filter
      if (onlyVerified && !item.verified) return false;

      return true;
    });

    // 2. Sort
    result.sort((a, b) => {
      if (sortBy === "price-low") {
        return a.raw_price - b.raw_price;
      }
      if (sortBy === "price-high") {
        return b.raw_price - a.raw_price;
      }
      if (sortBy === "visibility") {
        return parseVisibilityCount(b.visibility_metric) - parseVisibilityCount(a.visibility_metric);
      }
      if (sortBy === "newest") {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
      // Default / Relevance: Verified first, then ID deterministic
      if (a.verified && !b.verified) return -1;
      if (!a.verified && b.verified) return 1;
      return a.id.localeCompare(b.id);
    });

    return result;
  }, [listings, searchQuery, selectedMediaType, selectedNiche, selectedGeo, selectedPriceBand, selectedVisibility, onlyVerified, sortBy]);

  // Submit custom sourcing enquiry on empty search results
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
  };

  return (
    <div className="theme-light min-h-screen flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      <Navbar onLogoClick={() => router.push("/")} />

      <main className="flex-grow pt-24 pb-16 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Faceted Filters (Sidebar) */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[var(--border-default)] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <h3 className="text-h3 font-bold text-[var(--text-primary)]">Faceted Filters</h3>
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--action-primary)] flex items-center gap-1 cursor-pointer"
              >
                <MdiIcon name="close-circle-outline" /> Clear
              </button>
            </div>

            {/* Media Type */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">Media Type</label>
              <select
                value={selectedMediaType}
                onChange={(e) => setSelectedMediaType(e.target.value)}
                className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
              >
                <option value="">All Media Types</option>
                {mediaTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Niche / Category */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">Audience Niche</label>
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
              >
                <option value="">All Niches</option>
                {niches.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Geography */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">Geography</label>
              <select
                value={selectedGeo}
                onChange={(e) => setSelectedGeo(e.target.value)}
                className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
              >
                <option value="">All Locations</option>
                {geographies.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Price Band */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">Price Band</label>
              <select
                value={selectedPriceBand}
                onChange={(e) => setSelectedPriceBand(e.target.value)}
                className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
              >
                <option value="">All Budgets</option>
                {priceBands.map((band) => (
                  <option key={band} value={band}>{band}</option>
                ))}
              </select>
            </div>

            {/* Visibility Band */}
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">Reach / Visibility</label>
              <select
                value={selectedVisibility}
                onChange={(e) => setSelectedVisibility(e.target.value)}
                className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
              >
                <option value="">All Views</option>
                {visibilityBands.map((vis) => (
                  <option key={vis} value={vis}>{vis}</option>
                ))}
              </select>
            </div>

            {/* Verification checkbox */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-default)]">
              <input
                type="checkbox"
                id="verified-check"
                checked={onlyVerified}
                onChange={(e) => setOnlyVerified(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--action-primary)] focus:ring-[var(--border-focus)]"
              />
              <label htmlFor="verified-check" className="text-xs font-bold text-[var(--text-primary)] cursor-pointer flex items-center gap-1">
                <MdiIcon name="check-decagram" className="text-[var(--status-success-text)]" />
                <span>Verified Zones Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Column: Search, Sort and Listing Grid */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Search bar and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-[var(--border-default)] shadow-sm">
            
            {/* Substring Search Input */}
            <div className="relative w-full sm:max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-[var(--text-tertiary)]">
                <MdiIcon name="magnify" className="text-xl" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Star, Bandra, billboard, CP..."
                className="input-field pl-10 focus-ring"
              />
            </div>

            {/* Sort Select dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <span className="text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm font-semibold"
              >
                <option value="relevance">Relevance (Verified First)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="visibility">Reach: Highest First</option>
                <option value="newest">Newest Listed</option>
              </select>
            </div>
          </div>

          {/* Active Pre-filters Banner (Section 3.4) */}
          {user?.role === "brand" && user.profile && (
            <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-[var(--text-secondary)]">Brand Profile Pre-Filters:</span>
              {user.profile.niche && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[var(--border-default)] text-[var(--text-primary)] font-semibold shadow-sm">
                  Niche: {user.profile.niche}
                  <button onClick={() => setSelectedNiche("")} className="hover:text-red-500 font-bold ml-0.5 cursor-pointer">×</button>
                </span>
              )}
              {user.profile.budget_band && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[var(--border-default)] text-[var(--text-primary)] font-semibold shadow-sm">
                  Budget: {user.profile.budget_band}
                  <button onClick={() => setSelectedPriceBand("")} className="hover:text-red-500 font-bold ml-0.5 cursor-pointer">×</button>
                </span>
              )}
              {user.profile.geography && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-[var(--border-default)] text-[var(--text-primary)] font-semibold shadow-sm">
                  Geo: {user.profile.geography}
                  <button onClick={() => setSelectedGeo("")} className="hover:text-red-500 font-bold ml-0.5 cursor-pointer">×</button>
                </span>
              )}
            </div>
          )}

          {/* Listings count and results */}
          <div className="flex items-center justify-between text-caption-default font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-1">
            <span>Marketplace Catalog</span>
            <span>{filteredAndSortedListings.length} Match{filteredAndSortedListings.length !== 1 ? "es" : ""} found</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-xl border border-[var(--border-default)] animate-pulse" />
              ))}
            </div>
          ) : filteredAndSortedListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/listings/${item.id}`)}
                  className="card-raised cursor-pointer overflow-hidden bg-white border border-[var(--border-default)] transition-all flex flex-col justify-between"
                  style={{ borderRadius: "10px", boxShadow: "var(--shadow-raised)" }}
                >
                  <div>
                    {/* 16:9 Image */}
                    <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden border-b border-[var(--border-default)]">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
                        {item.media_type}
                      </span>
                      {item.verified && (
                        <span className="absolute top-3 right-3 bg-[#2BD67B] text-[#0B1E3B] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <MdiIcon name="check-decagram" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-2">
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                        {item.parent_network}
                      </p>
                      <h4 className="text-h3 text-[var(--text-primary)] leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.niche_tags?.map(t => (
                          <span key={t} className="bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-[10px] font-semibold px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                        {item.geography?.map(g => (
                          <span key={g} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions / Stats footer */}
                  <div className="px-5 pb-5 pt-3 border-t border-[var(--surface-subtle)] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Verified Reach</span>
                      <span className="text-body-strong text-[var(--text-primary)]">{item.visibility_metric}</span>
                      <span className="text-[9px] text-[var(--text-tertiary)] block">Source: {item.reach_source}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Price Range</span>
                      <span className="text-body-strong text-[var(--action-primary)] tabular-nums">{item.price_band}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No Dead-Ends Empty state (Section 5.4)
            <div className="p-8 rounded-2xl bg-white border border-[var(--border-default)] shadow-sm space-y-6 animate-scale-up">
              <div className="text-center py-4 space-y-2">
                <div className="h-16 w-16 bg-red-50 text-[var(--status-error)] rounded-full flex items-center justify-center mx-auto text-3xl">
                  <MdiIcon name="close-circle-outline" />
                </div>
                <h4 className="text-h3 text-[var(--text-primary)]">No Matches in the Active Catalog</h4>
                <p className="text-small text-[var(--text-secondary)] max-w-md mx-auto">
                  We couldn&apos;t find listings matching your specific parameters. Tap a relaxation filter below to expand your criteria.
                </p>
              </div>

              {/* Nearest Filter Relaxations */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-default)]">
                <span className="text-xs uppercase font-bold text-[var(--text-secondary)] block">Nearest Filter Relaxations</span>
                <div className="flex flex-wrap gap-3">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="btn-secondary h-10 px-4 text-xs flex items-center gap-1.5"
                    >
                      Clear Search Query (&ldquo;{searchQuery}&rdquo;)
                    </button>
                  )}
                  {selectedMediaType && (
                    <button
                      onClick={() => setSelectedMediaType("")}
                      className="btn-secondary h-10 px-4 text-xs flex items-center gap-1.5"
                    >
                      Remove Media Type: {selectedMediaType}
                    </button>
                  )}
                  {selectedNiche && (
                    <button
                      onClick={() => setSelectedNiche("")}
                      className="btn-secondary h-10 px-4 text-xs flex items-center gap-1.5"
                    >
                      Remove Niche: {selectedNiche}
                    </button>
                  )}
                  {selectedGeo && (
                    <button
                      onClick={() => setSelectedGeo("")}
                      className="btn-secondary h-10 px-4 text-xs flex items-center gap-1.5"
                    >
                      Remove Geography: {selectedGeo}
                    </button>
                  )}
                  {selectedPriceBand && (
                    <button
                      onClick={() => setSelectedPriceBand("")}
                      className="btn-secondary h-10 px-4 text-xs flex items-center gap-1.5"
                    >
                      Remove Budget Limit: {selectedPriceBand}
                    </button>
                  )}
                </div>
              </div>

              {/* Request Sourcing Form */}
              <div className="pt-6 border-t border-[var(--border-default)] space-y-4">
                <div>
                  <h4 className="text-body-strong text-[var(--text-primary)]">Request Media Not Listed</h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Let our operations sourcing desk verify and secure this inventory for you.
                  </p>
                </div>

                {sourcingSent ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-[var(--status-success-text)] rounded-xl flex items-center gap-3">
                    <MdiIcon name="check-circle" className="text-xl" />
                    <span className="text-xs font-bold">Your sourcing demand has been logged in the ops pipeline.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSourcingSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <input
                        type="text"
                        value={sourcingMessage}
                        onChange={(e) => setSourcingMessage(e.target.value)}
                        placeholder="Tell us what inventory you are looking for (e.g. Bandra LED, Star Plus primetime, TRS integration)..."
                        className="input-field focus-ring"
                      />
                    </div>
                    <div className="md:col-span-4 flex gap-2">
                      <select
                        value={sourcingBudget}
                        onChange={(e) => setSourcingBudget(e.target.value)}
                        className="h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-xs font-semibold flex-grow"
                      >
                        <option value="">Select budget...</option>
                        <option value="₹10K - ₹50K">₹10K - ₹50K</option>
                        <option value="₹50K - ₹2L">₹50K - ₹2L</option>
                        <option value="₹2L - ₹10L">₹2L - ₹10L</option>
                        <option value="₹10L+">₹10L+</option>
                      </select>
                      <button
                        type="submit"
                        className="btn-primary px-5 shrink-0"
                        style={{ color: "#0B1E3B" }}
                      >
                        <MdiIcon name="send" /> Send
                      </button>
                    </div>
                    {sourcingError && (
                      <p className="md:col-span-12 text-xs text-[var(--status-error)] font-bold">{sourcingError}</p>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="theme-light min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <div className="text-[#1C2430] text-sm animate-pulse">Loading Marketplace...</div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
