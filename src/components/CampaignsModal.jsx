"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import MdiIcon from "@/components/MdiIcon";

const mockCampaigns = [
  {
    id: "camp-1",
    name: "Summer Brand Blitz Q3",
    status: "Active",
    budget: 4500,
    reach: "1.2M daily impressions",
    schedule: "Jul 01 - Jul 31, 2026",
    asset: "Premium Digital Billboard - Times Square Hub",
    progress: 45,
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
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setIsCampaignsModalOpen(false)}
      ></div>

      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl frost-card rounded-3xl overflow-hidden flex flex-col animate-scale-up max-h-[90vh] transition-colors duration-200"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsCampaignsModalOpen(false)}
          className="absolute top-4 right-4 text-[#A5B2BF] hover:text-[#F2F6FA] p-2 rounded-xl hover:bg-white/10 transition-colors z-20 border border-white/10 cursor-pointer"
          title="Close Modal"
        >
          <MdiIcon name="close" className="text-xl" />
        </button>

        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <MdiIcon name="chart-box-outline" className="text-3xl text-[#B8C7D9]" />
            <div>
              <h2 className="text-xl font-bold text-[#F2F6FA] flex items-center">
                My Campaign Dashboard
              </h2>
              <p className="text-xs text-[#A5B2BF] mt-1">
                Monitor active schedules, validation status, and performance metrics for account <span className="font-semibold text-[#B8C7D9]">@{user?.handle || "maver1ck"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8 space-y-6">
          {mockCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="frost-card p-5 rounded-2xl transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Info block */}
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-extrabold text-[#F2F6FA]">
                      {camp.name}
                    </h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      camp.status === "Active"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                        : camp.status === "Pending Quote"
                        ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                        : "bg-white/5 text-[#A5B2BF] border-white/10"
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#7F8B99] mt-1">
                    {camp.asset}
                  </p>
                </div>

                {/* Pricing / Schedule block */}
                <div className="text-left md:text-right min-w-[150px]">
                  <div className="text-sm font-black text-[#F2F6FA]">
                    ₹{camp.budget.toLocaleString()} / mo
                  </div>
                  <div className="text-xs text-[#A5B2BF] mt-1">
                    {camp.schedule}
                  </div>
                </div>
              </div>

              {/* Progress bar / Analytics details */}
              <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-[#A5B2BF] mb-1.5 font-medium">
                    <span>Campaign Execution Progress</span>
                    <span className="font-bold text-[#F2F6FA]">{camp.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#B8C7D9] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${camp.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs bg-white/5 px-3 py-2 rounded-xl border border-white/10 text-[#A5B2BF]">
                  <MdiIcon name="trending-up" className="text-base text-[#B8C7D9]" />
                  <span>Target Reach:</span>
                  <span className="font-bold text-[#F2F6FA]">{camp.reach}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-white/10 bg-white/5 text-center text-xs text-[#7F8B99]">
          Want to launch a new campaign? Head back to the marketplace, add assets to your plan, and request a verified quote.
        </div>
      </div>
    </div>
  );
}
