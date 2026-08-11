"use client";

import React from "react";
import MdiIcon from "@/components/MdiIcon";

export default function Results({ results }) {
  if (!results || !results.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl">
        <MdiIcon name="magnify-remove-outline" className="text-3xl text-[var(--accent-primary)] opacity-60 mb-2" />
        <p className="text-[var(--text-secondary)] text-sm">
          No matches found for the selected campaign parameters. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((item) => (
        <div
          key={item.id}
          className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(184,199,217,0.25)] hover:bg-[var(--glass-hover)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] animate-scale-up"
        >
          {/* Card Header & Title */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(184,199,217,0.08)] border border-[rgba(255,255,255,0.04)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
                {item.media}
              </span>
              <span className="text-[10px] font-medium text-[var(--text-muted)]">
                ID: {item.id}
              </span>
            </div>
            <h3 className="text-[var(--text-primary)] text-base font-bold leading-snug group-hover:text-[var(--accent-hover)] transition-colors duration-200">
              {item.name}
            </h3>
          </div>

          {/* Details & Metadata */}
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)] flex items-center gap-1">
                <MdiIcon name="chart-bar" className="text-sm text-[var(--accent-primary)] opacity-70" />
                Est. Reach
              </span>
              <span className="font-bold text-[var(--text-primary)]">
                {item.reach}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)] flex items-center gap-1">
                <MdiIcon name="tag-outline" className="text-sm text-[var(--accent-primary)] opacity-70" />
                Price Spot
              </span>
              <span className="font-extrabold text-[var(--accent-primary)]">
                {item.price}
              </span>
            </div>
          </div>

          {/* Footer Badges */}
          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-dashed border-[rgba(255,255,255,0.04)]">
            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-white/5 border border-[var(--glass-border)] text-[var(--text-secondary)]">
              {item.industry}
            </span>
            <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-white/5 border border-[var(--glass-border)] text-[var(--text-secondary)]">
              {item.goal}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
