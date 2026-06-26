"use client";

import React from "react";
import { useBag } from "@/context/BagContext";

export default function MediaDetailModal({ asset, onClose }) {
  const { addToBag, removeFromBag, isInBag } = useBag();

  if (!asset) return null;

  const inBag = isInBag(asset.id);
  const availability = asset.availability || {};
  const isCompletelyBooked = Object.values(availability).length > 0 && Object.values(availability).every((val) => val === false);

  // Dynamic specs mapping based on category
  const getSpecsContent = (category) => {
    switch (category) {
      case "Billboards":
        return "Dimensions: 14ft x 48ft | Format: High-Res JPEG / TIFF | Aspect Ratio: 3.4:1";
      case "Digital Ads":
        return "Resolution: 1920x1080px | Format: MP4 or PNG | Max File Size: 20MB";
      case "Radio":
        return "Duration: 30 seconds | Format: High-Quality WAV or MP3 (320kbps)";
      case "Cinema":
        return "Resolution: 2K/4K Flat | Format: Digital Cinema Package (DCP)";
      default:
        return "Standard high-resolution layout and print files accepted.";
    }
  };

  const handleActionClick = () => {
    if (inBag) {
      removeFromBag(asset.id);
    } else {
      addToBag(asset);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scale-up max-h-[90vh] dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 backdrop-blur-md transition-colors z-20 border border-slate-200 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-950/50 dark:border-slate-800/40"
          title="Close Modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Visual Header Banner */}
        <div className="relative w-full h-56 sm:h-72 bg-slate-100 dark:bg-slate-950 overflow-hidden flex-shrink-0">
          <img
            src={asset.image}
            alt={asset.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-slate-900 dark:via-slate-900/40"></div>
          
          {/* Category Badge over Image */}
          <span className="absolute top-4 left-4 rounded-full bg-slate-50/90 px-3.5 py-1 text-xs font-semibold text-violet-700 border border-violet-200 backdrop-blur-md dark:bg-slate-950/70 dark:text-violet-300 dark:border-violet-500/20">
            {asset.category}
          </span>

          {/* Absolute bottom details */}
          <div className="absolute bottom-5 left-6 right-6">
            <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex items-center mb-1">
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight sm:text-2xl">
              {asset.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505 mb-2">
              Overview
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {asset.description}
            </p>
          </div>

          {/* Fast Specifications Panel */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-950/20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                Estimated Reach
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {asset.reach}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                Availability Specs
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {asset.specs}
              </span>
            </div>
          </div>

          {/* Creative Specs Panel */}
          <div className="rounded-2xl border border-slate-200 bg-slate-100/40 p-4 dark:border-slate-800/80 dark:bg-slate-950/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-650 dark:text-violet-400 mb-2 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="mr-1.5 h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 21l8.904-4.473L21 21l-8.904-4.473L9.813 15.904zM3 21h18M3 10h18M3 6h18"
                />
              </svg>
              Creative & Technical Requirements
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed font-mono">
              {getSpecsContent(asset.category)}
            </p>
          </div>

          {/* Availability Timeline Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-950/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-505 mb-3 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="mr-1.5 h-4 w-4 text-violet-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              Availability Timeline (Next 6 Months)
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(availability).map(([month, isAvailable]) => (
                <div
                  key={month}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all duration-300 ${
                    isAvailable
                      ? "bg-green-50/60 border-green-200 text-green-700 dark:bg-green-950/15 dark:border-green-800/50 dark:text-green-400"
                      : "bg-red-50/60 border-red-150 text-red-650 line-through dark:bg-red-950/15 dark:border-red-900/50 dark:text-red-400"
                  }`}
                >
                  <span className="text-sm font-bold">{month}</span>
                  <span className="text-[9px] font-medium tracking-wide mt-0.5 uppercase">
                    {isAvailable ? "Available" : "Booked"}
                  </span>
                </div>
              ))}
            </div>
            {isCompletelyBooked && (
              <p className="text-[10px] text-red-600 dark:text-red-450 font-semibold mt-2.5 text-center">
                ⚠️ This media slot is fully booked for all upcoming months.
              </p>
            )}
          </div>
        </div>

        {/* Footer Pricing & CTA Section */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-row items-center justify-between flex-shrink-0 dark:border-slate-800 dark:bg-slate-950 transition-colors duration-200">
          <div>
            <p className="text-xs text-slate-500">Base Price / Month</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              ${asset.price * 30}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> (est. net)</span>
            </p>
          </div>

          {/* Dynamic CTA button */}
          <button
            type="button"
            disabled={isCompletelyBooked && !inBag}
            onClick={handleActionClick}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${
              isCompletelyBooked && !inBag
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-750"
                : inBag
                ? "bg-rose-100 text-rose-700 border border-rose-250 hover:bg-rose-600 hover:text-white dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/60 dark:hover:bg-rose-900/40 dark:hover:text-white"
                : "bg-violet-650 hover:bg-violet-550 text-white shadow-md shadow-violet-650/10 hover:shadow-violet-650/30"
            }`}
          >
            {isCompletelyBooked && !inBag
              ? "Unavailable for Booking"
              : inBag
              ? "Remove from Bag"
              : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
