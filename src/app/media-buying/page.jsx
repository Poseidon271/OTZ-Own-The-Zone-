"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LegacyMediaBuyingRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const channel = searchParams.get("channel");
    if (channel) {
      router.replace(`/for-brands?channel=${encodeURIComponent(channel)}`);
    } else {
      router.replace("/for-brands");
    }
  }, [router, searchParams]);

  return (
    <div className="theme-dark min-h-screen bg-[#0B1E3B] flex items-center justify-center">
      <div className="text-white text-sm animate-pulse">Redirecting to For Brands...</div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="theme-dark min-h-screen bg-[#0B1E3B] flex items-center justify-center">
          <div className="text-white text-sm animate-pulse">Redirecting to For Brands...</div>
        </div>
      }
    >
      <LegacyMediaBuyingRedirect />
    </Suspense>
  );
}

