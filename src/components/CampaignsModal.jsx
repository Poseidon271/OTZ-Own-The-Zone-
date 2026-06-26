"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

const mockCampaigns = [
  {
    id: "camp-1",
    name: "Summer Brand Blitz Q3",
    status: "Active",
    budget: 4500,
    reach: "1.2M daily impressions",
    schedule: "Jul 01 - Jul 31, 2026",
    asset: "Premium Digital Billboard - Times Square Hub",
    progress: 45, // percentage
  },
  {
    id: "camp-2",
    name: "Commuter Drive Promotion",
    status: "Pending Quote",
    budget: 2150,
    reach: "600K combined listeners & drivers",
    schedule: "Aug 15 - Sep 15, 2026",
    asset: "Highway Billboard I-95 & prime 98.1 FM spot",
    progress: 0,
  },
  {
    id: "camp-3",
    name: "Q2 Product Showcase",
    status: "Completed",
    budget: 650,
    reach: "25K total views",
    schedule: "May 01 - May 31, 2026",
    asset: "Cinema Pre-Show Advertising - AMC Empire 25",
    progress: 100,
  },
];

export default function CampaignsModal() {
  const { isCampaignsModalOpen, setIsCampaignsModalOpen, user } = useAuth();

  if (!isCampaignsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCampaignsModalOpen(false)}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scale-up max-h-[90vh] dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsCampaignsModalOpen(false)}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors z-20 border border-slate-200 dark:border-slate-800"
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

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                My Campaign Dashboard
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Monitor active schedules, validation status, and performance metrics for account <span className="font-semibold text-violet-650 dark:text-violet-400">@{user?.handle || "maver1ck"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 space-y-6">
          {mockCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-5 border border-slate-150 bg-slate-50/30 rounded-2xl dark:border-slate-800 dark:bg-slate-950/20 hover:border-violet-500/30 hover:shadow-md transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Info block */}
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                      {camp.name}
                    </h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      camp.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/55 dark:text-emerald-400 dark:border-emerald-900/60"
                        : camp.status === "Pending Quote"
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/55 dark:text-amber-400 dark:border-amber-900/60"
                        : "bg-slate-105 text-slate-600 border-slate-200 dark:bg-slate-950/55 dark:text-slate-400 dark:border-slate-800"
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {camp.asset}
                  </p>
                </div>

                {/* Pricing / Schedule block */}
                <div className="text-left md:text-right min-w-[150px]">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    ${camp.budget.toLocaleString()} / mo
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                    {camp.schedule}
                  </div>
                </div>
              </div>

              {/* Progress bar / Analytics details */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-1.5 font-medium">
                    <span>Campaign Execution Progress</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{camp.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200/60 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${camp.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <span>📈 Target Reach:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300">{camp.reach}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center text-xs text-slate-450 dark:text-slate-500">
          Want to launch a new campaign? Head back to the marketplace, add assets to your plan, and request a verified quote.
        </div>
      </div>
    </div>
  );
}
