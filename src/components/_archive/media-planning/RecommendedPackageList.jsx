"use client";

import React from "react";
import MdiIcon from "@/components/MdiIcon";
import { ShinyButton } from "@/components/scrollx/shiny-button";

export default function RecommendedPackageList({
  planningResults = null,
  isInBag = () => false,
  onAddPackageToBag,
  onAddToBag,
  onRemoveFromBag,
  onSelectAsset,
  triggerToast,
}) {
  const bundle = planningResults?.bundle || [];
  const duration = planningResults?.duration || 1;
  const totalCost = planningResults?.totalCost || 0;
  const maxBudget = planningResults?.maxBudget || 0;

  return (
    <div className="rounded-3xl border border-[var(--border-default)] bg-[var(--surface-raised)]/40 p-6 md:p-8 space-y-6 text-left relative overflow-hidden backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-default)] pb-4 gap-4 w-full">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-canvas)] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-[var(--action-primary)] border border-[var(--border-default)]">
            <MdiIcon name="auto-fix" className="text-xs" /> AI Engine Select
          </span>
          <h4 className="text-2xl font-black text-white mt-2 font-display">
            Strategic Recommendation Mix
          </h4>
        </div>
        {bundle.length > 0 && (
          <div className="text-left md:text-right">
            <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-extrabold">
              Total Bundle Cost
            </p>
            <p className="text-2xl font-black text-[var(--action-primary)]">
              ₹{totalCost.toLocaleString()}
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Remaining Budget: ₹{(maxBudget - totalCost).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {bundle.length > 0 ? (
        <div className="space-y-6">
          <div className="divide-y divide-[var(--border-default)] bg-[var(--surface-canvas)]/30 rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-inner">
            {bundle.map((asset) => {
              const inBag = isInBag(asset.id);
              return (
                <div
                  key={asset.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--surface-canvas)] border border-[var(--border-default)] cursor-pointer"
                      onClick={() => onSelectAsset && onSelectAsset(asset)}
                    >
                      <img src={asset.image} alt={asset.title} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <h5
                        className="text-sm font-bold text-white hover:text-[var(--action-primary)] transition-colors cursor-pointer"
                        onClick={() => onSelectAsset && onSelectAsset(asset)}
                      >
                        {asset.title}
                      </h5>
                      <p className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <MdiIcon name="map-marker" className="text-[10px] text-[var(--action-primary)]" /> {asset.location} &bull; <MdiIcon name="chart-bar" className="text-[10px] text-[var(--action-primary)]" /> {asset.reach}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-[var(--border-default)] pt-2 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-black text-white">
                        ₹{(asset.price * duration * 30).toLocaleString()}
                      </p>
                      <p className="text-[9px] text-[var(--text-secondary)] font-mono">
                        ₹{asset.price.toLocaleString()}/day for {duration}M
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (inBag) {
                          if (onRemoveFromBag) onRemoveFromBag(asset.id);
                          if (triggerToast) triggerToast(`Removed "${asset.title}" from bag`);
                        } else {
                          if (onAddToBag) onAddToBag(asset, duration);
                          if (triggerToast) triggerToast(`✓ Added "${asset.title}" to campaign bag`);
                        }
                      }}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wide transition-all duration-300 cursor-pointer flex items-center gap-1 ${
                        inBag
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40"
                          : "bg-white text-black hover:bg-[var(--action-primary)] hover:text-[#0B1E3B]"
                      }`}
                    >
                      {inBag ? (
                        <>
                          <MdiIcon name="check-bold" className="text-xs text-emerald-400" />
                          <span>Added ✓</span>
                        </>
                      ) : (
                        <span>Add</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            {bundle.every((item) => isInBag(item.id)) ? (
              <button
                type="button"
                onClick={() => onAddPackageToBag && onAddPackageToBag(bundle)}
                className="rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-6 py-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <MdiIcon name="check-bold" className="text-sm text-emerald-400" /> All Recommended Placements Added ✓
              </button>
            ) : (
              <ShinyButton
                onClick={() => onAddPackageToBag && onAddPackageToBag(bundle)}
                className="rounded-2xl py-4 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer font-sans shadow-lg hover:shadow-[#FF5A1F]/30"
              >
                <MdiIcon name="shopping-outline" className="text-base" /> Add Recommended Package to Bag
              </ShinyButton>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-start gap-3">
          <MdiIcon name="alert-circle-outline" className="text-xl shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold block text-white mb-0.5">No Recommended Mix Found</span>
            <span>Adjust your budget or filter parameters to generate a custom recommendation package.</span>
          </div>
        </div>
      )}
    </div>
  );
}
