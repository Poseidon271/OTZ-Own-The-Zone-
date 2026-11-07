"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ColumnLines } from "@/components/scrollx/column-lines";
import BagDrawer from "@/components/BagDrawer";
import MdiIcon from "@/components/MdiIcon";
import MagazineFilterSidebar from "@/components/marketplace/MagazineFilterSidebar";
import MagazineCard from "@/components/marketplace/MagazineCard";
import { getAllMagazines } from "@/lib/magazineData";
import { matchesLocation } from "@/lib/locationData";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  BookOpen,
  ArrowUpDown,
  ChevronRight,
  FilterX,
  Layers,
  Sparkles
} from "lucide-react";

function MagazineMarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const allMagazines = useMemo(() => getAllMagazines(), []);

  // Filter state (unified Location + Publication + Main/Supplement + 5 attributes)
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    locations: [],
    publications: [],
    editionTypes: [],
    categories: [],
    adOptions: [],
    languages: [],
    frequencies: [],
    targetGroups: [],
  });
  const [sortBy, setSortBy] = useState("top-searched");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync initial search param without cascading effect renders
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setSearchQuery(initialQuery);
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearAll = () => {
    setFilters({
      locations: [],
      publications: [],
      editionTypes: [],
      categories: [],
      adOptions: [],
      languages: [],
      frequencies: [],
      targetGroups: [],
    });
    setSearchQuery("");
  };

  const removeFilterChip = (type, val) => {
    if (type === "search") {
      setSearchQuery("");
    } else {
      setFilters((prev) => ({
        ...prev,
        [type]: (prev[type] || []).filter((item) => item !== val),
      }));
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = searchQuery.trim() ? 1 : 0;
    Object.values(filters).forEach((arr) => {
      if (Array.isArray(arr)) count += arr.length;
    });
    return count;
  }, [filters, searchQuery]);

  // Compute filtered magazines
  const filteredMagazines = useMemo(() => {
    return allMagazines.filter((mag) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = mag.name?.toLowerCase().includes(q);
        const catMatch = mag.category?.toLowerCase().includes(q);
        const pubMatch = (mag.publication || mag.publicationType)?.toLowerCase().includes(q);
        const descMatch = mag.description?.toLowerCase().includes(q);
        const cityMatch = mag.location?.city?.toLowerCase().includes(q);
        const stateMatch = mag.location?.state?.toLowerCase().includes(q);
        const regionMatch = mag.location?.region?.toLowerCase().includes(q);
        const langMatch = mag.languages?.some((l) => l.toLowerCase().includes(q));
        if (!nameMatch && !catMatch && !pubMatch && !descMatch && !cityMatch && !stateMatch && !regionMatch && !langMatch) {
          return false;
        }
      }

      // 2. Locations (Unified Autocomplete Filter)
      if (filters.locations?.length > 0) {
        const matchesLoc = filters.locations.some((loc) =>
          matchesLocation(mag, loc)
        );
        if (!matchesLoc) return false;
      }

      // 3. Publications (Actual Magazine Names)
      if (filters.publications?.length > 0) {
        const matchesPub = filters.publications.some((selectedPub) => {
          const s = selectedPub.toLowerCase().trim();
          const p = (mag.publication || "").toLowerCase().trim();
          const n = (mag.name || "").toLowerCase().trim();
          return p === s || n === s || n.includes(s) || s.includes(n);
        });
        if (!matchesPub) return false;
      }

      // 4. Main / Supplement (Main Magazine, Special Supplement, Both)
      if (filters.editionTypes?.length > 0) {
        if (!filters.editionTypes.includes("Both")) {
          const ed = mag.editionType || "Main Magazine";
          if (!filters.editionTypes.includes(ed)) return false;
        }
      }

      // 5. Category
      if (filters.categories?.length > 0) {
        if (!filters.categories.includes(mag.category)) return false;
      }

      // 6. Ad Options
      if (filters.adOptions?.length > 0) {
        const hasAdOption = filters.adOptions.some((opt) =>
          mag.adOptions?.includes(opt)
        );
        if (!hasAdOption) return false;
      }

      // 7. Languages
      if (filters.languages?.length > 0) {
        const hasLang = filters.languages.some((lang) =>
          mag.languages?.includes(lang)
        );
        if (!hasLang) return false;
      }

      // 8. Frequencies
      if (filters.frequencies?.length > 0) {
        if (!filters.frequencies.includes(mag.frequency)) return false;
      }

      // 9. Target Groups
      if (filters.targetGroups?.length > 0) {
        const hasTarget = filters.targetGroups.some((tg) =>
          mag.targetGroups?.includes(tg)
        );
        if (!hasTarget) return false;
      }

      return true;
    });
  }, [allMagazines, searchQuery, filters]);

  // Apply sorting
  const sortedMagazines = useMemo(() => {
    const list = [...filteredMagazines];

    switch (sortBy) {
      case "top-searched":
        return list.sort((a, b) => {
          if (a.topSearched && !b.topSearched) return -1;
          if (!a.topSearched && b.topSearched) return 1;
          return (b.popularity || 0) - (a.popularity || 0);
        });
      case "most-popular":
        return list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      case "lowest-price":
        return list.sort((a, b) => (a.minimumSpend || 0) - (b.minimumSpend || 0));
      case "highest-price":
        return list.sort((a, b) => (b.minimumSpend || 0) - (a.minimumSpend || 0));
      case "highest-reach":
        return list.sort((a, b) => (b.audienceReach || 0) - (a.audienceReach || 0));
      case "alphabetical":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [filteredMagazines, sortBy]);

  return (
    <div
      className="theme-dark min-h-screen relative flex flex-col text-[var(--text-primary)] font-sans antialiased overflow-x-hidden"
      style={{ backgroundColor: "var(--surface-canvas)" }}
    >
      {/* Architectural Column Lines & Global Dark Ambient Glow */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.035}
        className="fixed inset-0 z-0 pointer-events-none"
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(19, 42, 79, 0.5) 0%, transparent 55%)",
        }}
      />

      {/* Global Navbar */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* SECTION 1: Midnight Zone Brand Hero Banner */}
      <section className="relative z-10 text-white pt-28 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4 text-left">
          {/* Breadcrumb Navigation: Home / Marketplace / Print / Magazine */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-xs font-mono text-[#A5B5CD]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  Marketplace
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
                <span className="text-[#A5B5CD]">Print</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
                <span className="text-[#FF5A1F] font-semibold">Magazine</span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#132A4F] text-[#A5B5CD] border border-[#1E375C] text-xs font-mono font-medium mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#FF5A1F]" />
                <span>PRINT MEDIA &bull; MAGAZINE INVENTORY</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
                Magazine Advertising
              </h1>
              <p className="text-xs sm:text-sm text-[#A5B5CD] max-w-2xl mt-1.5 leading-relaxed">
                Compare verified readership, ad placement rates and target demographics across India&rsquo;s leading magazines.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-left">
                <span className="text-[10px] uppercase font-mono text-[#677E9E] block">Verified Titles</span>
                <span className="text-base font-bold text-white font-display">{allMagazines.length} Publications</span>
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-left">
                <span className="text-[10px] uppercase font-mono text-[#677E9E] block">Commercial Standard</span>
                <span className="text-base font-bold text-[#FF5A1F] font-display">100% Audited</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="relative z-10 flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Two-Column Marketplace Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* LEFT: Filter Sidebar */}
          <div className="hidden lg:block w-72 shrink-0">
            <MagazineFilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              allMagazines={allMagazines}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {/* RIGHT: Magazine Listing Area */}
          <div className="flex-1 w-full space-y-6 text-left">
            {/* Header Card & Search/Sort Controls */}
            <div className="bg-[#0F2444] border border-[#1E375C] rounded-xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-4">
              {/* Search Field & Sorting Dropdown */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Field */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#677E9E]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by publication name, category or city..."
                    className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-xs text-white placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F] transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-[#677E9E] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Mobile Filter & Sorting Dropdown */}
                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                  <div className="flex items-center gap-2 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setIsMobileDrawerOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] hover:bg-[#1a3869] text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5A1F]" />
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#A5B5CD] whitespace-nowrap flex items-center gap-1 font-medium">
                      <ArrowUpDown className="w-3.5 h-3.5 text-[#677E9E]" />
                      <span>Sort:</span>
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-xs font-semibold text-white focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                    >
                      <option value="top-searched" className="bg-[#0F2444] text-white">Top Searched</option>
                      <option value="most-popular" className="bg-[#0F2444] text-white">Most Popular</option>
                      <option value="lowest-price" className="bg-[#0F2444] text-white">Lowest Price</option>
                      <option value="highest-price" className="bg-[#0F2444] text-white">Highest Price</option>
                      <option value="highest-reach" className="bg-[#0F2444] text-white">Highest Audience Reach</option>
                      <option value="alphabetical" className="bg-[#0F2444] text-white">Alphabetical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Count & Clear All */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1E375C] text-xs">
                <div className="flex items-center gap-1.5 text-[#A5B5CD]">
                  <span>Showing</span>
                  <strong className="text-white font-bold">
                    {sortedMagazines.length}
                  </strong>
                  <span>of {allMagazines.length} Magazines</span>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 text-[#FF5A1F] hover:text-[#E64E15] font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>

              {/* Removable Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium">
                      <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("search")}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.locations?.map((loc) => (
                    <span
                      key={loc}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Location: {loc}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("locations", loc)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}

                  {filters.publications?.map((pub) => (
                    <span
                      key={pub}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Publication: {pub}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("publications", pub)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}

                  {filters.editionTypes?.map((ed) => (
                    <span
                      key={ed}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Edition: {ed}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("editionTypes", ed)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}

                  {filters.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Category: {cat}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("categories", cat)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.adOptions.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Option: {opt}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("adOptions", opt)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Language: {lang}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("languages", lang)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.frequencies.map((freq) => (
                    <span
                      key={freq}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Frequency: {freq}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("frequencies", freq)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.targetGroups.map((tg) => (
                    <span
                      key={tg}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] font-medium"
                    >
                      <span>Target: {tg}</span>
                      <button
                        type="button"
                        onClick={() => removeFilterChip("targetGroups", tg)}
                        className="hover:text-red-400 cursor-pointer text-[#677E9E]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Magazine Responsive Grid */}
            {sortedMagazines.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedMagazines.map((magazine) => (
                  <MagazineCard key={magazine.id} magazine={magazine} />
                ))}
              </div>
            ) : (
              /* Meaningful Empty State */
              <div className="rounded-xl bg-[#0F2444] border border-[#1E375C] p-12 text-center space-y-3 shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
                <div className="w-12 h-12 rounded-full bg-[#132A4F] text-[#A5B5CD] flex items-center justify-center mx-auto border border-[#1E375C]">
                  <FilterX className="w-6 h-6 text-[#FF5A1F]" />
                </div>
                <h3 className="text-base font-bold text-white font-display">No Magazines Found</h3>
                <p className="text-xs text-[#A5B5CD] max-w-sm mx-auto leading-relaxed">
                  No publications match your selected combination of filters. Try broadening your location, category or frequency criteria.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Off-Canvas Filter Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/80 backdrop-blur-xs animate-fade-in text-left">
          <div className="relative w-full max-w-xs sm:max-w-sm h-full bg-[#0F2444] border-r border-[#1E375C] p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1E375C] mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF5A1F]" />
                  <h3 className="text-sm font-bold text-white font-display">Filter Magazines</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg bg-[#132A4F] text-[#A5B5CD] hover:text-white border border-[#1E375C] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <MagazineFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                allMagazines={allMagazines}
                activeFilterCount={activeFilterCount}
              />
            </div>

            <div className="pt-4 border-t border-[#1E375C] sticky bottom-0 bg-[#0F2444]">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#FF5A1F] text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Apply Filters ({sortedMagazines.length} Results)
              </button>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        </div>
      )}

      {/* Bag Drawer */}
      <BagDrawer />

      {/* OTZ Midnight Zone Footer */}
      <footer className="relative z-10 border-t border-[#1E375C] bg-[#0B1E3B]/90 backdrop-blur-xs text-[#A5B5CD] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-display font-black tracking-widest text-lg text-white">OTZ</span>
            <span className="text-[#677E9E]">|</span>
            <span className="text-[#A5B5CD]">
              &copy; {new Date().getFullYear()} Own The Zone. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/for-brands" className="hover:text-white transition-colors">For Brands</Link>
            <Link href="/for-media-owners" className="hover:text-white transition-colors">For Media Owners</Link>
            <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/marketplace/newspaper" className="hover:text-white transition-colors">Newspapers</Link>
            <Link href="/marketplace/magazine" className="text-[#FF5A1F] font-semibold">Magazines</Link>
            <a
              href="https://wa.me/919999999999?text=I%27m%20interested%20in%20Magazine%20advertising"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <MdiIcon name="whatsapp" className="text-base" /> Chat with Ops
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function MagazineMarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1E3B] text-white flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#FF5A1F] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-[#A5B5CD]">Loading Magazine Directory...</span>
          </div>
        </div>
      }
    >
      <MagazineMarketplaceContent />
    </Suspense>
  );
}
