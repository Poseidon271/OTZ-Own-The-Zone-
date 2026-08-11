"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

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
      <div className="theme-light min-h-screen bg-[#F6F7F9] flex items-center justify-center">
        <div className="text-slate-900 text-sm animate-pulse">Synchronizing secure session coordinates...</div>
      </div>
    );
  }

  // Logged-out state UI
  if (!user) {
    return (
      <div className="theme-light min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] flex flex-col justify-center items-center p-6 text-center">
        <Navbar onLogoClick={() => router.push("/")} />
        <div className="max-w-md p-8 rounded-2xl bg-white border border-[var(--border-default)] shadow-sm space-y-4">
          <div className="h-14 w-14 bg-red-50 text-[var(--action-primary)] rounded-full flex items-center justify-center mx-auto text-2xl">
            <MdiIcon name="lock-outline" />
          </div>
          <h1 className="text-h2">Workspace Access Gated</h1>
          <p className="text-small text-[var(--text-secondary)] leading-relaxed">
            Please log in or register via our verification wizard to access your campaign coordinates or list inventory.
          </p>
          <button onClick={openLogin} className="btn-primary w-full shadow focus-ring" style={{ color: "#0B1E3B" }}>
            Sign In with Phone OTP
          </button>
        </div>
      </div>
    );
  }

  const isBrand = user.role === "brand";
  const isHost = user.role === "host";

  // Redirection link for ops users
  if (user.role === "ops" || user.role === "admin") {
    return (
      <div className="theme-light min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] flex flex-col justify-center items-center p-6 text-center">
        <Navbar onLogoClick={() => router.push("/")} />
        <div className="max-w-md p-8 rounded-2xl bg-white border border-[var(--border-default)] shadow-sm space-y-4">
          <h1 className="text-h2">Operations Desk</h1>
          <p className="text-small text-[var(--text-secondary)]">Redirecting to the unified administrative console panel...</p>
          <button onClick={() => router.push("/admin")} className="btn-primary w-full" style={{ color: "#0B1E3B" }}>
            Open Admin Ops Console
          </button>
        </div>
      </div>
    );
  }

  // Get dynamic stage colors
  const getStageColorClass = (stage) => {
    const s = stage?.toLowerCase() || "";
    if (s.includes("confirm") || s.includes("live") || s.includes("complete")) {
      return "bg-emerald-50 text-[var(--status-success-text)] border-emerald-200";
    }
    if (s.includes("quote") || s.includes("review")) {
      return "bg-amber-50 text-[var(--status-warning)] border-amber-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="theme-light min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] pb-16">
      <Navbar onLogoClick={() => router.push("/")} />

      <main className="max-w-7xl mx-auto px-6 pt-24 space-y-8">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-default)] pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-bold">
              <span className="h-1.5 w-1.5 bg-[var(--action-primary)] rounded-full animate-pulse" />
              <span>SECURE WORKSPACE &bull; ID: @{user.phone}</span>
            </div>
            <h1 className="text-h1 text-[var(--text-primary)] font-display mt-1">
              {isBrand ? `${user.company} Brand Desk` : `${user.company} Host Portal`}
            </h1>
          </div>

          {/* Tab Navigation selectors */}
          <div className="flex p-1 bg-slate-100 rounded-xl border border-[var(--border-default)]">
            {isBrand ? (
              <>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "overview" ? "bg-[#0B1E3B] text-white" : "text-[var(--text-secondary)] hover:text-black"
                  }`}
                >
                  My Enquiries
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "profile" ? "bg-[#0B1E3B] text-white" : "text-[var(--text-secondary)] hover:text-black"
                  }`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "settings" ? "bg-[#0B1E3B] text-white" : "text-[var(--text-secondary)] hover:text-black"
                  }`}
                >
                  Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "listings" ? "bg-[#0B1E3B] text-white" : "text-[var(--text-secondary)] hover:text-black"
                  }`}
                >
                  My Listings
                </button>
                <button
                  onClick={() => setActiveTab("submit")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "submit" ? "bg-[#0B1E3B] text-white" : "text-[var(--text-secondary)] hover:text-black"
                  }`}
                >
                  Submit Listing
                </button>
                <button
                  onClick={() => setActiveTab("enquiries")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "enquiries" ? "bg-[#0B1E3B] text-white" : "text-[var(--text-secondary)] hover:text-black"
                  }`}
                >
                  Incoming Enquiries
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    activeTab === "settings" ? "bg-[#0B1E3B] text-white" : "text-[var(--text-secondary)] hover:text-black"
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
          <div className="space-y-6 animate-fade-in">
            {/* Overview / My Enquiries tab */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <h3 className="text-h3 font-bold">My Campaign Enquiries</h3>
                
                {enquiries.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {enquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="p-6 bg-white border border-[var(--border-default)] rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                              Enquiry ID: {enq.id}
                            </span>
                            <span className="text-[9px] text-[var(--text-tertiary)]">&bull; {new Date(enq.created_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-body-strong text-[var(--text-primary)]">
                            {enq.listingTitle}
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic line-clamp-2">
                            &ldquo;{enq.message}&rdquo;
                          </p>
                        </div>

                        {/* Pipeline Stage display (Section 6.5) */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] block text-left md:text-right">Assignee</span>
                            <span className="text-xs font-bold text-[var(--text-primary)]">{enq.assignee === "ops-unassigned" ? "Awaiting Assignment" : enq.assignee}</span>
                          </div>

                          <div className={`px-4 py-2 rounded-full border text-xs font-bold text-center ${getStageColorClass(enq.stage)}`}>
                            {enq.stage}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-white border border-[var(--border-default)] text-center text-slate-400">
                    <MdiIcon name="file-document-outline" className="text-4xl block mx-auto mb-2 text-slate-350" />
                    <p className="text-small">No enquiries submitted yet. Visit the catalog to make an enquiry.</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Profile tab (Section 2.8) */}
            {activeTab === "profile" && (
              <div className="max-w-2xl bg-white p-8 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6">
                <div>
                  <h3 className="text-h3 font-bold">Edit Brand Profile</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Modifying these metrics will instantly update your default marketplace pre-filters.
                  </p>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Brand Niche</label>
                      <select
                        value={profileForm.niche}
                        onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                      >
                        <option value="">Select Niche...</option>
                        {niches.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Budget Band</label>
                      <select
                        value={profileForm.budget_band}
                        onChange={(e) => setProfileForm({ ...profileForm, budget_band: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
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
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Target Location</label>
                      <select
                        value={profileForm.geography}
                        onChange={(e) => setProfileForm({ ...profileForm, geography: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                      >
                        <option value="">Select target city...</option>
                        {geographies.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Campaign Timeline</label>
                      <select
                        value={profileForm.timeline}
                        onChange={(e) => setProfileForm({ ...profileForm, timeline: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
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
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Primary Campaign Goal</label>
                    <select
                      value={profileForm.primary_goal}
                      onChange={(e) => setProfileForm({ ...profileForm, primary_goal: e.target.value })}
                      className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm font-semibold"
                    >
                      <option value="">Select goal...</option>
                      {goalOptions.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  {profileSuccess && (
                    <p className="text-xs text-[var(--status-success-text)] font-bold flex items-center gap-1 animate-fade-in bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <MdiIcon name="check-circle-outline" /> Profile details synchronized. Live filters pre-applied.
                    </p>
                  )}

                  {profileError && (
                    <p className="text-xs text-[var(--status-error)] font-bold flex items-center gap-1 bg-red-50 p-3 rounded-lg">
                      <MdiIcon name="alert-circle-outline" /> {profileError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn-primary px-8 shadow"
                    style={{ color: "#0B1E3B" }}
                  >
                    Save Changes & Sync
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* HOST WORKSPACE PANELS */}
        {isHost && (
          <div className="space-y-6 animate-fade-in">
            
            {/* My Listings tab (Section 2.9) */}
            {activeTab === "listings" && (
              <div className="space-y-4">
                <h3 className="text-h3 font-bold">My Registered Properties</h3>

                {hostListings.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {hostListings.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 bg-white border border-[var(--border-default)] rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                              Listing ID: {item.id}
                            </span>
                            <span className="text-[9px] text-[var(--text-tertiary)]">&bull; {item.media_type}</span>
                          </div>
                          <h4 className="text-body-strong text-[var(--text-primary)]">
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
                            <span className="text-xs text-[var(--status-error)] font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                              Reason: {item.rejection_reason}
                            </span>
                          )}

                          <span className={`px-4 py-2 rounded-full border text-xs font-bold text-center uppercase tracking-wider ${
                            item.state === "published"
                              ? "bg-emerald-50 text-[var(--status-success-text)] border-emerald-200"
                              : item.state === "rejected"
                              ? "bg-red-50 text-[var(--status-error)] border-red-200"
                              : "bg-amber-50 text-[var(--status-warning)] border-amber-200"
                          }`}>
                            {item.state === "submitted" ? "Under Review" : item.state}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-white border border-[var(--border-default)] text-center text-slate-400">
                    <MdiIcon name="office-building" className="text-4xl block mx-auto mb-2 text-slate-350" />
                    <p className="text-small">No listings registered yet. Submit your first listing to begin.</p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Listing tab (Section 7.1) */}
            {activeTab === "submit" && (
              <div className="max-w-3xl bg-white p-8 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6">
                <div>
                  <h3 className="text-h3 font-bold">Register Supply Placement</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Submissions are moderated by the OTZ operations team before going live on the marketplace.
                  </p>
                </div>

                <form onSubmit={handleListingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Listing Title</label>
                      <input
                        type="text"
                        value={listingForm.title}
                        onChange={(e) => setListingForm({ ...listingForm, title: e.target.value })}
                        placeholder="Bandra LED Screen Block A"
                        className="input-field focus-ring"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Parent Network / Owner</label>
                      <input
                        type="text"
                        value={listingForm.parent_network}
                        onChange={(e) => setListingForm({ ...listingForm, parent_network: e.target.value })}
                        placeholder="Times OOH Media"
                        className="input-field focus-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Media Type</label>
                      <select
                        value={listingForm.media_type}
                        onChange={(e) => setListingForm({ ...listingForm, media_type: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                      >
                        {mediaTypes.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Geography</label>
                      <select
                        value={listingForm.geography}
                        onChange={(e) => setListingForm({ ...listingForm, geography: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                      >
                        {geographies.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Audience Niche</label>
                      <select
                        value={listingForm.niche_tags}
                        onChange={(e) => setListingForm({ ...listingForm, niche_tags: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                      >
                        {niches.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Audited Reach Metric</label>
                      <input
                        type="text"
                        value={listingForm.visibility_metric}
                        onChange={(e) => setListingForm({ ...listingForm, visibility_metric: e.target.value })}
                        placeholder="1.2M weekly views"
                        className="input-field focus-ring"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Reach Data Source</label>
                      <input
                        type="text"
                        value={listingForm.reach_source}
                        onChange={(e) => setListingForm({ ...listingForm, reach_source: e.target.value })}
                        placeholder="BARC Outdoor June 2026"
                        className="input-field focus-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Cost Band</label>
                      <select
                        value={listingForm.price_band}
                        onChange={(e) => setListingForm({ ...listingForm, price_band: e.target.value })}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                      >
                        {priceBands.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Placement Formats (Comma Separated)</label>
                      <input
                        type="text"
                        value={listingForm.formats}
                        onChange={(e) => setListingForm({ ...listingForm, formats: e.target.value })}
                        placeholder="15s loop slot, 30s loop slot, Static gantry"
                        className="input-field focus-ring"
                      />
                    </div>
                  </div>

                  {/* Rate card mock file upload (Section 7.1) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Upload Rate Card / Spec Deck (Mock scan)</label>
                    <div className="border-2 border-dashed border-[var(--border-default)] p-4 rounded-xl text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
                      <input
                        type="file"
                        onChange={(e) => setListingForm({ ...listingForm, rateCardName: e.target.files[0]?.name || "" })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <MdiIcon name="cloud-upload-outline" className="text-3xl text-slate-400 block mx-auto mb-1" />
                      <span className="text-xs font-bold text-slate-600 block">
                        {listingForm.rateCardName ? `Uploaded: ${listingForm.rateCardName} (Verified Safe)` : "Drag & drop or click to upload proposal sheet"}
                      </span>
                      <span className="text-[10px] text-slate-400 block">PDF, PPTX or JPG (Size Limit 10MB)</span>
                    </div>
                  </div>

                  {submitSuccess && (
                    <p className="text-xs text-[var(--status-success-text)] font-bold flex items-center gap-1 animate-fade-in bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <MdiIcon name="check-circle-outline" /> Listing successfully queued. Operations has been notified.
                    </p>
                  )}

                  {submitError && (
                    <p className="text-xs text-[var(--status-error)] font-bold flex items-center gap-1 bg-red-50 p-3 rounded-lg">
                      <MdiIcon name="alert-circle-outline" /> {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn-primary px-8 shadow"
                    style={{ color: "#0B1E3B" }}
                  >
                    Submit for Operations Review
                  </button>
                </form>
              </div>
            )}

            {/* Host Enquiries received tab (Section 7.3) */}
            {activeTab === "enquiries" && (
              <div className="space-y-4">
                <h3 className="text-h3 font-bold">Enquiries Received on my Properties</h3>

                {enquiries.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {enquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="p-6 bg-white border border-[var(--border-default)] rounded-xl shadow-sm space-y-4"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                              Placement: {enq.listingTitle}
                            </span>
                            <h4 className="text-body-strong text-[var(--text-primary)]">
                              Campaign Intent Proposal
                            </h4>
                          </div>

                          <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStageColorClass(enq.stage)}`}>
                            {enq.stage}
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic p-3 bg-slate-50 rounded-lg">
                          &ldquo;{enq.message}&rdquo;
                        </p>

                        {/* Brand contact details revealed on sent enquiry */}
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Brand Name</span>
                            <span className="font-bold text-[var(--text-primary)]">{enq.brandName}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Company</span>
                            <span className="font-bold text-[var(--text-primary)]">{enq.brandCompany}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase block">Contact Coordinates</span>
                            <span className="font-bold text-[var(--text-primary)]">{enq.brandPhone} | {enq.brandEmail}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-white border border-[var(--border-default)] text-center text-slate-400">
                    <MdiIcon name="email-open-outline" className="text-4xl block mx-auto mb-2 text-slate-350" />
                    <p className="text-small">No demand inquiries received on your listings yet.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* GENERAL SETTINGS PANEL (Section 2.10) */}
        {activeTab === "settings" && (
          <div className="max-w-2xl bg-white p-8 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6 animate-fade-in">
            <div>
              <h3 className="text-h3 font-bold">Account Settings</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Manage your credentials, data export portfolios, and vault schedules.
              </p>
            </div>

            <div className="space-y-4">
              {/* Data Portability */}
              <div className="p-5 border border-[var(--border-default)] rounded-xl flex items-center justify-between gap-4 bg-slate-50">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">Download Data Portfolio</h4>
                  <p className="text-caption-default text-[var(--text-secondary)] max-w-sm">
                    In compliance with DPDP laws, download a full portable JSON export of your credentials, profiles and timeline.
                  </p>
                </div>
                <button
                  onClick={handleDataExport}
                  className="btn-secondary h-10 px-4 text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <MdiIcon name="download-outline" /> Export Data
                </button>
              </div>

              {/* Account Deletion */}
              <div className="p-5 border border-red-200 rounded-xl flex items-center justify-between gap-4 bg-red-50/50">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[var(--status-error)] uppercase">Request Account Deletion</h4>
                  <p className="text-caption-default text-[var(--text-secondary)] max-w-sm">
                    Initiate permanent account removal. A mandatory 30-day vault retention window applies to finalize active transactions.
                  </p>
                </div>
                <button
                  onClick={handleAccountDelete}
                  className="btn-secondary border-[var(--status-error)] text-[var(--status-error)] hover:bg-red-50 h-10 px-4 text-xs font-bold flex items-center gap-1.5 shrink-0"
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
