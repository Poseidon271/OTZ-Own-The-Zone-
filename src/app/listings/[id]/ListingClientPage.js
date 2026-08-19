"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

export default function ListingClientPage({ listing }) {
  const router = useRouter();

  // State
  const [selectedFormat, setSelectedFormat] = useState(listing.formats?.[0] || "");
  const [selectedTier, setSelectedTier] = useState("");
  const [message, setMessage] = useState(() => {
    if (listing.media_type === "Event or Venue") {
      return `Hi OTZ, I am interested in booking advertising slots on "${listing.title}". Please share details.`;
    } else {
      return `Hi OTZ, I am interested in booking advertising slots on "${listing.title}" for format "${listing.formats?.[0] || ""}". Please share availability coordinates.`;
    }
  });
  const [budget, setBudget] = useState(listing.price_band || "");
  const [loading, setLoading] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Load session
  useEffect(() => {
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-session" })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      });
  }, []);

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setMessage(`Hi OTZ, I am interested in booking the "${tier}" tier for "${listing.title}". Please share the detailed deck and rate breakdown.`);
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
    setMessage(`Hi OTZ, I am interested in booking advertising slots on "${listing.title}" for format "${format}". Please share availability coordinates.`);
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      // Save current URL for return routing
      localStorage.setItem("post_login_redirect", `/listings/${listing.id}`);
      // Open login modal
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
      return;
    }

    if (user.state === "unverified") {
      setError("Your account is unverified. Please complete verification in your dashboard.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: listing.media_type === "Event or Venue" ? "sponsorship" : "listing",
          source: `listing-detail-${listing.id}`,
          referenced_listing_id: listing.id,
          message,
          budget_band: budget,
          sponsorship_tier: selectedTier || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setEnquirySent(true);
      } else {
        setError(data.error || "Failed to submit enquiry.");
      }
    } catch (err) {
      setError("Failed to connect to server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const isEvent = listing.media_type === "Event or Venue";

  return (
    <div className="theme-dark bg-[var(--surface-canvas)] min-h-screen text-[var(--text-primary)] pb-16">
      <Navbar onLogoClick={() => router.push("/")} />

      <main className="max-w-6xl mx-auto px-6 pt-24 space-y-8">
        
        {/* Back and Breadcrumbs */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/media-buying")}
            className="flex items-center gap-1.5 text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--action-primary)] transition-colors cursor-pointer"
          >
            <MdiIcon name="arrow-left" /> Back to Marketplace
          </button>

          {listing.is_otz_original && (
            <span className="bg-[#0B1E3B] text-[var(--status-featured)] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              ★ OTZ Original
            </span>
          )}
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Column Left: Visuals & Profile Attributes */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Visual Cover */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[var(--border-default)] shadow-sm bg-[var(--surface-subtle)]">
              <img
                src={listing.image_url}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                {listing.media_type}
              </span>
              {listing.verified && (
                <span className="absolute top-4 right-4 bg-[#2BD67B] text-[#0B1E3B] text-xs font-black px-3 py-1 rounded-md flex items-center gap-1 shadow">
                  <MdiIcon name="check-decagram" /> Verified Zone
                </span>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                  Network/Parent: {listing.parent_network}
                </span>
                <h1 className="text-h1 text-[var(--text-primary)] font-display">{listing.title}</h1>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {listing.niche_tags?.map(t => (
                  <span key={t} className="bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-xs font-bold px-3 py-1 rounded-md border border-[var(--border-default)]">
                    Niche: {t}
                  </span>
                ))}
                {listing.geography?.map(g => (
                  <span key={g} className="bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-xs font-bold px-3 py-1 rounded-md border border-[var(--border-default)]">
                    Location: {g}
                  </span>
                ))}
                {listing.language?.map(l => (
                  <span key={l} className="bg-[var(--surface-subtle)] text-[var(--text-secondary)] text-xs font-bold px-3 py-1 rounded-md border border-[var(--border-default)]">
                    Language: {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Structured Stats (Reach source disclosure Section 4.5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-default)]">
              <div className="p-5 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-xl shadow-inner">
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block mb-1">Verified Audience Reach</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-h2 font-display text-[var(--text-primary)]">{listing.visibility_metric}</span>
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-semibold mt-1 flex items-center gap-1">
                  <MdiIcon name="shield-check-outline" className="text-[var(--status-success)]" />
                  Source: {listing.reach_source} ({listing.reach_date})
                </div>
              </div>

              <div className="p-5 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-xl shadow-inner">
                <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block mb-1">Estimated Cost Band</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-h2 font-display text-[var(--action-primary)] tabular-nums">{listing.price_band}</span>
                </div>
                <span className="text-[9px] text-[var(--text-secondary)] block mt-1">
                  *Exact rates shared upon enquiry receipt.
                </span>
              </div>
            </div>

            {/* Event Specific Parameters (Section 4.4) */}
            {isEvent && (
              <div className="p-5 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-xl space-y-3">
                <h4 className="text-xs uppercase font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <MdiIcon name="calendar-range" className="text-[var(--action-primary)]" />
                  <span>IP Event Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">Event Date</span>
                    <span className="font-bold text-[var(--text-primary)]">{listing.event_date || "November 2026"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block">City Location</span>
                    <span className="font-bold text-[var(--text-primary)]">{listing.geography[0]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Column Right: Enquiry / Sponsorship Action Box */}
          <div className="lg:col-span-5">
            <div
              className="p-8 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-default)] shadow-md space-y-6"
              style={{ boxShadow: "var(--shadow-floating)" }}
            >
              <div>
                <h3 className="text-h3 font-bold text-[var(--text-primary)]">
                  {isEvent ? "Sponsor this Event" : "Book Advertising Zone"}
                </h3>
                <p className="text-caption-default text-[var(--text-secondary)] mt-1">
                  Coordinate availability options and secure audited campaign quotation sheets.
                </p>
              </div>

              {enquirySent ? (
                <div className="text-center py-6 space-y-4 animate-fade-in">
                  <div className="h-14 w-14 bg-[var(--status-success)]/10 text-[var(--status-success)] rounded-full flex items-center justify-center mx-auto text-2xl animate-sweep-green border border-[var(--status-success)]/20">
                    <MdiIcon name="check-bold" />
                  </div>
                  <div>
                    <h4 className="text-body-strong text-[var(--text-primary)]">Enquiry Submitted</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      A same-day operational acknowledgement has been registered. Track stage updates on your dashboard.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="btn-secondary w-full"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnquiry} className="space-y-5">
                  
                  {/* Event Sponsorship Tiers */}
                  {isEvent && listing.sponsorship_tiers && (
                    <div className="space-y-2">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                        Select Sponsorship Tier
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {listing.sponsorship_tiers.map((tier) => {
                          const isSelected = selectedTier === tier;
                          return (
                            <button
                              type="button"
                              key={tier}
                              onClick={() => handleTierSelect(tier)}
                              className={`p-3 rounded-lg border text-[11px] font-bold text-center transition-all cursor-pointer ${
                                isSelected
                                  ? "border-[var(--action-primary)] bg-[var(--action-primary)]/5 text-[var(--action-primary)]"
                                  : "border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]"
                              }`}
                            >
                              {tier}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Formats Selection */}
                  {!isEvent && listing.formats && (
                    <div className="space-y-2">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                        Ad Spec Format Placement
                      </label>
                      <select
                        value={selectedFormat}
                        onChange={(e) => handleFormatSelect(e.target.value)}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-xs font-semibold"
                      >
                        {listing.formats.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Message Detail Box */}
                  <div className="space-y-2">
                    <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                      Campaign Details Message
                    </label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add timing, budget bounds or custom inquiries..."
                      className="w-full p-3 border border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-primary)] rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-xs resize-none leading-relaxed"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-[var(--status-error)] font-bold flex items-center gap-1 animate-fade-in">
                      <MdiIcon name="alert-circle-outline" /> {error}
                    </p>
                  )}

                  {/* Submit Enquiry CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-md focus-ring"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? (
                      <span>Submitting Enquiry...</span>
                    ) : (
                      <>
                        <MdiIcon name="send" />
                        <span>{user ? "Submit Demand Enquiry" : "Login to Submit Enquiry"}</span>
                      </>
                    )}
                  </button>

                  {!user && (
                    <p className="text-[10px] text-[var(--text-secondary)] text-center leading-relaxed font-semibold">
                      *Note: An Own The Zone account is required to coordinate media booking sheets.
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
