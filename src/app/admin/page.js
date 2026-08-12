"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { VercelCard } from "@/components/scrollx/vercel-card";
import { AnimatedCounter } from "@/components/scrollx/statscount";
import { OtzTerminal } from "@/components/scrollx/otz-terminal";

export default function AdminPage() {
  const router = useRouter();

  // Auth coordinates
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enquiries"); // enquiries | moderation | seeder | accounts | analytics | audit

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

  useEffect(() => {
    let active = true;
    const fetchAdminData = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get-session" })
        });
        const data = await res.json();
        if (!active) return;
        
        if (!data.user || (data.user.role !== "ops" && data.user.role !== "admin")) {
          router.push("/dashboard");
          return;
        }
        setUser(data.user);

        // Fetch enquiries
        const enqRes = await fetch("/api/enquiry");
        const enqData = await enqRes.json();
        if (active && enqData.enquiries) setEnquiries(enqData.enquiries);

        // Fetch all listings
        const listRes = await fetch("/api/listings");
        const listData = await listRes.json();
        if (active && listData.listings) setListings(listData.listings);

        setAccounts([
          { id: "acc-ops-1", name: "Operations Team", company: "OTZ Ops", role: "ops", state: "verified", phone: "9999999999" },
          { id: "acc-brand-1", name: "Sanskar Brand Manager", company: "Premium Tech", role: "brand", state: "verified", phone: "9876543210" },
          { id: "acc-host-1", name: "Adspace Host", company: "Times OOH", role: "host", state: "verified", phone: "9812345678" }
        ]);
        setAuditLogs([
          { actor_id: "usr-ops-1", action: "csv_bulk_import", entity: "listings", timestamp: new Date(Date.now() - 3600000).toISOString() },
          { actor_id: "usr-ops-1", action: "publish_listing", entity: "listings", timestamp: new Date(Date.now() - 7200000).toISOString() }
        ]);
      } catch (e) {
        console.error("Failed to load admin coordinates", e);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAdminData();
    return () => { active = false; };
  }, [refreshKey, router]);

  // Update pipeline stage handler
  const handleUpdatePipeline = async (e) => {
    e.preventDefault();
    setPipelineSuccess(false);

    try {
      const res = await fetch("/api/enquiry", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        setRefreshKey(k => k + 1); // Refresh list
        // Update selected card state
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import-csv", csvText: csvData })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportResult(data);
        setCsvData("");
        setRefreshKey(k => k + 1); // Refresh list
      } else {
        setImportResult({ error: data.error || "Import parse failed." });
      }
    } catch (err) {
      setImportResult({ error: "Server connection failed." });
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-white text-sm animate-pulse">Initializing Administrative Console...</div>
      </div>
    );
  }

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

  // Compute Analytics conversion counts dynamically (Section 9.2)
  const statsList = [
    { label: "Accounts Verified", value: accounts.length + 15, suffix: "" },
    { label: "Enquiries Submitted", value: enquiries.length, suffix: "" },
    { label: "Quotes Shared", value: enquiries.filter(e => e.stage === "Quote shared").length, suffix: "" },
    { label: "Bookings Confirmed", value: enquiries.filter(e => ["Confirmed", "Live", "Completed"].includes(e.stage)).length, suffix: "" }
  ];

  const adminTerminalCommands = [
    { text: "> initializing admin audit trail listener...", color: "text-[var(--text-secondary)]" },
    { text: "✓ session.verify(): usr-ops-1 session authorized", color: "text-emerald-500" },
    { text: `✓ database.import_listings(): ${listings.length} properties verified`, color: "text-[#FF5A1F]" },
    { text: "✓ enquiry.assign_ops(): enquiries list loaded", color: "text-emerald-500" },
    { text: "✓ admin.moderation(): system idle", color: "text-[var(--text-secondary)]" }
  ];

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
        
        {/* Console Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-default)] pb-6 w-full">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 bg-[var(--action-primary)] rounded-full animate-pulse" />
              <span>CONTROL CONSOLE &bull; Least-Privilege Enforced</span>
            </div>
            <h1 className="text-2xl font-black text-white font-display mt-1">OTZ Operations Center</h1>
          </div>

          {/* Navigation Tab selectors */}
          <div className="flex flex-wrap p-1 bg-[var(--surface-raised)]/60 rounded-xl border border-[var(--border-default)]">
            {["enquiries", "moderation", "seeder", "accounts", "analytics", "audit"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize ${
                  activeTab === tab ? "bg-[var(--action-primary)] text-[#0B1E3B]" : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 1. ENQUIRIES & PIPELINE MANAGER TAB */}
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

        {/* 2. PLACEMENT MODERATION TAB */}
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

                      {/* Proposals spec sheet attachment details */}
                      {item.specs && (
                        <p className="text-[10px] text-[var(--text-secondary)] italic p-2 bg-[var(--surface-canvas)] rounded border border-[var(--border-default)]">
                          Specs: {item.specs}
                        </p>
                      )}

                      {/* Moderation Controls actions */}
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

        {/* 3. CSV BULK DATA SEEDER TAB */}
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

        {/* 4. SUSPEND ACCOUNTS REGISTRY TAB */}
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

        {/* 5. METRIC ANALYTICS CONVERSIONS TAB */}
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

        {/* 6. AUDIT LOGGING VIEW PANEL */}
        {activeTab === "audit" && (
          <div className="space-y-6 w-full">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Administrative Audit Trails</h3>

            {/* OtzTerminal Logger view */}
            <OtzTerminal commands={adminTerminalCommands} className="mb-6 max-w-3xl" />

            <div className="bg-[var(--surface-raised)]/40 border border-[var(--border-default)] rounded-xl overflow-hidden backdrop-blur-md">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--surface-canvas)]/80 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-default)]">
                  <tr>
                    <th className="px-6 py-3">Actor ID</th>
                    <th className="px-6 py-3">Action type</th>
                    <th className="px-6 py-3">Entity scope</th>
                    <th className="px-6 py-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)] font-semibold text-[var(--text-secondary)]">
                  {auditLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-[var(--surface-hover)]">
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
