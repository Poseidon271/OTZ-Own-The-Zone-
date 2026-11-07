"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  MapPin,
  BookOpen,
  Layers,
  Tag,
  LayoutGrid,
  Languages,
  Clock,
  Users2,
} from "lucide-react";
import OtzCheckbox from "./OtzCheckbox";
import FilterOptionsModal from "./FilterOptionsModal";
import LocationAutocomplete from "./LocationAutocomplete";

export const MAGAZINE_FILTER_DEFINITIONS = {
  editionTypes: [
    "Main Magazine",
    "Special Supplement",
    "Both",
  ],
  categories: [
    "Lifestyle",
    "Business",
    "News",
    "General Interest",
    "Fashion",
    "Entertainment",
    "Technology",
    "Travel",
    "Healthcare and Medical Journals",
    "Sports",
    "Education",
  ],
  adOptions: [
    "Full Page",
    "Cover Page",
    "Double Spread",
    "Half Page",
    "Back Cover",
    "Inside Front Cover",
    "Inside Back Cover",
    "Advertorial",
  ],
  languages: [
    "English",
    "Hindi",
    "Malayalam",
    "Tamil",
    "Telugu",
    "Bengali",
    "Marathi",
    "Gujarati",
    "Kannada",
    "Punjabi",
  ],
  frequencies: [
    "Monthly",
    "Fortnightly",
    "Weekly",
    "Bi-Monthly",
    "Quarterly",
    "Annual",
  ],
  targetGroups: [
    "Affluent Consumers",
    "High Net Worth Individuals",
    "Professionals",
    "C-Suite",
    "Corporate Executives",
    "Women 25-45",
    "Men 25-45",
    "Youth",
    "Automobile Enthusiasts",
    "Medical Professionals",
    "Hospital Administrators",
    "Luxury Shoppers",
    "Students & Aspirants",
  ],
};

function matchesLocation(item, loc) {
  if (!loc) return true;
  const l = loc.toLowerCase();
  const city = item.location?.city?.toLowerCase() || "";
  const state = item.location?.state?.toLowerCase() || "";
  const region = item.location?.region?.toLowerCase() || "";
  const fullLoc = typeof item.location === "string" ? item.location.toLowerCase() : "";
  return (
    city === l ||
    state === l ||
    region === l ||
    city.includes(l) ||
    state.includes(l) ||
    region.includes(l) ||
    fullLoc.includes(l)
  );
}

