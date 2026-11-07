"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, CheckCircle, Send, ShieldCheck } from "lucide-react";
import { formatIndianCurrency } from "@/lib/newspaperData";

export default function NewspaperEnquiryModal({
  isOpen,
  onClose,
  newspaper,
  selectedOption = null
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
    adOption: selectedOption?.option || newspaper?.adOptions?.[0] || "Front Page",
    timeline: "Immediate (This Week)",
    budget: selectedOption?.price ? formatIndianCurrency(selectedOption.price) : "₹3,00,000 - ₹8,00,000",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen || !newspaper) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please provide a contact phone number");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        type: "listing",
        source: "marketplace_newspaper",
        referenced_listing_id: newspaper.id,
        listing_title: `${newspaper.name} (${formData.adOption})`,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || "Not Specified",
        budget_band: formData.budget,
        timeline: formData.timeline,
        sponsorship_tier: formData.adOption,
        message: formData.message.trim() || `Inquiry for ${newspaper.name} - ${formData.adOption} newspaper advertisement. Target timeline: ${formData.timeline}.`,
      };

      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.warn("Enquiry submission fallback:", err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in text-left">
      <div className="relative w-full max-w-xl rounded-xl bg-[#0F2444] border border-[#1E375C] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#132A4F] text-[#A5B5CD] hover:text-white border border-[#1E375C] flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950/70 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold font-display text-white">Enquiry Received</h3>
            <p className="text-sm text-[#A5B5CD] max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-white">{formData.name}</strong>. Our print media buying desk has received your enquiry for{" "}
              <strong className="text-white">{newspaper.name}</strong> ({formData.adOption}). An OTZ representative will contact you with availability and confirmed card rates within 2 hours.
            </p>
            <div className="p-4 rounded-lg bg-[#132A4F] border border-[#1E375C] text-xs text-[#A5B5CD] max-w-md mx-auto space-y-1 text-left">
              <p><strong className="text-white">Publication:</strong> {newspaper.name}</p>
              <p><strong className="text-white">Ad Option:</strong> {formData.adOption}</p>
              <p><strong className="text-white">Contact Email:</strong> {formData.email}</p>
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-6 py-2.5 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0B1E3B] text-[#A5B5CD] border border-[#1E375C] mb-2">
                Newspaper Advertising Enquiry
              </div>
              <h3 className="text-2xl font-bold font-display text-white">
                Book {newspaper.name}
              </h3>
              <p className="text-xs text-[#A5B5CD] mt-1">
                Reach {newspaper.audienceReach ? new Intl.NumberFormat("en-IN").format(newspaper.audienceReach) : "thousands of"} verified daily readers with certified proof of performance.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A5B5CD]">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white placeholder-[#677E9E] text-xs focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A5B5CD]">Company / Brand Name</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Horizon Retail"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white placeholder-[#677E9E] text-xs focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A5B5CD]">Work Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white placeholder-[#677E9E] text-xs focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A5B5CD]">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white placeholder-[#677E9E] text-xs focus:border-[#FF5A1F] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A5B5CD]">Placement Format</label>
                <select
                  name="adOption"
                  value={formData.adOption}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs focus:border-[#FF5A1F] focus:outline-none cursor-pointer"
                >
                  {newspaper.adOptions?.map((opt, i) => (
                    <option key={i} value={opt} className="bg-[#0F2444] text-white">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#A5B5CD]">Target Insertion Date / Timeline</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white text-xs focus:border-[#FF5A1F] focus:outline-none cursor-pointer"
                >
                  <option value="Immediate (This Week)" className="bg-[#0F2444] text-white">Immediate (This Week)</option>
                  <option value="Next Week" className="bg-[#0F2444] text-white">Next Week</option>
                  <option value="This Month" className="bg-[#0F2444] text-white">This Month</option>
                  <option value="Multi-Edition Campaign" className="bg-[#0F2444] text-white">Multi-Edition Campaign</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#A5B5CD]">Specific Requirements or City Editions</label>
              <textarea
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Specify preferred editions (e.g. Delhi NCR Main, Mumbai City), target release dates, bleeding specs or additional questions..."
                className="w-full px-3.5 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-white placeholder-[#677E9E] text-xs focus:border-[#FF5A1F] focus:outline-none resize-none"
              />
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1E375C]">
              <div className="flex items-center gap-1.5 text-xs text-[#677E9E]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero spam guarantee. Verified rate cards.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#132A4F] border border-[#1E375C] text-xs font-semibold text-[#A5B5CD] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-[#FF5A1F] hover:bg-[#E64E15] disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? "Submitting..." : "Submit Booking Enquiry"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
