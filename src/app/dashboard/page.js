"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { EdgeIllustration } from "@/components/scrollx/feature-illustrations";
import { VercelCard } from "@/components/scrollx/vercel-card";
import {
  getHostDashboardData,
  getHostListings,
  getHostLeads,
  getHostBookings,
  getHostAnalytics,
  getHostRecentActivity
} from "@/lib/hostDashboardService";

const PerformanceChart = ({ data, range }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-xs">
        No performance records.
      </div>
    );
  }

  const maxViews = Math.max(...data.map(d => d.views), 1);
  const maxLeads = Math.max(...data.map(d => d.leads), 1);

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400">
        <span className="text-slate-300 tracking-wider">Views & Conversion Funnel</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--action-primary)]" /> Views
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-405" /> Leads
          </span>
        </div>
      </div>

      <div className="relative h-48 border border-white/5 rounded-xl bg-white/2 p-4 flex items-end justify-between gap-1 sm:gap-2 overflow-hidden w-full">
        {data.map((item, idx) => {
          const viewsHeight = `${(item.views / maxViews) * 80}%`;
          const leadsHeight = `${(item.leads / maxLeads) * 40}%`;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className="absolute bottom-full mb-2 bg-slate-950 border border-white/10 p-2.5 rounded-lg text-[10px] hidden group-hover:block z-30 pointer-events-none whitespace-nowrap shadow-2xl">
                <p className="font-bold text-white text-xs border-b border-white/5 pb-1 mb-1">{item.name}</p>
                <p className="text-[var(--action-primary)] font-bold">Views: {item.views.toLocaleString()}</p>
                <p className="text-emerald-400 font-bold">Leads: {item.leads}</p>
                {item.bookings !== undefined && (
                  <p className="text-blue-450 font-bold">Bookings: {item.bookings}</p>
                )}
              </div>

              <div className="w-full flex items-end gap-0.5 sm:gap-1 justify-center h-[120px]">
                <div 
                  style={{ height: viewsHeight }} 
                  className="w-2.5 sm:w-4 bg-[var(--action-primary)]/80 rounded-t transition-all group-hover:bg-[var(--action-primary)]" 
                />
                <div 
                  style={{ height: leadsHeight }} 
                  className="w-2.5 sm:w-4 bg-emerald-400/80 rounded-t transition-all group-hover:bg-emerald-400" 
                />
              </div>

              <span className="text-[9px] font-bold text-slate-500 mt-2 block truncate w-full text-center">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();

  // Session & UI States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // brand: "overview" | "profile" | "settings"; host: "listings" | "submit" | "enquiries" | "settings"

  // Brand Profile editor state
  const [profileForm, setProfileForm] = useState({
    niche: "",
    goals: [],
    primary_goal: "",
    budget_band: "",
    geography: "",
    timeline: ""
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Host Listing submission state
  const [listingForm, setListingForm] = useState({
    title: "",
    media_type: "OOH",
    parent_network: "",
    geography: "Mumbai",
    niche_tags: "FMCG",
    language: "English",
    visibility_metric: "",
    reach_source: "",
    price_band: "₹10K - ₹50K",
    raw_price: "",
    formats: "",
    rateCardName: "",
    specs: ""
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Enquiries & Listings data states
  const [enquiries, setEnquiries] = useState([]);
  const [hostListings, setHostListings] = useState([]);

  // Host Dashboard data states (fetched from service abstraction)
  const [hostDashboardOverview, setHostDashboardOverview] = useState(null);
  const [hostDashboardListings, setHostDashboardListings] = useState([]);
  const [hostDashboardLeads, setHostDashboardLeads] = useState([]);
  const [hostDashboardBookings, setHostDashboardBookings] = useState([]);
  const [hostDashboardRecentActivity, setHostDashboardRecentActivity] = useState([]);
  const [hostDashboardAnalytics, setHostDashboardAnalytics] = useState([]);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("30days");
  const [hostDashboardLoading, setHostDashboardLoading] = useState(false);

  // Fetch session & load dependencies
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-session" })
        });
        const data = await res.json();
        if (!active) return;
        
        if (data.user) {
          setUser(data.user);
          
          // If brand, populate profile editor
          if (data.user.role === "brand" && data.user.profile) {
            const prof = data.user.profile;
            setProfileForm({
              niche: prof.niche || "",
              goals: prof.goals || [],
              primary_goal: prof.primary_goal || "",
              budget_band: prof.budget_band || "",
              geography: prof.geography || "",
              timeline: prof.timeline || ""
            });
          }

          // Fetch Enquiries
          const enqRes = await fetch("/api/enquiry");
          const enqData = await enqRes.json();
          if (active && enqData.enquiries) {
            setEnquiries(enqData.enquiries);
          }

          // Fetch Listings (if host)
          if (data.user.role === "host") {
            const listRes = await fetch("/api/listings");
            const listData = await listRes.json();
            if (active && listData.listings) {
              // Filter host-owned listings
              const owned = listData.listings.filter(l => l.owner_account_id === data.user.account_id);
              setHostListings(owned);
            }

            // Load Host Portal Dashboard details from service abstraction
            try {
              const overviewData = await getHostDashboardData(data.user.account_id);
              const listingsData = await getHostListings(data.user.account_id);
              const leadsData = await getHostLeads(data.user.account_id);
              const bookingsData = await getHostBookings(data.user.account_id);
              const activityData = await getHostRecentActivity(data.user.account_id);
              const analyticsData = await getHostAnalytics(data.user.account_id, analyticsTimeRange);

              if (active) {
                setHostDashboardOverview(overviewData);
                setHostDashboardListings(listingsData);
                setHostDashboardLeads(leadsData);
                setHostDashboardBookings(bookingsData);
                setHostDashboardRecentActivity(activityData);
                setHostDashboardAnalytics(analyticsData);
              }
            } catch (err) {
              console.error("Failed to load host dashboard details", err);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load dashboard coordinates", e);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { active = false; };
  }, [refreshKey]);

  // Handle refetching analytics when timeRange changes
  useEffect(() => {
    let active = true;
    if (user && user.role === "host") {
      getHostAnalytics(user.account_id, analyticsTimeRange).then((data) => {
        if (active) setHostDashboardAnalytics(data);
      });
    }
    return () => { active = false; };
  }, [analyticsTimeRange, user]);

  // Update profile handler (Brand)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError("");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-profile",
          ...profileForm
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfileSuccess(true);
        // Refresh session profile cache
        const updatedUser = { ...user, profile: data.profile };
        setUser(updatedUser);
        localStorage.setItem("otz_user", JSON.stringify(updatedUser));
      } else {
        setProfileError(data.error || "Profile update failed.");
      }
    } catch (err) {
      setProfileError("Server connection failed.");
    }
  };

  // Submit new Listing handler (Host)
  const handleListingSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError("");

    if (!listingForm.title || !listingForm.parent_network || !listingForm.visibility_metric || !listingForm.reach_source || !listingForm.formats) {
      setSubmitError("Please fill out all mandatory listing fields.");
      return;
    }

    try {
      const res = await fetch("/api/listings/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: listingForm.title,
          media_type: listingForm.media_type,
          parent_network: listingForm.parent_network,
          geography: [listingForm.geography],
          niche_tags: [listingForm.niche_tags],
          language: [listingForm.language],
          visibility_metric: listingForm.visibility_metric,
          reach_source: listingForm.reach_source,
          price_band: listingForm.price_band,
          raw_price: listingForm.raw_price,
          formats: listingForm.formats.split(",").map(f => f.trim()),
          specs: listingForm.specs
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        // Reset form
        setListingForm({
          title: "",
          media_type: "OOH",
          parent_network: "",
          geography: "Mumbai",
          niche_tags: "FMCG",
          language: "English",
          visibility_metric: "",
          reach_source: "",
          price_band: "₹10K - ₹50K",
          raw_price: "",
          formats: "",
          rateCardName: "",
          specs: ""
        });
        setRefreshKey(k => k + 1); // Refresh list
      } else {
        setSubmitError(data.error || "Failed to submit listing.");
      }
    } catch (err) {
      setSubmitError("Server connection error.");
    }
  };

  // Download export data (DPDP compliance)
  const handleDataExport = async () => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export-data" })
      });
      const data = await res.json();

      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `otz-user-profile-data.json`;
        a.click();
      }
    } catch (err) {
      alert("Failed to export data portfolio.");
    }
  };

  // Delete account handler (DPDP compliance)
  const handleAccountDelete = async () => {
    if (!window.confirm("CONFIRM DELETION: Are you sure you want to request complete account deletion? Data is retained for settling enquiries for 30 days before permanent vault purge.")) {
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-account" })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.removeItem("otz_user");
        alert("Account deletion scheduled. Logging out session.");
        window.location.href = "/";
      }
    } catch (err) {
      alert("Failed to register account deletion request.");
    }
  };

  // Trigger login trigger modal
  const openLogin = () => {
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  };

  if (loading) {
    return (
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-white text-sm animate-pulse">Loading Workspace Coordinates...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-white flex flex-col items-center justify-center p-6 text-center font-sans space-y-4">
        <MdiIcon name="lock-outline" className="text-5xl text-[var(--action-primary)] animate-pulse" />
        <h2 className="text-2xl font-black font-display">Secure Workspace</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm">
          Please log in with your phone number to access your brand enquiries, listings moderation, or ops details dashboard.
        </p>
        <ShinyButton onClick={openLogin} className="px-8 font-bold">
          Log In Session
        </ShinyButton>
      </div>
    );
  }

  const isBrand = user.role === "brand";
  const isHost = user.role === "host";

  // Categories & options lists matching original
  const niches = ["FMCG", "Technology & SaaS", "Corporate & B2B", "Automobile", "Education", "Real Estate", "Sports & Gaming", "Healthcare", "Fashion & Lifestyle"];
  const priceBands = ["Under ₹10K", "₹10K - ₹50K", "₹50K - ₹2L", "₹2L - ₹10L", "₹10L+"];
  const geographies = ["Mumbai", "Delhi NCR", "Bengaluru", "National Grid", "Regional South", "Regional West"];
  const timelines = ["ASAP (Within 7 days)", "Next 30 days", "Quarterly", "Planning phase"];
  const goalOptions = [
    { value: "awareness", label: "Brand Awareness & Reach" },
    { value: "downloads", label: "App Installs & Signups" },
    { value: "sales", label: "Direct Conversions & Sales" },
    { value: "footfalls", label: "Retail Footfalls & Visits" }
  ];
  const mediaTypes = [
    { value: "OOH", label: "Out of Home (Billboards, Metros)" },
    { value: "TV", label: "Television Channels" },
    { value: "Radio", label: "FM Radio Networks" },
    { value: "Cinema", label: "Movie Screens & Multiplexes" },
    { value: "Digital", label: "Connected TV & OTT Slots" },
    { value: "Influencer", label: "Influencer Placements" },
    { value: "Print", label: "Daily Newspapers & Magazines" }
  ];

  const getStageColorClass = (stage) => {
    switch (stage) {
      case "settled":
        return "bg-emerald-500/10 text-emerald-450 border-emerald-900/30";
      case "audit-report":
      case "active":
        return "bg-blue-500/10 text-blue-400 border-blue-900/30";
      case "in-negotiation":
        return "bg-amber-500/10 text-amber-400 border-amber-900/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-900/30";
    }
  };

  return (
    <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] pb-16 relative overflow-hidden font-sans">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={35}
        radialFadeEnd={80}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar onLogoClick={() => router.push("/")} />

      <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8 relative z-10 text-left">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-default)] pb-6 w-full">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 bg-[var(--action-primary)] rounded-full animate-pulse" />
              <span>SECURE WORKSPACE &bull; ID: @{user.phone}</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display mt-1.5">
              {isBrand ? `${user.company} Brand Desk` : `${user.company} Host Portal`}
            </h1>
          </div>

          {/* Tab Navigation selectors */}
          <div className="flex p-1 bg-[var(--surface-raised)]/60 rounded-xl border border-[var(--border-default)]">
            {isBrand ? (
              <>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "overview" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  My Enquiries
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "profile" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "settings" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "overview" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "listings" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  My Listings
                </button>
                <button
                  onClick={() => setActiveTab("submit")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "submit" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Submit Listing
                </button>
                <button
                  onClick={() => setActiveTab("enquiries")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "enquiries" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Incoming Enquiries
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === "settings" ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Settings
                </button>
              </>
            )}
          </div>
        </div>

        {/* BRAND WORKSPACE PANELS */}
        {isBrand && (
          <div className="space-y-6 animate-fade-in w-full">
            {/* Overview / My Enquiries tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                
                {/* Left Side: Enquiries List */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">My Campaign Enquiries</h3>
                  
                  {enquiries.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {enquiries.map((enq) => (
                        <VercelCard
                          key={enq.id}
                          bordered={true}
                          glowEffect={true}
                          animateOnHover={false}
                          className="p-1 bg-[var(--surface-raised)]/40 rounded-xl text-left w-full h-full"
                        >
                          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                            <div className="space-y-1 max-w-xl text-left">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                                  Enquiry ID: {enq.id}
                                </span>
                                <span className="text-[9px] text-[var(--text-secondary)] font-mono">&bull; {new Date(enq.created_at).toLocaleDateString()}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white">
                                {enq.listingTitle}
                              </h4>
                              <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic line-clamp-2">
                                &ldquo;{enq.message}&rdquo;
                              </p>
                            </div>

                            {/* Pipeline Stage display (Section 6.5) */}
                            <div className="flex items-center gap-4 shrink-0">
                              <div className="text-left">
                                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block">Assignee</span>
                                <span className="text-xs font-bold text-white">{enq.assignee === "ops-unassigned" ? "Awaiting Assignment" : enq.assignee}</span>
                              </div>

                              <div className={`px-4 py-2 rounded-full border text-xs font-bold text-center ${getStageColorClass(enq.stage)}`}>
                                {enq.stage}
                              </div>
                            </div>
                          </div>
                        </VercelCard>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400">
                      <MdiIcon name="file-document-outline" className="text-4xl block mx-auto mb-2 text-slate-500" />
                      <p className="text-xs">No enquiries submitted yet. Visit the catalog to make an enquiry.</p>
                    </div>
                  )}
                </div>

                {/* Right Side: Active Placement Zone Map */}
                <div className="lg:col-span-4 space-y-6 w-full">
                  <VercelCard bordered={true} className="bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl text-left">
                    <div className="w-full">
                      <p className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-[var(--text-secondary)] mb-2">Campaign Placements map</p>
                      <EdgeIllustration />
                    </div>
                  </VercelCard>
                </div>
              </div>
            )}

            {/* Edit Profile tab (Section 2.8) */}
            {activeTab === "profile" && (
              <VercelCard bordered={true} className="p-2 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl w-full text-left font-sans">
                <div className="p-6 space-y-6 w-full">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Edit Brand Profile</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Modifying these metrics will instantly update your default marketplace pre-filters.
                    </p>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Brand Niche</label>
                        <select
                          value={profileForm.niche}
                          onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          <option value="">Select Niche...</option>
                          {niches.map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Budget Band</label>
                        <select
                          value={profileForm.budget_band}
                          onChange={(e) => setProfileForm({ ...profileForm, budget_band: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          <option value="">Select budget range...</option>
                          {priceBands.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Target Location</label>
                        <select
                          value={profileForm.geography}
                          onChange={(e) => setProfileForm({ ...profileForm, geography: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          <option value="">Select target city...</option>
                          {geographies.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Campaign Timeline</label>
                        <select
                          value={profileForm.timeline}
                          onChange={(e) => setProfileForm({ ...profileForm, timeline: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          <option value="">Select timeline...</option>
                          {timelines.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Primary Goal Selector */}
                    <div className="space-y-1 pt-2">
                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Primary Campaign Goal</label>
                      <select
                        value={profileForm.primary_goal}
                        onChange={(e) => setProfileForm({ ...profileForm, primary_goal: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm font-semibold cursor-pointer"
                      >
                        <option value="">Select goal...</option>
                        {goalOptions.map(g => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>

                    {profileSuccess && (
                      <p className="text-xs text-[var(--status-success-text)] font-bold flex items-center gap-1 animate-fade-in bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <MdiIcon name="check-circle-outline" /> Profile details synchronized. Live filters pre-applied.
                      </p>
                    )}

                    {profileError && (
                      <p className="text-xs text-[var(--status-error)] font-bold flex items-center gap-1 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <MdiIcon name="alert-circle-outline" /> {profileError}
                      </p>
                    )}

                    <ShinyButton
                      type="submit"
                      className="px-8 shadow mt-2"
                    >
                      Save Changes & Sync
                    </ShinyButton>
                  </form>
                </div>
              </VercelCard>
            )}
          </div>
        )}

        {/* HOST WORKSPACE PANELS */}
        {isHost && (
          <div className="space-y-6 animate-fade-in w-full">
            
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-[rgba(255,90,31,0.08)] to-transparent border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                  <div className="relative z-10 space-y-1">
                    <h2 className="text-xl md:text-2xl font-black text-white font-display">
                      Welcome back, {user.name.split(" ")[0]} 👋
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">
                      Here's how your media inventory is performing on Sharma Media Networks.
                    </p>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-6 h-12 w-12 rounded-full bg-[var(--action-primary)]/10 text-[var(--action-primary)] flex items-center justify-center text-xl border border-[var(--action-primary)]/20 animate-pulse">
                    <MdiIcon name="hand-wave" />
                  </div>
                </div>

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Total Listings */}
                  <VercelCard bordered={true} className="p-4 bg-[var(--surface-raised)]/40 hover:border-white/20 transition-all rounded-xl">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Total Listings</span>
                      <h4 className="text-2xl font-black text-white font-display">
                        {hostDashboardOverview?.totalListings || 0}
                      </h4>
                      <span className="text-[9px] text-emerald-400 font-bold block">100% cataloged</span>
                    </div>
                  </VercelCard>

                  {/* Active Listings */}
                  <VercelCard bordered={true} className="p-4 bg-[var(--surface-raised)]/40 hover:border-white/20 transition-all rounded-xl">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Active Listings</span>
                      <h4 className="text-2xl font-black text-emerald-400 font-display">
                        {hostDashboardOverview?.activeListings || 0}
                      </h4>
                      <span className="text-[9px] text-[var(--text-secondary)] font-bold block">
                        {hostDashboardOverview?.totalListings ? Math.round((hostDashboardOverview.activeListings / hostDashboardOverview.totalListings) * 100) : 0}% live
                      </span>
                    </div>
                  </VercelCard>

                  {/* Total Leads */}
                  <VercelCard bordered={true} className="p-4 bg-[var(--surface-raised)]/40 hover:border-white/20 transition-all rounded-xl">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Total Leads</span>
                      <h4 className="text-2xl font-black text-white font-display">
                        {hostDashboardOverview?.totalLeads || 0}
                      </h4>
                      <span className="text-[9px] text-[var(--action-primary)] font-bold block">+18% this month</span>
                    </div>
                  </VercelCard>

                  {/* Active Bookings */}
                  <VercelCard bordered={true} className="p-4 bg-[var(--surface-raised)]/40 hover:border-white/20 transition-all rounded-xl">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Active Bookings</span>
                      <h4 className="text-2xl font-black text-white font-display">
                        {hostDashboardOverview?.activeBookings || 0}
                      </h4>
                      <span className="text-[9px] text-blue-400 font-bold block">4 campaigns running</span>
                    </div>
                  </VercelCard>

                  {/* Estimated Revenue */}
                  <VercelCard bordered={true} className="p-4 bg-[var(--surface-raised)]/40 hover:border-white/20 transition-all rounded-xl col-span-2 sm:col-span-1">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Est. Revenue</span>
                      <h4 className="text-2xl font-black text-[var(--action-primary)] font-display">
                        ₹{(hostDashboardOverview?.estimatedRevenue ? (hostDashboardOverview.estimatedRevenue / 100000).toFixed(2) : 0)}L
                      </h4>
                      <span className="text-[9px] text-emerald-400 font-bold block">Settle pending: ₹45K</span>
                    </div>
                  </VercelCard>

                  {/* Average Views */}
                  <VercelCard bordered={true} className="p-4 bg-[var(--surface-raised)]/40 hover:border-white/20 transition-all rounded-xl">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Average Views</span>
                      <h4 className="text-2xl font-black text-white font-display">
                        {(hostDashboardOverview?.averageViews ? hostDashboardOverview.averageViews.toLocaleString() : 0)}
                      </h4>
                      <span className="text-[9px] text-slate-500 font-bold block">per active slot</span>
                    </div>
                  </VercelCard>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Performance Chart & Top listings */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    {/* Performance Analytics Card */}
                    <VercelCard bordered={true} className="p-6 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
                          <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Performance Analytics</h3>
                            <p className="text-[10px] text-[var(--text-secondary)]">Exposing real-time views and conversion performance metrics.</p>
                          </div>

                          {/* Time Range Toggle */}
                          <div className="flex bg-slate-900 border border-white/5 p-1 rounded-lg">
                            {["7days", "30days", "90days"].map((range) => (
                              <button
                                key={range}
                                onClick={() => setAnalyticsTimeRange(range)}
                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  analyticsTimeRange === range
                                    ? "bg-[var(--action-primary)] text-[#0B1E3B]"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                {range === "7days" ? "7D" : range === "30days" ? "30D" : "90D"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Rendering our Custom Lightweight Responsive SVG Chart component */}
                        <PerformanceChart data={hostDashboardAnalytics} range={analyticsTimeRange} />
                      </div>
                    </VercelCard>

                    {/* Top Performing Listings */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white">Top Performing Inventory</h3>
                        <button
                          onClick={() => setActiveTab("listings")}
                          className="text-xs font-bold text-[var(--action-primary)] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                        >
                          View All Listings <MdiIcon name="arrow-right" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {hostDashboardListings.slice(0, 4).map((item) => (
                          <VercelCard
                            key={item.id}
                            bordered={true}
                            glowEffect={true}
                            className="bg-[var(--surface-raised)]/40 hover:shadow-lg transition-all rounded-xl overflow-hidden animate-fade-in"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 w-full text-left">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-20 rounded-lg overflow-hidden border border-white/5 bg-slate-900 flex-shrink-0">
                                  <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                                      {item.id}
                                    </span>
                                    <span className="h-1 w-1 bg-slate-600 rounded-full" />
                                    <span className="text-[9px] uppercase font-bold text-[var(--action-primary)]">
                                      {item.media_type}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">{item.title}</h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto text-xs">
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Views</span>
                                  <span className="font-bold text-white">{item.views.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Leads</span>
                                  <span className="font-bold text-white">{item.leads}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Status</span>
                                  <span className="font-bold text-emerald-450 uppercase text-[9px] tracking-wider bg-emerald-500/10 border border-emerald-900/30 px-2 py-0.5 rounded-full">{item.status}</span>
                                </div>
                              </div>
                            </div>
                          </VercelCard>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick Actions, Recent Leads, Activity Stream */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* Quick Actions Panel */}
                    <VercelCard bordered={true} className="p-5 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/5 pb-2">Quick Actions</h3>
                        
                        <div className="flex flex-col gap-2">
                          <ShinyButton
                            onClick={() => setActiveTab("submit")}
                            className="w-full py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                          >
                            <MdiIcon name="plus" className="text-sm" /> Add New Listing
                          </ShinyButton>

                          <button
                            onClick={() => setActiveTab("listings")}
                            className="w-full text-center text-xs font-bold text-slate-300 hover:text-white transition-all py-2.5 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 cursor-pointer flex items-center justify-center gap-2 animate-fade-in"
                          >
                            <MdiIcon name="office-building" className="text-sm text-[var(--action-primary)]" />
                            Manage Listings
                          </button>

                          <button
                            onClick={() => setActiveTab("enquiries")}
                            className="w-full text-center text-xs font-bold text-slate-300 hover:text-white transition-all py-2.5 rounded-xl border border-white/10 hover:border-white/30 bg-white/5 cursor-pointer flex items-center justify-center gap-2 animate-fade-in"
                          >
                            <MdiIcon name="email-outline" className="text-sm text-emerald-400" />
                            Incoming Enquiries
                          </button>
                        </div>

                        {/* Listing Health Overview */}
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                            <span>Listing Health</span>
                            <span>{hostDashboardOverview?.activeListings || 0} / {hostDashboardOverview?.totalListings || 0} Active</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                            <div style={{ width: `${((hostDashboardOverview?.activeListings || 0) / (hostDashboardOverview?.totalListings || 1)) * 100}%` }} className="bg-emerald-500" />
                            <div style={{ width: `${(2 / (hostDashboardOverview?.totalListings || 1)) * 100}%` }} className="bg-amber-500 animate-pulse" />
                            <div style={{ width: `${(1 / (hostDashboardOverview?.totalListings || 1)) * 100}%` }} className="bg-slate-500" />
                          </div>
                          <p className="text-[9px] text-slate-400 italic">2 pending review, 1 draft.</p>
                        </div>
                      </div>
                    </VercelCard>

                    {/* Recent Incoming Leads */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recent Leads</h3>
                        <button
                          onClick={() => setActiveTab("enquiries")}
                          className="text-[10px] font-bold text-[var(--action-primary)] hover:underline cursor-pointer bg-transparent border-none"
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-3">
                        {hostDashboardLeads.slice(0, 3).map((lead) => (
                          <VercelCard
                            key={lead.id}
                            bordered={true}
                            className="p-4 bg-[var(--surface-raised)]/40 hover:border-white/10 transition-all rounded-xl"
                          >
                            <div className="space-y-2 text-left text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-white">{lead.brandName}</span>
                                <span className={`text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                                  lead.status === "New"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-900/30"
                                    : lead.status === "Negotiating"
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-900/30"
                                    : "bg-emerald-500/10 text-emerald-450 border border-emerald-900/30"
                                }`}>
                                  {lead.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-semibold line-clamp-1">{lead.campaignName}</p>
                              <div className="flex justify-between items-center text-[10px] border-t border-white/5 pt-1.5 text-slate-500">
                                <span>Budget: <span className="text-white font-bold">₹{lead.budget.toLocaleString()}</span></span>
                                <span>{lead.date}</span>
                              </div>
                            </div>
                          </VercelCard>
                        ))}
                      </div>
                    </div>

                    {/* Bookings & Enquiries Activity Feed */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recent Activity</h3>
                      
                      <VercelCard bordered={true} className="p-4 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl">
                        <div className="space-y-3">
                          {hostDashboardRecentActivity.slice(0, 4).map((act) => (
                            <div key={act.id} className="flex gap-3 text-xs items-start border-b border-white/5 pb-2.5 last:border-none last:pb-0">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs border ${
                                act.status === "new" ? "bg-blue-500/10 text-blue-450 border-blue-900/20" :
                                act.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-900/20" :
                                act.status === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-900/20" :
                                "bg-slate-500/10 text-slate-400 border-slate-900/20"
                              }`}>
                                <MdiIcon name={
                                  act.status === "new" ? "email-outline" :
                                  act.status === "pending" ? "clock-outline" :
                                  act.status === "approved" ? "check-circle-outline" :
                                  "bell-outline"
                                } className="text-xs" />
                              </div>
                              <div className="space-y-0.5 text-left flex-grow">
                                <p className="font-bold text-white leading-snug">{act.event}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-1">
                                  {act.listingTitle} &bull; <span className="text-slate-500 font-semibold">{act.userCompany}</span>
                                </p>
                                <span className="text-[9px] text-slate-500 font-mono block">{act.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </VercelCard>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* My Listings tab (Section 2.9) */}
            {activeTab === "listings" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">My Registered Properties</h3>

                {hostListings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {hostListings.map((item) => (
                      <VercelCard
                        key={item.id}
                        bordered={true}
                        glowEffect={true}
                        animateOnHover={false}
                        className="p-1 bg-[var(--surface-raised)]/40 rounded-xl text-left w-full h-full"
                      >
                        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                                Listing ID: {item.id}
                              </span>
                              <span className="text-[9px] text-[var(--text-secondary)] font-mono">&bull; {item.media_type}</span>
                            </div>
                            <h4 className="text-sm font-bold text-white">
                              {item.title}
                            </h4>
                            <div className="text-xs text-[var(--text-secondary)] font-semibold flex gap-3">
                              <span>Reach: {item.visibility_metric}</span>
                              <span>Rate: {item.price_band}</span>
                            </div>
                          </div>

                          {/* State review indicators */}
                          <div className="shrink-0 flex items-center gap-3">
                            {item.state === "rejected" && item.rejection_reason && (
                              <span className="text-xs text-[var(--status-error)] font-semibold bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                                Reason: {item.rejection_reason}
                              </span>
                            )}

                            <span className={`px-4 py-2 rounded-full border text-xs font-bold text-center uppercase tracking-wider ${
                              item.state === "published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-900/30"
                                : item.state === "rejected"
                                ? "bg-red-500/10 text-[var(--status-error)] border-red-900/30"
                                : "bg-amber-500/10 text-[var(--status-warning)] border-amber-900/30"
                            }`}>
                              {item.state === "submitted" ? "Under Review" : item.state}
                            </span>
                          </div>
                        </div>
                      </VercelCard>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400">
                    <MdiIcon name="office-building" className="text-4xl block mx-auto mb-2 text-slate-500" />
                    <p className="text-xs">No listings registered yet. Submit your first listing to begin.</p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Listing tab (Section 7.1) */}
            {activeTab === "submit" && (
              <VercelCard bordered={true} className="p-2 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl w-full text-left font-sans">
                <div className="p-6 space-y-6 w-full">
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Register Supply Placement</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Submissions are moderated by the OTZ operations team before going live on the marketplace.
                    </p>
                  </div>

                  <form onSubmit={handleListingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Listing Title</label>
                        <input
                          type="text"
                          value={listingForm.title}
                          onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                          placeholder="Bandra LED Screen Block A"
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Parent Network / Owner</label>
                        <input
                          type="text"
                          value={listingForm.parent_network}
                          onChange={(e) => setListingForm({ ...listingForm, parent_network: e.target.value })}
                          placeholder="Times OOH Media"
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Media Type</label>
                        <select
                          value={listingForm.media_type}
                          onChange={(e) => setListingForm({ ...listingForm, media_type: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          {mediaTypes.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Geography</label>
                        <select
                          value={listingForm.geography}
                          onChange={(e) => setListingForm({ ...listingForm, geography: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          {geographies.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Audience Niche</label>
                        <select
                          value={listingForm.niche_tags}
                          onChange={(e) => setListingForm({ ...listingForm, niche_tags: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          {niches.map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Audited Reach Metric</label>
                        <input
                          type="text"
                          value={listingForm.visibility_metric}
                          onChange={(e) => setListingForm({ ...listingForm, visibility_metric: e.target.value })}
                          placeholder="1.2M weekly views"
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Reach Data Source</label>
                        <input
                          type="text"
                          value={listingForm.reach_source}
                          onChange={(e) => setListingForm({ ...listingForm, reach_source: e.target.value })}
                          placeholder="BARC Outdoor June 2026"
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Cost Band</label>
                        <select
                          value={listingForm.price_band}
                          onChange={(e) => setListingForm({ ...listingForm, price_band: e.target.value })}
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm cursor-pointer"
                        >
                          {priceBands.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Placement Formats (Comma Separated)</label>
                        <input
                          type="text"
                          value={listingForm.formats}
                          onChange={(e) => setListingForm({ ...listingForm, formats: e.target.value })}
                          placeholder="15s loop slot, 30s loop slot, Static gantry"
                          className="w-full h-11 px-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg focus:outline-none focus:border-[var(--action-primary)] text-sm"
                        />
                      </div>
                    </div>

                    {/* Rate card mock file upload (Section 7.1) */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Upload Rate Card / Spec Deck (Mock scan)</label>
                      <div className="border-2 border-dashed border-[var(--border-default)] p-4 rounded-xl text-center hover:bg-[var(--surface-hover)] transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          onChange={(e) => setListingForm({ ...listingForm, rateCardName: e.target.files[0]?.name || "" })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <MdiIcon name="cloud-upload-outline" className="text-3xl text-slate-550 block mx-auto mb-1" />
                        <span className="text-xs font-bold text-white block">
                          {listingForm.rateCardName ? `Uploaded: ${listingForm.rateCardName} (Verified Safe)` : "Drag & drop or click to upload proposal sheet"}
                        </span>
                        <span className="text-[9px] text-[var(--text-secondary)] block">PDF, PPTX or JPG (Size Limit 10MB)</span>
                      </div>
                    </div>

                    {submitSuccess && (
                      <p className="text-xs text-[var(--status-success-text)] font-bold flex items-center gap-1 animate-fade-in bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                        <MdiIcon name="check-circle-outline" /> Listing successfully queued. Operations has been notified.
                      </p>
                    )}

                    {submitError && (
                      <p className="text-xs text-[var(--status-error)] font-bold flex items-center gap-1 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <MdiIcon name="alert-circle-outline" /> {submitError}
                      </p>
                    )}

                    <ShinyButton
                      type="submit"
                      className="px-8 shadow mt-2"
                    >
                      Submit for Operations Review
                    </ShinyButton>
                  </form>
                </div>
              </VercelCard>
            )}

            {/* Host Enquiries received tab (Section 7.3) */}
            {activeTab === "enquiries" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Enquiries Received on my Properties</h3>

                {enquiries.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {enquiries.map((enq) => (
                      <VercelCard
                        key={enq.id}
                        bordered={true}
                        glowEffect={true}
                        animateOnHover={false}
                        className="p-1 bg-[var(--surface-raised)]/40 rounded-xl text-left w-full h-full font-sans"
                      >
                        <div className="p-6 space-y-4 w-full">
                          <div className="flex justify-between items-start gap-4 w-full">
                            <div className="text-left">
                              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                                Placement: {enq.listingTitle}
                              </span>
                              <h4 className="text-sm font-bold text-white mt-1">
                                Campaign Intent Proposal
                              </h4>
                            </div>

                            <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStageColorClass(enq.stage)}`}>
                              {enq.stage}
                            </div>
                          </div>

                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic p-3 bg-[var(--surface-canvas)] rounded-lg">
                            &ldquo;{enq.message}&rdquo;
                          </p>

                          {/* Brand contact details revealed on sent enquiry */}
                          <div className="p-4 bg-[var(--surface-canvas)] border border-[var(--border-default)] rounded-lg text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block">Brand Name</span>
                              <span className="font-bold text-white">{enq.brandName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block">Company</span>
                              <span className="font-bold text-white">{enq.brandCompany}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase block">Contact Coordinates</span>
                              <span className="font-bold text-white">{enq.brandPhone} | {enq.brandEmail}</span>
                            </div>
                          </div>
                        </div>
                      </VercelCard>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400">
                    <MdiIcon name="email-open-outline" className="text-4xl block mx-auto mb-2 text-slate-500" />
                    <p className="text-xs">No demand inquiries received on your listings yet.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* GENERAL SETTINGS PANEL (Section 2.10) */}
        {activeTab === "settings" && (
          <div className="max-w-2xl bg-[var(--surface-raised)]/40 p-8 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6 animate-fade-in w-full text-left">
            <div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Account Settings</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Manage your credentials, data export portfolios, and vault schedules.
              </p>
            </div>

            <div className="space-y-4">
              {/* Data Portability */}
              <div className="p-5 border border-[var(--border-default)] rounded-xl flex items-center justify-between gap-4 bg-[var(--surface-canvas)]">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase">Download Data Portfolio</h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                    In compliance with DPDP laws, download a full portable JSON export of your credentials, profiles and timeline.
                  </p>
                </div>
                <button
                  onClick={handleDataExport}
                  className="rounded-xl border border-[var(--border-default)] bg-[var(--surface-raised)] text-white hover:bg-[var(--surface-hover)] h-10 px-4 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <MdiIcon name="download-outline" /> Export Data
                </button>
              </div>

              {/* Account Deletion */}
              <div className="p-5 border border-red-950 rounded-xl flex items-center justify-between gap-4 bg-red-950/10">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--status-error)] uppercase">Request Account Deletion</h4>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                    Initiate permanent account removal. A mandatory 30-day vault retention window applies to finalize active transactions.
                  </p>
                </div>
                <button
                  onClick={handleAccountDelete}
                  className="rounded-xl border border-red-900/40 text-[var(--status-error)] hover:bg-red-500/10 h-10 px-4 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <MdiIcon name="delete-outline" /> Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
