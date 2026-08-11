"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

export default function ServicePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [enquirySent, setEnquirySent] = useState(false);
  const [formData, setFormData] = useState({ message: "", budget: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

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

  const serviceData = {
    "media-planning": {
      title: "Media Planning & Strategy",
      subtitle: "Route budgets to the highest recall zones.",
      desc: "Our operations team uses goal-matched algorithms and historical performance indexes to design the perfect multi-channel media mix for your brand. We plan across TV, OOH, Digital, and creator activations.",
      process: ["Objective definition & taxonomy tag sync", "Audience density mapping (geo-specific)", "Segmented media budget allocation", "Unified campaign strategy package compilation"],
      timeline: "5 - 7 business days",
      priceRange: "₹2L - ₹10L Campaign Minimum"
    },
    "media-buying": {
      title: "Media Buying & Placements",
      subtitle: "Secure premium ad spaces instantly with verified rates.",
      desc: "Bypass intermediary agency markup. View live rates, verify reach audits (BARC, IRS, platform-authenticated stats), and book slots directly in our prime physical and digital inventory catalogs.",
      process: ["Inventory selection from live catalog", "Slot availability reservation", "Audited rate card sheet sign-off", "Direct proof-of-performance tracking"],
      timeline: "2 - 3 business days kickoff",
      priceRange: "Flexible slots starting at ₹15K"
    },
    "production": {
      title: "Creative Media Production",
      subtitle: "High recall scriptwriting, production, and localization.",
      desc: "From billboard creative designs and high-fidelity video spots to short-form UGC content briefs, our design and production network coordinates end-to-end asset production aligned to your zone placement specs.",
      process: ["Creative asset specification briefs", "Concept drafting & copy sign-off", "Studio matching and asset assembly", "Pre-distribution formatting verification"],
      timeline: "10 - 15 business days",
      priceRange: "₹50K - ₹5L package-based"
    }
  };

  const service = serviceData[id] || serviceData["media-planning"];

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      setError("Please fill out your campaign details.");
      return;
    }

    if (!user) {
      // Trigger login modal
      window.dispatchEvent(new CustomEvent("open-auth-modal"));
      return;
    }

    if (user.state === "unverified") {
      setError("Your account is unverified. Please complete verification in your dashboard.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "service",
          source: `service-${id}`,
          message: `[${service.title}] Inquiry.\nBudget: ${formData.budget || "Not Specified"}\nDetails: ${formData.message}`
        })
      });

      const data = await res.json();
      if (data.success) {
        setEnquirySent(true);
      } else {
        setError(data.error || "Failed to submit enquiry.");
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-dark min-h-screen relative flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      <Navbar onLogoClick={() => router.push("/")} />

      <main className="relative z-10 flex-grow pt-32 pb-20 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Service Copy (Column Left) */}
        <div className="lg:col-span-7 space-y-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-caption-default uppercase font-bold text-[var(--action-primary)] hover:translate-x-[-4px] transition-transform"
          >
            <MdiIcon name="arrow-left" /> Back to Home
          </button>

          <div className="space-y-2">
            <h1 className="text-display text-white">{service.title}</h1>
            <p className="text-h3 text-[var(--action-primary)]">{service.subtitle}</p>
          </div>

          <p className="text-body-default text-[var(--text-secondary)] leading-relaxed">
            {service.desc}
          </p>

          {/* Process Timeline */}
          <div className="space-y-4 pt-4">
            <h3 className="text-h3 text-white border-b border-white/10 pb-2">Engagement Process</h3>
            <ul className="space-y-3">
              {service.process.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-small text-[var(--text-secondary)]">
                  <span className="h-6 w-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--action-primary)] font-bold text-xs shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing & Time details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-caption-default text-[var(--text-tertiary)] uppercase block">Indicative Timeline</span>
              <span className="text-body-strong text-white">{service.timeline}</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-caption-default text-[var(--text-tertiary)] uppercase block">Sourcing Budget Range</span>
              <span className="text-body-strong text-white">{service.priceRange}</span>
            </div>
          </div>
        </div>

        {/* Enquiry Form Panel (Column Right) */}
        <div className="lg:col-span-5">
          <div
            className="p-8 rounded-2xl border"
            style={{
              background: "rgba(19, 42, 79, 0.45)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
            }}
          >
            <h3 className="text-h3 text-white mb-2">Request Service Quote</h3>
            <p className="text-caption-default text-[var(--text-secondary)] mb-6">
              Complete the prompt fields below and our operations desk will compile a custom structure proposal.
            </p>

            {enquirySent ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-950 border border-emerald-500/50 text-[#2BD67B] flex items-center justify-center mx-auto text-2xl">
                  <MdiIcon name="check-bold" />
                </div>
                <h4 className="text-body-strong text-white">Enquiry Registered</h4>
                <p className="text-small text-[var(--text-secondary)]">
                  An automated acknowledgement has been logged. You can review current stages in your Brand Dashboard.
                </p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn-secondary w-full"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-caption-default text-[var(--text-secondary)] mb-1.5 uppercase font-bold">
                    Campaign Scope Details
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly state your brand's target audience, locations (Delhi or Mumbai), and placement objectives..."
                    className="w-full p-3 rounded-lg border bg-white/5 text-white placeholder-slate-500 border-white/10 focus:outline-none focus:border-[var(--action-primary)] text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-caption-default text-[var(--text-secondary)] mb-1.5 uppercase font-bold">
                    Indicative Budget Band
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full h-11 px-3 rounded-lg border bg-[#0B1E3B] text-white border-white/10 focus:outline-none focus:border-[var(--action-primary)] text-sm"
                  >
                    <option value="">Select budget range...</option>
                    <option value="₹10K - ₹50K">₹10K - ₹50K</option>
                    <option value="₹50K - ₹2L">₹50K - ₹2L</option>
                    <option value="₹2L - ₹10L">₹2L - ₹10L</option>
                    <option value="₹10L+">₹10L+</option>
                  </select>
                </div>

                {error && (
                  <p className="text-small text-[var(--status-error)] flex items-center gap-1 font-bold">
                    <MdiIcon name="alert-circle-outline" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full shadow-lg"
                  style={{ color: "#0B1E3B" }}
                >
                  {loading ? (
                    <span>Submitting Enquiry...</span>
                  ) : (
                    <>
                      <MdiIcon name="send" />
                      <span>{user ? "Submit Request" : "Login to Submit"}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
