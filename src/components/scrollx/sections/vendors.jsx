"use client";

import React, { useState } from "react";
import { FadeIn } from "../fade-in";
import { ShinyButton } from "../shiny-button";
import { VercelCard } from "../vercel-card";
import { cn } from "@/lib/utils";
import MdiIcon from "@/components/MdiIcon";

export default function Vendors({ className }) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    mediaType: "OOH",
  });
  const [status, setStatus] = useState("idle"); // "idle" | "submitting" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "register",
          name: formData.name,
          company: formData.company,
          phone: formData.phone,
          email: formData.email,
          role: "host",
          consent: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit lead request.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage("Server connection error. Please try again.");
    }
  };

  return (
    <section id="vendors" className={cn("border-t border-[var(--border-default)] py-24 px-5 text-left relative z-10 bg-transparent", className)}>
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <VercelCard className="w-full rounded-2xl bg-gradient-to-br from-[#132a4f]/20 to-[#0b1e3b]/40 backdrop-blur-md p-8 md:p-12 border border-[var(--border-default)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Copy */}
              <div className="lg:col-span-7 space-y-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-[var(--action-primary)]">
                  FOR MEDIA OWNERS
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl md:text-5xl font-display">
                  Join the OTZ Media Network
                </h2>
                <p className="text-sm md:text-base text-[#A5B5CD] leading-relaxed max-w-xl">
                  Own media inventory? Get discovered by brands looking for the right audiences, locations and channels. List your media on OTZ and turn available inventory into new opportunities.
                </p>
              </div>

              {/* Right Column: Form */}
              <div className="lg:col-span-5 w-full bg-[#0B1E3B]/40 rounded-xl p-6 border border-[var(--border-default)] backdrop-blur-sm">
                {status === "success" ? (
                  <div className="text-center py-8 space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-3xl border border-emerald-500/20 mx-auto">
                      <MdiIcon name="check-bold" />
                    </div>
                    <h3 className="text-xl font-bold text-white font-display">Request Received</h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Thanks! Your request has been received.<br />
                      Our team will get in touch with you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="vendor-name" className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="vendor-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white placeholder-slate-500 text-xs font-semibold focus-ring"
                      />
                    </div>

                    <div>
                      <label htmlFor="vendor-company" className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                        Business / Brand Name
                      </label>
                      <input
                        type="text"
                        id="vendor-company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        placeholder="Apex Billboards"
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white placeholder-slate-500 text-xs font-semibold focus-ring"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="vendor-phone" className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="vendor-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="9999999999"
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white placeholder-slate-500 text-xs font-semibold focus-ring"
                        />
                      </div>
                      <div>
                        <label htmlFor="vendor-email" className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                          Work Email
                        </label>
                        <input
                          type="email"
                          id="vendor-email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="partner@example.com"
                          className="w-full h-10 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white placeholder-slate-500 text-xs font-semibold focus-ring"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="vendor-mediaType" className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">
                        Media Type
                      </label>
                      <select
                        id="vendor-mediaType"
                        name="mediaType"
                        value={formData.mediaType}
                        onChange={handleChange}
                        className="w-full h-10 px-3 rounded-lg border border-[var(--border-default)] bg-[#0b1e3b] text-white text-xs font-semibold focus-ring"
                      >
                        <option value="OOH">OOH (Outdoor)</option>
                        <option value="TV">Television</option>
                        <option value="Radio">Radio</option>
                        <option value="Print">Print</option>
                        <option value="Digital">Digital</option>
                        <option value="Cinema">Cinema</option>
                        <option value="Influencer-Creator">Influencer</option>
                        <option value="Event or Venue">Events</option>
                        <option value="Production partner">Production</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {status === "error" && (
                      <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                        <MdiIcon name="alert-circle-outline" /> {errorMessage}
                      </p>
                    )}

                    <ShinyButton
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full justify-center text-center mt-2"
                    >
                      {status === "submitting" ? "Submitting..." : "List Your Media →"}
                    </ShinyButton>
                  </form>
                )}
              </div>
            </div>
          </VercelCard>
        </FadeIn>
      </div>
    </section>
  );
}
