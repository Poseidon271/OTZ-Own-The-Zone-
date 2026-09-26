import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/serverAuth";

// GET: Authenticated Administrator access only (RLS & role enforcement)
export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user || (user.role !== "admin" && user.role !== "ops")) {
      return NextResponse.json(
        { error: "Access Denied. Administrator authorization required." },
        { status: 403 }
      );
    }

    // 1. If Supabase Server is configured, retrieve from Supabase
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: sbSubmissions, error: sbError } = await supabase
          .from("vendor_submissions")
          .select("*")
          .order("created_at", { ascending: false });

        if (!sbError && Array.isArray(sbSubmissions)) {
          return NextResponse.json({
            success: true,
            submissions: sbSubmissions
          });
        }
        if (sbError) {
          console.warn("Supabase Server read notice:", sbError.message || sbError);
        }
      } catch (sbErr) {
        console.warn("Supabase Server read fallback:", sbErr);
      }
    }

    // 2. Retrieve vendor submissions from database
    const submissions = db.get("vendor_submissions") || [];

    // Sort by created_at DESC (newest first)
    const sorted = [...submissions].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );

    return NextResponse.json({
      success: true,
      submissions: sorted
    });
  } catch (error) {
    console.error("GET Vendor Submissions Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Public submission of "Join the OTZ Media Network" vendor form
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, company, business_name, phone, email, media_type, mediaType } = body;

    const finalName = (name || "").trim();
    const finalCompany = (company || business_name || "").trim();
    const finalPhone = (phone || "").trim();
    const finalEmail = (email || "").trim().toLowerCase();
    const finalMediaType = (media_type || mediaType || "OOH").trim();

    // Validation
    if (!finalName) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }
    if (!finalCompany) {
      return NextResponse.json({ error: "Business / Brand Name is required" }, { status: 400 });
    }
    if (!finalPhone || !/^\d{7,15}$/.test(finalPhone.replace(/\D/g, ""))) {
      return NextResponse.json({ error: "A valid phone number is required" }, { status: 400 });
    }
    if (!finalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) {
      return NextResponse.json({ error: "A valid work email is required" }, { status: 400 });
    }

    let createdId = null;

    // 1. Insert into Supabase if configured
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: sbData, error: sbError } = await supabase
          .from("vendor_submissions")
          .insert([
            {
              name: finalName,
              business_name: finalCompany,
              phone: finalPhone,
              email: finalEmail,
              media_type: finalMediaType,
              status: "New"
            }
          ])
          .select();

        if (sbError) {
          console.error("Supabase vendor insert error:", sbError.message || sbError);
        } else if (sbData && sbData.length > 0) {
          createdId = sbData[0].id;
        }
      } catch (sbErr) {
        console.error("Supabase Server write exception:", sbErr.message || sbErr);
      }
    }

    // 2. Safe local fallback persistence (tolerant to serverless read-only filesystems)
    try {
      const submission = db.insert("vendor_submissions", {
        ...(createdId ? { id: createdId } : {}),
        name: finalName,
        business_name: finalCompany,
        phone: finalPhone,
        email: finalEmail,
        media_type: finalMediaType,
        status: "New"
      });

      // Write audit log
      db.insert("audit_logs", {
        actor_id: "public_vendor",
        action: "vendor_network_submission",
        entity: "vendor_submissions",
        after: { id: submission?.id || createdId || "sub", business_name: finalCompany, media_type: finalMediaType },
        timestamp: new Date().toISOString()
      });
    } catch (localDbErr) {
      console.warn("Local storage write notice (serverless):", localDbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Thanks! Your request has been received. Our team will get in touch with you soon."
    });
  } catch (error) {
    console.error("POST Vendor Submission Error:", error.message || error);
    return NextResponse.json({ error: "Unable to submit your request right now. Please try again." }, { status: 500 });
  }
}

// PUT / PATCH: Admin update of submission status
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
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    let updatedRecord = null;

    // Update Supabase if configured
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: sbUpdated, error: sbErr } = await supabase
          .from("vendor_submissions")
          .update(updates)
          .eq("id", id)
          .select();
        if (!sbErr && sbUpdated && sbUpdated.length > 0) {
          updatedRecord = sbUpdated[0];
        }
      } catch (sbErr) {
        console.warn("Supabase update fallback:", sbErr);
      }
    }

    const existing = db.find("vendor_submissions", "id", id);
    if (existing) {
      const localUpdated = db.update("vendor_submissions", "id", id, updates);
      if (!updatedRecord) updatedRecord = localUpdated;
    }

    if (!updatedRecord && !existing && !isServerSupabaseConfigured()) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Write audit log
    db.insert("audit_logs", {
      actor_id: user.id,
      action: "update_vendor_submission",
      entity: "vendor_submissions",
      before: { id, status: existing?.status },
      after: { id, status: updates.status || existing?.status },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      submission: updatedRecord || { id, ...updates }
    });
  } catch (error) {
    console.error("PUT Vendor Submission Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Admin deletion of submission
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
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 });
    }

    // Delete in Supabase if configured
    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        await supabase.from("vendor_submissions").delete().eq("id", id);
      } catch (sbErr) {
        console.warn("Supabase delete fallback:", sbErr);
      }
    }

    db.delete("vendor_submissions", "id", id);

    db.insert("audit_logs", {
      actor_id: user.id,
      action: "delete_vendor_submission",
      entity: "vendor_submissions",
      before: { id },
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: "Submission removed." });
  } catch (error) {
    console.error("DELETE Vendor Submission Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
