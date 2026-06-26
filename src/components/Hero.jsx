"use client";

import React from "react";

export default function Hero({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  activeCategory,
  setActiveCategory,
}) {
  const categories = ["Billboards", "Digital Ads", "Cinema", "Radio"];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Live filtering happens instantly, but submission is handled gracefully
  };

  const toggleCategory = (category) => {
    if (activeCategory === category) {
      setActiveCategory(null); // Deselect if clicked again
    } else {
      setActiveCategory(category);
    }
  };

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.06] dark:bg-violet-600/10 blur-[120px]"></div>
      <div className="absolute top-1/3 left-1/3 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.06] dark:bg-indigo-500/10 blur-[100px]"></div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Sub-badge */}
        <div className="mx-auto mb-6 flex max-w-fit items-center space-x-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 text-xs font-semibold text-violet-600 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-400 animate-fade-in">
          <span>Introducing OTZ Marketplace</span>
          <span className="h-1 w-1 rounded-full bg-violet-400"></span>
          <span className="text-slate-500 dark:text-slate-300">The Future of Media Booking</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          Discover & Book <br />
          <span className="bg-gradient-to-r from-violet-650 via-indigo-550 to-purple-650 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(139,92,246,0.1)] dark:from-violet-400 dark:via-indigo-300 dark:to-purple-400 dark:drop-shadow-[0_2px_10px_rgba(139,92,246,0.15)]">
            Advertising Spaces
          </span>
        </h1>

        {/* Hero Subheading */}
        <p className="mx-auto mt-6 max-w-xl text-base text-slate-500 dark:text-slate-400 sm:text-lg">
          Find premium billboards, high-impact digital displays, cinema ads, and top-rated radio slots in one click.
        </p>

        {/* Search Console */}
        <form
          onSubmit={handleSearchSubmit}
          className="mx-auto mt-10 max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_15px_40px_rgba(0,0,0,0.06)] backdrop-blur-md sm:rounded-full dark:border-slate-800 dark:bg-slate-900/60 dark:shadow-2xl"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="flex flex-1 items-center px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="h-5 w-5 text-slate-400 dark:text-slate-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search media (e.g. Times Square, Metro Billboards)"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {/* Separator Line (Desktop only) */}
            <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-800"></div>

            {/* Location Input */}
            <div className="flex flex-1 items-center px-3 py-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-5 w-5 text-slate-400 dark:text-slate-500"
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
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter Location (e.g. New York, Miami)"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
              />
            </div>

            {/* Search Action Button */}
            <button
              type="submit"
              className="flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-violet-500 hover:shadow-violet-600/30 sm:rounded-full"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Chips - Phase 2 Preview */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1.5">
              Popular:
            </span>
            {categories.map((category) => {
              const isSelected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)] border border-violet-500"
                      : "bg-slate-100 text-slate-650 hover:bg-slate-200 hover:text-slate-800 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:border-slate-800"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
