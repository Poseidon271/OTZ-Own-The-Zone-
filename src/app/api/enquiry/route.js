import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/serverAuth";

export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");

    // 1. Ops / Admin Console View (all enquiries)
    if (user.role === "ops" || user.role === "admin") {
      let allEnquiries = [];

      if (isServerSupabaseConfigured()) {
        try {
          const supabase = getSupabaseServer();
          const { data: sbEnq, error: sbErr } = await supabase
            .from("enquiries")
            .select("*")
            .order("created_at", { ascending: false });

          if (!sbErr && Array.isArray(sbEnq)) {
            allEnquiries = sbEnq;
          }
        } catch (e) {
          console.warn("Supabase enquiries fetch notice:", e);
        }
      }

      if (allEnquiries.length === 0) {
        const localEnquiries = db.get("enquiries") || [];
        allEnquiries = localEnquiries.map((enq) => {
          const enqUser = db.get("users", (u) => u.account_id === enq.account_id)[0] || {};
          const enqAccount = db.find("accounts", "id", enq.account_id) || {};
          const listing = enq.referenced_listing_id ? db.find("listings", "id", enq.referenced_listing_id) : null;
          
          return {
            ...enq,
            userName: enq.user_name || enqUser.name,
            userEmail: enq.user_email || enqUser.email,
            userPhone: enq.user_phone || enqUser.phone,
            userCompany: enq.user_company || enqAccount.company,
            listingTitle: enq.listing_title || (listing ? listing.title : "Direct Sourcing Request")
          };
        });
      }

      return NextResponse.json({ enquiries: allEnquiries });
    }

    // 2. Host View (enquiries on their listings)
    if (user.role === "host") {
      const hostListings = db.get("listings", (l) => l.owner_account_id === user.account_id);
      const hostListingIds = hostListings.map((l) => l.id);

      const enquiries = db.get("enquiries", (e) => hostListingIds.includes(e.referenced_listing_id));
      
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
          brandName: enqUser.name,
          brandCompany: enqAccount.company,
          brandEmail: enqUser.email,
          brandPhone: enqUser.phone
        };
      });

      return NextResponse.json({ enquiries: mappedEnquiries });
    }

    // 3. User / Brand View (their own enquiries)
    let userEnquiries = [];

    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: sbData, error: sbErr } = await supabase
          .from("enquiries")
          .select("*")
          .or(`user_id.eq.${user.id},user_email.eq.${user.email}`)
          .order("created_at", { ascending: false });

        if (!sbErr && Array.isArray(sbData)) {
          userEnquiries = sbData;
        }
      } catch (e) {
        console.warn("Supabase user enquiries fetch notice:", e);
      }
    }

    if (userEnquiries.length === 0) {
      const localEnquiries = db.get("enquiries", (e) => 
        e.account_id === user.account_id || 
        e.user_id === user.id || 
        e.user_email === user.email
      ) || [];

      userEnquiries = localEnquiries.map((enq) => {
        const listing = enq.referenced_listing_id ? db.find("listings", "id", enq.referenced_listing_id) : null;
        return {
          ...enq,
          listingTitle: enq.listing_title || (listing ? listing.title : "Direct Service Request")
        };
      });
    }

    return NextResponse.json({ enquiries: userEnquiries });
  } catch (error) {
    console.error("GET Enquiries Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser(request);
    const body = await request.json();
    const {
      type = "listing",
      source,
      referenced_listing_id,
      listing_title,
      message,
      budget_band,
      timeline,
      sponsorship_tier,
      name,
      email,
      phone,
      company
    } = body;

    if (!message) {
      return NextResponse.json({ error: "Enquiry details/message is required" }, { status: 400 });
    }

    const userName = name || user?.name || "Client";
    const userEmail = (email || user?.email || "").trim().toLowerCase();
    const userPhone = phone || user?.phone || "";
    const userCompany = company || user?.company || "Personal Account";

    const payload = {
      user_id: user?.id || null,
      account_id: user?.account_id || user?.id || "guest",
      type: type || "listing",
      source: source || "marketplace",
      referenced_listing_id: referenced_listing_id || null,
      listing_title: listing_title || null,
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone,
      user_company: userCompany,
      message,
      budget_band: budget_band || null,
      timeline: timeline || null,
      sponsorship_tier: sponsorship_tier || null,
      stage: "Enquiry received",
      assignee: "ops-unassigned",
      notes: [
        {
          author: "System (Capture)",
          text: `Enquiry submitted via ${source || "marketplace"} path.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    let createdId = null;

    // 1. Insert into Supabase enquiries table
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: sbData, error: sbErr } = await supabase
          .from("enquiries")
          .insert([payload])
          .select();

        if (!sbErr && sbData && sbData.length > 0) {
          createdId = sbData[0].id;
        } else if (sbErr) {
          console.warn("Supabase enquiry insert notice:", sbErr.message || sbErr);
        }
      } catch (sbEx) {
        console.warn("Supabase server enquiry write exception:", sbEx);
      }
    }

    // 2. Insert into local DB fallback
    try {
      const enquiry = db.insert("enquiries", {
        ...(createdId ? { id: createdId } : {}),
        ...payload
      });
      if (!createdId) createdId = enquiry?.id;
    } catch (_) {}

    return NextResponse.json({
      success: true,
      enquiryId: createdId || "enq-success",
      message: "Enquiry submitted successfully. Our team will contact you shortly."
    });
  } catch (error) {
    console.error("POST Enquiry Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getSessionUser(request);
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
