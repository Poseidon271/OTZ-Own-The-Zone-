import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/serverAuth";

// GET: Authenticated Administrator & Ops access only (RLS & role enforcement)
export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user || (user.role !== "admin" && user.role !== "ops")) {
      return NextResponse.json(
        { error: "Access Denied. Administrator authorization required." },
        { status: 403 }
      );
    }

    // 1. If Supabase Server is configured, retrieve from Supabase brand_requests table
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: sbRequests, error: sbError } = await supabase
          .from("brand_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (!sbError && Array.isArray(sbRequests)) {
          return NextResponse.json({
            success: true,
            brand_requests: sbRequests,
            requests: sbRequests
          });
        }
        if (sbError) {
          console.warn("Supabase Server brand_requests read notice:", sbError.message || sbError);
        }
      } catch (sbErr) {
        console.warn("Supabase Server brand_requests read fallback:", sbErr);
      }
    }

    // 2. Retrieve brand requests from local database fallback
    const requests = db.get("brand_requests") || [];

    // Sort by created_at DESC (newest first)
    const sorted = [...requests].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    return NextResponse.json({
      success: true,
      brand_requests: sorted,
      requests: sorted
    });
  } catch (error) {
    console.error("GET Brand Requests Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Public submission of Brand Media Request forms
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      company,
      company_name,
      phone,
      email,
      media_channel,
      selectedMedia,
      request_details,
      status,
      admin_notes
    } = body;

    const finalName = (name || "").trim();
    const finalCompany = (company_name || company || "").trim();
    const finalPhone = (phone || "").trim();
    const finalEmail = (email || "").trim().toLowerCase();
    const finalMediaChannel = (media_channel || selectedMedia || "").trim();
    const finalRequestDetails =
      request_details && typeof request_details === "object"
        ? request_details
        : {};
    const finalStatus = (status || "New").trim();

    // Validation
    if (!finalName) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }
    if (!finalCompany) {
      return NextResponse.json({ error: "Company / Organisation name is required" }, { status: 400 });
    }
    if (!finalPhone || !/^\d{7,15}$/.test(finalPhone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "A valid contact phone number is required" }, { status: 400 });
    }
    if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (!finalMediaChannel) {
      return NextResponse.json({ error: "Media channel vertical is required" }, { status: 400 });
    }

    let createdId = null;
    let createdRecord = null;

    // 1. Insert into Supabase brand_requests table if configured
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const insertPayload = {
          name: finalName,
          company_name: finalCompany,
          phone: finalPhone,
          email: finalEmail,
          media_channel: finalMediaChannel,
          request_details: finalRequestDetails,
          status: finalStatus
        };

        if (admin_notes) {
          insertPayload.admin_notes = admin_notes;
        }

        const { data: sbData, error: sbError } = await supabase
          .from("brand_requests")
          .insert([insertPayload])
          .select();

        if (sbError) {
          console.error("Supabase brand_requests insert error:", sbError.message || sbError);
        } else if (sbData && sbData.length > 0) {
          createdId = sbData[0].id;
          createdRecord = sbData[0];
        }
      } catch (sbErr) {
        console.error("Supabase Server brand_requests write exception:", sbErr.message || sbErr);
      }
    }

    // 2. Safe local fallback persistence (tolerant to serverless read-only filesystems)
    try {
      const record = db.insert("brand_requests", {
        ...(createdId ? { id: createdId } : {}),
        name: finalName,
        company_name: finalCompany,
        phone: finalPhone,
        email: finalEmail,
        media_channel: finalMediaChannel,
        request_details: finalRequestDetails,
        status: finalStatus,
        admin_notes: admin_notes || null
      });

      if (!createdRecord) createdRecord = record;

      // Write audit log
      db.insert("audit_logs", {
        actor_id: "public_brand",
        action: "brand_media_request_submission",
        entity: "brand_requests",
        after: {
          id: record?.id || createdId || "brq",
          company_name: finalCompany,
          media_channel: finalMediaChannel
        },
        timestamp: new Date().toISOString()
      });
    } catch (localDbErr) {
      console.warn("Local storage write notice (serverless):", localDbErr.message);
    }

    return NextResponse.json({
      success: true,
      id: createdId || createdRecord?.id,
      message: "Inquiry Submitted. An OTZ media specialist will share custom availability and rate cards within 24 hours."
    });
  } catch (error) {
    console.error("POST Brand Request Error:", error.message || error);
    return NextResponse.json({ error: "Unable to submit your proposal request. Please try again." }, { status: 500 });
  }
}

// PUT / PATCH: Admin update of brand request status / admin notes
export async function PUT(request) {
  try {
    const user = await getSessionUser(request);
    if (!user || (user.role !== "admin" && user.role !== "ops")) {
      return NextResponse.json(
        { error: "Access Denied. Administrator authorization required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, status, admin_notes, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Brand Request ID is required" }, { status: 400 });
    }

    const updates = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;
    if (notes !== undefined && admin_notes === undefined) updates.admin_notes = notes;

    let updatedRecord = null;

    // Update Supabase if configured
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: sbUpdated, error: sbErr } = await supabase
          .from("brand_requests")
          .update(updates)
          .eq("id", id)
          .select();
        if (!sbErr && sbUpdated && sbUpdated.length > 0) {
          updatedRecord = sbUpdated[0];
        }
      } catch (sbErr) {
        console.warn("Supabase brand_requests update fallback:", sbErr);
      }
    }

    const existing = db.find("brand_requests", "id", id);
    if (existing) {
      const localUpdated = db.update("brand_requests", "id", id, updates);
      if (!updatedRecord) updatedRecord = localUpdated;
    }

    if (!updatedRecord && !existing && !isServerSupabaseConfigured()) {
      return NextResponse.json({ error: "Brand request not found" }, { status: 404 });
    }

    // Write audit log
    db.insert("audit_logs", {
      actor_id: user.id,
      action: "update_brand_request",
      entity: "brand_requests",
      before: { id, status: existing?.status },
      after: { id, status: updates.status || existing?.status, admin_notes: updates.admin_notes },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      brand_request: updatedRecord || { id, ...updates }
    });
  } catch (error) {
    console.error("PUT Brand Request Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Admin deletion of brand request
export async function DELETE(request) {
  try {
    const user = await getSessionUser(request);
    if (!user || (user.role !== "admin" && user.role !== "ops")) {
      return NextResponse.json(
        { error: "Access Denied. Administrator authorization required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Brand Request ID is required" }, { status: 400 });
    }

    // Delete in Supabase if configured
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        await supabase.from("brand_requests").delete().eq("id", id);
      } catch (sbErr) {
        console.warn("Supabase brand_requests delete fallback:", sbErr);
      }
    }

    db.delete("brand_requests", "id", id);

    db.insert("audit_logs", {
      actor_id: user.id,
      action: "delete_brand_request",
      entity: "brand_requests",
      before: { id },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Brand request removed." });
  } catch (error) {
    console.error("DELETE Brand Request Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
