"use client";

import React, { useState, useEffect } from "react";
import MdiIcon from "@/components/MdiIcon";
import {
  Maximize2,
  Bus,
  Film,
  Radio,
  Tv,
  Newspaper,
  MonitorPlay,
  Users,
  Ticket,
  Building2,
  X,
  CheckCircle,
  Tag
} from "lucide-react";

export const MEDIA_CHANNELS = [
  {
    id: "ooh",
    title: "OOH / Billboards",
    iconComponent: Maximize2,
    icon: "billboard-outline",
    badge: "High Impact",
    desc: "Digital billboards, unipoles, gantries & static hoardings in prime high-traffic corridors.",
    stat: "15,000+ Premium Sites"
  },
  {
    id: "transit",
    title: "Transit & Aviation",
    iconComponent: Bus,
    icon: "train-car",
    badge: "High Frequency",
    desc: "Metro train wraps, airport terminals, bus shelters, cabs & in-flight media placements.",
    stat: "50M+ Daily Commuters"
  },
  {
    id: "cinema",
    title: "Cinema Screens",
    iconComponent: Film,
    icon: "clapperboard-outline",
    badge: "Captive Audience",
    desc: "On-screen ads, blockbuster movie slots, multiplex lobby branding & product sampling kiosks.",
    stat: "3,500+ Multiplex Screens"
  },
  {
    id: "radio",
    title: "Radio & FM",
    iconComponent: Radio,
    icon: "radio-tower",
    badge: "Audio Reach",
    desc: "Prime FM station spots, RJ mentions, live contest integrations & regional audio jingles.",
    stat: "120+ FM Stations"
  },
  {
    id: "tv",
    title: "Television & OTT",
    iconComponent: Tv,
    icon: "television-play",
    badge: "Mass Scale",
    desc: "Primetime TV network spots plus precision CTV targeting on Hotstar, JioCinema & OTT.",
    stat: "250M+ Connected Homes"
  },
  {
    id: "print",
    title: "Print Media",
    iconComponent: Newspaper,
    icon: "newspaper-variant-outline",
    badge: "High Credibility",
    desc: "Front-page jackets, full-page displays & advertorials in leading national & regional press.",
    stat: "450+ Publications"
  },
  {
    id: "digital",
    title: "Digital & CTV",
    iconComponent: MonitorPlay,
    icon: "monitor-cellphone",
    badge: "Programmatic",
    desc: "Programmatic display networks, Connected TV (CTV) video ads & performance channels.",
    stat: "100M+ Smart Screens"
  },
  {
    id: "influencers",
    title: "Influencers",
    iconComponent: Users,
    icon: "account-group-outline",
    badge: "High Engagement",
    desc: "Top macro/micro creators, Instagram Reels, YouTube integrations & celebrity endorsements.",
    stat: "10,000+ Verified Creators"
  },
  {
    id: "events",
    title: "Events & Sponsorships",
    iconComponent: Ticket,
    icon: "ticket-confirmation-outline",
    badge: "Experiential",
    desc: "Live music concerts, tech summits, college fests, marathons & sports tournament sponsorships.",
    stat: "500+ Annual Events"
  },
  {
    id: "captive",
    title: "Captive & Venue Media",
    iconComponent: Building2,
    icon: "office-building-marker-outline",
    badge: "Targeted HNI",
    desc: "Tech park digital screens, corporate cafeterias, gym networks & luxury elevator displays.",
    stat: "8,000+ Corporate Venues"
  }
];

export const INDUSTRY_OPTIONS = [
  "Fintech",
  "D2C & E-Commerce",
  "Real Estate",
  "Edtech",
  "FMCG",
  "Healthcare",
  "Automotive",
  "B2B SaaS",
  "Gaming",
  "Other"
];

export const AUDIENCE_OPTIONS = [
  "Gen-Z & Students",
  "Working Professionals",
  "Affluent Urban HNI",
  "Tier 2/3 Regional Consumers",
  "Homemakers/Parents"
];

