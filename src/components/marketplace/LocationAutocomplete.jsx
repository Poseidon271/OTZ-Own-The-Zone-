"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, MapPin, Check } from "lucide-react";
import { searchLocations } from "@/lib/locationData";

export default function LocationAutocomplete({
  selectedLocations = [],
  onLocationChange,
  placeholder = "Search city, state or region...",
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Dynamic suggestions matching the user's query
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchLocations(query);
  }, [query]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      setIsOpen(true);
      setActiveIndex(0);
    } else {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    if (!item) return;
    const label = item.label;
    if (!selectedLocations.includes(label)) {
      onLocationChange([...selectedLocations, label]);
    }
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemove = (labelToRemove) => {
    onLocationChange(selectedLocations.filter((loc) => loc !== labelToRemove));
  };

  const handleClearInput = () => {
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // Keyboard navigation: ArrowUp, ArrowDown, Enter, Escape
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "ArrowDown" && query.trim()) {
        setIsOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-2 text-left">
      {/* Search Bar Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#677E9E] absolute left-3 top-2.5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim() && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-xs text-white placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F] transition-colors"
        />

        {query && (
          <button
            type="button"
            onClick={handleClearInput}
            className="absolute right-2.5 top-2.5 text-[#677E9E] hover:text-white cursor-pointer transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-[#0F2444] border border-[#1E375C] rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.6)] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
          {suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((item, index) => {
                const isSelected = selectedLocations.includes(item.label);
                const isActive = index === activeIndex;

                // Split label into primary and secondary parts
                let primaryName = item.label;
                let secondaryInfo = "";
                if (item.label.includes(",")) {
                  const parts = item.label.split(",");
                  primaryName = parts[0].trim();
                  secondaryInfo = `, ${parts[1].trim()}`;
                } else if (item.label.includes("(")) {
                  const idx = item.label.indexOf("(");
                  primaryName = item.label.slice(0, idx).trim();
                  secondaryInfo = ` ${item.label.slice(idx).trim()}`;
                }

                return (
                  <li
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#132A4F] text-white border-l-2 border-[#FF5A1F]"
                        : "text-[#A5B5CD] hover:bg-[#132A4F]/60 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <MapPin
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive || isSelected ? "text-[#FF5A1F]" : "text-[#677E9E]"
                        }`}
                      />
                      <div className="truncate">
                        <span className="font-semibold text-white">{primaryName}</span>
                        {secondaryInfo && (
                          <span className="text-[#A5B5CD] text-[11px]">{secondaryInfo}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B1E3B] border border-[#1E375C] text-[#677E9E]">
                        {item.type}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#FF5A1F] stroke-[2.5]" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-3 text-center text-xs text-[#677E9E]">
              No locations matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Selected Location Chips (Directly below input in sidebar) */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedLocations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#132A4F] border border-[#FF5A1F]/40 text-xs text-white font-medium shadow-xs"
            >
              <MapPin className="w-3 h-3 text-[#FF5A1F] shrink-0" />
              <span className="truncate max-w-[170px]">{loc}</span>
              <button
                type="button"
                onClick={() => handleRemove(loc)}
                className="hover:text-red-400 text-[#A5B5CD] cursor-pointer transition-colors ml-0.5"
                title={`Remove ${loc}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
