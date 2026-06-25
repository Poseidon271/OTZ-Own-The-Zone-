"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BagDrawer from "@/components/BagDrawer";
import MediaDetailModal from "@/components/MediaDetailModal";
import { mockAdvertisingAssets } from "@/data/mockData";
import { useBag } from "@/context/BagContext";

export default function Home() {
  const { addToBag, removeFromBag, isInBag } = useBag();

  // Search and Category Filter States
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState(null);
  const [activeDetailAsset, setActiveDetailAsset] = React.useState(null);

  // Reset all search and category filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setLocationQuery("");
    setActiveCategory(null);
  };

  // Perform live query filtering on mock dataset
  const filteredAssets = mockAdvertisingAssets.filter((asset) => {
    // 1. Category Filter
    if (activeCategory && asset.category !== activeCategory) {
      return false;
    }
    // 2. Keyword Search Query Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = asset.title.toLowerCase().includes(query);
      const descMatch = asset.description.toLowerCase().includes(query);
      const specsMatch = asset.specs.toLowerCase().includes(query);
      if (!titleMatch && !descMatch && !specsMatch) {
        return false;
      }
    }
    // 3. Location Query Filter
    if (locationQuery) {
      const loc = locationQuery.toLowerCase();
      if (!asset.location.toLowerCase().includes(loc)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-violet-500 selection:text-white">
      {/* Navbar Component */}
      <Navbar />

      {/* Sliding Sidebar Drawer */}
      <BagDrawer />

      {/* Hero Component with state props passed down */}
      <main className="flex-grow">
        <Hero
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationQuery={locationQuery}
          setLocationQuery={setLocationQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />

        {/* Assets Listing Section */}
        <section id="explore" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {activeCategory ? `${activeCategory} Slots` : "All Advertising Slots"}
              </h2>
              <p className="mt-2 text-slate-400 text-sm">
                {filteredAssets.length} active spaces matching your search preferences.
              </p>
            </div>
            {(activeCategory || searchQuery || locationQuery) && (
              <button
                onClick={handleResetFilters}
                className="mt-4 md:mt-0 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Conditional Rendering: Empty State vs Grid */}
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 py-20 text-center px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="mx-auto h-12 w-12 text-slate-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <h3 className="mt-4 text-sm font-semibold text-white">No Advertising Slots Found</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-xs">
                We couldn't find any listings matching your search criteria. Try modifying your keywords, location, or selected category.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 rounded-full bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-violet-500 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Grid Layout */
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 animate-fade-in">
              {filteredAssets.map((asset) => {
                const inBag = isInBag(asset.id);
                return (
                  <div
                    key={asset.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 transition-all duration-300 hover:border-slate-700/80 hover:bg-slate-900/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1"
                  >
                    {/* Image Container */}
                    <div
                      className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                      onClick={() => setActiveDetailAsset(asset)}
                    >
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-500/20 backdrop-blur-md">
                        {asset.category}
                      </span>
                    </div>

                    {/* Info Container */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex-1">
                        {/* Location */}
                        <p className="text-xs font-medium text-violet-400 flex items-center mb-1.5">
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
                          className="text-base font-bold text-white group-hover:text-violet-300 transition-colors cursor-pointer"
                          onClick={() => setActiveDetailAsset(asset)}
                        >
                          {asset.title}
                        </h3>

                        {/* Reach indicator */}
                        <p className="mt-2 text-xs text-slate-400">
                          Est. Reach: <span className="font-semibold text-slate-300">{asset.reach}</span>
                        </p>
                      </div>

                      {/* Pricing and Action */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                        <div>
                          <p className="text-xs text-slate-500">Price per slot</p>
                          <p className="text-lg font-black text-white">
                            ${asset.price}
                            <span className="text-xs font-normal text-slate-400">/day</span>
                          </p>
                        </div>

                        {/* Add to bag button */}
                        <button
                          type="button"
                          disabled={inBag}
                          onClick={() => !inBag && addToBag(asset)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                            inBag
                              ? "bg-emerald-950/30 text-emerald-400 border border-emerald-800/40 cursor-not-allowed"
                              : "bg-slate-850 text-slate-200 border border-slate-700 hover:border-violet-500/50 hover:bg-violet-600 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.25)]"
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
        </section>
      </main>

      {/* Sliding Sidebar Drawer */}
      <BagDrawer />

      {/* Media Detail Modal */}
      <MediaDetailModal
        asset={activeDetailAsset}
        onClose={() => setActiveDetailAsset(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} OTZ Marketplace Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
