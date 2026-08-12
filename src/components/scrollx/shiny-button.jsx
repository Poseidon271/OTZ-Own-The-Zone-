"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const spotlightClass = cn(
  "group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer focus-ring select-none",
  "bg-[var(--action-primary)] text-[#0B1E3B] hover:bg-[var(--action-primary-hover)]",
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity group-hover:before:opacity-100",
  "before:bg-[radial-gradient(100px_at_var(--x)_var(--y),rgba(255,255,255,0.22),transparent)]"
);

function useSpotlight() {
  const ref = useRef(null);
  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }
  return { ref, onMouseMove };
}

export function ShinyButton({ children, className, href, onClick, type = "button" }) {
  const { ref, onMouseMove } = useSpotlight();
  const style = { "--x": "50%", "--y": "50%" };

  if (href) {
    return (
      <Link
        href={href}
        ref={ref}
        onMouseMove={onMouseMove}
        style={style}
        className={cn(spotlightClass, className)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      ref={ref}
      onMouseMove={onMouseMove}
      style={style}
      onClick={onClick}
      className={cn(spotlightClass, className)}
    >
      {children}
    </button>
  );
}
