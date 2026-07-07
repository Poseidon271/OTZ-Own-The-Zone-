"use client";

import React from "react";

export default function Hero({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
}) {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Live filtering happens instantly, but submission is handled gracefully
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/[0.06] dark:bg-violet-600/10 blur-[120px]"></div>
      <div className="absolute top-1/3 left-1/3 -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.06] dark:bg-indigo-500/10 blur-[100px]"></div>

      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Typography Container */}
        <div className="mx-auto mb-10 flex flex-col items-center justify-center text-center animate-fade-in">
          {/* Line 1 (The Brand) */}
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl">
            <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(139,92,246,0.1)] dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 dark:drop-shadow-[0_2px_10px_rgba(139,92,246,0.15)]">
              OTZ
            </span>
          </h1>
          {/* Line 2 (The Tagline) */}
          <p className="mt-5 text-2xl font-bold tracking-tight leading-tight text-slate-800 dark:text-slate-100 sm:text-3xl max-w-3xl">
            The New Age Marketing Enablement Engine
          </p>
        </div>

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
                placeholder="Search media (e.g. Bandra Sea Link, Rajiv Chowk, Metro)"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-550"
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
                placeholder="Enter Location (e.g. Mumbai, Delhi, Bengaluru)"
                className="ml-2.5 w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-550"
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
      </div>
    </section>
  );
}
