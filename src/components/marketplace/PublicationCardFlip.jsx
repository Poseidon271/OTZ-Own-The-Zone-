"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBag } from "@/context/BagContext";
import {
  CardFlip,
  CardFlipFront,
  CardFlipBack,
  CardFlipHeader,
  CardFlipFooter,
  CardFlipTitle,
  CardFlipDescription,
  CardFlipContent,
  CardFlipAction,
} from "@/components/ui/card-flip";
import {
  Users,
  MapPin,
  Globe,
  ShoppingBag,
  Check,
  ArrowRight,
  Calendar,
  Info,
} from "lucide-react";
import NewspaperEnquiryModal from "./NewspaperEnquiryModal";
import MagazineEnquiryModal from "./MagazineEnquiryModal";

function formatIndianCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "Price on Request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatAudienceReach(count) {
  if (count === undefined || count === null || isNaN(count)) return "0";
  return new Intl.NumberFormat("en-IN").format(count);
}

export default function PublicationCardFlip({ publication, type = "newspaper" }) {
  const router = useRouter();
  const { addToBag, removeFromBag, isInBag } = useBag();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const isNewspaper = type === "newspaper";
  const item = publication;
  const inBag = isInBag(item.id);

  const locationText =
    typeof item.location === "object"
      ? `${item.location.city}${
          item.location.region
            ? ` • ${item.location.region}`
            : item.location.state
            ? ` • ${item.location.state}`
            : ""
        }`
      : item.location || "National";

  const detailHref = isNewspaper
    ? `/marketplace/newspaper/${item.id}`
    : `/marketplace/magazine/${item.id}`;

  const handleBagToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inBag) {
      removeFromBag(item.id);
    } else {
      addToBag({
        id: item.id,
        name: item.name,
        title: `${item.name} ${isNewspaper ? "Newspaper" : "Magazine"} Advertising`,
        price: item.minimumSpend,
        dailyRate: item.minimumSpend,
        duration: 1,
        reach: `${formatAudienceReach(item.audienceReach)} ${
          isNewspaper ? "Daily Readers" : "Readers"
        }`,
        location: locationText,
        image: item.coverImage || item.logo,
        logo: item.logo,
        category: item.category || (isNewspaper ? "National Daily" : "General Interest"),
        subCategory: isNewspaper ? "Newspaper" : "Magazine",
        mediaType: isNewspaper ? "Newspaper" : "Magazine",
        channelDomain: "Print Media",
        specs:
          item.adOptions?.[0] ||
          (isNewspaper ? "Front Page Broadsheet" : "Full Page Placement"),
        frequency: item.frequency || (isNewspaper ? "Daily" : "Monthly"),
        languages: item.languages || [],
      });
    }
  };

  const handleEnquiryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEnquiryOpen(true);
  };

  return (
    <>
      <CardFlip className="h-[520px] w-full text-left">
        {/* ================= CARD FRONT ================= */}
        <CardFlipFront className="bg-[#0F2444] rounded-xl border border-[#1E375C] hover:border-[#FF5A1F] shadow-[0_4px_24px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between overflow-hidden text-left h-[520px]">
          {/* Top Image & Featured Badges */}
          <div className="relative h-44 w-full overflow-hidden bg-[#0B1E3B] border-b border-[#1E375C] shrink-0">
            <img
              src={item.coverImage || item.logo}
              alt={item.name}
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
            />

            <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0B1E3B] text-white border border-[#1E375C] shadow-xs">
                {item.category}
              </span>
              {item.topSearched && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FF5A1F] text-white shadow-xs">
                  Featured
                </span>
              )}
            </div>

            {/* Top-Right Info Icon (Single Flip Trigger to Back) */}
            <div className="absolute top-3 right-3 z-10">
              <CardFlipAction
                className="w-8 h-8 rounded-full bg-[#0B1E3B]/90 backdrop-blur-xs text-[#FF5A1F] hover:text-white hover:bg-[#FF5A1F] border border-[#1E375C] hover:border-[#FF5A1F] transition-all shadow-md flex items-center justify-center cursor-pointer"
                title="View more information"
                aria-label="View more information"
              >
                <Info className="w-4 h-4" />
              </CardFlipAction>
            </div>
          </div>

          {/* Front Body */}
          <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
            {/* Header: Name + Logo */}
            <CardFlipHeader className="p-0">
              <div className="min-w-0 flex-1 pr-2">
                <CardFlipTitle className="truncate">
                  {item.name}
                </CardFlipTitle>
                <CardFlipDescription className="flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-[#677E9E] shrink-0" />
                  <span>{item.frequency} Edition</span>
                </CardFlipDescription>
              </div>

              <div className="w-9 h-9 rounded-md bg-[#0B1E3B] border border-[#1E375C] p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={item.logo}
                  alt={`${item.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            </CardFlipHeader>

            {/* Front Metrics Box */}
            <CardFlipContent className="p-0 space-y-3">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#132A4F] border border-[#1E375C] text-xs">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#677E9E] uppercase tracking-wider block">
                    {isNewspaper ? "Audited Readership" : "Audience Reach"}
                  </span>
                  <span className="font-bold text-white mt-0.5 block">
                    {formatAudienceReach(item.audienceReach)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#677E9E] uppercase tracking-wider block">
                    Starting Spend
                  </span>
                  <span className="font-extrabold text-[#FF5A1F] mt-0.5 block">
                    {formatIndianCurrency(item.minimumSpend)}
                  </span>
                </div>
              </div>

              {/* Location & Languages */}
              <div className="space-y-1.5 text-xs text-[#A5B5CD]">
                <div className="flex items-center justify-between">
                  <span className="text-[#677E9E] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF5A1F] shrink-0" /> Location:
                  </span>
                  <span className="font-medium text-white truncate max-w-[170px]">
                    {locationText}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#677E9E] flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[#677E9E] shrink-0" /> Languages:
                  </span>
                  <span className="font-medium text-white truncate max-w-[170px]">
                    {item.languages?.join(", ")}
                  </span>
                </div>
              </div>
            </CardFlipContent>

            {/* Front Footer Actions */}
            <CardFlipFooter className="p-0 pt-3 border-t border-[#1E375C] flex items-center gap-2">
              <button
                type="button"
                onClick={handleBagToggle}
                title={inBag ? "Remove from Media Cart" : "Add to Media Cart"}
                className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                  inBag
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                    : "bg-[#132A4F] border-[#1E375C] text-[#A5B5CD] hover:text-white hover:border-[#FF5A1F]"
                }`}
                aria-label={inBag ? "Remove from Media Cart" : "Add to Media Cart"}
              >
                {inBag ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleEnquiryClick}
                className="py-2 px-3 rounded-lg bg-[#132A4F] hover:bg-[#1a3869] text-white border border-[#1E375C] hover:border-[#FF5A1F]/50 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                Enquire
              </button>

              <Link
                href={detailHref}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-bold tracking-wide transition-colors shadow-sm"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardFlipFooter>
          </div>
        </CardFlipFront>

        {/* ================= CARD BACK ================= */}
        <CardFlipBack className="bg-[#0B1E3B] rounded-xl border border-[#1E375C] hover:border-[#FF5A1F] shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-left h-[520px] p-5 flex flex-col justify-between overflow-hidden">
          {/* Main Back Content Container - Zero Scrollbar, Perfectly Sized */}
          <div className="flex-1 flex flex-col justify-between">
            {/* Header: Badges, Publication Name + Top-Right Return Info Icon */}
            <div className="border-b border-[#1E375C] pb-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#132A4F] text-[#FF5A1F] border border-[#1E375C]">
                      {isNewspaper ? "Newspaper" : "Magazine"}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-[#132A4F] text-[#A5B5CD]">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold text-white truncate">
                    {item.name}
                  </h3>
                </div>

                {/* Top-Right Info Icon (Single Flip Trigger back to Front) */}
                <CardFlipAction
                  className="w-8 h-8 rounded-full bg-[#132A4F] text-[#FF5A1F] hover:text-white hover:bg-[#FF5A1F] border border-[#1E375C] hover:border-[#FF5A1F] transition-all shadow-sm flex items-center justify-center cursor-pointer shrink-0"
                  title="Return to front"
                  aria-label="Return to front"
                >
                  <Info className="w-4 h-4" />
                </CardFlipAction>
              </div>
            </div>

            {/* Short Concise Description (2 Lines) */}
            <div className="py-2">
              <p className="text-xs text-[#A5B5CD] leading-relaxed line-clamp-2">
                {item.description || item.tagline}
              </p>
            </div>

            {/* Compact Specifications Box */}
            <div className="p-3 rounded-lg bg-[#0F2444] border border-[#1E375C] space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#677E9E] shrink-0 font-medium">
                  {isNewspaper ? "Edition:" : "Frequency:"}
                </span>
                <span className="text-white font-semibold text-right truncate">
                  {item.frequency} Edition
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#677E9E] shrink-0 font-medium">
                  {isNewspaper ? "Coverage:" : "Target Audience:"}
                </span>
                <span className="text-white font-semibold text-right truncate max-w-[170px]">
                  {isNewspaper
                    ? locationText
                    : item.targetGroups?.[0] || "Affluent Consumers"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[#677E9E] shrink-0 font-medium">Languages:</span>
                <span className="text-white font-semibold text-right truncate max-w-[170px]">
                  {item.languages?.join(", ")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-[#1E375C]/60 pt-1.5">
                <span className="text-[#677E9E] shrink-0 font-medium">
                  {isNewspaper ? "Daily Readership:" : "Audience Reach:"}
                </span>
                <span className="text-white font-bold text-right font-mono">
                  {formatAudienceReach(item.audienceReach)} readers
                </span>
              </div>
            </div>

            {/* Available Placements */}
            <div className="py-2 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#677E9E] block">
                Available Placements
              </span>
              <div className="flex flex-wrap gap-1">
                {(item.adOptions?.slice(0, 3) || ["Front Page", "Full Page", "Quarter Page"]).map(
                  (opt, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#132A4F] text-[#A5B5CD] border border-[#1E375C]"
                    >
                      {opt}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Starting Rate Card Highlight */}
            <div className="px-3 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#677E9E]">
                Starting Rate Card
              </span>
              <span className="text-base font-black text-[#FF5A1F] font-display">
                {formatIndianCurrency(item.minimumSpend)}
              </span>
            </div>
          </div>

          {/* Back Footer Actions: Add to Cart, Enquire, View Details */}
          <CardFlipFooter className="p-0 pt-3 border-t border-[#1E375C] flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBagToggle}
              title={inBag ? "Remove from Media Cart" : "Add to Media Cart"}
              className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                inBag
                  ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                  : "bg-[#132A4F] border-[#1E375C] text-[#A5B5CD] hover:text-white hover:border-[#FF5A1F]"
              }`}
              aria-label={inBag ? "Remove from Media Cart" : "Add to Media Cart"}
            >
              {inBag ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleEnquiryClick}
              className="py-2 px-3 rounded-lg bg-[#132A4F] hover:bg-[#1a3869] text-white border border-[#1E375C] hover:border-[#FF5A1F]/50 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              Enquire
            </button>

            <Link
              href={detailHref}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-bold tracking-wide transition-colors shadow-sm"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardFlipFooter>
        </CardFlipBack>
      </CardFlip>

      {/* Enquiry Modals */}
      {isNewspaper ? (
        <NewspaperEnquiryModal
          isOpen={isEnquiryOpen}
          onClose={() => setIsEnquiryOpen(false)}
          newspaper={item}
        />
      ) : (
        <MagazineEnquiryModal
          isOpen={isEnquiryOpen}
          onClose={() => setIsEnquiryOpen(false)}
          magazine={item}
        />
      )}
    </>
  );
}
