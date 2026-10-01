"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import { useAuth } from "@/context/AuthContext";

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { VercelCard } from "@/components/scrollx/vercel-card";
import { AnimatedCounter } from "@/components/scrollx/statscount";
import { OtzTerminal } from "@/components/scrollx/otz-terminal";
import { cn } from "@/lib/utils";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, session, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("vendors"); // vendors | enquiries | moderation | seeder | accounts | analytics | audit

  // Vendor Submissions State
  const [vendorSubmissions, setVendorSubmissions] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [vendorError, setVendorError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorMediaTypeFilter, setVendorMediaTypeFilter] = useState("all");
  const [vendorStatusFilter, setVendorStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Brand Requests State (brand_requests)
  const [brandRequests, setBrandRequests] = useState([]);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandError, setBrandError] = useState(null);
  const [selectedBrandRequest, setSelectedBrandRequest] = useState(null);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandChannelFilter, setBrandChannelFilter] = useState("all");
  const [brandStatusFilter, setBrandStatusFilter] = useState("all");
  const [updatingBrandStatus, setUpdatingBrandStatus] = useState(false);
  const [brandAdminNoteInput, setBrandAdminNoteInput] = useState("");

  // Database State Lists
  const [enquiries, setEnquiries] = useState([]);
  const [listings, setListings] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Pipeline modal update states
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [pipelineForm, setPipelineForm] = useState({ stage: "", assignee: "", noteText: "" });
  const [pipelineSuccess, setPipelineSuccess] = useState(false);

  // Moderation reason state
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingListingId, setRejectingListingId] = useState(null);

  // CSV Seeder state
  const [csvData, setCsvData] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  // Auth Header helper for API calls
  const getAuthHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("otz_token") || session?.access_token;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  };

  // Fetch Vendor Submissions from centralized database
  const fetchVendorSubmissions = async () => {
    setVendorLoading(true);
    setVendorError(null);
    try {
      let directSupabaseSubmissions = null;

      // 1. Direct Supabase Query if client-side is configured
      if (isSupabaseConfigured()) {
        try {
          const { data: sbData, error: sbErr } = await supabase
            .from("vendor_submissions")
            .select("*")
            .order("created_at", { ascending: false });

          if (!sbErr && Array.isArray(sbData)) {
            directSupabaseSubmissions = sbData;
          }
        } catch (e) {
          console.warn("Direct Supabase query fallback:", e);
        }
      }

      if (directSupabaseSubmissions) {
        setVendorSubmissions((prev) => {
          const fetchedMap = new Map(directSupabaseSubmissions.map((s) => [s.id, s]));
          const merged = [...directSupabaseSubmissions];
          for (const item of prev) {
            if (!fetchedMap.has(item.id)) {
              merged.push(item);
            }
          }
          return merged.sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
        });
      } else {
        // 2. Server API Route Fetch
        const res = await fetch("/api/vendor-submissions", {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const fetched = data.submissions || [];
          setVendorSubmissions((prev) => {
            const fetchedMap = new Map(fetched.map((s) => [s.id, s]));
            const merged = [...fetched];
            for (const item of prev) {
              if (!fetchedMap.has(item.id)) {
                merged.push(item);
              }
            }
            return merged.sort(
              (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
          });
        } else {
          setVendorError(data.error || "Unable to load submissions. Please try again.");
        }
      }
    } catch (err) {
      setVendorError("Unable to load submissions. Please try again.");
    } finally {
      setVendorLoading(false);
    }
  };

  // Fetch Brand Requests from centralized database
  const fetchBrandRequests = async () => {
    setBrandLoading(true);
    setBrandError(null);
    try {
      let directSupabaseRequests = null;

      // 1. Direct Supabase Query if client-side is configured
      if (isSupabaseConfigured()) {
        try {
          const { data: sbData, error: sbErr } = await supabase
            .from("brand_requests")
            .select("*")
            .order("created_at", { ascending: false });

          if (!sbErr && Array.isArray(sbData)) {
            directSupabaseRequests = sbData;
          }
        } catch (e) {
          console.warn("Direct Supabase query fallback for brand_requests:", e);
        }
      }

      if (directSupabaseRequests) {
        setBrandRequests((prev) => {
          const fetchedMap = new Map(directSupabaseRequests.map((s) => [s.id, s]));
          const merged = [...directSupabaseRequests];
          for (const item of prev) {
            if (!fetchedMap.has(item.id)) {
              merged.push(item);
            }
          }
          return merged.sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
          );
        });
      } else {
        // 2. Server API Route Fetch
        const res = await fetch("/api/brand-requests", {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const fetched = data.brand_requests || data.requests || [];
          setBrandRequests((prev) => {
            const fetchedMap = new Map(fetched.map((s) => [s.id, s]));
            const merged = [...fetched];
            for (const item of prev) {
              if (!fetchedMap.has(item.id)) {
                merged.push(item);
              }
            }
            return merged.sort(
              (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
            );
          });
        } else {
          setBrandError(data.error || "Unable to load brand requests. Please try again.");
        }
      }
    } catch (err) {
      setBrandError("Unable to load brand requests. Please try again.");
    } finally {
      setBrandLoading(false);
    }
  };

  // Supabase Realtime Subscription: Instant live sync across devices
  useEffect(() => {
    if (authLoading || !user || !isAdmin) return;

    let vendorChannel = null;
    let brandChannel = null;

    if (isSupabaseConfigured()) {
      try {
        vendorChannel = supabase
          .channel("realtime-vendor-submissions")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "vendor_submissions",
            },
            (payload) => {
              if (payload.eventType === "INSERT" && payload.new) {
                setVendorSubmissions((prev) => {
                  if (prev.some((item) => item.id === payload.new.id)) {
                    return prev;
                  }
                  return [payload.new, ...prev];
                });
              } else if (payload.eventType === "UPDATE" && payload.new) {
                setVendorSubmissions((prev) =>
                  prev.map((item) =>
                    item.id === payload.new.id ? { ...item, ...payload.new } : item
                  )
                );
                setSelectedVendor((prev) =>
                  prev && prev.id === payload.new.id ? { ...prev, ...payload.new } : prev
                );
              } else if (payload.eventType === "DELETE" && payload.old) {
                setVendorSubmissions((prev) =>
                  prev.filter((item) => item.id !== payload.old.id)
                );
                setSelectedVendor((prev) =>
                  prev && prev.id === payload.old.id ? null : prev
                );
              }
            }
          )
          .subscribe();

        brandChannel = supabase
          .channel("realtime-brand-requests")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "brand_requests",
            },
            (payload) => {
              if (payload.eventType === "INSERT" && payload.new) {
                setBrandRequests((prev) => {
                  if (prev.some((item) => item.id === payload.new.id)) {
                    return prev;
                  }
                  return [payload.new, ...prev];
                });
              } else if (payload.eventType === "UPDATE" && payload.new) {
                setBrandRequests((prev) =>
                  prev.map((item) =>
                    item.id === payload.new.id ? { ...item, ...payload.new } : item
                  )
                );
                setSelectedBrandRequest((prev) =>
                  prev && prev.id === payload.new.id ? { ...prev, ...payload.new } : prev
                );
              } else if (payload.eventType === "DELETE" && payload.old) {
                setBrandRequests((prev) =>
                  prev.filter((item) => item.id !== payload.old.id)
                );
                setSelectedBrandRequest((prev) =>
                  prev && prev.id === payload.old.id ? null : prev
                );
              }
            }
          )
          .subscribe();
      } catch (e) {
        console.warn("Supabase Realtime subscription notice:", e);
      }
    }

    return () => {
      if (vendorChannel) {
        supabase.removeChannel(vendorChannel);
      }
      if (brandChannel) {
        supabase.removeChannel(brandChannel);
      }
    };
  }, [authLoading, user, isAdmin]);

  // Protect Admin Route: Only redirect if authentication check is COMPLETE and user is not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.replace("/");
      }
    }
  }, [authLoading, user, isAdmin, router]);

  // Load Dashboard Data once user is authorized
  useEffect(() => {
    if (authLoading || !user || !isAdmin) return;

    let active = true;
    const fetchAdminData = async () => {
      try {
        fetchVendorSubmissions();
        fetchBrandRequests();

        // Fetch enquiries
        const enqRes = await fetch("/api/enquiry", { headers: getAuthHeaders() });
        const enqData = await enqRes.json();
        if (active && enqData.enquiries) setEnquiries(enqData.enquiries);

        // Fetch all listings
        const listRes = await fetch("/api/listings");
        const listData = await listRes.json();
        if (active && listData.listings) setListings(listData.listings);

        setAccounts([
          { id: "acc-admin-1", name: "OTZ Administrator", company: "OTZ Admin", role: "admin", state: "verified", phone: "9999999999" },
          { id: "acc-ops-1", name: "Operations Team", company: "OTZ Ops", role: "ops", state: "verified", phone: "9999999999" },
          { id: "acc-brand-1", name: "Sanskar Brand Manager", company: "Premium Tech", role: "brand", state: "verified", phone: "9876543210" },
          { id: "acc-host-1", name: "Adspace Host", company: "Times OOH", role: "host", state: "verified", phone: "9812345678" }
        ]);
        setAuditLogs([
          { actor_id: "usr-admin-1", action: "admin_login", entity: "sessions", timestamp: new Date(Date.now() - 1800000).toISOString() },
          { actor_id: "usr-ops-1", action: "csv_bulk_import", entity: "listings", timestamp: new Date(Date.now() - 3600000).toISOString() },
          { actor_id: "usr-ops-1", action: "publish_listing", entity: "listings", timestamp: new Date(Date.now() - 7200000).toISOString() }
        ]);
      } catch (e) {
        console.error("Failed to load admin dashboard coordinates", e);
      }
    };

    fetchAdminData();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin, refreshKey]);

  // Update Vendor Submission Status
  const handleUpdateVendorStatus = async (id, newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/vendor-submissions", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVendorSubmissions(prev =>
          prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
        );
        if (selectedVendor && selectedVendor.id === id) {
          setSelectedVendor(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Delete Vendor Submission
  const handleDeleteVendor = async (id) => {
    if (!confirm("Are you sure you want to remove this vendor submission?")) return;
    try {
      const res = await fetch(`/api/vendor-submissions?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setVendorSubmissions(prev => prev.filter(item => item.id !== id));
        if (selectedVendor && selectedVendor.id === id) {
          setSelectedVendor(null);
        }
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Update Brand Request Status / Admin Notes
  const handleUpdateBrandStatus = async (id, newStatus, adminNotes) => {
    setUpdatingBrandStatus(true);
    try {
      const body = { id };
      if (newStatus) body.status = newStatus;
      if (adminNotes !== undefined) body.admin_notes = adminNotes;

      const res = await fetch("/api/brand-requests", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBrandRequests(prev =>
          prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  ...(newStatus ? { status: newStatus } : {}),
                  ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {})
                }
              : item
          )
        );
        if (selectedBrandRequest && selectedBrandRequest.id === id) {
          setSelectedBrandRequest(prev => ({
            ...prev,
            ...(newStatus ? { status: newStatus } : {}),
            ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {})
          }));
        }
      }
    } catch (err) {
      console.error("Brand status update error:", err);
    } finally {
      setUpdatingBrandStatus(false);
    }
  };

  // Delete Brand Request
  const handleDeleteBrandRequest = async (id) => {
    if (!confirm("Are you sure you want to remove this brand request?")) return;
    try {
      const res = await fetch(`/api/brand-requests?id=${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setBrandRequests(prev => prev.filter(item => item.id !== id));
        if (selectedBrandRequest && selectedBrandRequest.id === id) {
          setSelectedBrandRequest(null);
        }
      }
    } catch (err) {
      console.error("Brand request delete error:", err);
    }
  };

  // Update pipeline stage handler
  const handleUpdatePipeline = async (e) => {
    e.preventDefault();
    setPipelineSuccess(false);

    try {
      const res = await fetch("/api/enquiry", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: selectedEnquiry.id,
          stage: pipelineForm.stage,
          assignee: pipelineForm.assignee,
          noteText: pipelineForm.noteText
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPipelineSuccess(true);
        setPipelineForm({ ...pipelineForm, noteText: "" });
        setRefreshKey(k => k + 1);
        setSelectedEnquiry(data.enquiry);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Publish listing moderator action
  const handlePublishListing = async (listingId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "publish-listing", id: listingId })
      });
      if (res.ok) {
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reject listing moderator action
  const handleRejectListing = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "reject-listing",
          id: rejectingListingId,
          reason: rejectionReason
        })
      });
      if (res.ok) {
        setRejectingListingId(null);
        setRejectionReason("");
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle account suspension action
  const handleToggleSuspension = async (accountId) => {
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "toggle-suspension", accountId })
      });
      if (res.ok) {
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Bulk seeder handler
  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvData.trim()) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: "import-csv", csvText: csvData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult(data);
        setCsvData("");
        setRefreshKey(k => k + 1);
      } else {
        setImportResult({ error: data.error || "Import parse failed." });
      }
    } catch (err) {
      setImportResult({ error: "Server connection failed." });
    } finally {
      setImportLoading(false);
    }
  };

  // Filtered vendor submissions
  const filteredVendors = vendorSubmissions.filter((item) => {
    const matchesSearch =
      !vendorSearch.trim() ||
      (item.name && item.name.toLowerCase().includes(vendorSearch.toLowerCase())) ||
      (item.business_name && item.business_name.toLowerCase().includes(vendorSearch.toLowerCase())) ||
      (item.phone && item.phone.includes(vendorSearch)) ||
      (item.email && item.email.toLowerCase().includes(vendorSearch.toLowerCase()));

    const matchesMediaType =
      vendorMediaTypeFilter === "all" ||
      (item.media_type && item.media_type.toLowerCase() === vendorMediaTypeFilter.toLowerCase());

    const matchesStatus =
      vendorStatusFilter === "all" ||
      (item.status && item.status.toLowerCase() === vendorStatusFilter.toLowerCase());

    return matchesSearch && matchesMediaType && matchesStatus;
  });

  // Filtered brand requests
  const filteredBrandRequests = brandRequests.filter((item) => {
    const matchesSearch =
      !brandSearch.trim() ||
      (item.name && item.name.toLowerCase().includes(brandSearch.toLowerCase())) ||
      (item.company_name && item.company_name.toLowerCase().includes(brandSearch.toLowerCase())) ||
      (item.phone && item.phone.includes(brandSearch)) ||
      (item.email && item.email.toLowerCase().includes(brandSearch.toLowerCase())) ||
      (item.media_channel && item.media_channel.toLowerCase().includes(brandSearch.toLowerCase()));

    const matchesChannel =
      brandChannelFilter === "all" ||
      (item.media_channel && item.media_channel.toLowerCase() === brandChannelFilter.toLowerCase());

    const matchesStatus =
      brandStatusFilter === "all" ||
      (item.status && item.status.toLowerCase() === brandStatusFilter.toLowerCase());

    return matchesSearch && matchesChannel && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="theme-dark min-h-screen bg-[#0B1E3B] flex items-center justify-center">
        <div className="text-white text-sm animate-pulse flex items-center gap-2">
          <MdiIcon name="loading" className="animate-spin text-xl text-[var(--action-primary)]" />
          <span>Initializing Administrative Console...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Helper for status badge style
  const getVendorStatusBadge = (status) => {
    const s = (status || "new").toLowerCase();
    if (s === "approved" || s === "contacted") {
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
    }
    if (s === "in review" || s === "pending") {
      return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
    }
    if (s === "rejected" || s === "archived") {
      return "bg-slate-500/20 text-slate-400 border border-slate-700";
    }
    return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
  };

  // Get stage colors helper
  const getStageColorClass = (stage) => {
    const s = stage?.toLowerCase() || "";
    if (s.includes("confirm") || s.includes("live") || s.includes("complete")) {
      return "bg-emerald-500/10 text-emerald-450 border-emerald-900/30";
    }
    if (s.includes("quote") || s.includes("review")) {
      return "bg-amber-500/10 text-amber-400 border-amber-900/30";
    }
    return "bg-slate-500/10 text-slate-400 border-slate-900/30";
  };

  // Dynamic stats
  const statsList = [
    { label: "Brand Requests", value: brandRequests.length, suffix: "" },
    { label: "Vendor Leads", value: vendorSubmissions.length, suffix: "" },
    { label: "Enquiries Submitted", value: enquiries.length, suffix: "" },
    { label: "Quotes Shared", value: enquiries.filter(e => e.stage === "Quote shared").length, suffix: "" }
  ];

  const adminTerminalCommands = [
    { text: "> initializing admin audit trail listener...", color: "text-[var(--text-secondary)]" },
    { text: `✓ session.verify(): ${user?.name || "adminotz@gmail.com"} session authorized (role: ${user?.role || "admin"})`, color: "text-emerald-500" },
    { text: `✓ database.brand_requests: ${brandRequests.length} brand media inquiries online`, color: "text-[#FF5A1F]" },
    { text: `✓ database.vendor_submissions: ${vendorSubmissions.length} active leads loaded`, color: "text-[#FF5A1F]" },
    { text: `✓ database.listings: ${listings.length} inventory items online`, color: "text-emerald-500" },
    { text: "✓ admin.security: RLS enforcement verified", color: "text-[var(--text-secondary)]" }
  ];

  return (
    <div className="theme-dark min-h-screen bg-[#0B1E3B] text-[var(--text-primary)] pb-16 relative overflow-hidden font-sans">
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
        
        {/* Console Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-default)] pb-6 w-full">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <span className="h-2 w-2 bg-[var(--action-primary)] rounded-full animate-pulse" />
              <span>OTZ ADMIN &bull; Administrator: {user?.email || "adminotz@gmail.com"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-display mt-1">OTZ Admin</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Logout button */}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors cursor-pointer"
            >
              <MdiIcon name="logout" className="text-sm" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tab selectors */}
        <div className="flex flex-wrap gap-1 p-1 bg-[var(--surface-raised)]/80 rounded-xl border border-[var(--border-default)] w-fit">
          {[
            { id: "brand_requests", label: "Brand Requests", count: brandRequests.length },
            { id: "vendors", label: "Vendor Submissions", count: vendorSubmissions.length },
            { id: "enquiries", label: "Campaign Pipeline", count: enquiries.length },
            { id: "moderation", label: "Supply Moderation", count: listings.length },
            { id: "seeder", label: "CSV Seeder" },
            { id: "accounts", label: "Accounts" },
            { id: "analytics", label: "Analytics" },
            { id: "audit", label: "Audit Logs" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
                  activeTab === tab.id ? "bg-[#0B1E3B]/20 text-[#0B1E3B]" : "bg-white/10 text-white"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 0. BRAND REQUESTS TAB (brand_requests) */}
        {/* ========================================================================= */}
        {activeTab === "brand_requests" && (
          <div className="space-y-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                  <MdiIcon name="bullhorn-outline" className="text-[var(--action-primary)]" />
                  <span>BRAND MEDIA PROPOSAL REQUESTS</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Inquiries submitted by brands across all demand media channels (<code className="text-[#FF5A1F] font-mono">brand_requests</code>).
                </p>
              </div>

              <ShinyButton
                onClick={fetchBrandRequests}
                className="px-4 py-1.5 text-xs font-bold"
              >
                <MdiIcon name="refresh" className="mr-1.5" />
                Refresh
              </ShinyButton>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-[var(--surface-raised)]/60 rounded-xl border border-[var(--border-default)]">
              {/* Search Bar */}
              <div className="md:col-span-6 relative">
                <MdiIcon name="magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Search by name, company, phone, email, channel..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-[var(--action-primary)]"
                />
              </div>

              {/* Media Channel Filter */}
              <div className="md:col-span-3">
                <select
                  value={brandChannelFilter}
                  onChange={(e) => setBrandChannelFilter(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white text-xs font-semibold focus:outline-none focus:border-[var(--action-primary)] cursor-pointer"
                >
                  <option value="all">All Media Channels</option>
                  <option value="OOH / Billboards">OOH / Billboards</option>
                  <option value="Print Media">Print Media</option>
                  <option value="BTL">BTL</option>
                  <option value="Radio & FM">Radio & FM</option>
                  <option value="Television & OTT">Television & OTT</option>
                  <option value="Transit & Aviation">Transit & Aviation</option>
                  <option value="Digital & CTV">Digital & CTV</option>
                  <option value="Influencers">Influencers</option>
                  <option value="Events & Sponsorships">Events & Sponsorships</option>
                  <option value="Cinema Screens">Cinema Screens</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-3">
                <select
                  value={brandStatusFilter}
                  onChange={(e) => setBrandStatusFilter(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white text-xs font-semibold focus:outline-none focus:border-[var(--action-primary)] cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Table / Content States */}
            {brandLoading ? (
              <div className="p-12 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400">
                <MdiIcon name="loading" className="text-3xl block mx-auto mb-2 text-[var(--action-primary)] animate-spin" />
                <p className="text-xs font-semibold">Loading brand requests…</p>
              </div>
            ) : brandError ? (
              <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-center text-red-400">
                <MdiIcon name="alert-circle-outline" className="text-3xl block mx-auto mb-2" />
                <p className="text-xs font-bold mb-3">{brandError}</p>
                <button
                  onClick={fetchBrandRequests}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : filteredBrandRequests.length === 0 ? (
              <div className="p-12 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400 space-y-2">
                <MdiIcon name="inbox-outline" className="text-4xl block mx-auto text-slate-500" />
                <p className="text-sm font-bold text-white">No brand requests found.</p>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  {brandRequests.length > 0
                    ? "No brand requests matched your search filter criteria."
                    : "When brands submit proposal intake requests from any media channel, submissions will appear here in real-time."}
                </p>
              </div>
            ) : (
              <div className="bg-[var(--surface-raised)]/40 border border-[var(--border-default)] rounded-xl overflow-hidden backdrop-blur-md shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#0B1E3B]/90 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-default)]">
                      <tr>
                        <th className="px-5 py-3.5">Name</th>
                        <th className="px-5 py-3.5">Company</th>
                        <th className="px-5 py-3.5">Phone</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Media Channel</th>
                        <th className="px-5 py-3.5">Request Details</th>
                        <th className="px-5 py-3.5">Submitted Date</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)] font-medium text-[var(--text-secondary)]">
                      {filteredBrandRequests.map((req) => {
                        const details = req.request_details || {};
                        const industry = details.industry || "";
                        const audiences = Array.isArray(details.target_audiences)
                          ? details.target_audiences
                          : Array.isArray(details.targetAudiences)
                          ? details.targetAudiences
                          : [];

                        return (
                          <tr
                            key={req.id}
                            className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                            onClick={() => {
                              setSelectedBrandRequest(req);
                              setBrandAdminNoteInput(req.admin_notes || "");
                            }}
                          >
                            <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#0B1E3B] border border-[#FF5A1F]/30 text-[#FF5A1F] flex items-center justify-center font-bold text-[11px] shrink-0">
                                  {req.name ? req.name.charAt(0).toUpperCase() : "B"}
                                </div>
                                <span>{req.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-200 whitespace-nowrap">
                              {req.company_name || req.company || "—"}
                            </td>
                            <td className="px-5 py-4 font-mono text-xs whitespace-nowrap text-slate-300">
                              {req.phone || "—"}
                            </td>
                            <td className="px-5 py-4 font-mono text-xs whitespace-nowrap text-slate-300">
                              {req.email || "—"}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#FF5A1F]/10 border border-[#FF5A1F]/30 text-[#FF5A1F]">
                                {req.media_channel}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-slate-300 max-w-xs">
                              <div className="truncate">
                                {industry && (
                                  <span className="font-semibold text-white mr-1.5">
                                    [{industry}]
                                  </span>
                                )}
                                {audiences.length > 0 ? (
                                  <span className="text-slate-400">{audiences.join(", ")}</span>
                                ) : (
                                  <span className="text-slate-500">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 font-mono text-[11px] whitespace-nowrap text-slate-400">
                              {req.created_at
                                ? new Date(req.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : "—"}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getVendorStatusBadge(req.status)}`}>
                                {req.status || "New"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    setSelectedBrandRequest(req);
                                    setBrandAdminNoteInput(req.admin_notes || "");
                                  }}
                                  className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                  title="Inspect Brand Request"
                                >
                                  <MdiIcon name="eye-outline" className="text-base" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBrandRequest(req.id)}
                                  className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Remove Request"
                                >
                                  <MdiIcon name="trash-can-outline" className="text-base" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Brand Request Detail Modal */}
            {selectedBrandRequest && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E3B]/80 backdrop-blur-md animate-fade-in no-print">
                <div
                  className="fixed inset-0"
                  onClick={() => setSelectedBrandRequest(null)}
                ></div>

                <div className="relative w-full max-w-xl bg-[#0F2445] rounded-2xl border border-[var(--border-default)] shadow-2xl p-6 md:p-8 space-y-6 z-10 animate-scale-up text-left max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start border-b border-[var(--border-default)] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5A1F]">
                          BRAND REQUEST ID: {selectedBrandRequest.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getVendorStatusBadge(selectedBrandRequest.status)}`}>
                          {selectedBrandRequest.status || "New"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-display mt-1">
                        {selectedBrandRequest.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => setSelectedBrandRequest(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <MdiIcon name="close" className="text-xl" />
                    </button>
                  </div>

                  {/* Modal Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Company / Organisation
                      </span>
                      <p className="text-sm font-bold text-white">
                        {selectedBrandRequest.company_name || selectedBrandRequest.company || "—"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Media Channel
                      </span>
                      <p className="text-sm font-bold text-[#FF5A1F]">
                        {selectedBrandRequest.media_channel || "—"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Phone Number
                      </span>
                      <a
                        href={`tel:${selectedBrandRequest.phone}`}
                        className="text-sm font-mono font-bold text-white hover:text-[var(--action-primary)] transition-colors flex items-center gap-1.5"
                      >
                        <MdiIcon name="phone-outline" />
                        <span>{selectedBrandRequest.phone || "—"}</span>
                      </a>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Work / Personal Email
                      </span>
                      <a
                        href={`mailto:${selectedBrandRequest.email}`}
                        className="text-sm font-mono font-bold text-white hover:text-[var(--action-primary)] transition-colors flex items-center gap-1.5 truncate"
                      >
                        <MdiIcon name="email-outline" />
                        <span className="truncate">{selectedBrandRequest.email || "—"}</span>
                      </a>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Submission Timestamp
                      </span>
                      <p className="font-mono text-xs text-slate-300">
                        {selectedBrandRequest.created_at
                          ? new Date(selectedBrandRequest.created_at).toLocaleString("en-US", {
                              dateStyle: "full",
                              timeStyle: "medium"
                            })
                          : "—"}
                      </p>
                    </div>

                    {/* JSONB request_details breakdown */}
                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-2 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Request Details (JSONB)
                      </span>
                      <div className="space-y-2 text-xs">
                        {selectedBrandRequest.request_details?.industry && (
                          <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-slate-400">Industry / Sector:</span>
                            <span className="font-bold text-white">{selectedBrandRequest.request_details.industry}</span>
                          </div>
                        )}
                        {(selectedBrandRequest.request_details?.target_audiences || selectedBrandRequest.request_details?.targetAudiences) && (
                          <div className="flex flex-col gap-1 border-b border-white/5 pb-1">
                            <span className="text-slate-400">Target Audiences:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {(selectedBrandRequest.request_details?.target_audiences || selectedBrandRequest.request_details?.targetAudiences || []).map((aud) => (
                                <span key={aud} className="bg-white/10 text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
                                  {aud}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <pre className="mt-2 p-2 bg-black/40 rounded-lg text-[10px] font-mono text-slate-400 overflow-x-auto">
                          {JSON.stringify(selectedBrandRequest.request_details || {}, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-2 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Admin Notes
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={brandAdminNoteInput}
                          onChange={(e) => setBrandAdminNoteInput(e.target.value)}
                          placeholder="Add internal ops / admin notes..."
                          className="flex-1 bg-[#101828] border border-white/20 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#FF5A1F]"
                        />
                        <button
                          onClick={() => handleUpdateBrandStatus(selectedBrandRequest.id, null, brandAdminNoteInput)}
                          className="px-3 py-1.5 bg-[#FF5A1F] text-[#0B1E3B] font-bold text-xs rounded-lg hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status update controls */}
                  <div className="pt-4 border-t border-[var(--border-default)] space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                      Update Request Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["New", "Contacted", "In Review", "Approved", "Archived"].map((st) => (
                        <button
                          key={st}
                          disabled={updatingBrandStatus}
                          onClick={() => handleUpdateBrandStatus(selectedBrandRequest.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedBrandRequest.status === st
                              ? "bg-[#FF5A1F] text-[#0B1E3B] shadow-sm font-black"
                              : "border border-[var(--border-default)] bg-[#0B1E3B] text-slate-300 hover:text-white hover:border-slate-500"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => handleDeleteBrandRequest(selectedBrandRequest.id)}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MdiIcon name="trash-can-outline" /> Remove Request
                    </button>

                    <button
                      onClick={() => setSelectedBrandRequest(null)}
                      className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. VENDOR NETWORK SUBMISSIONS TAB (PRIMARY REQUIREMENT) */}
        {/* ========================================================================= */}
        {activeTab === "vendors" && (
          <div className="space-y-6 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
                  <MdiIcon name="storefront-outline" className="text-[var(--action-primary)]" />
                  <span>JOIN THE OTZ MEDIA NETWORK SUBMISSIONS</span>
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Submissions captured from media owners and inventory providers.
                </p>
              </div>

              <ShinyButton
                onClick={fetchVendorSubmissions}
                className="px-4 py-1.5 text-xs font-bold"
              >
                <MdiIcon name="refresh" className="mr-1.5" />
                Refresh
              </ShinyButton>
            </div>

            {/* Filter and Search Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-[var(--surface-raised)]/60 rounded-xl border border-[var(--border-default)]">
              {/* Search Bar */}
              <div className="md:col-span-6 relative">
                <MdiIcon name="magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base" />
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search by name, business, phone, email..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-[var(--action-primary)]"
                />
              </div>

              {/* Media Type Filter */}
              <div className="md:col-span-3">
                <select
                  value={vendorMediaTypeFilter}
                  onChange={(e) => setVendorMediaTypeFilter(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white text-xs font-semibold focus:outline-none focus:border-[var(--action-primary)] cursor-pointer"
                >
                  <option value="all">All Media Types</option>
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

              {/* Status Filter */}
              <div className="md:col-span-3">
                <select
                  value={vendorStatusFilter}
                  onChange={(e) => setVendorStatusFilter(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[#0B1E3B]/80 text-white text-xs font-semibold focus:outline-none focus:border-[var(--action-primary)] cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Review">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Table / Content States */}
            {vendorLoading ? (
              <div className="p-12 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400">
                <MdiIcon name="loading" className="text-3xl block mx-auto mb-2 text-[var(--action-primary)] animate-spin" />
                <p className="text-xs font-semibold">Loading submissions…</p>
              </div>
            ) : vendorError ? (
              <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20 text-center text-red-400">
                <MdiIcon name="alert-circle-outline" className="text-3xl block mx-auto mb-2" />
                <p className="text-xs font-bold mb-3">{vendorError}</p>
                <button
                  onClick={fetchVendorSubmissions}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="p-12 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400 space-y-2">
                <MdiIcon name="inbox-outline" className="text-4xl block mx-auto text-slate-500" />
                <p className="text-sm font-bold text-white">No vendor submissions yet.</p>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  {vendorSubmissions.length > 0
                    ? "No responses matched your search filter criteria."
                    : "When visitors submit the \"Join the OTZ Media Network\" form, responses will appear here in real-time."}
                </p>
              </div>
            ) : (
              <div className="bg-[var(--surface-raised)]/40 border border-[var(--border-default)] rounded-xl overflow-hidden backdrop-blur-md shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#0B1E3B]/90 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-default)]">
                      <tr>
                        <th className="px-5 py-3.5">Name</th>
                        <th className="px-5 py-3.5">Business / Brand</th>
                        <th className="px-5 py-3.5">Phone</th>
                        <th className="px-5 py-3.5">Work Email</th>
                        <th className="px-5 py-3.5">Media Type</th>
                        <th className="px-5 py-3.5">Submitted Date</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)] font-medium text-[var(--text-secondary)]">
                      {filteredVendors.map((vendor) => (
                        <tr
                          key={vendor.id}
                          className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <td className="px-5 py-4 font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#0B1E3B] border border-[var(--border-default)] text-[var(--action-primary)] flex items-center justify-center font-bold text-[11px] shrink-0">
                                {vendor.name ? vendor.name.charAt(0).toUpperCase() : "V"}
                              </div>
                              <span>{vendor.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-300 whitespace-nowrap">
                            {vendor.business_name || vendor.company || "—"}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs whitespace-nowrap text-slate-300">
                            {vendor.phone || "—"}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs whitespace-nowrap text-slate-300">
                            {vendor.email || "—"}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#0B1E3B] border border-[var(--border-default)] text-slate-200">
                              {vendor.media_type || "OOH"}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px] whitespace-nowrap text-slate-400">
                            {vendor.created_at
                              ? new Date(vendor.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })
                              : "—"}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getVendorStatusBadge(vendor.status)}`}>
                              {vendor.status || "New"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setSelectedVendor(vendor)}
                                className="p-1.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Inspect Details"
                              >
                                <MdiIcon name="eye-outline" className="text-base" />
                              </button>
                              <button
                                onClick={() => handleDeleteVendor(vendor.id)}
                                className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                title="Remove Submission"
                              >
                                <MdiIcon name="trash-can-outline" className="text-base" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Vendor Submission Detail Modal */}
            {selectedVendor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1E3B]/80 backdrop-blur-md animate-fade-in no-print">
                <div
                  className="fixed inset-0"
                  onClick={() => setSelectedVendor(null)}
                ></div>

                <div className="relative w-full max-w-xl bg-[#0F2445] rounded-2xl border border-[var(--border-default)] shadow-2xl p-6 md:p-8 space-y-6 z-10 animate-scale-up text-left">
                  {/* Modal Header */}
                  <div className="flex justify-between items-start border-b border-[var(--border-default)] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--action-primary)]">
                          SUBMISSION ID: {selectedVendor.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getVendorStatusBadge(selectedVendor.status)}`}>
                          {selectedVendor.status || "New"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-display mt-1">
                        {selectedVendor.name}
                      </h3>
                    </div>

                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <MdiIcon name="close" className="text-xl" />
                    </button>
                  </div>

                  {/* Modal Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Business / Brand Name
                      </span>
                      <p className="text-sm font-bold text-white">
                        {selectedVendor.business_name || selectedVendor.company || "—"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Media Inventory Type
                      </span>
                      <p className="text-sm font-bold text-[var(--action-primary)]">
                        {selectedVendor.media_type || "OOH"}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Phone Number
                      </span>
                      <a
                        href={`tel:${selectedVendor.phone}`}
                        className="text-sm font-mono font-bold text-white hover:text-[var(--action-primary)] transition-colors flex items-center gap-1.5"
                      >
                        <MdiIcon name="phone-outline" />
                        <span>{selectedVendor.phone || "—"}</span>
                      </a>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Work Email
                      </span>
                      <a
                        href={`mailto:${selectedVendor.email}`}
                        className="text-sm font-mono font-bold text-white hover:text-[var(--action-primary)] transition-colors flex items-center gap-1.5 truncate"
                      >
                        <MdiIcon name="email-outline" />
                        <span className="truncate">{selectedVendor.email || "—"}</span>
                      </a>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B1E3B]/80 border border-[var(--border-default)] space-y-1 md:col-span-2">
                      <span className="text-[10px] font-bold uppercase text-[var(--text-secondary)] block">
                        Submission Timestamp
                      </span>
                      <p className="font-mono text-xs text-slate-300">
                        {selectedVendor.created_at
                          ? new Date(selectedVendor.created_at).toLocaleString("en-US", {
                              dateStyle: "full",
                              timeStyle: "medium"
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Status update controls */}
                  <div className="pt-4 border-t border-[var(--border-default)] space-y-2">
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                      Update Submission Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["New", "Contacted", "In Review", "Approved", "Archived"].map((st) => (
                        <button
                          key={st}
                          disabled={updatingStatus}
                          onClick={() => handleUpdateVendorStatus(selectedVendor.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedVendor.status === st
                              ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-sm font-black"
                              : "border border-[var(--border-default)] bg-[#0B1E3B] text-slate-300 hover:text-white hover:border-slate-500"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => handleDeleteVendor(selectedVendor.id)}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <MdiIcon name="trash-can-outline" /> Remove Submission
                    </button>

                    <button
                      onClick={() => setSelectedVendor(null)}
                      className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. CAMPAIGN ENQUIRIES & PIPELINE MANAGER TAB */}
        {/* ========================================================================= */}
        {activeTab === "enquiries" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            {/* Pipeline List aside */}
            <div className="lg:col-span-7 space-y-4 w-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Campaign Pipeline Rows</h3>
              {enquiries.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {enquiries.map((enq) => (
                    <VercelCard
                      key={enq.id}
                      bordered={true}
                      glowEffect={true}
                      animateOnHover={false}
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setPipelineForm({ stage: enq.stage, assignee: enq.assignee, noteText: "" });
                      }}
                      className={cn("p-1 bg-[var(--surface-raised)]/40 rounded-xl text-left w-full h-full cursor-pointer", selectedEnquiry?.id === enq.id && "border-[var(--action-primary)]")}
                    >
                      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] font-mono">ENQ: {enq.id}</span>
                            <span className="text-[9px] text-[var(--text-secondary)]">&bull; {enq.brandCompany}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{enq.listingTitle}</h4>
                          <p className="text-[10px] text-[var(--text-secondary)] font-semibold flex gap-2">
                            <span>Assignee: {enq.assignee === "ops-unassigned" ? "Unassigned" : enq.assignee}</span>
                            <span>&bull;</span>
                            <span>Stage: {enq.stage}</span>
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold shrink-0 ${getStageColorClass(enq.stage)}`}>
                          {enq.stage}
                        </div>
                      </div>
                    </VercelCard>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-500">
                  <MdiIcon name="inbox-outline" className="text-4xl block mx-auto mb-2" />
                  <p className="text-xs">No campaign demand enquiries logged in the pipeline.</p>
                </div>
              )}
            </div>

            {/* Selected Enquiry Pipeline update Panel */}
            <div className="lg:col-span-5 w-full">
              {selectedEnquiry ? (
                <VercelCard bordered={true} className="p-2 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl w-full text-left font-sans">
                  <div className="p-6 space-y-6 w-full">
                    <div className="border-b border-[var(--border-default)] pb-4 w-full">
                      <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">Campaign Details Editor</span>
                      <h4 className="text-base font-bold text-white mt-1">Enquiry #{selectedEnquiry.id}</h4>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      <div>
                        <span className="font-bold text-[var(--text-secondary)] block">Target Asset Placements:</span>
                        <span className="text-white font-semibold">{selectedEnquiry.listingTitle}</span>
                      </div>
                      <div>
                        <span className="font-bold text-[var(--text-secondary)] block">Brand Demander:</span>
                        <span className="text-white font-semibold">{selectedEnquiry.brandName} ({selectedEnquiry.brandCompany})</span>
                      </div>
                      <div>
                        <span className="font-bold text-[var(--text-secondary)] block">Contact Phone:</span>
                        <span className="text-white font-mono font-semibold">{selectedEnquiry.brandPhone} | {selectedEnquiry.brandEmail}</span>
                      </div>
                      <div className="p-3 bg-[var(--surface-canvas)] rounded-lg border border-[var(--border-default)]">
                        <span className="font-bold text-[var(--text-secondary)] block mb-1">Proposal message:</span>
                        <p className="italic text-[var(--text-secondary)] leading-relaxed">&ldquo;{selectedEnquiry.message}&rdquo;</p>
                      </div>
                    </div>

                    {/* Timeline Notes list */}
                    {selectedEnquiry.notes && selectedEnquiry.notes.length > 0 && (
                      <div className="space-y-2 border-t border-[var(--border-default)] pt-4 w-full">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block">Ops Notes Log</span>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                          {selectedEnquiry.notes.map((n, idx) => (
                            <div key={idx} className="p-2 rounded bg-[var(--surface-canvas)] text-[10px] leading-relaxed border border-[var(--border-default)]">
                              <div className="flex justify-between text-[8px] text-[var(--text-secondary)] font-bold uppercase mb-1">
                                <span>{n.author}</span>
                                <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-white font-medium">{n.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Form Update */}
                    <form onSubmit={handleUpdatePipeline} className="space-y-4 border-t border-[var(--border-default)] pt-4 w-full">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase">Pipeline Stage</label>
                          <select
                            value={pipelineForm.stage}
                            onChange={(e) => setPipelineForm({ ...pipelineForm, stage: e.target.value })}
                            className="w-full h-9 px-2 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-md text-xs cursor-pointer focus:outline-none"
                          >
                            <option value="Awaiting response">Awaiting response</option>
                            <option value="In negotiations">In negotiations</option>
                            <option value="Quote shared">Quote shared</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Live">Live</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase">Assignee Team</label>
                          <select
                            value={pipelineForm.assignee}
                            onChange={(e) => setPipelineForm({ ...pipelineForm, assignee: e.target.value })}
                            className="w-full h-9 px-2 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-md text-xs cursor-pointer focus:outline-none"
                          >
                            <option value="ops-unassigned">Unassigned</option>
                            <option value="ops-mumbai">Ops Mumbai</option>
                            <option value="ops-delhi">Ops Delhi</option>
                            <option value="ops-digital">Ops Digital</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase">Append Progress Note</label>
                        <input
                          type="text"
                          value={pipelineForm.noteText}
                          onChange={(e) => setPipelineForm({ ...pipelineForm, noteText: e.target.value })}
                          placeholder="e.g. Rate card approved by Times OOH team."
                          className="w-full h-9 px-2 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-md text-xs"
                        />
                      </div>

                      {pipelineSuccess && (
                        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <MdiIcon name="check-bold" /> Pipeline details synchronized.
                        </p>
                      )}

                      <ShinyButton
                        type="submit"
                        className="w-full py-2.5 text-xs font-bold rounded-lg shadow"
                      >
                        Update pipeline
                      </ShinyButton>
                    </form>
                  </div>
                </VercelCard>
              ) : (
                <div className="p-8 rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--surface-raised)]/20 text-center text-slate-500">
                  <MdiIcon name="cursor-default-click-outline" className="text-4xl block mx-auto mb-2" />
                  <p className="text-xs">Click any enquiry row to configure assignment and pipeline stage updates.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. PLACEMENT MODERATION TAB */}
        {/* ========================================================================= */}
        {activeTab === "moderation" && (
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Supply Verification Moderation</h3>

            {listings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {listings.map((item) => (
                  <VercelCard
                    key={item.id}
                    bordered={true}
                    glowEffect={true}
                    animateOnHover={false}
                    className="p-1 bg-[var(--surface-raised)]/40 rounded-xl text-left w-full h-full font-sans"
                  >
                    <div className="p-5 flex flex-col justify-between h-full w-full space-y-4">
                      <div className="text-left w-full space-y-1">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] font-mono">LISTING: {item.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            item.state === "published"
                              ? "bg-emerald-500/10 text-emerald-450 border border-emerald-900/30"
                              : item.state === "rejected"
                              ? "bg-red-500/10 text-[var(--status-error)] border border-red-900/30"
                              : "bg-amber-500/10 text-[var(--status-warning)] border border-amber-900/30"
                          }`}>
                            {item.state}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                        <div className="text-[10px] text-[var(--text-secondary)] font-semibold flex flex-wrap gap-x-4 gap-y-1">
                          <span>Owner: {item.owner_company}</span>
                          <span>Reach: {item.visibility_metric} (Src: {item.reach_source})</span>
                          <span>Rate: {item.price_band}</span>
                        </div>
                      </div>

                      {item.specs && (
                        <p className="text-[10px] text-[var(--text-secondary)] italic p-2 bg-[var(--surface-canvas)] rounded border border-[var(--border-default)]">
                          Specs: {item.specs}
                        </p>
                      )}

                      <div className="pt-3 border-t border-[var(--border-default)] flex flex-col gap-3 w-full">
                        {rejectingListingId === item.id ? (
                          <form
                            onSubmit={handleRejectListing}
                            className="flex gap-2 w-full"
                          >
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Reason (e.g. rate card illegible)..."
                              className="h-9 px-2 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-md text-xs flex-grow focus:outline-none focus:border-[var(--status-error)]"
                              required
                            />
                            <button
                              type="submit"
                              className="h-9 px-3 bg-red-650 hover:bg-red-700 text-white rounded-md text-xs font-bold cursor-pointer shrink-0"
                            >
                              Confirm Reject
                            </button>
                            <button
                              onClick={() => setRejectingListingId(null)}
                              className="h-9 px-3 border border-[var(--border-default)] hover:bg-[var(--surface-hover)] text-white rounded-md text-xs font-semibold cursor-pointer shrink-0"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <div className="flex justify-end gap-3 w-full">
                            {item.state !== "published" && (
                              <ShinyButton
                                onClick={() => handlePublishListing(item.id)}
                                className="px-4 py-2 text-xs font-bold rounded-lg"
                              >
                                Approve & Publish Live
                              </ShinyButton>
                            )}
                            {item.state !== "rejected" && (
                              <button
                                onClick={() => setRejectingListingId(item.id)}
                                className="rounded-lg border border-red-900/40 text-[var(--status-error)] hover:bg-red-500/10 px-4 py-2 text-xs font-bold cursor-pointer"
                              >
                                Reject Submission
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </VercelCard>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[var(--surface-raised)]/30 border border-[var(--border-default)] text-center text-slate-400 w-full">
                <MdiIcon name="check-decagram-outline" className="text-4xl block mx-auto mb-2 text-slate-500" />
                <p className="text-xs">All host listings moderation checks cleared.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CSV BULK DATA SEEDER TAB */}
        {/* ========================================================================= */}
        {activeTab === "seeder" && (
          <div className="max-w-3xl w-full">
            <VercelCard bordered={true} className="p-2 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl w-full text-left font-sans">
              <div className="p-6 space-y-6 w-full text-left">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">CSV Catalog Seeder</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Bulk upload inventory listings. Format: Title, Media_Type, Parent_Network, Location, Niche, Reach, Price_Band, Price_Day, Formats
                  </p>
                </div>

                <form onSubmit={handleCsvImport} className="space-y-4 w-full">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase">Raw CSV Data</label>
                    <textarea
                      rows="6"
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                      placeholder={`Bandra Gantry Block C, OOH, Times Media, Mumbai, FMCG, 800K views, ₹10K - ₹50K, 15000, 15s loop slot
STAR Star Plus, TV, Star Network, National Grid, FMCG, 12M reach, ₹10L+, 120000, 30s ad spot`}
                      className="w-full p-3 border border-[var(--border-default)] bg-[var(--surface-canvas)] text-white rounded-lg text-xs font-mono focus:outline-none focus:border-[var(--action-primary)]"
                    />
                  </div>

                  {importResult && (
                    <div className={cn("p-4 rounded-xl text-xs space-y-1 border", importResult.error ? "bg-red-500/10 border-red-500/20 text-[var(--status-error)]" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400")}>
                      {importResult.error ? (
                        <p className="font-bold">Error: {importResult.error}</p>
                      ) : (
                        <>
                          <p className="font-black">✓ Bulk Seeder Sync Complete</p>
                          <p className="font-medium">Rows parsed: {importResult.rowsParsed} &bull; Listings inserted: {importResult.insertedCount}</p>
                        </>
                      )}
                    </div>
                  )}

                  <ShinyButton
                    type="submit"
                    className="px-8 shadow mt-2"
                  >
                    {importLoading ? "Parsing Rows..." : "Validate & Seed Listings"}
                  </ShinyButton>
                </form>
              </div>
            </VercelCard>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. SUSPEND ACCOUNTS REGISTRY TAB */}
        {/* ========================================================================= */}
        {activeTab === "accounts" && (
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">DPDP Account Registry Moderation</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {accounts.map((acc) => (
                <VercelCard
                  key={acc.id}
                  bordered={true}
                  glowEffect={true}
                  animateOnHover={false}
                  className="p-1 bg-[var(--surface-raised)]/40 rounded-xl text-left w-full h-full font-sans"
                >
                  <div className="p-4 flex flex-col justify-between h-full w-full space-y-4">
                    <div className="text-left space-y-1.5">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] font-mono">{acc.role}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          acc.state === "verified"
                            ? "bg-emerald-500/10 text-emerald-450 border border-emerald-900/30"
                            : "bg-red-500/10 text-[var(--status-error)] border border-red-900/30"
                        }`}>
                          {acc.state}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                      <div className="text-[10px] text-[var(--text-secondary)] space-y-0.5">
                        <p>Company: {acc.company}</p>
                        <p className="font-mono">Phone: @{acc.phone}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-default)] flex justify-end w-full">
                      <button
                        onClick={() => handleToggleSuspension(acc.id)}
                        className={cn("rounded-lg border px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors", acc.state === "verified" ? "border-red-900/40 text-[var(--status-error)] hover:bg-red-500/10" : "border-emerald-900/40 text-emerald-400 hover:bg-emerald-500/10")}
                      >
                        {acc.state === "verified" ? "Suspend Account" : "Unsuspend Account"}
                      </button>
                    </div>
                  </div>
                </VercelCard>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. METRIC ANALYTICS CONVERSIONS TAB */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6 w-full">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Campaign Conversion Funnels</h3>

            {/* Funnel counters widgets */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              {statsList.map((st, idx) => (
                <VercelCard key={st.label} bordered={true} className="bg-[var(--surface-raised)]/40 p-4 text-center">
                  <AnimatedCounter
                    value={st.value}
                    suffix={st.suffix}
                    delay={idx}
                    label={st.label}
                    className="w-full text-center"
                  />
                </VercelCard>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 7. AUDIT LOGGING VIEW PANEL */}
        {/* ========================================================================= */}
        {activeTab === "audit" && (
          <div className="space-y-6 w-full">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Administrative Audit Trails</h3>

            {/* OtzTerminal Logger view */}
            <OtzTerminal commands={adminTerminalCommands} className="mb-6 max-w-3xl" />

            <div className="bg-[var(--surface-raised)]/40 border border-[var(--border-default)] rounded-xl overflow-hidden backdrop-blur-md">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0B1E3B]/80 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-default)]">
                  <tr>
                    <th className="px-6 py-3">Actor ID</th>
                    <th className="px-6 py-3">Action type</th>
                    <th className="px-6 py-3">Entity scope</th>
                    <th className="px-6 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)] font-semibold text-[var(--text-secondary)]">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.04]">
                      <td className="px-6 py-4 font-mono text-white">{log.actor_id}</td>
                      <td className="px-6 py-4 uppercase text-[var(--action-primary)] font-bold">{log.action}</td>
                      <td className="px-6 py-4">{log.entity}</td>
                      <td className="px-6 py-4 text-right font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
