"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BagDrawer from "@/components/BagDrawer";
import MediaDetailModal from "@/components/MediaDetailModal";
import CompareModal from "@/components/CompareModal";
import { mockAdvertisingAssets } from "@/data/mockData";
import { useBag } from "@/context/BagContext";
import { taxonomy, categoryMetadata } from "@/data/structureData";

const subcategoryIcons = {
  "Television": "📺",
  "Radio": "📻",
  "Print": "📰",
  "Outdoor": "🛣️",
  "Cinema": "🎬",
  "OTT": "🍿",
  "Exhibitions & Trade Shows": "🎪",
  "Conferences & Seminars": "🏛️",
  "Social & Cultural": "🎭",
  "Community": "👥",
  "Experiential": "💡",
  "PR": "📢",
  "Web": "🌐",
  "Influencer": "👤",
  "UGCs": "🤳",
  "Communities": "💬",
  "In-Transit": "🚌",
  "In-Store": "🏪",
  "RWAs & Societies": "🏢",
  "Malls & Shopping Areas": "🛍️",
  "Broadcast": "📡",
  "In-App": "📲"
};

const assetAudienceMap = {
  "asset-1": ["General Audience", "News & Infotainment"],
  "asset-2": ["General Audience"],
  "asset-3": ["Fashion & Lifestyle", "Sports & Gaming"],
  "asset-4": ["News & Infotainment", "General Audience"],
  "asset-5": ["General Audience"],
  "asset-6": ["General Audience", "Fashion & Lifestyle"],
  "asset-7": ["Fashion & Lifestyle"],
  "asset-8": ["Sports & Gaming", "News & Infotainment"],
  "asset-9": ["Fashion & Lifestyle"],
  "asset-10": ["News & Infotainment", "General Audience"],
  "asset-11": ["News & Infotainment", "General Audience"],
  "asset-12": ["General Audience", "Sports & Gaming"],
  "asset-13": ["Sports & Gaming", "Fashion & Lifestyle"],
  "asset-14": ["News & Infotainment", "Sports & Gaming"],
  "asset-15": ["Sports & Gaming", "News & Infotainment"]
};

