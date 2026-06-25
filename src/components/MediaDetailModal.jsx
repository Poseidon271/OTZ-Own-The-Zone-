"use client";

import React from "react";
import { useBag } from "@/context/BagContext";

export default function MediaDetailModal({ asset, onClose }) {
  const { addToBag, removeFromBag, isInBag } = useBag();

  if (!asset) return null;

  const inBag = isInBag(asset.id);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scale-up max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-950/50 backdrop-blur-md transition-colors z-20 border border-slate-800/40"
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
        <div className="relative w-full h-56 sm:h-72 bg-slate-950 overflow-hidden flex-shrink-0">
          <img
            src={asset.image}
            alt={asset.title}
            className="w-full h-full object-cover"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          {/* Category Badge over Image */}
          <span className="absolute top-4 left-4 rounded-full bg-slate-950/70 px-3.5 py-1 text-xs font-semibold text-violet-300 border border-violet-500/20 backdrop-blur-md">
            {asset.category}
          </span>

          {/* Absolute bottom details */}
          <div className="absolute bottom-5 left-6 right-6">
            <p className="text-xs font-semibold text-violet-400 flex items-center mb-1">
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
            <h3 className="text-xl font-bold text-white tracking-tight sm:text-2xl">
              {asset.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Overview
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {asset.description}
            </p>
          </div>

          {/* Fast Specifications Panel */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/20 p-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Estimated Reach
              </span>
              <span className="text-sm font-semibold text-white">
                {asset.reach}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Availability Specs
              </span>
              <span className="text-sm font-semibold text-white">
                {asset.specs}
              </span>
            </div>
          </div>

          {/* Creative Specs Panel */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-2 flex items-center">
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
            <p className="text-xs text-slate-300 font-medium leading-relaxed font-mono">
              {getSpecsContent(asset.category)}
            </p>
          </div>
        </div>

        {/* Footer Pricing & CTA Section */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex flex-row items-center justify-between flex-shrink-0">
          <div>
            <p className="text-xs text-slate-500">Base Price / Month</p>
            <p className="text-xl font-black text-white">
              ${asset.price * 30}
              <span className="text-xs font-normal text-slate-400"> (est. net)</span>
            </p>
          </div>

          {/* Dynamic CTA button */}
          <button
            type="button"
            onClick={handleActionClick}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 ${
              inBag
                ? "bg-rose-950/30 text-rose-400 border border-rose-800/60 hover:bg-rose-900/40 hover:text-white"
                : "bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/10 hover:shadow-violet-600/30"
            }`}
          >
            {inBag ? "Remove from Bag" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
