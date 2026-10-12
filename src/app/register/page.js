"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup");
  }, [router]);

  return (
    <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center text-white text-xs font-bold">
      Redirecting to registration...
    </div>
  );
}
