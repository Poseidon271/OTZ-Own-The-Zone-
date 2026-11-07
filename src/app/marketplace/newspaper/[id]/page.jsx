"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ColumnLines } from "@/components/scrollx/column-lines";
import MdiIcon from "@/components/MdiIcon";
import NewspaperEnquiryModal from "@/components/marketplace/NewspaperEnquiryModal";
import { getNewspaperById, getAllNewspapers, formatIndianCurrency, formatAudienceReach } from "@/lib/newspaperData";
import { useBag } from "@/context/BagContext";
import {
  ChevronRight,
  Newspaper,
  Users,
  MapPin,
  Globe,
  Calendar,
  ShoppingBag,
  Check,
  Send,
  ShieldCheck,
  FileText,
  Layers
} from "lucide-react";

export default function NewspaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;

  const newspaper = useMemo(() => {
    return getNewspaperById(rawId);
  }, [rawId]);

  const allNewspapers = useMemo(() => getAllNewspapers(), []);

  const relatedNewspapers = useMemo(() => {
    if (!newspaper) return [];
    return allNewspapers
      .filter((n) => n.id !== newspaper.id && (n.category === newspaper.category || n.location?.region === newspaper.location?.region))
      .slice(0, 3);
  }, [newspaper, allNewspapers]);

  const { addToBag, removeFromBag, isInBag, setIsBagOpen } = useBag();

  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [selectedAdOptionForEnquiry, setSelectedAdOptionForEnquiry] = useState(null);

  if (!newspaper) {
    return (
      <div
        className="theme-dark min-h-screen flex flex-col text-[var(--text-primary)] font-sans antialiased"
        style={{ backgroundColor: "var(--surface-canvas)" }}
      >
        <Navbar onLogoClick={() => router.push("/")} />
        <main className="flex-grow flex items-center justify-center p-6 pt-32">
          <div className="text-center space-y-4 max-w-md p-8 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
            <Newspaper className="w-10 h-10 text-[#FF5A1F] mx-auto" />
            <h2 className="text-xl font-bold text-white font-display">Newspaper Not Found</h2>
            <p className="text-xs text-[#A5B5CD]">
              The newspaper you are looking for is either archived or unavailable in our active directory.
            </p>
            <Link
              href="/marketplace/newspaper"
              className="inline-block px-4 py-2 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-semibold"
            >
              Back to Newspaper Directory
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const inBag = isInBag(newspaper.id);

  const locationText =
    typeof newspaper.location === "object"
      ? `${newspaper.location.city}${newspaper.location.state ? `, ${newspaper.location.state}` : ""} • ${newspaper.location.region || "National"}`
      : newspaper.location || "National";

  const handleBagToggle = () => {
    if (inBag) {
      removeFromBag(newspaper.id);
    } else {
      addToBag({
        id: newspaper.id,
        name: newspaper.name,
        title: `${newspaper.name} Newspaper Advertising`,
        price: selectedAdOptionForEnquiry?.price || newspaper.minimumSpend,
        dailyRate: selectedAdOptionForEnquiry?.price || newspaper.minimumSpend,
        duration: 1,
        reach: `${formatAudienceReach(newspaper.audienceReach)} Daily Readers`,
        location: locationText,
        image: newspaper.coverImage || newspaper.logo,
        logo: newspaper.logo,
        category: newspaper.category || "General Interest",
        subCategory: "Newspaper",
        mediaType: "Newspaper",
        channelDomain: "Print Media",
        specs: selectedAdOptionForEnquiry?.option || newspaper.adOptions?.[0] || "Front Page Broadsheet",
        frequency: newspaper.frequency || "Daily",
        languages: newspaper.languages || [],
      });
    }
  };

  const handleOpenOptionEnquiry = (opt) => {
    setSelectedAdOptionForEnquiry(opt);
    setIsEnquiryModalOpen(true);
  };

  return (
    <div
      className="theme-dark min-h-screen relative flex flex-col text-[var(--text-primary)] font-sans antialiased overflow-x-hidden"
      style={{ backgroundColor: "var(--surface-canvas)" }}
    >
      {/* Architectural Column Lines & Global Dark Ambient Glow */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.035}
        className="fixed inset-0 z-0 pointer-events-none"
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 85% 15%, rgba(255, 90, 31, 0.12) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(19, 42, 79, 0.5) 0%, transparent 55%)",
        }}
      />

      {/* Global Navbar */}
      <Navbar onLogoClick={() => router.push("/")} />

      {/* SECTION 1: Midnight Zone Publication Hero Banner */}
      <section className="relative z-10 text-white pt-28 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6 text-left">
          {/* Breadcrumb Navigation: Home / Marketplace / Print / Newspaper / [Newspaper Name] */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-xs font-mono text-[#A5B5CD]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
                <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
                <span className="text-[#A5B5CD]">Print</span>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
                <Link href="/marketplace/newspaper" className="hover:text-white transition-colors">Newspaper</Link>
              </li>
              <li className="flex items-center space-x-2">
                <ChevronRight className="w-3.5 h-3.5 text-[#677E9E]" />
                <span className="text-[#FF5A1F] font-semibold">{newspaper.name}</span>
              </li>
            </ol>
          </nav>

          {/* Publication Header Profile */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-2">
            {/* Thumbnail */}
            <div className="relative w-full md:w-56 h-56 rounded-xl overflow-hidden bg-[#132A4F] border border-[#1E375C] shrink-0 shadow-lg">
              <img
                src={newspaper.coverImage || newspaper.logo}
                alt={newspaper.name}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-2.5 left-2.5 bg-[#0B1E3B]/90 backdrop-blur-xs px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider text-white border border-[#1E375C]">
                {newspaper.category}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-[#132A4F] text-[#A5B5CD] border border-[#1E375C]">
                  {newspaper.category}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-[#132A4F] text-[#A5B5CD] border border-[#1E375C] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#FF5A1F]" /> {newspaper.frequency} Edition
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                  {newspaper.name}
                </h1>
                {newspaper.tagline && (
                  <p className="text-sm text-[#A5B5CD] mt-1 italic">
                    &ldquo;{newspaper.tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-[#132A4F] border border-[#1E375C]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#677E9E] block">
                    Daily Readership
                  </span>
                  <span className="text-base font-bold text-white font-display">
                    {formatAudienceReach(newspaper.audienceReach)}
                  </span>
                  <span className="text-[10px] text-[#A5B5CD] block">Certified readers</span>
                </div>

                <div className="p-3 rounded-lg bg-[#132A4F] border border-[#1E375C]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#677E9E] block">
                    Circulation
                  </span>
                  <span className="text-base font-bold text-white font-display">
                    {newspaper.circulation ? formatAudienceReach(newspaper.circulation) : "ABC Audited"}
                  </span>
                  <span className="text-[10px] text-[#A5B5CD] block">Copies daily</span>
                </div>

                <div className="p-3 rounded-lg bg-[#132A4F] border border-[#1E375C]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#677E9E] block">
                    Starting Card Rate
                  </span>
                  <span className="text-base font-bold text-[#FF5A1F] font-display">
                    {formatIndianCurrency(newspaper.minimumSpend)}
                  </span>
                  <span className="text-[10px] text-[#A5B5CD] block">Base placement</span>
                </div>

                <div className="p-3 rounded-lg bg-[#132A4F] border border-[#1E375C]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#677E9E] block">
                    Primary Region
                  </span>
                  <span className="text-base font-bold text-white font-display truncate block">
                    {typeof newspaper.location === "object" ? newspaper.location.city : newspaper.location}
                  </span>
                  <span className="text-[10px] text-[#A5B5CD] block">
                    {typeof newspaper.location === "object" ? newspaper.location.region : "National"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdOptionForEnquiry(newspaper.advertisingRates?.[0] || null);
                    setIsEnquiryModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enquire for Booking</span>
                </button>

                <button
                  type="button"
                  onClick={handleBagToggle}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                    inBag
                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                      : "bg-[#132A4F] border-[#1E375C] text-[#A5B5CD] hover:text-white hover:border-[#FF5A1F]"
                  }`}
                >
                  {inBag ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                  <span>{inBag ? "Added to Cart" : "Add to Media Cart"}</span>
                </button>

                <a
                  href={`https://wa.me/919999999999?text=Hi%2C%20I%20am%20interested%20in%20booking%20an%20ad%20in%20${encodeURIComponent(newspaper.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#132A4F] hover:bg-[#1a3869] border border-[#1E375C] text-xs font-semibold text-emerald-400 transition-colors"
                >
                  <MdiIcon name="whatsapp" className="text-base" />
                  <span>Chat with Ops</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="relative z-10 flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Content Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6 text-left">
            {/* Overview */}
            <section className="p-6 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-3">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF5A1F]" />
                Publication Overview
              </h2>
              <p className="text-sm text-[#A5B5CD] leading-relaxed">
                {newspaper.description}
              </p>
            </section>

            {/* Readership Profile */}
            <section className="p-6 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-4">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-[#FF5A1F]" />
                Readership Profile &amp; Demographics
              </h2>
              <p className="text-sm text-[#A5B5CD] leading-relaxed">
                {newspaper.readershipProfile || "Verified daily household subscribers and commercial trade readers across core metropolitan corridors."}
              </p>

              <div className="pt-2 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#677E9E] block">
                  Target Demographics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {newspaper.targetGroups?.map((group, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[#132A4F] border border-[#1E375C] text-xs font-medium text-white"
                    >
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Available Advertising Rates Table */}
            <section className="p-6 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E375C] pb-3">
                <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#FF5A1F]" />
                  Available Advertising Rates &amp; Placements
                </h2>
                <span className="text-xs text-[#A5B5CD] font-medium">
                  {newspaper.advertisingRates?.length || newspaper.adOptions?.length} Formats
                </span>
              </div>

              <div className="divide-y divide-[#1E375C]">
                {newspaper.advertisingRates?.map((rate, idx) => (
                  <div
                    key={idx}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-[#FF5A1F] transition-colors font-display">
                          {rate.option}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#0B1E3B] text-[#A5B5CD] font-mono font-medium border border-[#1E375C]">
                          Broadsheet Insertion
                        </span>
                      </div>
                      <p className="text-xs text-[#A5B5CD] mt-0.5">
                        Dimensions: {rate.specs} &bull; Reach: <strong className="text-white">{rate.estimatedReach}</strong>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                      <span className="text-base font-extrabold text-[#FF5A1F] font-display">
                        {formatIndianCurrency(rate.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenOptionEnquiry(rate)}
                        className="px-3 py-1.5 rounded bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Enquire Rate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Booking Terms & Requirements */}
            <section className="p-6 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-4">
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Booking Terms &amp; Requirements
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#A5B5CD]">
                <div className="p-3.5 rounded-lg bg-[#132A4F] border border-[#1E375C] space-y-1">
                  <strong className="text-white font-semibold block">Minimum Booking</strong>
                  <p>{newspaper.minimumBooking || "1 Insertion (Issue based commitment)"}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#132A4F] border border-[#1E375C] space-y-1">
                  <strong className="text-white font-semibold block">Artwork Submission Due</strong>
                  <p>Broadsheet print-ready PDF (CMYK, 300 DPI) due 24-48 hours before publication edition cutoff.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#132A4F] border border-[#1E375C] space-y-1">
                  <strong className="text-white font-semibold block">Proof of Performance</strong>
                  <p>Complete physical newspaper voucher edition and digital e-paper tear sheet delivered to your dashboard.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#132A4F] border border-[#1E375C] space-y-1">
                  <strong className="text-white font-semibold block">Cancellation Policy</strong>
                  <p>Up to 48 hours prior to printing date. Subject to individual publisher editorial policies.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Column (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6 text-left">
            {/* Quick Sourcing Box */}
            <div className="p-5 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-4">
              <div className="border-b border-[#1E375C] pb-3">
                <span className="text-[10px] uppercase font-bold text-[#677E9E] block font-mono">Starting Spend</span>
                <p className="text-2xl font-black text-[#FF5A1F] font-display">
                  {formatIndianCurrency(newspaper.minimumSpend)}
                </p>
                <span className="text-xs text-[#A5B5CD]">{newspaper.frequency} edition release</span>
              </div>

              <div className="space-y-2 text-xs text-[#A5B5CD]">
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <span className="font-semibold text-white">{locationText}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Languages:</span>
                  <span className="font-semibold text-white">{newspaper.languages?.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Turnaround:</span>
                  <span className="font-semibold text-white">Next Daily Cycle</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAdOptionForEnquiry(null);
                    setIsEnquiryModalOpen(true);
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-xs"
                >
                  Request Official Quotation
                </button>

                <button
                  type="button"
                  onClick={handleBagToggle}
                  className={`w-full py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    inBag
                      ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"
                      : "bg-[#132A4F] border-[#1E375C] text-[#A5B5CD] hover:text-white hover:border-[#FF5A1F]"
                  }`}
                >
                  {inBag ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                  <span>{inBag ? "In Media Cart" : "Add to Media Cart"}</span>
                </button>
              </div>
            </div>

            {/* Related Newspapers */}
            {relatedNewspapers.length > 0 && (
              <div className="p-5 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_4px_24px_rgba(0,0,0,0.25)] space-y-3">
                <h3 className="text-sm font-bold text-white font-display">
                  Similar {newspaper.category} Newspapers
                </h3>
                <div className="divide-y divide-[#1E375C]">
                  {relatedNewspapers.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/marketplace/newspaper/${rel.id}`}
                      className="py-2.5 flex items-center gap-3 group"
                    >
                      <img
                        src={rel.logo}
                        alt={rel.name}
                        className="w-8 h-8 rounded border border-[#1E375C] object-contain p-0.5 bg-[#0B1E3B] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#FF5A1F] truncate transition-colors">
                          {rel.name}
                        </h4>
                        <p className="text-[11px] text-[#A5B5CD]">
                          {formatAudienceReach(rel.audienceReach)} readers &bull; {formatIndianCurrency(rel.minimumSpend)}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#677E9E] group-hover:text-white transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Newspaper Enquiry Modal */}
      <NewspaperEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        newspaper={newspaper}
        selectedOption={selectedAdOptionForEnquiry}
      />



      {/* OTZ Midnight Zone Footer */}
      <footer className="relative z-10 border-t border-[#1E375C] bg-[#0B1E3B]/90 backdrop-blur-xs text-[#A5B5CD] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-display font-black tracking-widest text-lg text-white">OTZ</span>
            <span className="text-[#677E9E]">|</span>
            <span className="text-[#A5B5CD]">
              &copy; {new Date().getFullYear()} Own The Zone. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/for-brands" className="hover:text-white transition-colors">For Brands</Link>
            <Link href="/for-media-owners" className="hover:text-white transition-colors">For Media Owners</Link>
            <Link href="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link href="/marketplace/newspaper" className="text-[#FF5A1F] font-semibold">Newspapers</Link>
            <Link href="/marketplace/magazine" className="hover:text-white transition-colors">Magazines</Link>
            <a
              href={`https://wa.me/919999999999?text=Hi%2C%20I%20am%20interested%20in%20${encodeURIComponent(newspaper.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <MdiIcon name="whatsapp" className="text-base" /> Chat with Ops
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