export default function MagazineFilterSidebar({
  filters,
  onFilterChange,
  onClearAll,
  allMagazines = [],
  activeFilterCount = 0,
}) {
  const [collapsedSections, setCollapsedSections] = useState({
    location: false,
    category: false,
    adOptions: false,
    languages: false,
    frequency: false,
    targetGroup: false,
    publication: false,
    editionType: false,
  });

  // Dynamically extract actual magazine publication names from inventory
  const publicationOptions = useMemo(() => {
    const set = new Set();
    allMagazines.forEach((m) => {
      const p = m.publication || m.name;
      if (p) set.add(p);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allMagazines]);

  // Modal state for "X More" popup
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    groupKey: "",
    groupTitle: "",
    options: [],
    counts: {},
    selectedValues: [],
  });

  const openModal = (groupKey, groupTitle, options, optionCounts) => {
    setModalConfig({
      isOpen: true,
      groupKey,
      groupTitle,
      options,
      counts: optionCounts || {},
      selectedValues: filters[groupKey] || [],
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalApply = (groupKey, newSelections) => {
    onFilterChange(groupKey, newSelections);
  };

  const toggleSection = (sectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const handleToggle = (key, value) => {
    const current = filters[key] || [];
    const exists = current.includes(value);
    const updated = exists
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFilterChange(key, updated);
  };

  // Dynamic counts derived from actual magazine inventory
  const counts = useMemo(() => {
    const c = {
      publications: {},
      editionTypes: {},
      categories: {},
      adOptions: {},
      languages: {},
      frequencies: {},
      targetGroups: {},
    };

    publicationOptions.forEach((pub) => {
      c.publications[pub] = allMagazines.filter((mag) => {
        const p = (mag.publication || "").toLowerCase();
        const n = (mag.name || "").toLowerCase();
        const target = pub.toLowerCase();
        return p === target || n === target || n.startsWith(target) || target.startsWith(n);
      }).length;
    });

    c.editionTypes = {
      "Main Magazine": allMagazines.filter(
        (m) => (m.editionType || "Main Magazine") === "Main Magazine"
      ).length,
      "Special Supplement": allMagazines.filter(
        (m) => m.editionType === "Special Supplement"
      ).length,
      Both: allMagazines.length,
    };

    allMagazines.forEach((mag) => {
      if (mag.category) {
        c.categories[mag.category] = (c.categories[mag.category] || 0) + 1;
      }
      mag.adOptions?.forEach((opt) => {
        c.adOptions[opt] = (c.adOptions[opt] || 0) + 1;
      });
      mag.languages?.forEach((lang) => {
        c.languages[lang] = (c.languages[lang] || 0) + 1;
      });
      if (mag.frequency) {
        c.frequencies[mag.frequency] = (c.frequencies[mag.frequency] || 0) + 1;
      }
      mag.targetGroups?.forEach((tg) => {
        c.targetGroups[tg] = (c.targetGroups[tg] || 0) + 1;
      });
    });

    return c;
  }, [allMagazines, publicationOptions]);

  const renderFilterGroup = (
    groupKey,
    title,
    Icon,
    options,
    optionCounts,
    previewCount = 4
  ) => {
    const isCollapsed = collapsedSections[groupKey];
    const visibleOptions = options.slice(0, previewCount);
    const remainingCount = options.length - previewCount;
    const selectedList = filters[groupKey] || [];

    return (
      <div className="border-b border-[#1E375C] py-3.5 space-y-2 text-left">
        <button
          type="button"
          onClick={() => toggleSection(groupKey)}
          className="flex w-full items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Icon className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span>{title}</span>
            {selectedList.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold">
                {selectedList.length}
              </span>
            )}
          </span>
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4 text-[#A5B5CD]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[#A5B5CD]" />
          )}
        </button>

        {!isCollapsed && (
          <div className="space-y-2 pt-1">
            {visibleOptions.map((opt) => {
              const count = optionCounts[opt] || 0;
              const isChecked = selectedList.includes(opt);
              return (
                <OtzCheckbox
                  key={opt}
                  label={opt}
                  count={count}
                  checked={isChecked}
                  onChange={() => handleToggle(groupKey, opt)}
                />
              );
            })}

            {remainingCount > 0 && (
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => openModal(groupKey, title, options, optionCounts)}
                  className="text-xs font-semibold text-[#FF5A1F] hover:text-[#E64E15] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>{remainingCount} More</span>
                  <span className="text-[10px]">&rarr;</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className="w-full bg-[#0F2444] rounded-xl border border-[#1E375C] p-4 text-left shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-1">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E375C]">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Filters
            </h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF5A1F] text-white">
                {activeFilterCount}
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-[#A5B5CD] hover:text-white transition-colors cursor-pointer font-medium flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-[#FF5A1F]" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* 1. LOCATION (Searchable Autocomplete) */}
        <div className="border-b border-[#1E375C] py-3.5 space-y-2 text-left">
          <button
            type="button"
            onClick={() => toggleSection("location")}
            className="flex w-full items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white hover:text-[#FF5A1F] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span>Location</span>
              {(filters.locations?.length || 0) > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#FF5A1F] text-white text-[10px] font-bold">
                  {filters.locations.length}
                </span>
              )}
            </span>
            {collapsedSections.location ? (
              <ChevronDown className="w-4 h-4 text-[#A5B5CD]" />
            ) : (
              <ChevronUp className="w-4 h-4 text-[#A5B5CD]" />
            )}
          </button>

          {!collapsedSections.location && (
            <div className="pt-1">
              <LocationAutocomplete
                selectedLocations={filters.locations || []}
                onLocationChange={(newLocations) =>
                  onFilterChange("locations", newLocations)
                }
                placeholder="Search city, state or region..."
              />
            </div>
          )}
        </div>

        {/* 2. CATEGORY */}
        {renderFilterGroup(
          "categories",
          "Category",
          Tag,
          MAGAZINE_FILTER_DEFINITIONS.categories,
          counts.categories,
          4
        )}

        {/* 3. AD OPTIONS */}
        {renderFilterGroup(
          "adOptions",
          "Ad Options",
          LayoutGrid,
          MAGAZINE_FILTER_DEFINITIONS.adOptions,
          counts.adOptions,
          4
        )}

        {/* 4. LANGUAGES */}
        {renderFilterGroup(
          "languages",
          "Languages",
          Languages,
          MAGAZINE_FILTER_DEFINITIONS.languages,
          counts.languages,
          4
        )}

        {/* 5. FREQUENCY */}
        {renderFilterGroup(
          "frequencies",
          "Frequency",
          Clock,
          MAGAZINE_FILTER_DEFINITIONS.frequencies,
          counts.frequencies,
          4
        )}

        {/* 6. TARGET GROUP */}
        {renderFilterGroup(
          "targetGroups",
          "Target Group",
          Users2,
          MAGAZINE_FILTER_DEFINITIONS.targetGroups,
          counts.targetGroups,
          4
        )}

        {/* 7. PUBLICATION */}
        {renderFilterGroup(
          "publications",
          "Publication",
          BookOpen,
          publicationOptions,
          counts.publications,
          4
        )}

        {/* 8. MAIN / SUPPLEMENT */}
        {renderFilterGroup(
          "editionTypes",
          "Main / Supplement",
          Layers,
          MAGAZINE_FILTER_DEFINITIONS.editionTypes,
          counts.editionTypes,
          4
        )}
      </aside>

      {/* 4-Column Option Selection Modal */}
      <FilterOptionsModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.groupTitle}
        options={modalConfig.options}
        optionCounts={modalConfig.counts}
        selectedValues={modalConfig.selectedValues}
        onApply={(newSelections) =>
          handleModalApply(modalConfig.groupKey, newSelections)
        }
      />
    </>
  );
}