export default function MediaBuying({ initialChannel = "" }) {
  const [selectedChannel, setSelectedChannel] = useState(initialChannel);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    industry: "",
    targetAudiences: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialChannel) {
      const found = MEDIA_CHANNELS.find(
        (c) => c.title.toLowerCase() === initialChannel.toLowerCase() || c.id === initialChannel.toLowerCase()
      );
      if (found) {
        setSelectedChannel(found.title);
        setIsModalOpen(true);
      } else {
        setSelectedChannel(initialChannel);
        setIsModalOpen(true);
      }
    }
  }, [initialChannel]);

  const handleOpenModal = (channelTitle) => {
    setSelectedChannel(channelTitle);
    setSubmitted(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmitted(false);
    setFormError("");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formError) setFormError("");
  };

  const toggleAudienceChip = (audience) => {
    setFormData((prev) => {
      const exists = prev.targetAudiences.includes(audience);
      const updated = exists
        ? prev.targetAudiences.filter((a) => a !== audience)
        : [...prev.targetAudiences, audience];
      return { ...prev, targetAudiences: updated };
    });
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (!formData.phone.trim()) {
      setFormError("Please enter your contact phone number.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }
    if (!formData.company.trim()) {
      setFormError("Please enter your company or organisation name.");
      return;
    }
    if (!formData.industry) {
      setFormError("Please select an Industry / Business Sector.");
      return;
    }
    if (formData.targetAudiences.length === 0) {
      setFormError("Please select at least one Target Audience Vertical.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      company: formData.company,
      selectedMedia: selectedChannel,
      industry: formData.industry,
      targetAudiences: formData.targetAudiences
    };

    console.log("Media Buying Lead Payload:", payload);

    try {
      await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "media-buying-lead",
          source: "media-buying-funnel",
          message: `[MEDIA BUYING PROPOSAL REQUEST]\nSelected Channel: ${selectedChannel}\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nCompany: ${formData.company}\nIndustry: ${formData.industry}\nTarget Audience: ${formData.targetAudiences.join(", ")}`,
          payload
        })
      });
    } catch (err) {
      console.warn("API logging fallback:", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <section className="w-full space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 rounded-full px-4 py-1 text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
          <MdiIcon name="bullhorn-outline" className="text-sm" /> Lead-Generation Funnel & Rate Cards
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">
          Select Your <span className="text-[#FF5A1F]">Media Channel</span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
          Choose a media vertical below to receive verified rate cards, audience heatmaps, and custom campaign placement proposals within 24 hours.
        </p>
      </div>

      {/* Primary Media Channel Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5 w-full">
        {MEDIA_CHANNELS.map((channel) => {
          const IconComponent = channel.iconComponent;
          return (
            <div
              key={channel.id}
              onClick={() => handleOpenModal(channel.title)}
              className="group relative bg-[#0B1E3B]/80 hover:bg-[#0B1E3B] border border-white/10 hover:border-[#FF5A1F] rounded-[12px] p-5 text-left cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-[0_8px_30px_rgba(255,90,31,0.25)] hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 text-[#FF5A1F] bg-[#FF5A1F]/10 p-2 rounded-[6px] border border-[#FF5A1F]/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    {IconComponent ? (
                      <IconComponent className="w-full h-full stroke-[2]" />
                    ) : (
                      <MdiIcon name={channel.icon} className="text-xl" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FF5A1F]/10 text-[#FF5A1F] border border-[#FF5A1F]/20 px-2 py-0.5 rounded-full">
                    {channel.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#FF5A1F] transition-colors leading-snug">
                    {channel.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-3 leading-relaxed">
                    {channel.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {channel.stat}
                </span>
                <span className="text-[#FF5A1F] font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Request →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proposal Request Intake Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
          {/* Modal Container: Solid navy canvas (bg-[#0B1E3B]) */}
          <div className="bg-[#0B1E3B] rounded-[10px] p-6 md:p-8 max-w-xl w-full border border-white/10 shadow-2xl relative text-left my-8">
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-[#101828] p-1.5 rounded-full border border-white/10 cursor-pointer"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              /* Success State */
              <div className="py-6 space-y-6 text-center animate-fade-in">
                <div className="w-16 h-16 bg-[#FF5A1F]/15 text-[#FF5A1F] border border-[#FF5A1F]/30 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white font-display">
                    Proposal Request Received
                  </h3>
                  <div className="p-4 bg-[#101828] border border-white/10 rounded-[8px] text-left space-y-2 text-xs">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-slate-400">CHANNEL:</span>
                      <span className="font-bold text-[#FF5A1F]">{selectedChannel}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-slate-400">ORGANISATION:</span>
                      <span className="font-bold text-white">{formData.company}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="font-mono text-slate-400">SECTOR:</span>
                      <span className="font-bold text-white">{formData.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-slate-400">AUDIENCES:</span>
                      <span className="font-bold text-white">{formData.targetAudiences.join(", ")}</span>
                    </div>
                  </div>
                </div>
                {/* Verbatim success requirement */}
                <div className="p-4 bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 rounded-[8px] text-left">
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    Inquiry Submitted. An OTZ media specialist will share custom availability and rate cards within 24 hours.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="bg-[#FF5A1F] text-[#0B1E3B] font-bold h-[44px] w-full rounded-[6px] hover:opacity-90 transition-all cursor-pointer text-sm tracking-wide"
                >
                  DONE
                </button>
              </div>
            ) : (
              /* Modal Intake Form */
              <div className="space-y-6">
                {/* Header Tagged with chosen channel */}
                <div className="border-b border-white/10 pb-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-[#FF5A1F] bg-[#FF5A1F]/10 px-2.5 py-1 rounded-md mb-2 border border-[#FF5A1F]/20">
                    <Tag className="w-3.5 h-3.5" />
                    Request Proposal for: {selectedChannel}
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-white font-display tracking-tight">
                    Request Media Buying Proposal
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Fill in your campaign parameters to receive custom rate cards and placement availability.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="bg-[#101828] border border-white/20 text-white placeholder-slate-400 rounded-[6px] px-3.5 py-2.5 w-full text-sm focus:ring-2 focus:ring-[#FF5A1F] focus:outline-none"
                    />
                  </div>

                  {/* Contact / Phone Number */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Contact / Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bg-[#101828] border border-white/20 text-white placeholder-slate-400 rounded-[6px] px-3.5 py-2.5 w-full text-sm focus:ring-2 focus:ring-[#FF5A1F] focus:outline-none"
                    />
                  </div>

                  {/* Work / Personal Email */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Work / Personal Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="rahul@company.com"
                      className="bg-[#101828] border border-white/20 text-white placeholder-slate-400 rounded-[6px] px-3.5 py-2.5 w-full text-sm focus:ring-2 focus:ring-[#FF5A1F] focus:outline-none"
                    />
                  </div>

                  {/* Company or Organisation Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Company or Organisation Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="e.g. Acme Brands Pvt Ltd"
                      className="bg-[#101828] border border-white/20 text-white placeholder-slate-400 rounded-[6px] px-3.5 py-2.5 w-full text-sm focus:ring-2 focus:ring-[#FF5A1F] focus:outline-none"
                    />
                  </div>

                  {/* Field 1: Industry / Business Sector */}
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white mb-1.5">
                      Industry / Business Sector *
                    </label>
                    <select
                      required
                      value={formData.industry}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      className="bg-[#101828] border border-white/20 text-white placeholder-slate-400 rounded-[6px] px-3.5 py-2.5 w-full text-sm focus:ring-2 focus:ring-[#FF5A1F] focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-500">
                        -- Select Industry --
                      </option>
                      {INDUSTRY_OPTIONS.map((item) => (
                        <option key={item} value={item} className="bg-[#101828] text-white">
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 2: Target Audience Vertical */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Target Audience Vertical *
                      </label>
                      <span className="text-[11px] font-mono font-semibold text-[#FF5A1F] bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 px-2 py-0.5 rounded-full">
                        {formData.targetAudiences.length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {AUDIENCE_OPTIONS.map((audience) => {
                        const isSelected = formData.targetAudiences.includes(audience);
                        return (
                          <button
                            type="button"
                            key={audience}
                            onClick={() => toggleAudienceChip(audience)}
                            className={
                              isSelected
                                ? "bg-[#FF5A1F] border border-[#FF5A1F] text-[#0B1E3B] font-bold text-xs px-3 py-1.5 rounded-full shadow-sm"
                                : "bg-[#101828] border border-white/20 text-slate-300 text-xs px-3 py-1.5 rounded-full hover:border-white/50 cursor-pointer transition-all"
                            }
                          >
                            {isSelected ? "✓ " : "+ "}{audience}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error display */}
                  {formError && (
                    <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-[6px] text-xs font-semibold text-red-300">
                      {formError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#FF5A1F] text-[#0B1E3B] font-bold h-[44px] w-full rounded-[6px] hover:opacity-90 transition-all mt-4 cursor-pointer text-sm tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : "SUBMIT INQUIRY →"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
