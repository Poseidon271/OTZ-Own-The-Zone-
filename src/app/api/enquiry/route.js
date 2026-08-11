import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

// Helper to verify session server-side
const getSessionUser = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("otz_session");
  if (!sessionCookie) return null;

  const session = db.find("sessions", "token", sessionCookie.value);
  if (!session || session.revoked_at || new Date() > new Date(session.expires_at)) {
    return null;
  }

  const user = db.find("users", "id", session.user_id);
  if (!user) return null;

  const account = db.find("accounts", "id", user.account_id);
  return { ...user, account };
};

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    // 1. Ops Console View (all enquiries)
    if (user.role === "ops" || user.role === "admin") {
      const enquiries = db.get("enquiries");
      // Map listing details and brand account details for ops dashboard
      const detailedEnquiries = enquiries.map((enq) => {
        const enqUser = db.get("users", (u) => u.account_id === enq.account_id)[0] || {};
        const enqAccount = db.find("accounts", "id", enq.account_id) || {};
        const listing = enq.referenced_listing_id ? db.find("listings", "id", enq.referenced_listing_id) : null;
        
        return {
          ...enq,
          userName: enqUser.name,
          userEmail: enqUser.email,
          userPhone: enqUser.phone,
          userCompany: enqAccount.company,
          listingTitle: listing ? listing.title : "Direct Sourcing Request"
        };
      });
      return NextResponse.json({ enquiries: detailedEnquiries });
    }

    // 2. Host View (enquiries on their listings)
    if (user.role === "host") {
      // Find listings owned by host
      const hostListings = db.get("listings", (l) => l.owner_account_id === user.account_id);
      const hostListingIds = hostListings.map((l) => l.id);

      const enquiries = db.get("enquiries", (e) => hostListingIds.includes(e.referenced_listing_id));
      
      // Reveal brand PII only since brand sent the enquiry (compliance check Section 7.3)
      const mappedEnquiries = enquiries.map((enq) => {
        const enqUser = db.get("users", (u) => u.account_id === enq.account_id)[0] || {};
        const enqAccount = db.find("accounts", "id", enq.account_id) || {};
        const listing = db.find("listings", "id", enq.referenced_listing_id);

        return {
          id: enq.id,
          created_at: enq.created_at,
          type: enq.type,
          message: enq.message,
          stage: enq.stage,
          listingTitle: listing ? listing.title : "Listing",
          // PII exposed strictly on sent enquiry
          brandName: enqUser.name,
          brandCompany: enqAccount.company,
          brandEmail: enqUser.email,
          brandPhone: enqUser.phone
        };
      });

      return NextResponse.json({ enquiries: mappedEnquiries });
    }

    // 3. Brand View (their own enquiries)
    if (user.role === "brand") {
      const enquiries = db.get("enquiries", (e) => e.account_id === user.account_id);
      const detailedEnquiries = enquiries.map((enq) => {
        const listing = enq.referenced_listing_id ? db.find("listings", "id", enq.referenced_listing_id) : null;
        return {
          ...enq,
          listingTitle: listing ? listing.title : "Direct Service Request"
        };
      });
      return NextResponse.json({ enquiries: detailedEnquiries });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("GET Enquiries Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to submit enquiries" }, { status: 401 });
    }

    const body = await request.json();
    const { type, source, referenced_listing_id, message, budget_band, timeline, sponsorship_tier } = body;

    if (!type || !message) {
      return NextResponse.json({ error: "Missing required enquiry parameters" }, { status: 400 });
    }

    // Check account status
    if (user.account.state === "unverified") {
      return NextResponse.json({ error: "Verification required. Please verify your phone number via OTP first." }, { status: 403 });
    }

    // Deduplication check (Section 6.4)
    // "A second enquiry from the same account appears on the same timeline rather than as a new record"
    const existingEnquiry = db.get("enquiries", (e) => 
      e.account_id === user.account_id && 
      e.referenced_listing_id === referenced_listing_id && 
      referenced_listing_id !== undefined && 
      referenced_listing_id !== null &&
      ["received", "review", "in review"].includes(e.stage.toLowerCase())
    );

    if (existingEnquiry.length > 0) {
      const parentEnquiry = existingEnquiry[0];
      // Append message as a new entry in notes/timeline instead of double record
      const updatedNotes = parentEnquiry.notes || [];
      updatedNotes.push({
        author: "System (Deduplication Merge)",
        text: `Brand sent follow-up message: "${message}"`,
        timestamp: new Date().toISOString()
      });

      db.update("enquiries", "id", parentEnquiry.id, {
        notes: updatedNotes,
        // Update message to carry newest
        message: `${parentEnquiry.message}\n\n[Follow-up ${new Date().toLocaleDateString()}]: ${message}`
      });

      // Write audit log
      db.insert("audit_logs", {
        actor_id: user.id,
        action: "merge_duplicate_enquiry",
        entity: "enquiries",
        after: parentEnquiry.id,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        merged: true,
        enquiryId: parentEnquiry.id,
        message: "Your follow-up query has been added to your existing enquiry timeline."
      });
    }

    // Create a new Enquiry
    const enquiry = db.insert("enquiries", {
      account_id: user.account_id,
      type, // "listing" | "sponsorship" | "service" | "sourcing"
      source: source || "marketplace",
      referenced_listing_id: referenced_listing_id || null,
      message,
      budget_band: budget_band || null,
      timeline: timeline || null,
      sponsorship_tier: sponsorship_tier || null,
      stage: "Enquiry received", // received | In review | Quote shared | Confirmed | Live | Completed
      assignee: "ops-unassigned",
      notes: [
        {
          author: "System (Capture)",
          text: `Enquiry generated via ${source || "marketplace"} path. Auto-acknowledgement dispatched.`,
          timestamp: new Date().toISOString()
        }
      ]
    });

    // Write audit log
    db.insert("audit_logs", {
      actor_id: user.id,
      action: "create_enquiry",
      entity: "enquiries",
      after: enquiry.id,
      timestamp: new Date().toISOString()
    });

    // Simulate real-time notification to sales/ops (delivered in <60 seconds)
    // Section 6.2: "Real-time notification to sales/ops (email plus Slack or WhatsApp)"
    const notificationLog = {
      enquiryId: enquiry.id,
      channels: ["Slack", "Email"],
      sent_at: new Date().toISOString(),
      payload: `[NEW DEMAND CAPTURED]: Account "${user.account.name}" submitted a ${type} enquiry. Details: "${message.substring(0, 100)}..."`
    };
    console.log("SIMULATED REALTIME NOTIFICATION:", notificationLog);

    return NextResponse.json({
      success: true,
      enquiryId: enquiry.id,
      message: "Enquiry submitted successfully. Our team will contact you shortly."
    });
  } catch (error) {
    console.error("POST Enquiry Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ops" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized access to workflow pipeline" }, { status: 401 });
    }

    const body = await request.json();
    const { id, stage, assignee, noteText } = body;

    if (!id) {
      return NextResponse.json({ error: "Enquiry ID required" }, { status: 400 });
    }

    const enquiry = db.find("enquiries", "id", id);
    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    const updates = {};
    if (stage) updates.stage = stage;
    if (assignee) updates.assignee = assignee;

    // Append new note if noteText is provided
    if (noteText) {
      const updatedNotes = enquiry.notes || [];
      updatedNotes.push({
        author: user.name,
        text: noteText,
        timestamp: new Date().toISOString()
      });
      updates.notes = updatedNotes;
    }

    const updatedEnquiry = db.update("enquiries", "id", id, updates);

    // Audit administrative changes
    db.insert("audit_logs", {
      actor_id: user.id,
      action: "update_enquiry_pipeline",
      entity: "enquiries",
      before: { stage: enquiry.stage, assignee: enquiry.assignee },
      after: { stage: updatedEnquiry.stage, assignee: updatedEnquiry.assignee },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, enquiry: updatedEnquiry });
  } catch (error) {
    console.error("PUT Enquiry Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
