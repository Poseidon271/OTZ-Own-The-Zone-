"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import BagDrawer from "@/components/BagDrawer";
import MediaBuying from "@/components/MediaBuying";
import { ColumnLines } from "@/components/scrollx/column-lines";

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);

  // Load session for "List Your Media" auth check
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
    <div className="theme-dark min-h-screen flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] relative overflow-hidden font-sans">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar onLogoClick={() => router.push("/")} />
      <BagDrawer />

      <main className="flex-grow pt-24 md:pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10 space-y-10">
        {/* Primary MVP Lead Generation Funnel Surface */}
        <MediaBuying initialChannel={searchParams.get("channel") || ""} />

        {/* Bottom Action / Navigation Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-t border-[var(--border-default)] pt-6 w-full">
          <button
            onClick={() => router.push("/")}
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--action-primary)] hover:text-[var(--action-primary)] transition-all cursor-pointer border border-[var(--border-default)] bg-[var(--surface-raised)]/20 shadow-sm"
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
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white hover:border-[var(--action-primary)] hover:text-[var(--action-primary)] transition-all cursor-pointer border border-[var(--border-default)] bg-[var(--surface-raised)]/20 shadow-sm"
          >
            <MdiIcon name="plus-circle-outline" className="text-sm text-[var(--action-primary)]" />
            <span>List Your Media</span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-white text-sm animate-pulse">Loading Media Buying...</div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