export default function Home() {
  const { addToBag, addItemsToBag, removeFromBag, isInBag, setIsBagOpen } = useBag();

  // Three Pillars Navigation State
  const [mainPillar, setMainPillar] = React.useState("landing"); // 'landing', 'buying', 'planning'

  // Media Planning Wizard State
  const [planningProductType, setPlanningProductType] = React.useState("");
  const [planningAudience, setPlanningAudience] = React.useState("");
  const [planningBudget, setPlanningBudget] = React.useState("");
  const [planningDuration, setPlanningDuration] = React.useState(1); // 1-12 months
  const [planningResults, setPlanningResults] = React.useState(null);
  const [planningStep, setPlanningStep] = React.useState(1); // 1: input wizard, 2: recommendation results

  // Search and Taxonomy View State Machine States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [currentView, setCurrentView] = React.useState("categories"); // 'categories', 'subcategories', 'products', 'intersection'
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = React.useState(null);
  const [activeDetailAsset, setActiveDetailAsset] = React.useState(null);
  const [selectedProductSector, setSelectedProductSector] = React.useState("");
  const [selectedTargetAudience, setSelectedTargetAudience] = React.useState("");

  // Helper for lightweight HTML5 History API sync
  const pushViewState = (view, category = null, subCategory = null) => {
    if (typeof window !== "undefined" && window.history) {
      window.history.pushState({ view, category, subCategory }, "");
    }
  };

  // Popstate navigation sync listener
  React.useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        const { view, category, subCategory } = event.state;
        if (view === 'home') {
          setMainPillar('landing');
          setCurrentView('categories');
          setSelectedCategory(null);
          setSelectedSubCategory(null);
        } else if (view === 'planning') {
          setMainPillar('planning');
          setPlanningStep(1);
        } else {
          setMainPillar('buying');
          setCurrentView(view);
          setSelectedCategory(category);
          setSelectedSubCategory(subCategory);
        }
      } else {
        // Fallback to pristine home screen
        setMainPillar('landing');
        setCurrentView('categories');
        setSelectedCategory(null);
        setSelectedSubCategory(null);
      }
    };

    if (typeof window !== "undefined" && window.history && !window.history.state) {
      window.history.replaceState({ view: 'home', category: null, subCategory: null }, "");
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Budget Splitter States
  const [budgetInput, setBudgetInput] = React.useState("");
  const [smartPlan, setSmartPlan] = React.useState(null);
  const [smartPlanError, setSmartPlanError] = React.useState("");

  // Comparison states
  const [selectedCompareAssets, setSelectedCompareAssets] = React.useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = React.useState(false);
  const [compareAlertMessage, setCompareAlertMessage] = React.useState("");

  // Auto-clear comparison alert message
  React.useEffect(() => {
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

  // Reset all search and category filters
  const handleResetFilters = () => {
    setMainPillar("landing");
    setSearchQuery("");
    setLocationQuery("");
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedProductSector("");
    setSelectedTargetAudience("");
    setCurrentView("categories");
    setBudgetInput("");
    setSmartPlan(null);
    setSmartPlanError("");
    setPlanningProductType("");
    setPlanningAudience("");
    setPlanningBudget("");
    setPlanningDuration(1);
    setPlanningResults(null);
    setPlanningStep(1);
    pushViewState("home", null, null);
  };

  // Handle text search bypassing categories and reverting back on clear
  React.useEffect(() => {
    if (searchQuery.trim() !== "" || locationQuery.trim() !== "") {
      setCurrentView("products");
    } else {
      // Revert to correct view based on current selection path
      if (selectedSubCategory) {
        if (selectedProductSector && selectedTargetAudience) {
          setCurrentView("products");
        } else {
          setCurrentView("intersection");
        }
      } else if (selectedCategory) {
        setCurrentView("subcategories");
      } else {
        setCurrentView("categories");
      }
    }
  }, [searchQuery, locationQuery, selectedCategory, selectedSubCategory, selectedProductSector, selectedTargetAudience]);

  // Perform live query filtering on mock dataset with intersectional match logic
  const getFilteredAssetsAndFallback = () => {
    // 1. If keyword/location search is active, bypass categories/intersection
    if (searchQuery || locationQuery) {
      return {
        assets: mockAdvertisingAssets.filter((asset) => {
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const titleMatch = asset.title.toLowerCase().includes(query);
            const descMatch = asset.description.toLowerCase().includes(query);
            const specsMatch = asset.specs.toLowerCase().includes(query);
            if (!titleMatch && !descMatch && !specsMatch) return false;
          }
          if (locationQuery) {
            const loc = locationQuery.toLowerCase();
            if (!asset.location.toLowerCase().includes(loc)) return false;
          }
          return true;
        }),
        isFallback: false
      };
    }

    // 2. Standard media buying flow filtering (with category + subcategory)
    if (selectedSubCategory) {
      const subCategoryAssets = mockAdvertisingAssets.filter(
        (asset) => asset.subCategory === selectedSubCategory
      );

      // If we have selected product sector & target audience filters from the configuration step
      if (selectedProductSector && selectedTargetAudience) {
        const exactMatch = subCategoryAssets.filter(
          (asset) =>
            asset.productSector === selectedProductSector &&
            asset.targetAudience === selectedTargetAudience
        );

        if (exactMatch.length > 0) {
          return { assets: exactMatch, isFallback: false };
        } else {
          // Fallback to showing everything in this subcategory
          return { assets: subCategoryAssets, isFallback: true };
        }
      }

      return { assets: subCategoryAssets, isFallback: false };
    }

    // Default case (e.g. no subcategory selected yet or other views)
    return { assets: [], isFallback: false };
  };

  const { assets: filteredAssets, isFallback: showFallbackBanner } = getFilteredAssetsAndFallback();

  // Smart Budget Allocator Logic
  const generateBundle = (totalBudgetInput) => {
    const budget = parseFloat(totalBudgetInput);
    if (isNaN(budget) || budget <= 0) return null;

    if (budget < 100000) {
      return { error: "Try entering a budget of at least ₹1,00,000 to generate a multi-channel plan." };
    }

    const billboardBudget = budget * 0.60;
    const digitalBudget = budget * 0.30;
    const otherBudget = budget * 0.20;

    const billboards = mockAdvertisingAssets.filter(item => item.category === "Mass-Media" && item.subCategory === "Outdoor");
    const digitals = mockAdvertisingAssets.filter(item => item.category === "Digital" || (item.category === "BTL" && item.subCategory === "Malls & Shopping Areas"));
    const others = mockAdvertisingAssets.filter(item => item.category === "Mass-Media" && (item.subCategory === "Radio" || item.subCategory === "Cinema"));

    billboards.sort((a, b) => b.price - a.price);
    digitals.sort((a, b) => b.price - a.price);
    others.sort((a, b) => b.price - a.price);

    let selectedItems = [];
    let currentTotal = 0;

    // 1. Premium item (Billboard) - target 50-60%
    const billboardFit = billboards.find(item => item.price <= billboardBudget);
    if (billboardFit) {
      selectedItems.push(billboardFit);
      currentTotal += billboardFit.price;
    }

    // 2. Digital Ad - target 30% of budget
    const digitalFit = digitals.find(item => item.price <= (budget - currentTotal) && item.price <= digitalBudget);
    if (digitalFit) {
      selectedItems.push(digitalFit);
      currentTotal += digitalFit.price;
    }

    // 3. Radio/Cinema spot - target 10-20%
    const otherFit = others.find(item => item.price <= (budget - currentTotal) && item.price <= otherBudget);
    if (otherFit) {
      selectedItems.push(otherFit);
      currentTotal += otherFit.price;
    }

    if (selectedItems.length === 0) {
      return { error: "Try entering a budget of at least ₹1,00,000 to generate a multi-channel plan." };
    }

    // Leftover optimization: add a low-cost slot if remaining budget allows
    const remaining = budget - currentTotal;
    if (remaining > 0) {
      const extraSpot = mockAdvertisingAssets
        .filter(item => !selectedItems.some(s => s.id === item.id) && item.price <= remaining)
        .sort((a, b) => b.price - a.price)[0];
      if (extraSpot) {
        selectedItems.push(extraSpot);
        currentTotal += extraSpot.price;
      }
    }

    return {
      items: selectedItems,
      totalSpent: currentTotal,
      utilizationPercent: Math.min(100, Math.round((currentTotal / budget) * 100)),
      originalBudget: budget
    };
  };

  const handleAddBundle = () => {
    if (smartPlan && smartPlan.items) {
      addItemsToBag(smartPlan.items);
      setIsBagOpen(true);
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
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 selection:bg-violet-500 selection:text-white transition-colors duration-200">
      {/* Navbar Component */}
      <Navbar onLogoClick={handleResetFilters} />

      {/* Sliding Sidebar Drawer */}
      <BagDrawer />

      {/* Hero Component with state props passed down */}
      <main className="flex-grow no-print">
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationQuery={locationQuery}
          setLocationQuery={setLocationQuery}
        />

        {/* Assets Listing Section */}
        {mainPillar === "landing" ? (
          <section id="explore" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-8 animate-fade-in text-center max-w-5xl mx-auto py-6">
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Orchestrate Your Brand Presence
                </h2>
                <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto sm:text-md">
                  Select one of our core operational engines to browse inventory, compile strategy packages, or oversee creatives.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Media Buying Card */}
                <div
                  onClick={() => {
                    setMainPillar("buying");
                    setCurrentView("categories");
                    const exploreSec = document.getElementById("explore");
                    if (exploreSec) exploreSec.scrollIntoView({ behavior: "smooth" });
                    pushViewState("categories", null, null);
                  }}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-md hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-1.5 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🛒</span>
                      <div className="absolute inset-0 rounded-2xl bg-violet-400/10 dark:bg-violet-400/20 blur-sm group-hover:blur-md transition-all"></div>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      Media Buying
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      Browse, compare, and instantly secure ad spaces across our entire multi-channel inventory.
                    </p>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 group-hover:gap-2.5 transition-all">
                      Explore Inventory &rarr;
                    </span>
                  </div>
                </div>

                {/* Media Planning Card */}
                <div
                  onClick={() => {
                    setMainPillar("planning");
                    setPlanningStep(1);
                    const exploreSec = document.getElementById("explore");
                    if (exploreSec) exploreSec.scrollIntoView({ behavior: "smooth" });
                    pushViewState("planning", null, null);
                  }}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-md hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-1.5 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🎯</span>
                      <div className="absolute inset-0 rounded-2xl bg-emerald-400/10 dark:bg-emerald-400/20 blur-sm group-hover:blur-md transition-all"></div>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Media Planning
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      Build your custom strategy. Tell us your goals, budget, and audience to discover the perfect media mix.
                    </p>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 group-hover:gap-2.5 transition-all">
                      Design Campaign &rarr;
                    </span>
                  </div>
                </div>

                {/* Media Production Card */}
                <div
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-md dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md transition-all duration-300 overflow-hidden cursor-not-allowed select-none"
                >
                  <div className="absolute inset-0 bg-slate-950/0 backdrop-blur-0 opacity-0 group-hover:bg-slate-950/40 group-hover:backdrop-blur-[2px] group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs uppercase tracking-widest px-4.5 py-2.5 rounded-2xl shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 select-none">
                      🎬 Coming Soon
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-3xl">🎨</span>
                      <div className="absolute inset-0 rounded-2xl bg-amber-400/10 dark:bg-amber-400/20 blur-sm"></div>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Media Production
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      Creative execution, scriptwriting, and production management.
                    </p>
                  </div>
                  <div className="mt-8 flex justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : mainPillar === "planning" ? (
          <section id="explore" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-6">
              {/* Back breadcrumb */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setMainPillar("landing");
                    pushViewState("home", null, null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  &larr; Back to Core Pillars
                </button>
              </div>

              {planningStep === 1 ? (
                /* Step 1: Input wizard form */
                <form
                  onSubmit={generatePlanningRecommendation}
                  className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md space-y-8"
                >
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      Media Strategy Advisor
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:ring-2 focus:ring-violet-500/20 cursor-pointer font-medium"
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:ring-2 focus:ring-violet-500/20 cursor-pointer font-medium"
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
                          <span className="text-sm font-bold text-slate-450 dark:text-slate-500">₹</span>
                        </div>
                        <input
                          id="planning-budget"
                          type="number"
                          value={planningBudget}
                          onChange={(e) => setPlanningBudget(e.target.value)}
                          placeholder="e.g. 500000"
                          min="1000"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-sm text-slate-800 outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:ring-2 focus:ring-violet-500/20 font-semibold"
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:ring-2 focus:ring-violet-500/20 cursor-pointer font-medium"
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
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-650 px-6 py-4 text-sm font-bold text-white shadow-md hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🚀</span> Generate Strategy Plan
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Recommendations results */
                <div className="space-y-10 animate-fade-in">
                  {/* Summary Header */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        Campaign Planning Strategy
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-1.5">
                        Parameters: Sector <span className="font-semibold text-slate-750 dark:text-slate-305">"{planningProductType}"</span> &rarr; Target Audience <span className="font-semibold text-slate-750 dark:text-slate-305">"{planningAudience}"</span> over <span className="font-semibold text-slate-750 dark:text-slate-305">{planningResults?.duration} {planningResults?.duration === 1 ? 'month' : 'months'}</span>.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setPlanningStep(1);
                        setPlanningResults(null);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 px-4.5 py-2 text-xs font-bold text-violet-600 dark:text-violet-400 cursor-pointer transition-colors shadow-sm"
                    >
                      ⚙️ Adjust Parameters
                    </button>
                  </div>

                  {/* Our Smart Strategic Recommendation Container */}
                  <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/40 via-white to-indigo-50/20 p-6 md:p-8 shadow-lg dark:border-violet-950/40 dark:from-slate-900/60 dark:to-indigo-950/20 dark:backdrop-blur-md space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-violet-100/60 dark:border-violet-900/40 pb-4 gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-violet-750 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/30">
                          ✨ AI Engine Select
                        </span>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                          Our Smart Strategic Recommendation
                        </h4>
                      </div>
                      {planningResults?.bundle.length > 0 && (
                        <div className="text-left md:text-right">
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-extrabold">Total Bundle Cost</p>
                          <p className="text-2xl font-black text-violet-650 dark:text-violet-400">
                            ₹{planningResults.totalCost.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Remaining Budget: ₹{(planningResults.maxBudget - planningResults.totalCost).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {planningResults?.bundle.length > 0 ? (
                      <div className="space-y-6">
                        {/* Bundle Breakdown List */}
                        <div className="divide-y divide-slate-150 dark:divide-slate-800 bg-white/60 dark:bg-slate-950/30 rounded-2xl border border-slate-150/60 dark:border-slate-850/60 overflow-hidden shadow-inner">
                          {planningResults.bundle.map((asset) => {
                            const inBag = isInBag(asset.id);
                            return (
                              <div key={asset.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/90 dark:hover:bg-slate-900/40 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div 
                                    className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 cursor-pointer"
                                    onClick={() => setActiveDetailAsset(asset)}
                                  >
                                    <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" />
                                  </div>
                                  <div>
                                    <h5 
                                      className="text-sm font-bold text-slate-800 dark:text-white hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                                      onClick={() => setActiveDetailAsset(asset)}
                                    >
                                      {asset.title}
                                    </h5>
                                    <p className="text-[11px] text-slate-455 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                      📍 {asset.location} &bull; 📊 {asset.reach}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 pt-2 sm:pt-0">
                                  <div className="text-left sm:text-right">
                                    <p className="text-xs font-black text-slate-900 dark:text-white">
                                      ₹{(asset.price * planningResults.duration * 30).toLocaleString()}
                                    </p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500">
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
                                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                                      inBag
                                        ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 dark:hover:bg-rose-650"
                                        : "bg-white text-slate-700 border border-slate-200 hover:border-violet-500/50 hover:bg-violet-600 hover:text-white dark:bg-slate-850 dark:text-slate-200 dark:border-slate-750 dark:hover:bg-violet-600 dark:hover:text-white"
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
                              className="rounded-2xl bg-emerald-500 text-white shadow-md border border-emerald-400/30 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-not-allowed opacity-90 font-sans"
                            >
                              <span>✓</span> All Items Added to Bag
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
                              className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/20 hover:shadow-xl px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer font-sans"
                            >
                              <span>💼</span> Add Recommended Package to Bag
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20 py-12 text-center px-4 font-sans space-y-3">
                        <span className="text-3xl">⚠️</span>
                        <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                          Budget constraints too restrictive
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-450 max-w-md leading-relaxed">
                          We couldn't fit any single asset matching this sector and audience combination within your total budget of **₹{planningResults?.maxBudget.toLocaleString()}** for **{planningResults?.duration} {planningResults?.duration === 1 ? 'month' : 'months'}** (minimum cost per asset: ₹{Math.min(...(planningResults?.allMatches.map(a => a.price * planningResults.duration * 30) || [0])).toLocaleString()}). Try increasing your budget or choosing matching assets manually below.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Manual Customization Grid */}
                  <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-center md:text-left">
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Explore All Available Matches
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-405 mt-1">
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
                              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-350 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700/80 dark:hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1"
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
                                <span className="absolute top-3 left-3 rounded-full bg-slate-50/90 px-3 py-1 text-xs font-semibold text-violet-750 border border-violet-200/50 backdrop-blur-md dark:bg-slate-950/70 dark:text-violet-300 dark:border-violet-500/20">
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
                                      className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                                    />
                                    <span>Compare</span>
                                  </label>
                                </div>
                              </div>
                              {/* Info Container */}
                              <div className="flex flex-1 flex-col p-6">
                                <div className="flex-1">
                                  <p className="text-xs font-medium text-violet-650 dark:text-violet-400 flex items-center mb-1.5">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="2"
                                      stroke="currentColor"
                                      className="mr-1 h-3.5 w-3.5"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                    {asset.location}
                                  </p>
                                  <h3
                                    className="text-base font-bold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors cursor-pointer"
                                    onClick={() => setActiveDetailAsset(asset)}
                                  >
                                    {asset.title}
                                  </h3>
                                  <p className="mt-2 text-xs text-slate-550 dark:text-slate-400">
                                    Est. Reach: <span className="font-semibold text-slate-700 dark:text-slate-300">{asset.reach}</span>
                                  </p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-4">
                                  <div>
                                    <p className="text-xs text-slate-450 dark:text-slate-505 font-bold">Estimated Cost</p>
                                    <p className="text-lg font-black text-slate-900 dark:text-white">
                                      ₹{(asset.price * planningResults.duration * 30).toLocaleString()}
                                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/total</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-medium">₹{asset.price.toLocaleString()}/day</p>
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
                                    className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                                      inBag
                                        ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white dark:bg-rose-950/30 dark:text-rose-455 dark:border-rose-900/40 dark:hover:bg-rose-650"
                                        : "bg-white text-slate-700 border border-slate-200 hover:border-violet-500/50 hover:bg-violet-600 hover:text-white dark:bg-slate-805 dark:text-slate-200 dark:border-slate-700 dark:hover:border-violet-500/50 dark:hover:bg-violet-600 dark:hover:text-white"
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
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/10 py-20 text-center px-4 font-sans">
                        <span className="text-3xl">🫙</span>
                        <h4 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                          No Matching Placements Found
                        </h4>
                        <p className="mt-2 text-xs text-slate-555 dark:text-slate-450 max-w-xs leading-relaxed font-medium">
                          We couldn't find any advertising assets matching sector **{planningProductType}** and target vertical **{planningAudience}**.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section id="explore" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
            {/* Back to Core Pillars navigation breadcrumb */}
            <div className="mb-6 flex items-center justify-between">
              <button
                onClick={() => {
                  setMainPillar("landing");
                  pushViewState("home", null, null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900 dark:hover:text-white transition-all cursor-pointer animate-fade-in"
              >
                &larr; Back to Core Pillars
              </button>
            </div>

            {smartPlan ? (
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Your Suggested Campaign Mix
                </h2>
                <p className="mt-2 text-slate-505 dark:text-slate-400 text-sm">
                  Optimized package fitting your ₹{smartPlan.originalBudget.toLocaleString()} budget limit.
                </p>
              </div>
              <button
                onClick={() => {
                  setBudgetInput("");
                  setSmartPlan(null);
                  setSmartPlanError("");
                }}
                className="mt-4 md:mt-0 text-sm font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
              >
                Back to Catalog
              </button>
            </div>
          ) : (
            <>
              {currentView !== "intersection" && (
                <div className={`flex flex-col md:flex-row md:items-end justify-between mb-10 ${currentView === "categories" ? "md:items-center md:justify-center text-center" : ""}`}>
                  <div className={currentView === "categories" ? "max-w-xl mx-auto" : ""}>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      {currentView === "categories" && "Explore Media Channels"}
                      {currentView === "subcategories" && `${selectedCategory}`}
                      {currentView === "products" && (
                        selectedSubCategory ? (
                          selectedProductSector && selectedTargetAudience ? (
                            <span className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <span>{selectedSubCategory} Placements</span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-500/20 px-2.5 py-1 rounded-xl w-fit">
                                🎯 {selectedProductSector} &rarr; {selectedTargetAudience}
                              </span>
                            </span>
                          ) : (
                            `${selectedSubCategory} Placements`
                          )
                        ) : (
                          "Search Results"
                        )
                      )}
                    </h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
                      {currentView === "categories" && "Select a top category domain from below to start discovery."}
                      {currentView === "subcategories" && `Choose from the specialized subcategories under ${selectedCategory}.`}
                      {currentView === "products" && `${filteredAssets.length} matching spaces available in India.`}
                    </p>
                  </div>
                  {(selectedCategory || selectedSubCategory || searchQuery || locationQuery) && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-4 md:mt-0 text-sm font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                    >
                      Clear all filters & reset
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {/* Conditional Rendering: Smart Plan suggestion OR Default catalog list */}
          {smartPlan ? (
            <div className="space-y-10 animate-fade-in">
              {/* Summary Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md transition-all duration-300">
                <div className="flex flex-col lg:flex-row justify-between gap-8">
                  {/* Left: breakdown list */}
                  <div className="flex-1">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                      Allocation Breakdown
                    </h3>
                    <div className="space-y-3.5">
                      {smartPlan.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {item.category} &bull; {item.location}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            ₹{item.price.toLocaleString()}/day
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: progress bar & summary details */}
                  <div className="lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
                    <div className="space-y-4">
                      {/* Cost details */}
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500 font-medium">Plan Budget Spent</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{smartPlan.totalSpent.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400">
                            {" "}
                            / ₹{smartPlan.originalBudget.toLocaleString()}
                          </span>
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${smartPlan.utilizationPercent}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                          <span>Utilization</span>
                          <span>{smartPlan.utilizationPercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Add Bundle button */}
                    <button
                      type="button"
                      onClick={handleAddBundle}
                      className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-md hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-600/25 transition-all duration-300"
                    >
                      Add Entire Bundle to Bag
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid showing only recommended items */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-405 dark:text-slate-505 mb-6">Included Advertising Slots</h3>
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                  {smartPlan.items.map((asset) => {
                    const inBag = isInBag(asset.id);
                    return (
                      <div
                        key={asset.id}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700/80 dark:hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1"
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
                          {/* Category Badge */}
                          <span className="absolute top-3 left-3 rounded-full bg-slate-50/90 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-200/50 backdrop-blur-md dark:bg-slate-950/70 dark:text-violet-300 dark:border-violet-500/20">
                            {asset.subCategory || asset.category}
                          </span>

                          {/* Verified Trust Badge */}
                          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white border border-emerald-400/30 backdrop-blur-sm shadow-sm select-none">
                            ✓ Verified Spot
                          </span>

                          {/* Compare Checkbox */}
                          <div
                            className="absolute top-3 right-3 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <label className="flex items-center space-x-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold text-white border border-white/20 backdrop-blur-md cursor-pointer transition-colors shadow-sm select-none">
                              <input
                                type="checkbox"
                                checked={selectedCompareAssets.some((item) => item.id === asset.id)}
                                onChange={() => toggleCompareAsset(asset)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                              />
                              <span>Compare</span>
                            </label>
                          </div>
                        </div>

                        {/* Info Container */}
                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex-1">
                            {/* Location */}
                            <p className="text-xs font-medium text-violet-600 dark:text-violet-400 flex items-center mb-1.5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                                className="mr-1 h-3.5 w-3.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                />
                              </svg>
                              {asset.location}
                            </p>
                            {/* Title */}
                            <h3
                              className="text-base font-bold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors cursor-pointer"
                              onClick={() => setActiveDetailAsset(asset)}
                            >
                              {asset.title}
                            </h3>

                            {/* Reach indicator */}
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              Est. Reach: <span className="font-semibold text-slate-700 dark:text-slate-300">{asset.reach}</span>
                            </p>
                          </div>

                          {/* Pricing and Action */}
                          <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div>
                              <p className="text-xs text-slate-500 dark:text-slate-550">Price per slot</p>
                              <p className="text-lg font-black text-slate-900 dark:text-white">
                                ₹{asset.price.toLocaleString()}
                                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/day</span>
                              </p>
                            </div>

                            {/* Add to bag button */}
                            <button
                              type="button"
                              disabled={inBag}
                              onClick={() => !inBag && addToBag(asset)}
                              className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                                inBag
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40 cursor-not-allowed"
                                  : "bg-white text-slate-700 border border-slate-200 hover:border-violet-500/50 hover:bg-violet-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:border-violet-500/50 dark:hover:bg-violet-600 dark:hover:text-white"
                              }`}
                            >
                              {inBag ? "Added" : "Add to Bag"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentView === "categories" && (
                <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
                  {Object.keys(taxonomy).map((cat) => {
                    const meta = categoryMetadata[cat];
                    const itemCount = mockAdvertisingAssets.filter(asset => asset.category === cat).length;
                    return (
                      <div
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setCurrentView("subcategories");
                          pushViewState("subcategories", cat, null);
                        }}
                        className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-50/20 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-violet-500/20 dark:hover:bg-violet-950/20 hover:-translate-y-1 cursor-pointer w-[calc(50%-8px)] sm:w-[calc(33.33%-12px)] lg:w-[calc(20%-13px)] flex-shrink-0"
                      >
                        <span className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                          {meta.icon}
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-750 group-hover:text-violet-650 dark:text-slate-300 dark:group-hover:text-violet-400">
                          {cat}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 mt-1 dark:text-slate-505">
                          {itemCount} {itemCount === 1 ? 'Slot' : 'Slots'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {currentView === "subcategories" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setCurrentView("categories");
                        pushViewState("categories", null, null);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition-all cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                      </svg>
                      <span>← Back to Categories</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {taxonomy[selectedCategory]?.map((sub) => {
                      const subItemCount = mockAdvertisingAssets.filter(asset => asset.category === selectedCategory && asset.subCategory === sub).length;
                      const icon = subcategoryIcons[sub] || "📁";
                      return (
                        <div
                          key={sub}
                          onClick={() => {
                            setSelectedSubCategory(sub);
                            setSelectedProductSector("");
                            setSelectedTargetAudience("");
                            setCurrentView("intersection");
                            pushViewState("intersection", selectedCategory, sub);
                          }}
                          className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-50/20 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-violet-500/20 dark:hover:bg-violet-950/20 hover:-translate-y-1 cursor-pointer"
                        >
                          <span className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                            {icon}
                          </span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-750 group-hover:text-violet-650 dark:text-slate-300 dark:group-hover:text-violet-400">
                            {sub}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400 mt-1 dark:text-slate-550">
                            {subItemCount} {subItemCount === 1 ? 'Placement' : 'Placements'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentView === "intersection" && (
                <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedSubCategory(null);
                        setCurrentView("subcategories");
                        pushViewState("subcategories", selectedCategory, null);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition-all cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                      </svg>
                      <span>← Back to {selectedCategory} Subcategories</span>
                    </button>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md space-y-8">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-650 dark:text-violet-400">
                        <span>{subcategoryIcons[selectedSubCategory] || "📁"}</span>
                        <span>{selectedSubCategory} Campaign Matcher</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        Configure Your Campaign Match
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select your business vertical matrix mapping to unlock the best-fit advertisement placements.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Dropdown 1: Select Your Product Sector */}
                      <div className="space-y-3">
                        <label htmlFor="sector-select" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                          Select Your Product Sector
                        </label>
                        <select
                          id="sector-select"
                          value={selectedProductSector}
                          onChange={(e) => setSelectedProductSector(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 cursor-pointer"
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

                      {/* Dropdown 2: Select Target Audience Vertical */}
                      <div className="space-y-3">
                        <label htmlFor="audience-select" className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                          Select Target Audience Vertical
                        </label>
                        <select
                          id="audience-select"
                          value={selectedTargetAudience}
                          onChange={(e) => setSelectedTargetAudience(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="">Select Target Audience...</option>
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
                    </div>

                    {/* Submit / Reveal Button */}
                    <div className="pt-4 border-t border-slate-150 dark:border-slate-800">
                      <button
                        type="button"
                        disabled={!selectedProductSector || !selectedTargetAudience}
                        onClick={() => {
                          setCurrentView("products");
                          pushViewState("products", selectedCategory, selectedSubCategory);
                        }}
                        className={`w-full rounded-2xl px-6 py-4 text-sm font-bold text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          selectedProductSector && selectedTargetAudience
                            ? "bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-600/20"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed shadow-none"
                        }`}
                      >
                        <span>🔍</span> Reveal Matching Ad Slots
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentView === "products" && (
                <div className="space-y-8 animate-fade-in">
                  {!searchQuery && !locationQuery && selectedCategory && (
                    <button
                      onClick={() => {
                        if (selectedProductSector && selectedTargetAudience) {
                          setCurrentView("intersection");
                          pushViewState("intersection", selectedCategory, selectedSubCategory);
                        } else {
                          setSelectedSubCategory(null);
                          setCurrentView("subcategories");
                          pushViewState("subcategories", selectedCategory, null);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition-all cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75" />
                      </svg>
                      <span>
                        {selectedProductSector && selectedTargetAudience
                          ? "← Back to Campaign Matcher"
                          : `← Back to ${selectedCategory} Options`}
                      </span>
                    </button>
                  )}

                  {showFallbackBanner && (
                    <div className="rounded-2xl border border-amber-250 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-sm font-medium flex items-center gap-3 animate-fade-in shadow-sm">
                      <span className="text-xl">⚠️</span>
                      <div>
                        <span className="font-bold">No exact matches</span> for this specific combination yet. Showing related alternatives in this sub-category.
                      </div>
                    </div>
                  )}

                  {filteredAssets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/10 py-20 text-center px-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No Advertising Slots Found</h3>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                        We couldn't find any listings matching your search criteria. Try modifying your keywords, location, or selected category.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-6 rounded-full bg-violet-650 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-violet-500 transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                      {filteredAssets.map((asset) => {
                        const inBag = isInBag(asset.id);
                        return (
                          <div
                            key={asset.id}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-350 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700/80 dark:hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                          >
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
                              <span className="absolute top-3 left-3 rounded-full bg-slate-50/90 px-3 py-1 text-xs font-semibold text-violet-750 border border-violet-200/50 backdrop-blur-md dark:bg-slate-950/70 dark:text-violet-300 dark:border-violet-500/20">
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
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                                  />
                                  <span>Compare</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                              <div className="flex-1">
                                <p className="text-xs font-medium text-violet-650 dark:text-violet-400 flex items-center mb-1.5">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    className="mr-1 h-3.5 w-3.5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                  </svg>
                                  {asset.location}
                                </p>
                                <h3
                                  className="text-base font-bold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors cursor-pointer"
                                  onClick={() => setActiveDetailAsset(asset)}
                                >
                                  {asset.title}
                                </h3>
                                <p className="mt-2 text-xs text-slate-550 dark:text-slate-400">
                                  Est. Reach: <span className="font-semibold text-slate-700 dark:text-slate-300">{asset.reach}</span>
                                </p>
                              </div>
                              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div>
                                  <p className="text-xs text-slate-450 dark:text-slate-505">Price per slot</p>
                                  <p className="text-lg font-black text-slate-900 dark:text-white">
                                    ₹{asset.price.toLocaleString()}
                                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/day</span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  disabled={inBag}
                                  onClick={() => !inBag && addToBag(asset)}
                                  className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                                    inBag
                                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40 cursor-not-allowed"
                                      : "bg-white text-slate-700 border border-slate-200 hover:border-violet-500/50 hover:bg-violet-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:border-violet-500/50 dark:hover:bg-violet-600 dark:hover:text-white"
                                  }`}
                                >
                                  {inBag ? "Added" : "Add to Bag"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

        {/* Sliding Sidebar Drawer */}
        <BagDrawer />

        {/* Media Detail Modal */}
        <MediaDetailModal
          asset={activeDetailAsset}
          onClose={() => setActiveDetailAsset(null)}
        />

        {/* Compare Modal */}
        <CompareModal
          selectedAssets={selectedCompareAssets}
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
        />

        {/* Toast Alert for Max Comparison limit */}
        {compareAlertMessage && (
          <div className="fixed top-6 left-1/2 z-50 w-full max-w-md px-4 animate-toast-slide-in no-print">
            <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-950/90 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-red-800 dark:text-red-200 text-sm font-semibold">
                <span>⚠️</span>
                <span>{compareAlertMessage}</span>
              </div>
              <button
                onClick={() => setCompareAlertMessage("")}
                className="text-red-500 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Floating Comparison Action Bar */}
        {selectedCompareAssets.length > 0 && (
          <div className="fixed bottom-6 left-1/2 z-40 w-full max-w-2xl px-4 no-print animate-slide-up">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 transition-all">
              {/* Previews and count */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {selectedCompareAssets.map((asset) => (
                    <div key={asset.id} className="relative group/thumb">
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-md"
                      />
                      {/* Individual remove button on hover */}
                      <button
                        onClick={() => setSelectedCompareAssets(prev => prev.filter(item => item.id !== asset.id))}
                        className="absolute -top-1 -right-1 hidden group-hover/thumb:flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] shadow cursor-pointer font-bold"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="text-xs font-semibold text-slate-550 dark:text-slate-450">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {selectedCompareAssets.length}
                  </span>
                  /3 Items Selected
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCompareAssets([])}
                  className="flex-1 sm:flex-none text-xs font-bold text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="flex-1 sm:flex-none rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35 transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚖️</span> Compare Side-by-Side
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white dark:border-slate-900 dark:bg-slate-950 py-8 text-center text-xs text-slate-400 dark:text-slate-500 transition-colors duration-200 no-print">
        <p>&copy; {new Date().getFullYear()} OTZ Marketplace Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
