"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ColumnLines } from "@/components/scrollx/column-lines";
import { useBag } from "@/context/BagContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ExternalLink,
  MapPin,
  Users,
  Send,
  CheckCircle,
  X,
  Layers,
  Sparkles,
  Building2,
  Calendar,
  AlertCircle
} from "lucide-react";

// Robust Indian Currency Formatter with fallback
function formatIndianCurrency(num) {
  if (num === null || num === undefined || isNaN(Number(num)) || Number(num) <= 0) {
    return "Price on Request";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(num));
}

export default function CartPage() {
  const router = useRouter();
  const { bag, isMounted, removeFromBag, clearBag } = useBag();
  const { user } = useAuth();

  // Enquiry modal state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [enquiryReferenceId, setEnquiryReferenceId] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    timeline: "Immediate (Next 7-14 Days)",
    notes: "",
  });

  // Pre-fill user data when modal opens if user is logged in
  const handleOpenEnquiryModal = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: user?.company || "",
      timeline: "Immediate (Next 7-14 Days)",
      notes: "",
    });
    setSubmitError("");
    setSubmitSuccess(false);
    setIsEnquiryModalOpen(true);
  };

  // Calculations
  const totalItems = bag.length;
  const newspaperCount = bag.filter((item) => {
    const type = (item.mediaType || item.subCategory || "").toLowerCase();
    return type.includes("newspaper");
  }).length;
  const magazineCount = bag.filter((item) => {
    const type = (item.mediaType || item.subCategory || "").toLowerCase();
    return type.includes("magazine");
  }).length;

  const validPriceItems = bag.filter(
    (item) => typeof item.price === "number" && item.price > 0
  );
  const totalEstimatedSpend = validPriceItems.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const hasValidPrice = validPriceItems.length > 0;

  // Handle Enquiry Submission
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setSubmitError("Please fill in your name, email, and phone number.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const itemsListFormatted = bag
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.name || item.title} [${
              item.mediaType || item.subCategory || "Print"
            }] - Placement: ${item.specs || "Standard"} - Est. Spend: ${
              typeof item.price === "number" && item.price > 0
                ? formatIndianCurrency(item.price)
                : "Price on Request"
            }`
        )
        .join("\n");

      const messageContent = `Print Advertising Cart Enquiry for ${bag.length} Publication(s):\n\n${itemsListFormatted}\n\nClient Campaign Brief & Notes:\n${
        formData.notes.trim() || "No additional notes provided."
      }`;

      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "marketplace_cart",
          source: "marketplace_cart",
          referenced_listing_id: bag.map((i) => i.id).join(", "),
          listing_title: `${bag.length} Print Media Opportunities (${bag
            .map((i) => i.name || i.title)
            .slice(0, 3)
            .join(", ")}${bag.length > 3 ? "..." : ""})`,
          message: messageContent,
          budget_band: hasValidPrice
            ? formatIndianCurrency(totalEstimatedSpend)
            : "Price on Request",
          timeline: formData.timeline,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim() || "Independent Advertiser",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      setEnquiryReferenceId(data.enquiryId || "OTZ-ENQ");
      setSubmitSuccess(true);
      // Clear cart only AFTER successful submission
      clearBag();
    } catch (err) {
      console.error("Cart enquiry submission error:", err);
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="theme-dark min-h-screen relative flex flex-col text-[var(--text-primary)] font-sans antialiased overflow-x-hidden"
      style={{ backgroundColor: "var(--surface-canvas)" }}
    >
      {/* Subtle Architectural Column Grid Texture */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.035}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Atmospheric Midnight Lighting */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(19, 42, 79, 0.5) 0%, transparent 55%)",
        }}
      />

      {/* Global Shared Navbar */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* Main Cart Content */}
      <main className="relative z-10 flex-grow pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-left">
        {/* Page Heading Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F] mb-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>Campaign Media Cart</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
            Your Media Cart
          </h1>
          <p className="text-sm text-[#A5B5CD] mt-2 max-w-2xl">
            Review your selected advertising opportunities before sending an enquiry.
          </p>
        </div>

        {/* Content State: Hydrated check & Empty vs Populated */}
        {!isMounted ? (
          // Lightweight skeleton while hydrating
          <div className="py-20 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#1E375C] border-t-[#FF5A1F] animate-spin" />
          </div>
        ) : totalItems === 0 ? (
          // Empty Cart State
          <div className="p-12 sm:p-16 rounded-2xl bg-[#0F2444] border border-[#1E375C] text-center max-w-2xl mx-auto shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-5 my-8">
            <div className="w-16 h-16 rounded-full bg-[#132A4F] border border-[#1E375C] text-[#FF5A1F] flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
                Your media cart is empty.
              </h2>
              <p className="text-xs sm:text-sm text-[#A5B5CD] max-w-md mx-auto leading-relaxed">
                Browse our curated print inventory across premier newspapers and magazines to plan your next high-impact campaign.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/marketplace")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Populated Cart Layout (Responsive 2-Column: 8 Cols Cart Items + 4 Cols Sticky Summary)
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E375C]">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A5B5CD]">
                  Selected Publications ({totalItems})
                </span>
                <button
                  type="button"
                  onClick={clearBag}
                  className="text-xs text-[#A5B5CD] hover:text-red-400 transition-colors font-medium cursor-pointer"
                >
                  Clear Cart
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {bag.map((item, index) => {
                  const isNewspaper = (
                    item.mediaType ||
                    item.subCategory ||
                    ""
                  )
                    .toLowerCase()
                    .includes("newspaper");

                  const detailHref = isNewspaper
                    ? `/marketplace/newspaper/${item.id}`
                    : `/marketplace/magazine/${item.id}`;

                  return (
                    <article
                      key={`${item.id}-${item.specs || index}`}
                      className="p-5 sm:p-6 rounded-xl bg-[#0F2444] border border-[#1E375C] hover:border-[#FF5A1F]/60 shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition-all duration-200 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between text-left"
                    >
                      {/* Thumbnail & Identity */}
                      <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                        {/* Publication Image / Logo */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-[#0B1E3B] border border-[#1E375C] overflow-hidden shrink-0 flex items-center justify-center p-1">
                          <img
                            src={item.image || item.logo || "/placeholder.png"}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0B1E3B] text-[#FF5A1F] border border-[#1E375C]">
                              {isNewspaper ? "Newspaper" : "Magazine"}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#132A4F] text-[#A5B5CD] border border-[#1E375C]">
                              {item.category || "General Interest"}
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-white font-display truncate">
                            {item.name || item.title}
                          </h3>

                          {/* Placement Specs */}
                          <div className="text-xs text-[#A5B5CD] flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#677E9E]" />
                            <span className="text-white font-medium">Placement:</span>
                            <span className="text-[#A5B5CD] truncate">
                              {item.specs || "Standard Placement"}
                            </span>
                          </div>

                          {/* Micro Metrics */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#A5B5CD] pt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#677E9E]" />
                              {item.location || "National"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#677E9E]" />
                              {item.reach || "Verified Readership"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing, Actions & Removal */}
                      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[#1E375C] pt-3 sm:pt-0 gap-3 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#677E9E] block">
                            Starting Rate
                          </span>
                          <span className="text-base sm:text-lg font-black text-[#FF5A1F] font-display block">
                            {formatIndianCurrency(item.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={detailHref}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#132A4F] hover:bg-[#1a3869] text-white border border-[#1E375C] hover:border-[#FF5A1F]/50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3 text-[#A5B5CD]" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => removeFromBag(item.id, item.specs)}
                            className="p-1.5 rounded-lg border border-[#1E375C] bg-[#132A4F] hover:bg-red-500/10 hover:border-red-500/50 text-[#A5B5CD] hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove from Media Cart"
                            aria-label={`Remove ${item.name || item.title} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Sticky Summary Panel Column (4 Cols) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 text-left">
              <div className="p-6 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-5">
                <div className="border-b border-[#1E375C] pb-3">
                  <h2 className="text-base font-bold text-white font-display">
                    Media Plan Summary
                  </h2>
                  <p className="text-xs text-[#A5B5CD] mt-0.5">
                    Consolidated advertising inventory
                  </p>
                </div>

                {/* Summary Metrics */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[#A5B5CD]">
                    <span>Selected Publications</span>
                    <span className="font-bold text-white font-mono">{totalItems}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#A5B5CD]">
                    <span>Newspapers</span>
                    <span className="font-semibold text-white font-mono">{newspaperCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#A5B5CD]">
                    <span>Magazines</span>
                    <span className="font-semibold text-white font-mono">{magazineCount}</span>
                  </div>

                  <div className="pt-3 border-t border-[#1E375C]">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs uppercase font-bold text-[#A5B5CD]">
                        Estimated Starting Spend
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-[#FF5A1F] font-display">
                        {hasValidPrice
                          ? formatIndianCurrency(totalEstimatedSpend)
                          : "Price on Request"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#677E9E] mt-1.5 leading-snug italic">
                      *Estimated spend based on available publisher base rate cards. Final quote reflects exact edition dates, ad sizing, and volume discounts.
                    </p>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleOpenEnquiryModal}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enquire About Selected Media</span>
                  </button>
                </div>

                {/* Reassurance Features */}
                <div className="pt-3 border-t border-[#1E375C] space-y-2 text-[11px] text-[#A5B5CD]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Direct publisher allocation & verified tear-sheets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Guaranteed response within 24 business hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Dedicated media planner assigned to campaign</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Enquiry Modal */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto no-print">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0B1E3B]/80 backdrop-blur-md transition-opacity"
            onClick={() => !isSubmitting && setIsEnquiryModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div
              className="relative w-full max-w-2xl rounded-2xl bg-[#0F2444] border border-[#1E375C] shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 text-left z-10 animate-scale-up"
            >
              {/* Modal Close Button */}
              <button
                type="button"
                onClick={() => !isSubmitting && setIsEnquiryModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg border border-[#1E375C] bg-[#132A4F] text-[#A5B5CD] hover:text-white transition-colors cursor-pointer"
                aria-label="Close Enquiry Modal"
              >
                <X className="w-4 h-4" />
              </button>

              {submitSuccess ? (
                // Success Confirmation State
                <div className="text-center py-6 space-y-5 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                      Enquiry Reference: #{enquiryReferenceId}
                    </span>
                    <h3 className="text-2xl font-bold text-white font-display">
                      Enquiry Successfully Submitted!
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A5B5CD] max-w-md mx-auto leading-relaxed">
                      Thank you! Our print media planning team has received your request and will contact you at{" "}
                      <strong className="text-white">{formData.email}</strong> with guaranteed availability and formal quotations within 24 hours.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEnquiryModalOpen(false);
                        router.push("/marketplace");
                      }}
                      className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Explore More Media
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEnquiryModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl bg-[#132A4F] hover:bg-[#1a3869] text-white border border-[#1E375C] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                // Enquiry Form
                <form onSubmit={handleEnquirySubmit} className="space-y-5">
                  <div className="border-b border-[#1E375C] pb-4">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F]">
                      <Send className="w-3.5 h-3.5" />
                      <span>Campaign Media Enquiry</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
                      Enquire About Selected Media
                    </h2>
                    <p className="text-xs text-[#A5B5CD] mt-1">
                      Request custom quotes, issue availability, and package discounts for your selected publications.
                    </p>
                  </div>

                  {/* Summary of Selected Publications */}
                  <div className="p-3.5 rounded-xl bg-[#0B1E3B] border border-[#1E375C] max-h-36 overflow-y-auto space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#677E9E] uppercase font-semibold">
                      <span>Publications in Enquiry ({bag.length})</span>
                      <span>
                        Est:{" "}
                        {hasValidPrice
                          ? formatIndianCurrency(totalEstimatedSpend)
                          : "Price on Request"}
                      </span>
                    </div>
                    <ul className="divide-y divide-[#1E375C]/60 text-xs">
                      {bag.map((i, idx) => (
                        <li
                          key={idx}
                          className="py-1.5 flex items-center justify-between text-white"
                        >
                          <span className="truncate pr-2">
                            {i.name || i.title}{" "}
                            <span className="text-[#A5B5CD] text-[11px]">
                              ({i.specs || "Standard"})
                            </span>
                          </span>
                          <span className="text-[#FF5A1F] font-mono font-semibold shrink-0">
                            {formatIndianCurrency(i.price)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5B5CD] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5B5CD] mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="e.g. rahul@brand.com"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5B5CD] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="e.g. +91 98765 43210"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5B5CD] mb-1">
                        Company / Brand
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5B5CD] mb-1">
                      Campaign Target Timeline
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) =>
                        setFormData({ ...formData, timeline: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
                    >
                      <option value="Immediate (Next 7-14 Days)">
                        Immediate (Next 7-14 Days)
                      </option>
                      <option value="Within 1 Month">Within 1 Month</option>
                      <option value="Next Quarter / Long Term">Next Quarter / Long Term</option>
                      <option value="Flexible / Exploring Rates">
                        Flexible / Exploring Rates
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#A5B5CD] mb-1">
                      Campaign Requirements &amp; Notes
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Specify preferred editions, ad creative sizes (e.g. Front Page Jack, Quarter Page), or special placement instructions..."
                      className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs placeholder-[#677E9E] focus:outline-none focus:border-[#FF5A1F] resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-[#1E375C]">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsEnquiryModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#1E375C] text-xs font-semibold text-[#A5B5CD] hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Official Enquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OTZ Midnight Zone Footer */}
      <footer className="relative z-10 border-t border-[#1E375C] bg-[#0B1E3B]/90 backdrop-blur-xs text-[#A5B5CD] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-[#FF5A1F]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="10"
                y="10"
                width="80"
                height="80"
                rx="14"
                stroke="currentColor"
                strokeWidth="6"
              />
              <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="6" />
            </svg>
            <span className="font-display font-black tracking-widest text-white uppercase">
              OTZ &bull; Own The Zone
            </span>
          </div>
          <p className="text-[#677E9E]">
            &copy; {new Date().getFullYear()} OTZ Media Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

