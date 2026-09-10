"use client";

import React, { useState, useEffect } from "react";
import MdiIcon from "@/components/MdiIcon";

export const INDUSTRY_SECTORS = [
  "Fintech",
  "D2C & E-Commerce",
  "Real Estate",
  "Edtech",
  "FMCG",
  "Healthcare",
  "Automotive",
  "B2B SaaS",
  "Gaming",
];

export const TARGET_AUDIENCES = [
  { id: "genz", label: "Gen-Z & Students", icon: "school-outline" },
  { id: "working_pro", label: "Working Professionals", icon: "briefcase-outline" },
  { id: "hni", label: "Affluent Urban HNI", icon: "crown-outline" },
  { id: "tier2_3", label: "Tier 2/3 Regional Consumers", icon: "map-marker-radius-outline" },
  { id: "parents", label: "Homemakers/Parents", icon: "home-heart" },
];

export const TARGET_CITIES = [
  "Mumbai (MMR)",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Pan-India National Grid",
];

export const CAMPAIGN_OBJECTIVES = [
  {
    id: "awareness",
    title: "Brand Awareness & Reach",
    description: "Maximize mass impressions, visibility & top-of-mind brand recall",
    icon: "bullhorn-outline",
  },
  {
    id: "conversions",
    title: "App Downloads / Digital Conversions",
    description: "Drive trackable app installs, web signups & direct digital sales",
    icon: "cellphone-arrow-down",
  },
  {
    id: "footfall",
    title: "Store Visits & Footfall",
    description: "Drive high-intent physical retail, showroom & experience center visits",
    icon: "store-outline",
  },
  {
    id: "buzz",
    title: "Event / Launch Buzz",
    description: "Build high-impact momentum for flagship product launches & events",
    icon: "rocket-launch-outline",
  },
];

export const BUDGET_PRESETS = [
  { label: "₹50,000", value: 50000 },
  { label: "₹2,00,000", value: 200000 },
  { label: "₹5,00,000", value: 500000 },
  { label: "₹10,00,000", value: 1000000 },
  { label: "Custom INR", value: "custom" },
];

export const FLIGHT_DURATIONS = [
  { label: "1 Week", value: "1 Week", monthsEquivalent: 0.25 },
  { label: "2 Weeks", value: "2 Weeks", monthsEquivalent: 0.5 },
  { label: "1 Month", value: "1 Month", monthsEquivalent: 1.0 },
  { label: "3 Months", value: "3 Months", monthsEquivalent: 3.0 },
];

