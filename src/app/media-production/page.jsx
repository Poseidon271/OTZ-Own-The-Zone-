"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { VercelCard } from "@/components/scrollx/vercel-card";

export default function MediaProductionPage() {
  const router = useRouter();

  // User session state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enquirySent, setEnquirySent] = useState(false);

  // Form fields state
  const [creativeType, setCreativeType] = useState("");
  const [targetChannel, setTargetChannel] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [briefDetails, setBriefDetails] = useState("");

  // Fetch session on load
  useEffect(() => {
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-session" })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });
  }, []);

  const handleProductionSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      // Save current URL for return routing
      localStorage.setItem("post_login_redirect", "/media-production");
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
          type: "service",
          source: "media-production",
          message: `[CREATIVE PRODUCTION BRIEF]
Creative Type: ${creativeType}
Target Zone/Channel: ${targetChannel}
Budget Band: ${budgetRange}
Timeline: ${timeline}
Details: ${briefDetails || "Not Provided"}`,
          budget_band: budgetRange,
          timeline: timeline
        })
      });

      const data = await res.json();
      if (data.success) {
        setEnquirySent(true);
      } else {
        setError(data.error || "Failed to log production brief.");
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const engagementProcess = [
    { title: "Brief Consultation", desc: "Align specifications, scriptwriting briefs, copy drafts, and zone dimensions." },
    { title: "Creative Assembly", desc: "Coordinate asset design, high-recall spots, or adaptations with our network." },
    { title: "Formatting & Signoff", desc: "Pre-distribution formatting checks matching physical or platform dimensions." }
  ];

  return (
    <div className="theme-dark min-h-screen flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] relative overflow-hidden font-sans">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar onLogoClick={() => router.push("/")} />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-center">
        
        {/* Breadcrumb Return Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="frost-glass inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[rgba(184,199,217,0.18)] hover:text-[var(--action-primary)] transition-all cursor-pointer border border-[var(--border-default)]"
          >
            <MdiIcon name="arrow-left" className="text-base" /> Return to Homepage
          </button>
        </div>

        {enquirySent ? (
          /* Step 2: Confirmation / Request Summary page */
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in py-12">
            <VercelCard bordered={true} className="p-8 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-3xl space-y-6 text-left">
              <div className="flex items-center gap-4 border-b border-[var(--border-default)] pb-6">
                <div className="h-12 w-12 rounded-full bg-emerald-950 border border-emerald-500/50 text-[#2BD67B] flex items-center justify-center text-2xl shrink-0">
                  <MdiIcon name="check-bold" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white font-display">Production Brief Logged</h2>
                  <p className="text-xs text-[var(--text-secondary)]">We have recorded your design and copy requirements.</p>
                </div>
              </div>

              {/* Request Summary */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider">Brief Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950/40 p-4 rounded-xl border border-[var(--border-default)]">
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block font-bold">Creative Type</span>
                    <span className="font-bold text-white">{creativeType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-tertiary)] block font-bold">Target Channel</span>
                    <span className="font-bold text-white">{targetChannel}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] text-[var(--text-tertiary)] block font-bold">Budget Band</span>
                    <span className="font-bold text-white">{budgetRange}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] text-[var(--text-tertiary)] block font-bold">Timeline</span>
                    <span className="font-bold text-white">{timeline}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border-default)]">
                <h4 className="text-xs font-bold text-white">Next Steps</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Our operations team will review your creative brief and assign a production manager. Check updates in your dashboard or talk to us on WhatsApp to speed up localization kickoff.
                </p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white py-3 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Go to Dashboard
                </button>
                <ShinyButton
                  onClick={() => window.open("https://wa.me/919999999999?text=I%27ve%20logged%20a%20production%20brief%20on%20OTZ", "_blank")}
                  className="w-full rounded-xl py-3 text-xs font-bold cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <MdiIcon name="whatsapp" className="text-sm" /> Chat with Ops
                </ShinyButton>
              </div>
            </VercelCard>
          </div>
        ) : (
          /* Step 1: Info and Intake Form split */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
            {/* Info copy column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-[1.15]">
                  Creative Media <span className="text-[var(--action-primary)]">Production</span>
                </h1>
                <p className="text-lg text-[var(--action-primary)] font-bold">
                  Spec-aligned copywriting, high-recall design, and content asset adaptation.
                </p>
              </div>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                From outdoor billboard sizes and display screens to scripting ad spots and studio matches, our design network coordinates specifications end-to-end. We design and deliver assets optimized for offline recall and digital performance.
              </p>

              {/* Engagement steps */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs uppercase font-bold text-white tracking-wider">How it works</h3>
                <ul className="space-y-4">
                  {engagementProcess.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-xs">
                      <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--action-primary)] font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-white block">{step.title}</span>
                        <span className="text-[var(--text-secondary)] mt-0.5 block">{step.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Intake Form Column */}
            <div className="lg:col-span-6 w-full">
              <VercelCard bordered={true} className="p-1 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-3xl text-left w-full">
                <form onSubmit={handleProductionSubmit} className="p-6 space-y-5 w-full">
                  <div>
                    <h3 className="text-lg font-bold text-white font-display">Request Production Quote</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Log your creative specs to fetch a spec-aligned project budget estimate.
                    </p>
                  </div>

                  {/* Creative Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                      Campaign / Creative Type
                    </label>
                    <select
                      value={creativeType}
                      onChange={(e) => setCreativeType(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select creative format...</option>
                      <option value="Billboard/OOH Design">Billboard / OOH Graphic Design</option>
                      <option value="Video spot production">Video Ad Spot (15s/30s)</option>
                      <option value="UGC Video Ads">UGC / Short-form Video Briefs</option>
                      <option value="Radio/Audio Copywriting">Radio Spot / Audio Copy</option>
                      <option value="Adaptation / Re-sizing">Placement spec Adaptation / Resizing</option>
                    </select>
                  </div>

                  {/* Target Zone/Channel */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                      Zone / Placement Channel
                    </label>
                    <select
                      value={targetChannel}
                      onChange={(e) => setTargetChannel(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select channel placement...</option>
                      <option value="Metropolitan Billboards">Metropolitan OOH Billboards</option>
                      <option value="Metro/Train station wraps">Metro Train Station & Wraps</option>
                      <option value="Multiplex Cinema screens">Multiplex Cinema Screens</option>
                      <option value="National TV slots">National Television Broadcast</option>
                      <option value="Short-form creator handles">Influencer / Creator Handles</option>
                      <option value="Regional Print media">Regional Print / News</option>
                    </select>
                  </div>

                  {/* Budget Band */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                      Indicative Budget Range
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select budget range...</option>
                      <option value="₹10K - ₹50K">₹10K - ₹50K</option>
                      <option value="₹50K - ₹2L">₹50K - ₹2L</option>
                      <option value="₹2L - ₹10L">₹2L - ₹10L</option>
                      <option value="₹10L+">₹10L+</option>
                    </select>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                      Required Timeline
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3 py-2.5 text-xs text-white cursor-pointer font-semibold outline-none focus:border-[var(--action-primary)]"
                      required
                    >
                      <option value="">Select delivery timeline...</option>
                      <option value="Express (3-5 days)">Express (3-5 days)</option>
                      <option value="Standard (7-14 days)">Standard (7-14 days)</option>
                      <option value="Flexible (14+ days)">Flexible (14+ days)</option>
                    </select>
                  </div>

                  {/* Brief Details text area */}
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">
                      Project Notes / Specific Specs
                    </label>
                    <textarea
                      rows={3}
                      value={briefDetails}
                      onChange={(e) => setBriefDetails(e.target.value)}
                      placeholder="List details (dimensions, logo specs, script ideas)..."
                      className="w-full p-3 rounded-lg border bg-white/5 text-white placeholder-slate-500 border-white/10 focus:outline-none focus:border-[var(--action-primary)] text-xs resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-[var(--status-error)] font-bold flex items-center gap-1 animate-fade-in">
                      <MdiIcon name="alert-circle-outline" /> {error}
                    </p>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-md py-3 text-xs"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? (
                      <span>Logging brief...</span>
                    ) : (
                      <>
                        <MdiIcon name="send" />
                        <span>{user ? "Submit Production Brief" : "Login to Submit Brief"}</span>
                      </>
                    )}
                  </button>
                </form>
              </VercelCard>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
