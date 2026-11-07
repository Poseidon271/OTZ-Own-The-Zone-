"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Search, Check } from "lucide-react";
import OtzCheckbox from "./OtzCheckbox";

export default function FilterOptionsModal({
  isOpen,
  onClose,
  groupKey,
  groupTitle,
  title,
  options = [],
  counts = {},
  optionCounts = {},
  selectedValues = [],
  onApply,
}) {
  const [draftSelected, setDraftSelected] = useState(selectedValues || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync draft selections when modal opens without cascading effect renders
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setDraftSelected(selectedValues || []);
      setSearchQuery("");
    }
  }

  const activeTitle = title || groupTitle || "Category";
  const activeCounts = counts && Object.keys(counts).length > 0 ? counts : (optionCounts || {});

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  if (!isOpen) return null;

  const handleToggle = (option) => {
    setDraftSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleClearAll = () => {
    setDraftSelected([]);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(draftSelected, groupKey);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in text-left"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[88vh] bg-[#0F2444] border border-[#1E375C] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#1E375C] bg-[#0B1E3B]/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 flex-1">
            {/* Search Input at Top-Left */}
            <div className="relative w-full max-w-xs sm:w-72">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#677E9E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTitle}...`}
                className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#132A4F] border border-[#1E375C] text-xs text-white placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F] transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-[#677E9E] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {draftSelected.length > 0 && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5A1F] text-white">
                {draftSelected.length} Selected
              </span>
            )}
          </div>

          {/* Close Button at Top-Right */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#132A4F] text-[#A5B5CD] hover:text-white border border-[#1E375C] flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY (Multi-Column Grid) */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
          {filteredOptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
              {filteredOptions.map((opt) => (
                <OtzCheckbox
                  key={opt}
                  id={`modal-${groupKey}-${opt}`}
                  checked={draftSelected.includes(opt)}
                  onChange={() => handleToggle(opt)}
                  label={opt}
                  count={activeCounts[opt] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#677E9E]">
              No options found matching &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-[#1E375C] bg-[#0B1E3B]/90 flex items-center justify-end gap-5 shrink-0">
          <button
            type="button"
            onClick={handleClearAll}
            disabled={draftSelected.length === 0}
            className={`text-xs font-semibold transition-colors cursor-pointer ${
              draftSelected.length > 0
                ? "text-[#A5B5CD] hover:text-[#FF5A1F]"
                : "text-[#677E9E]/50 cursor-not-allowed"
            }`}
          >
            Clear All
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Apply {draftSelected.length > 0 ? `(${draftSelected.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