export default function MediaPlanner({ initialValues = {}, onSubmitPlan, isLoading = false }) {
  // Get minimum lead-time date (tomorrow)
  const getMinStartDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [plannerInputState, setPlannerInputState] = useState({
    industrySector: initialValues.industrySector || "",
    targetAudience: initialValues.targetAudience || ["Working Professionals"],
    targetCities: initialValues.targetCities || ["Mumbai (MMR)", "Bengaluru"],
    campaignObjective: initialValues.campaignObjective || "Brand Awareness & Reach",
    totalBudget: initialValues.totalBudget || 500000,
    startDate: initialValues.startDate || getMinStartDate(),
    flightDuration: initialValues.flightDuration || "1 Month",
    creativeReadiness: initialValues.creativeReadiness || "ready", // 'ready' | 'need_production'
  });

  const [isCustomBudget, setIsCustomBudget] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Sync state changes
  const updateState = (field, value) => {
    setPlannerInputState((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Toggle multi-select items in array
  const toggleArrayItem = (field, item) => {
    setPlannerInputState((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(item);
      const updated = exists ? current.filter((i) => i !== item) : [...current, item];
      return { ...prev, [field]: updated };
    });
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Select all or clear cities
  const handleSelectAllCities = () => {
    if (plannerInputState.targetCities.length === TARGET_CITIES.length) {
      updateState("targetCities", []);
    } else {
      updateState("targetCities", [...TARGET_CITIES]);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!plannerInputState.industrySector) {
      errors.industrySector = "Please select an Industry / Business Sector";
    }
    if (!plannerInputState.targetAudience || plannerInputState.targetAudience.length === 0) {
      errors.targetAudience = "Please select at least one Target Audience Vertical";
    }
    if (!plannerInputState.targetCities || plannerInputState.targetCities.length === 0) {
      errors.targetCities = "Please select at least one Target City / Geography";
    }
    if (!plannerInputState.campaignObjective) {
      errors.campaignObjective = "Please select a Campaign Objective";
    }
    if (!plannerInputState.totalBudget || Number(plannerInputState.totalBudget) < 10000) {
      errors.totalBudget = "Please enter a budget of at least ₹10,000";
    }
    if (!plannerInputState.startDate) {
      errors.startDate = "Please select a Campaign Start Date";
    }
    if (!plannerInputState.flightDuration) {
      errors.flightDuration = "Please select a Flight Duration";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (onSubmitPlan) {
        onSubmitPlan(plannerInputState);
      }
    } else {
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <div className="w-full bg-[#0B1E3B] border border-white/10 rounded-[10px] p-6 md:p-8 backdrop-blur-md shadow-2xl text-left font-sans">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 mb-8 pt-2">
        <h2 className="text-2xl md:text-3xl font-black text-white font-display">
          Configure Campaign Parameters
        </h2>
        <p className="text-xs text-slate-300 mt-1 font-sans">
          Specify your sector, audience, geography, objective, and budget to compute an optimized AI media mix.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* SECTION 1: INDUSTRY & AUDIENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 1. Industry / Business Sector */}
          <div id="field-industrySector" className="space-y-2">
            <label htmlFor="industry-sector-select" className="font-mono text-xs uppercase font-bold tracking-wider mb-2 text-white block">
              1. Industry / Business Sector <span className="text-[#FF5A1F]">*</span>
            </label>
            <div className="relative">
              <select
                id="industry-sector-select"
                value={plannerInputState.industrySector}
                onChange={(e) => updateState("industrySector", e.target.value)}
                className={`w-full rounded-[6px] px-3.5 py-2.5 font-sans text-sm bg-[#132A4F] text-white border ${
                  validationErrors.industrySector ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-white/15 focus:ring-2 focus:ring-[#FF5A1F]"
                } outline-none cursor-pointer transition-all appearance-none pr-10`}
              >
                <option value="" disabled>Select Industry / Business Sector...</option>
                {INDUSTRY_SECTORS.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <MdiIcon name="chevron-down" className="text-lg" />
              </div>
            </div>
            {validationErrors.industrySector && (
              <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
                <MdiIcon name="alert-circle" className="text-xs" /> {validationErrors.industrySector}
              </p>
            )}
          </div>

          {/* 2. Target Audience Vertical (Pill Select) */}
          <div id="field-targetAudience" className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs uppercase font-bold tracking-wider mb-2 text-white block">
                2. Target Audience Vertical <span className="text-[#FF5A1F]">*</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {plannerInputState.targetAudience.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {TARGET_AUDIENCES.map((aud) => {
                const isSelected = plannerInputState.targetAudience.includes(aud.label);
                return (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => toggleArrayItem("targetAudience", aud.label)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#FF5A1F] text-[#0B1E3B] border-[#FF5A1F] shadow-md font-bold"
                        : "bg-[#132A4F] text-slate-200 border-white/10 hover:border-white/30 hover:bg-[#1a3869]"
                    }`}
                  >
                    <MdiIcon name={aud.icon} className="text-xs" />
                    <span>{aud.label}</span>
                    {isSelected && <MdiIcon name="check" className="text-xs" />}
                  </button>
                );
              })}
            </div>
            {validationErrors.targetAudience && (
              <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
                <MdiIcon name="alert-circle" className="text-xs" /> {validationErrors.targetAudience}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 2: TARGET CITY / GEOGRAPHY */}
        <div id="field-targetCities" className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="font-mono text-xs uppercase font-bold tracking-wider mb-1 text-white flex items-center gap-2">
                3. Target City / Geography (Critical Intake Parameter) <span className="text-[#FF5A1F]">*</span>
              </label>
              <p className="text-[11px] text-slate-300 font-sans">
                Select your key target markets for location-aware asset matching.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSelectAllCities}
              className="text-[11px] font-mono text-[#FF5A1F] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            >
              <MdiIcon name="checkbox-multiple-marked-outline" className="text-xs" />
              {plannerInputState.targetCities.length === TARGET_CITIES.length ? "Clear All" : "Select All Markets"}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {TARGET_CITIES.map((city) => {
              const isSelected = plannerInputState.targetCities.includes(city);
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleArrayItem("targetCities", city)}
                  className={`flex items-center justify-between rounded-[6px] px-3.5 py-2.5 text-xs font-sans font-medium transition-all cursor-pointer text-left border ${
                    isSelected
                      ? "bg-[#FF5A1F]/15 border-[#FF5A1F] text-white shadow-sm ring-1 ring-[#FF5A1F]"
                      : "bg-[#132A4F] text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <MdiIcon
                      name={city.includes("Pan-India") ? "earth" : "map-marker-outline"}
                      className={`text-xs ${isSelected ? "text-[#FF5A1F]" : "text-slate-400"}`}
                    />
                    <span className={isSelected ? "font-bold text-white" : ""}>{city}</span>
                  </span>
                  {isSelected && <MdiIcon name="check-circle" className="text-sm text-[#FF5A1F] shrink-0" />}
                </button>
              );
            })}
          </div>
          {validationErrors.targetCities && (
            <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
              <MdiIcon name="alert-circle" className="text-xs" /> {validationErrors.targetCities}
            </p>
          )}
        </div>

        {/* SECTION 3: CAMPAIGN OBJECTIVE */}
        <div id="field-campaignObjective" className="space-y-2 pt-2 border-t border-white/10">
          <label className="font-mono text-xs uppercase font-bold tracking-wider mb-2 text-white block">
            4. Campaign Objective <span className="text-[#FF5A1F]">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CAMPAIGN_OBJECTIVES.map((obj) => {
              const isSelected = plannerInputState.campaignObjective === obj.title;
              return (
                <div
                  key={obj.id}
                  onClick={() => updateState("campaignObjective", obj.title)}
                  className={`rounded-[8px] p-4 cursor-pointer transition-all border flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#163566] border-[#FF5A1F] text-white shadow-lg ring-2 ring-[#FF5A1F]"
                      : "bg-[#132A4F] border-white/10 text-slate-300 hover:border-white/25 hover:bg-[#183563]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`size-8 rounded-md flex items-center justify-center ${
                          isSelected ? "bg-[#FF5A1F] text-[#0B1E3B]" : "bg-[#0B1E3B] text-slate-300"
                        }`}
                      >
                        <MdiIcon name={obj.icon} className="text-lg" />
                      </div>
                      <input
                        type="radio"
                        name="campaignObjective"
                        checked={isSelected}
                        onChange={() => updateState("campaignObjective", obj.title)}
                        className="accent-[#FF5A1F] cursor-pointer h-4 w-4"
                      />
                    </div>
                    <h4 className={`text-sm font-bold font-sans ${isSelected ? "text-white" : "text-slate-100"}`}>
                      {obj.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans leading-snug">
                      {obj.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {validationErrors.campaignObjective && (
            <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
              <MdiIcon name="alert-circle" className="text-xs" /> {validationErrors.campaignObjective}
            </p>
          )}
        </div>

        {/* SECTION 4: BUDGET & DURATION & START DATE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 border-t border-white/10">

          {/* Total Campaign Budget */}
          <div id="field-totalBudget" className="lg:col-span-6 space-y-2">
            <label className="font-mono text-xs uppercase font-bold tracking-wider mb-2 text-white block">
              5. Total Campaign Budget (INR) <span className="text-[#FF5A1F]">*</span>
            </label>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mb-2">
              {BUDGET_PRESETS.map((preset) => {
                const isSelected =
                  preset.value === "custom"
                    ? isCustomBudget
                    : !isCustomBudget && Number(plannerInputState.totalBudget) === preset.value;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      if (preset.value === "custom") {
                        setIsCustomBudget(true);
                      } else {
                        setIsCustomBudget(false);
                        updateState("totalBudget", preset.value);
                      }
                    }}
                    className={`rounded-[6px] px-3 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#FF5A1F] text-[#0B1E3B] border-[#FF5A1F]"
                        : "bg-[#132A4F] text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Input field */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm">
                ₹
              </div>
              <input
                type="number"
                value={plannerInputState.totalBudget}
                onChange={(e) => {
                  setIsCustomBudget(true);
                  updateState("totalBudget", e.target.value);
                }}
                placeholder="e.g. 500000"
                min="10000"
                step="5000"
                className={`w-full rounded-[6px] pl-8 pr-3.5 py-2.5 font-sans text-sm bg-[#132A4F] text-white border ${
                  validationErrors.totalBudget ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-white/15 focus:ring-2 focus:ring-[#FF5A1F]"
                } outline-none transition-all font-semibold`}
              />
            </div>
            {validationErrors.totalBudget && (
              <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
                <MdiIcon name="alert-circle" className="text-xs" /> {validationErrors.totalBudget}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div id="field-startDate" className="lg:col-span-3 space-y-2">
            <label htmlFor="start-date-input" className="font-mono text-xs uppercase font-bold tracking-wider mb-2 text-white block">
              6A. Start Date <span className="text-[#FF5A1F]">*</span>
            </label>
            <input
              id="start-date-input"
              type="date"
              min={getMinStartDate()}
              value={plannerInputState.startDate}
              onChange={(e) => updateState("startDate", e.target.value)}
              className={`w-full rounded-[6px] px-3.5 py-2.5 font-sans text-sm bg-[#132A4F] text-white border ${
                validationErrors.startDate ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-white/15 focus:ring-2 focus:ring-[#FF5A1F]"
              } outline-none transition-all font-medium cursor-pointer`}
            />
            {validationErrors.startDate && (
              <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
                <MdiIcon name="alert-circle" className="text-xs" /> {validationErrors.startDate}
              </p>
            )}
          </div>

          {/* Flight Duration */}
          <div id="field-flightDuration" className="lg:col-span-3 space-y-2">
            <label className="font-mono text-xs uppercase font-bold tracking-wider mb-2 text-white block">
              6B. Flight Duration <span className="text-[#FF5A1F]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {FLIGHT_DURATIONS.map((dur) => {
                const isSelected = plannerInputState.flightDuration === dur.value;
                return (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => updateState("flightDuration", dur.value)}
                    className={`rounded-[6px] py-2 px-2 text-xs font-sans font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#FF5A1F] text-[#0B1E3B] border-[#FF5A1F]"
                        : "bg-[#132A4F] text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {dur.label}
                  </button>
                );
              })}
            </div>
            {validationErrors.flightDuration && (
              <p className="text-xs text-red-400 font-medium mt-1 flex items-center gap-1">
                <MdiIcon name="alert-circle" className="text-xs" /> {validationErrors.flightDuration}
              </p>
            )}
          </div>

        </div>

        {/* SECTION 5: CREATIVE ASSET READINESS */}
        <div id="field-creativeReadiness" className="space-y-2 pt-2 border-t border-white/10">
          <label className="font-mono text-xs uppercase font-bold tracking-wider mb-2 text-white block">
            7. Creative Asset Readiness
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => updateState("creativeReadiness", "ready")}
              className={`rounded-[8px] p-4 cursor-pointer transition-all border flex items-center gap-3 ${
                plannerInputState.creativeReadiness === "ready"
                  ? "bg-[#163566] border-[#FF5A1F] text-white shadow-md ring-1 ring-[#FF5A1F]"
                  : "bg-[#132A4F] border-white/10 text-slate-300 hover:border-white/25"
              }`}
            >
              <div
                className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                  plannerInputState.creativeReadiness === "ready"
                    ? "bg-[#FF5A1F] text-[#0B1E3B]"
                    : "bg-[#0B1E3B] text-slate-400"
                }`}
              >
                <MdiIcon name="file-image-check-outline" className="text-lg" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">I have ready creative assets</h5>
                <p className="text-[11px] text-slate-400 font-sans">Artwork is ready for immediate ad deployment</p>
              </div>
            </div>

            <div
              onClick={() => updateState("creativeReadiness", "need_production")}
              className={`rounded-[8px] p-4 cursor-pointer transition-all border flex items-center gap-3 ${
                plannerInputState.creativeReadiness === "need_production"
                  ? "bg-[#163566] border-[#FF5A1F] text-white shadow-md ring-1 ring-[#FF5A1F]"
                  : "bg-[#132A4F] border-white/10 text-slate-300 hover:border-white/25"
              }`}
            >
              <div
                className={`size-9 rounded-full flex items-center justify-center shrink-0 ${
                  plannerInputState.creativeReadiness === "need_production"
                    ? "bg-[#FF5A1F] text-[#0B1E3B]"
                    : "bg-[#0B1E3B] text-slate-400"
                }`}
              >
                <MdiIcon name="palette-outline" className="text-lg" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-white">I need OTZ Media Production</h5>
                <p className="text-[11px] text-slate-400 font-sans">Request design & artwork production assistance</p>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION TRIGGER & SUBMIT BUTTON */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-sans">
            <span className="text-white font-bold">{plannerInputState.targetCities.length} Markets</span> selected &bull; Budget <span className="text-white font-bold">₹{Number(plannerInputState.totalBudget).toLocaleString("en-IN")}</span> &bull; <span className="text-[#FF5A1F] font-bold">{plannerInputState.flightDuration}</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#FF5A1F] text-[#0B1E3B] font-bold h-[44px] px-6 rounded-[6px] hover:opacity-90 w-full sm:w-auto cursor-pointer border-none flex items-center justify-center gap-2 font-sans text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-[#FF5A1F]/30"
          >
            {isLoading ? (
              <>
                <MdiIcon name="loading" className="text-lg animate-spin" />
                <span>GENERATING AI MEDIA MIX...</span>
              </>
            ) : (
              <>
                <span>GENERATE AI MEDIA MIX</span>
                <MdiIcon name="arrow-right" className="text-lg font-bold" />
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
