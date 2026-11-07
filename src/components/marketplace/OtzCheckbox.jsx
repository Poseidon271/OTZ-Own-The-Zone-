"use client";

import React from "react";
import { Check } from "lucide-react";

export default function OtzCheckbox({
  id,
  checked,
  onChange,
  label,
  count,
  type = "checkbox",
  name,
  value,
  className = ""
}) {
  const inputId = id || (name && value ? `${name}-${value}` : undefined);

  return (
    <label
      htmlFor={inputId}
      className={`flex items-center text-xs text-[#A5B5CD] hover:text-white cursor-pointer py-1 group select-none transition-colors ${className}`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-1">
        <div className="relative flex items-center justify-center shrink-0">
          <input
            id={inputId}
            type={type}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
          />
          {type === "radio" ? (
            <div
              className={`w-4 h-4 rounded-full border transition-all duration-150 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF5A1F] peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-[#0F2444] ${
                checked
                  ? "border-[#FF5A1F] bg-[#0B1E3B]"
                  : "border-[#1E375C] bg-[#0B1E3B] group-hover:border-[#FF5A1F]/60"
              }`}
            >
              {checked && <div className="w-2 h-2 rounded-full bg-[#FF5A1F]" />}
            </div>
          ) : (
            <div
              className={`w-4 h-4 rounded border transition-all duration-150 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF5A1F] peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-[#0F2444] ${
                checked
                  ? "bg-[#FF5A1F] border-[#FF5A1F]"
                  : "bg-[#0B1E3B] border-[#1E375C] group-hover:border-[#FF5A1F]/60"
              }`}
            >
              {checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
            </div>
          )}
        </div>
        <span className={`truncate text-xs ${checked ? "text-white font-semibold" : "text-[#A5B5CD]"}`}>
          {label}
        </span>
        {count !== undefined && (
          <span className="text-[11px] text-[#677E9E] group-hover:text-[#A5B5CD] shrink-0 font-mono">
            ({count})
          </span>
        )}
      </div>
    </label>
  );
}

