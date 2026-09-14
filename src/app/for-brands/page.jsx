"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import BagDrawer from "@/components/BagDrawer";
import MediaBuying from "@/components/MediaBuying";
import { ColumnLines } from "@/components/scrollx/column-lines";

function ForBrandsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        const authRes = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-session" })
        });
        const authData = await authRes.json();
        if (active && authData.user) {
          setUser(authData.user);
        }
      } catch (err) {
        console.error("Failed to load session", err);
      }
    };

    loadSession();
    return () => { active = false; };
  }, []);

  return (
    <div className="theme-dark min-h-screen flex flex-col bg-[#0B1E3B] text-white relative overflow-hidden font-sans">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* Radial Gradient Glow Highlights */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 95% 35%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 5% 75%, rgba(19, 42, 79, 0.25) 0%, transparent 55%)",
        }}
      />

      <Navbar onLogoClick={() => router.push("/")} />
      <BagDrawer />

      <main className="flex-grow pt-28 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10 space-y-10">
        {/* Unified Demand Surface: 10 Media Channel Category Cards + Lead-Capture Intake Modal */}
        <MediaBuying initialChannel={searchParams.get("channel") || ""} />

        {/* Action / Return Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-t border-white/10 pt-6 w-full">
          <button
            onClick={() => router.push("/")}
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all cursor-pointer border border-white/10 bg-[#101828]/60 shadow-sm"
          >
            <MdiIcon name="arrow-left" className="text-sm" /> Return to Homepage
          </button>

          <button
            onClick={() => {
              if (user) {
                router.push("/dashboard?tab=listings");
              } else {
                window.dispatchEvent(new CustomEvent("open-lead-popup", { detail: { intent: "host" } }));
              }
            }}
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-all cursor-pointer border border-white/10 bg-[#101828]/60 shadow-sm"
          >
            <MdiIcon name="plus-circle-outline" className="text-sm text-[#FF5A1F]" />
            <span>List Your Media</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ForBrandsPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-dark min-h-screen bg-[#0B1E3B] flex items-center justify-center">
          <div className="text-white text-sm animate-pulse">Loading For Brands...</div>
        </div>
      }
    >
      <ForBrandsContent />
    </Suspense>
  );
}
