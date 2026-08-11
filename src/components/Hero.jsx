"use client";

import React from "react";
import MdiIcon from "@/components/MdiIcon";

export default function Hero({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
}) {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        {/* Typography Container */}
        <div className="mx-auto mb-10 flex flex-col items-center justify-center text-center animate-fade-in">
          {/* Line 1 (The Brand) */}
          <h1 className="text-6xl font-extrabold tracking-tight text-[#F2F6FA] sm:text-7xl">
            <span className="bg-gradient-to-r from-[#D4E2EC] via-[#B8C7D9] to-[#A8C7D8] bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(184,199,217,0.25)]">
              OTZ
            </span>
          </h1>
          {/* Line 2 (The Tagline) */}
          <p className="mt-5 text-2xl font-bold tracking-tight leading-tight text-[#F2F6FA] sm:text-3xl max-w-3xl">
            The New Age Marketing Enablement Engine
          </p>
        </div>

        {/* Search Console */}
        <form
          onSubmit={handleSearchSubmit}
          className="mx-auto mt-10 max-w-2xl rounded-2xl p-2 sm:rounded-full transition-all duration-300 focus-within:border-[#B8C7D9] focus-within:ring-4 focus-within:ring-[#B8C7D9]/12"
          style={{
            background: "rgba(18, 24, 34, 0.45)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="flex flex-1 items-center px-3 py-2">
              <MdiIcon name="magnify" className="text-xl text-[#B8C7D9]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search media (e.g. Bandra Sea Link, Rajiv Chowk, Metro)"
                className="ml-2.5 w-full bg-transparent text-sm text-[#F2F6FA] placeholder-[#7F8B99] outline-none"
              />
            </div>

            {/* Separator Line (Desktop only) */}
            <div className="hidden h-8 w-px bg-white/10 sm:block"></div>

            {/* Location Input */}
            <div className="flex flex-1 items-center px-3 py-2">
              <MdiIcon name="map-marker-outline" className="text-xl text-[#B8C7D9]" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter Location (e.g. Mumbai, Delhi, Bengaluru)"
                className="ml-2.5 w-full bg-transparent text-sm text-[#F2F6FA] placeholder-[#7F8B99] outline-none"
              />
            </div>

            {/* Search Action Button */}
            <button
              type="submit"
              className="flex items-center justify-center rounded-xl bg-[#B8C7D9] text-[#111827] px-6 py-3 text-sm font-bold transition-all duration-300 hover:bg-[#D4E2EC] active:bg-[#A8C7D8] shadow-[0_10px_30px_rgba(184,199,217,0.18)] sm:rounded-full cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
