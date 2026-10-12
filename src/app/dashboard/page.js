"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import { useAuth } from "@/context/AuthContext";
import { useBag } from "@/context/BagContext";
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import {
  getHostDashboardData,
  getHostListings,
  getHostLeads,
  getHostBookings,
  getHostAnalytics,
  getHostRecentActivity
} from "@/lib/hostDashboardService";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout, updateProfile, updatePassword, showToast } = useAuth();
  const { bag, removeFromBag, clearBag } = useBag();

  const tabParam = searchParams?.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "overview");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Data states
  const [enquiries, setEnquiries] = useState([]);
  const [brandRequests, setBrandRequests] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    niche: "",
    goals: [],
    primary_goal: "",
    budget_band: "",
    geography: "",
    timeline: ""
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Host Dashboard states
  const [hostDashboardOverview, setHostDashboardOverview] = useState(null);
  const [hostDashboardListings, setHostDashboardListings] = useState([]);
  const [hostDashboardLeads, setHostDashboardLeads] = useState([]);
  const [hostDashboardBookings, setHostDashboardBookings] = useState([]);
  const [hostDashboardRecentActivity, setHostDashboardRecentActivity] = useState([]);

  // Fetch all user activity and requests
  const loadUserActivity = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      // 1. Load Enquiries
      const enqRes = await fetch("/api/enquiry");
      const enqData = await enqRes.json();
      if (enqData.enquiries) {
        setEnquiries(enqData.enquiries);
      }

      // 2. Load Brand Media Requests
      const brRes = await fetch("/api/brand-requests");
      const brData = await brRes.json();
      if (brData.brand_requests) {
        setBrandRequests(brData.brand_requests);
      }

      // 3. Load Saved Listings from Supabase if available
      try {
        const savedRes = await fetch("/api/saved-listings");
        const savedData = await savedRes.json();
        if (savedData.saved_listings && savedData.saved_listings.length > 0) {
          setSavedListings(savedData.saved_listings.map((s) => s.listing_data || s));
        } else {
          setSavedListings(bag || []);
        }
      } catch (_) {
        setSavedListings(bag || []);
      }

      // 4. Host portal data if host
      if (user.role === "host") {
        try {
          const overviewData = await getHostDashboardData(user.account_id || user.id);
          const listingsData = await getHostListings(user.account_id || user.id);
          const leadsData = await getHostLeads(user.account_id || user.id);
          const bookingsData = await getHostBookings(user.account_id || user.id);
          const activityData = await getHostRecentActivity(user.account_id || user.id);

          setHostDashboardOverview(overviewData);
          setHostDashboardListings(listingsData);
          setHostDashboardLeads(leadsData);
          setHostDashboardBookings(bookingsData);
          setHostDashboardRecentActivity(activityData);
        } catch (err) {
          console.warn("Host portal data fetch notice:", err);
        }
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setDataLoading(false);
    }
  }, [user, bag]);

  // Sync profile form when user updates
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        company: user.company || "",
        niche: user.profile?.niche || "",
        goals: user.profile?.goals || [],
        primary_goal: user.profile?.primary_goal || "",
        budget_band: user.profile?.budget_band || "",
        geography: user.profile?.geography || "",
        timeline: user.profile?.timeline || ""
      });
      loadUserActivity();
    }
  }, [user, loadUserActivity]);

  // Profile Save handler
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await updateProfile({
        full_name: profileForm.name,
        name: profileForm.name,
        phone: profileForm.phone,
        company: profileForm.company,
        niche: profileForm.niche,
        goals: profileForm.goals,
        primary_goal: profileForm.primary_goal,
        budget_band: profileForm.budget_band,
        geography: profileForm.geography,
        timeline: profileForm.timeline
      });
      if (!res?.error) {
        showToast("Profile settings updated successfully!");
      }
    } catch (err) {
      showToast("Unable to save profile changes.", "error");
    } finally {
      setProfileSaving(false);
    }
  };

  // Password Update handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await updatePassword(passwordForm.newPassword);
      if (res.success) {
        setPasswordForm({ newPassword: "", confirmPassword: "" });
        showToast("Password updated successfully!");
      } else {
        showToast(res.error || "Failed to update password.", "error");
      }
    } catch (err) {
      showToast("Unable to update password.", "error");
    } finally {
      setPasswordSaving(false);
    }
  };

  // DPDP Data Export handler
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
        a.download = `otz-account-data-${user.id.substring(0, 8)}.json`;
        a.click();
        showToast("Account data exported successfully.");
      }
    } catch (err) {
      showToast("Failed to export data.", "error");
    }
  };

  // DPDP Account Deletion handler
  const handleAccountDelete = async () => {
    if (!window.confirm("CONFIRM ACCOUNT DELETION: Are you sure you want to request complete account deletion? Data is retained for settling enquiries for 30 days before permanent vault purge.")) {
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
        showToast("Account deletion requested. Logging out session.");
        logout();
      }
    } catch (err) {
      showToast("Failed to request account deletion.", "error");
    }
  };

  // Trigger login modal
  const openLogin = () => {
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  };

  // Helper for Status Badge
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "confirmed" || s === "approved" || s === "completed" || s === "live") {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
    }
    if (s === "proposal shared" || s === "in review" || s === "quote shared" || s === "contacted") {
      return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
    }
    return "bg-[var(--action-primary)]/10 text-[var(--action-primary)] border border-[var(--action-primary)]/30";
  };

  if (authLoading) {
    return (
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-white text-xs font-bold animate-pulse flex items-center gap-2">
          <MdiIcon name="loading" className="text-lg animate-spin text-[var(--action-primary)]" />
          <span>Loading Account Coordinates...</span>
        </div>
      </div>
    );
  }

  // Unauthenticated Protected State
  if (!user) {
    return (
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-white flex flex-col items-center justify-center p-6 text-center font-sans space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-[#0B1E3B] border border-[var(--border-default)] flex items-center justify-center text-3xl text-[var(--action-primary)] shadow-xl">
          <MdiIcon name="lock-outline" className="animate-pulse" />
        </div>
        <h2 className="text-2xl font-black font-display">Personal OTZ Account</h2>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
          Please sign in to access your media inquiries, campaign rate cards, saved advertising spaces, and profile settings.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => router.push("/login")}
            className="btn-primary px-6 font-bold text-xs"
            style={{ color: "#0B1E3B" }}
          >
            Sign In with Email / Google
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="btn-secondary px-6 font-bold text-xs"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const isHost = user.role === "host";

  return (
    <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] pb-20 relative overflow-hidden font-sans">
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={35}
        radialFadeEnd={80}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar onLogoClick={() => router.push("/")} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 space-y-8 relative z-10 text-left">
        
        {/* Account Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-default)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>AUTHENTICATED ACCOUNT &bull; {user.role === "admin" ? "ADMINISTRATOR" : user.role === "host" ? "MEDIA OWNER" : "BRAND ACCOUNT"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
              {user.name ? `${user.name}` : "My Account"}
              {user.company && user.company !== "Personal Account" && (
                <span className="text-xs font-semibold text-slate-400 ml-2 font-sans">
                  ({user.company})
                </span>
              )}
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              {user.email} {user.phone ? `• +91 ${user.phone}` : ""}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap p-1 bg-[#132A4F] rounded-xl border border-[var(--border-default)]">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "overview" ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "requests" ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              My Requests ({brandRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("enquiries")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "enquiries" ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              My Enquiries ({enquiries.length})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "saved" ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Saved ({savedListings.length || bag.length})
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === "settings" ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Settings
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-1"
            >
              <MdiIcon name="logout" className="text-sm mr-1" />
              Log Out
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#132A4F] border border-[var(--border-default)] p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  <span>Campaign Enquiries</span>
                  <MdiIcon name="message-text-outline" className="text-base text-[var(--action-primary)]" />
                </div>
                <div className="text-3xl font-black font-display text-white">
                  {enquiries.length}
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">Direct marketplace queries</p>
              </div>

              <div className="bg-[#132A4F] border border-[var(--border-default)] p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  <span>Media Requests</span>
                  <MdiIcon name="bullhorn-outline" className="text-base text-blue-400" />
                </div>
                <div className="text-3xl font-black font-display text-white">
                  {brandRequests.length}
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">Rate cards & channel proposals</p>
              </div>

              <div className="bg-[#132A4F] border border-[var(--border-default)] p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  <span>Saved Listings</span>
                  <MdiIcon name="bookmark-outline" className="text-base text-emerald-400" />
                </div>
                <div className="text-3xl font-black font-display text-white">
                  {savedListings.length || bag.length}
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">Bookmarked media spaces</p>
              </div>

              <div className="bg-[#132A4F] border border-[var(--border-default)] p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  <span>Account Status</span>
                  <MdiIcon name="shield-check" className="text-base text-emerald-400" />
                </div>
                <div className="text-xl font-black font-display text-emerald-400 pt-1">
                  Active & Verified
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">Full OTZ access granted</p>
              </div>
            </div>

            {/* Quick Actions & Media Discovery */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0B1E3B] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--action-primary)]/10 text-[var(--action-primary)] text-[10px] font-bold uppercase">
                    <MdiIcon name="compass-outline" /> Media Discovery
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Explore Available Inventory</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Search over verified billboards, transit networks, and digital screen clusters across top metros.
                  </p>
                </div>
                <Link
                  href="/for-brands"
                  className="btn-primary w-fit text-xs font-bold px-4"
                  style={{ color: "#0B1E3B" }}
                >
                  Browse Media Spaces
                </Link>
              </div>

              <div className="bg-[#0B1E3B] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                    <MdiIcon name="calculator-variant-outline" /> Planning Desk
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Media Planning Calculator</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Estimate impressions, CPM targets, and optimal channel budget allocations.
                  </p>
                </div>
                <Link
                  href="/media-planning"
                  className="btn-secondary w-fit text-xs font-bold px-4"
                >
                  Launch Media Planner
                </Link>
              </div>

              <div className="bg-[#0B1E3B] border border-[var(--border-default)] p-6 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                    <MdiIcon name="bullhorn" /> Direct Buying
                  </div>
                  <h3 className="text-lg font-bold text-white font-display">Channel Rate Cards</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Request official rate cards for OOH, Cinema, Transit, Radio, and TV verticals.
                  </p>
                </div>
                <Link
                  href="/media-buying"
                  className="btn-secondary w-fit text-xs font-bold px-4"
                >
                  Request Rate Cards
                </Link>
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Recent Account Activity</h3>
              
              {enquiries.length === 0 && brandRequests.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#0B1E3B] text-[var(--action-primary)] flex items-center justify-center mx-auto text-xl">
                    <MdiIcon name="tray-alert" />
                  </div>
                  <p className="text-xs font-bold text-white">No Activity Records Found</p>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                    You haven&apos;t submitted any campaign enquiries or media requests yet. Explore our media channels to get started.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/for-brands"
                      className="btn-primary text-xs font-bold px-5"
                      style={{ color: "#0B1E3B" }}
                    >
                      Explore Marketplace
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {brandRequests.slice(0, 3).map((br, idx) => (
                    <div key={`br-${idx}`} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-base shrink-0">
                          <MdiIcon name="bullhorn-outline" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            Media Request: <span className="text-[var(--action-primary)]">{br.media_channel}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Submitted on {new Date(br.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusBadge(br.status)}`}>
                        {br.status || "New"}
                      </span>
                    </div>
                  ))}

                  {enquiries.slice(0, 3).map((enq, idx) => (
                    <div key={`enq-${idx}`} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--action-primary)]/10 text-[var(--action-primary)] flex items-center justify-center text-base shrink-0">
                          <MdiIcon name="message-text-outline" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-sm">
                            {enq.listing_title || "Marketplace Listing Enquiry"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(enq.created_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusBadge(enq.stage)}`}>
                        {enq.stage || "Received"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY REQUESTS (Brand Media Requests) */}
        {activeTab === "requests" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-white">Media Proposals & Rate Card Requests</h2>
                <p className="text-xs text-[var(--text-secondary)]">Channel inquiries submitted through the media buying vertical.</p>
              </div>
              <Link
                href="/media-buying"
                className="btn-primary text-xs font-bold px-4"
                style={{ color: "#0B1E3B" }}
              >
                + New Media Request
              </Link>
            </div>

            {brandRequests.length === 0 ? (
              <div className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#0B1E3B] text-[var(--action-primary)] flex items-center justify-center mx-auto text-2xl">
                  <MdiIcon name="bullhorn-outline" />
                </div>
                <h3 className="text-sm font-bold text-white">No Media Requests Yet</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Submit a media vertical request to receive verified rate cards, audience heatmaps, and custom placement proposals.
                </p>
                <div className="pt-2">
                  <Link
                    href="/media-buying"
                    className="btn-primary text-xs font-bold px-5"
                    style={{ color: "#0B1E3B" }}
                  >
                    Explore Media Channels
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandRequests.map((req) => (
                  <div key={req.id} className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          CHANNEL VERTICAL
                        </span>
                        <h4 className="text-base font-bold text-white">{req.media_channel}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${getStatusBadge(req.status)}`}>
                        {req.status || "New"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">COMPANY</span>
                        <span className="text-white font-bold">{req.company_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">CONTACT</span>
                        <span className="text-slate-200">{req.phone}</span>
                      </div>
                    </div>

                    {req.request_details && typeof req.request_details === "object" && (
                      <div className="p-3 bg-[#0B1E3B] rounded-xl text-xs space-y-1">
                        {req.request_details.industry && (
                          <p className="text-slate-300">
                            <span className="font-bold text-slate-400">Industry:</span> {req.request_details.industry}
                          </p>
                        )}
                        {req.request_details.target_audiences && (
                          <p className="text-slate-300">
                            <span className="font-bold text-slate-400">Target Audiences:</span> {Array.isArray(req.request_details.target_audiences) ? req.request_details.target_audiences.join(", ") : req.request_details.target_audiences}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-1">
                      <span>ID: {req.id.substring(0, 8)}</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY ENQUIRIES */}
        {activeTab === "enquiries" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-white">Direct Marketplace Enquiries</h2>
                <p className="text-xs text-[var(--text-secondary)]">Inquiries submitted for specific billboard, transit, or event listings.</p>
              </div>
              <Link
                href="/for-brands"
                className="btn-primary text-xs font-bold px-4"
                style={{ color: "#0B1E3B" }}
              >
                Browse Inventory
              </Link>
            </div>

            {enquiries.length === 0 ? (
              <div className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#0B1E3B] text-[var(--action-primary)] flex items-center justify-center mx-auto text-2xl">
                  <MdiIcon name="message-text-outline" />
                </div>
                <h3 className="text-sm font-bold text-white">No Marketplace Enquiries Yet</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Browse our high-recall advertising spaces and connect directly with media inventory managers.
                </p>
                <div className="pt-2">
                  <Link
                    href="/for-brands"
                    className="btn-primary text-xs font-bold px-5"
                    style={{ color: "#0B1E3B" }}
                  >
                    View All Spaces
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {enquiries.map((enq) => (
                  <div key={enq.id} className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          LISTING / SERVICE
                        </span>
                        <h4 className="text-base font-bold text-white">{enq.listing_title || "Marketplace Space Inquiry"}</h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold self-start sm:self-center ${getStatusBadge(enq.stage)}`}>
                        {enq.stage || "Enquiry received"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed bg-[#0B1E3B] p-3.5 rounded-xl border border-white/5">
                      <p className="font-semibold text-slate-400 mb-1 text-[10px] uppercase">Message Details:</p>
                      <p className="whitespace-pre-line">{enq.message}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {enq.budget_band && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">BUDGET</span>
                          <span className="text-white font-bold">{enq.budget_band}</span>
                        </div>
                      )}
                      {enq.timeline && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">TIMELINE</span>
                          <span className="text-white font-bold">{enq.timeline}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">SUBMITTED ON</span>
                        <span className="text-slate-300">{new Date(enq.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED LISTINGS */}
        {activeTab === "saved" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold font-display text-white">Saved Media Spaces</h2>
                <p className="text-xs text-[var(--text-secondary)]">Items added to your campaign bag for evaluation and bulk proposal requests.</p>
              </div>
              {bag.length > 0 && (
                <button
                  onClick={clearBag}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {bag.length === 0 && savedListings.length === 0 ? (
              <div className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#0B1E3B] text-[var(--action-primary)] flex items-center justify-center mx-auto text-2xl">
                  <MdiIcon name="bookmark-outline" />
                </div>
                <h3 className="text-sm font-bold text-white">No Saved Media Spaces</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Click the bookmark icon or &ldquo;Add to Campaign&rdquo; on any media listing to save it here.
                </p>
                <div className="pt-2">
                  <Link
                    href="/for-brands"
                    className="btn-primary text-xs font-bold px-5"
                    style={{ color: "#0B1E3B" }}
                  >
                    Browse Spaces
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(bag.length > 0 ? bag : savedListings).map((item) => (
                  <div key={item.id} className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-[var(--action-primary)]/10 text-[var(--action-primary)] text-[10px] font-bold">
                          {item.subCategory || item.category || "Mass Media"}
                        </span>
                        <button
                          onClick={() => removeFromBag(item.id)}
                          className="text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                          title="Remove from saved"
                        >
                          <MdiIcon name="close" className="text-base" />
                        </button>
                      </div>
                      <h4 className="text-base font-bold text-white line-clamp-2">{item.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MdiIcon name="map-marker-outline" className="text-xs text-[var(--action-primary)]" />
                        <span>{item.location || "National"}</span>
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">DAILY RATE</span>
                        <span className="text-sm font-bold text-white">₹{(item.dailyRate || item.price || 0).toLocaleString()}</span>
                      </div>
                      <Link
                        href={`/listings/${item.id}`}
                        className="btn-primary text-xs font-bold px-3 py-1.5 h-8"
                        style={{ color: "#0B1E3B" }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SETTINGS & PERSONAL INFO */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* Left Column: Personal Information Form */}
            <div className="lg:col-span-7 bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold font-display text-white">Personal Information</h3>
                <p className="text-xs text-[var(--text-secondary)]">Update your profile information and campaign preferences.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="input-field focus-ring"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Company / Brand</label>
                    <input
                      type="text"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                      className="input-field focus-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Email (Verified)</label>
                    <input
                      type="email"
                      disabled
                      value={profileForm.email}
                      className="input-field focus-ring opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, "") })}
                      placeholder="9999999999"
                      className="input-field focus-ring"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Campaign & Brand Focus</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs text-slate-400 font-semibold">Primary Industry Niche</label>
                      <input
                        type="text"
                        value={profileForm.niche}
                        onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
                        placeholder="e.g. FMCG, Tech, Automotive"
                        className="input-field focus-ring"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs text-slate-400 font-semibold">Preferred Budget Band</label>
                      <input
                        type="text"
                        value={profileForm.budget_band}
                        onChange={(e) => setProfileForm({ ...profileForm, budget_band: e.target.value })}
                        placeholder="e.g. ₹50K - ₹2L, ₹2L - ₹10L"
                        className="input-field focus-ring"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="btn-primary font-bold text-xs px-6 shadow-md"
                  style={{ color: "#0B1E3B" }}
                >
                  {profileSaving ? "Saving..." : "Save Profile Changes"}
                </button>
              </form>
            </div>

            {/* Right Column: Security, Change Password & DPDP Tools */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Change Password Card */}
              <div className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <MdiIcon name="lock-reset" className="text-lg text-[var(--action-primary)]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Change Password</h3>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400 font-semibold">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="••••••••"
                        className="input-field focus-ring pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        tabIndex={-1}
                      >
                        <MdiIcon name={showPassword ? "eye-off-outline" : "eye-outline"} className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-slate-400 font-semibold">Confirm Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="input-field focus-ring text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="btn-secondary w-full text-xs font-bold"
                  >
                    {passwordSaving ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Data Export & Account Deletion (DPDP) */}
              <div className="bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <MdiIcon name="shield-account-outline" className="text-lg text-emerald-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Data Privacy & Portability</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Under DPDP compliance, you can export your complete activity portfolio or schedule account deletion.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDataExport}
                    className="flex w-full items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#0B1E3B] border border-[var(--border-default)] hover:border-slate-400 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <MdiIcon name="download" className="text-sm text-[var(--action-primary)]" />
                    <span>Export My Account Data (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAccountDelete}
                    className="flex w-full items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold text-red-400 transition-all cursor-pointer"
                  >
                    <MdiIcon name="delete-forever-outline" className="text-sm" />
                    <span>Request Account Deletion</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1E3B] flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[var(--action-primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-[#A5B5CD]">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
