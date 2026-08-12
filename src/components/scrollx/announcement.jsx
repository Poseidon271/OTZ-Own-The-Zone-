"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function Announcement({ children, href, className, badge }) {
  const inner = (
    <>
      {badge && (
        <span className="rounded-full bg-[var(--action-primary)] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0B1E3B] uppercase tracking-wide">
          {badge}
        </span>
      )}
      <span className="text-[var(--text-secondary)] font-medium text-xs">{children}</span>
      {href && (
        <ArrowRight className="size-3 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  const cls = cn(
    "group inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-raised)]/60 px-3.5 py-1.5 text-sm backdrop-blur-sm transition-all hover:border-[var(--text-primary)]/20 hover:bg-[var(--surface-raised)] select-none",
    className
  );

  if (href) {
    return <Link href={href} className={cls}>{inner}</Link>;
  }
  return <div className={cls}>{inner}</div>;
}
