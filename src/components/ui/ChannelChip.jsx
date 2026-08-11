"use client";

import React from "react";
import MdiIcon from "@/components/MdiIcon";

const CHANNEL_ICONS = {
  TV: "television",
  OOH: "road-variant",
  Influencer: "account-star-outline",
  Digital: "web",
  Search: "magnify",
  Radio: "radio"
};

export default function ChannelChip({
  label,
  value,
  isRecommended = false,
  isSelected = false,
  percentage = null,
  onClick
}) {
  const iconName = CHANNEL_ICONS[value] || "rss";

  // Bypassing CSS resets via inline styles for specific neon values
  const getStyle = () => {
    if (isSelected && isRecommended) {
      return {
        background: "rgba(139, 92, 246, 0.15)",
        borderColor: "rgba(139, 92, 246, 0.6)",
        boxShadow: "0 0 20px rgba(139, 92, 246, 0.35), 0 0 8px rgba(59, 130, 246, 0.25)",
        transform: "scale(1.03)"
      };
    }
    if (isSelected) {
      return {
        background: "rgba(59, 130, 246, 0.15)",
        borderColor: "rgba(59, 130, 246, 0.5)",
        boxShadow: "0 0 15px rgba(59, 130, 246, 0.25)"
      };
    }
    if (isRecommended) {
      return {
        background: "rgba(139, 92, 246, 0.05)",
        borderColor: "rgba(139, 92, 246, 0.3)",
        boxShadow: "0 0 10px rgba(139, 92, 246, 0.12)"
      };
    }
    return {
      background: "rgba(255, 255, 255, 0.03)",
      borderColor: "rgba(255, 255, 255, 0.05)"
    };
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={getStyle()}
      className={`relative inline-flex items-center gap-2 rounded-full px-4.5 py-2.5 text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer border ${
        isSelected
          ? "text-white"
          : "text-slate-350 hover:text-white hover:bg-white/10 hover:border-white/15 hover:-translate-y-0.5"
      }`}
    >
      <MdiIcon
        name={iconName}
        className={`text-sm transition-transform duration-300 ${
          isSelected ? "scale-110 text-white" : "text-slate-400 group-hover:scale-110"
        }`}
      />

      <span>{label}</span>

      {percentage !== null && (
        <span
          className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-black ${
            isSelected
              ? "bg-white/15 text-white"
              : "bg-white/5 text-slate-400"
          }`}
        >
          {percentage}%
        </span>
      )}

      {isRecommended && (
        <span
          className="absolute -top-1.5 -right-1 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white animate-pulse"
          style={{
            background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)",
            boxShadow: "0 0 8px rgba(139, 92, 246, 0.6)",
            fontSize: "7px",
            lineHeight: "1"
          }}
        >
          AI Rec
        </span>
      )}
    </button>
  );
}
