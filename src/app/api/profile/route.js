import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/serverAuth";

export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = user.profile;

    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data: profData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profData) {
          profile = profData;
        }
      } catch (e) {
        console.warn("Supabase profile fetch notice:", e);
      }
    }

    return NextResponse.json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // 1. UPDATE USER / BRAND PROFILE
    if (action === "update-profile") {
      const {
        name,
        full_name,
        phone,
        company,
        niche,
        goals,
        primary_goal,
        budget_band,
        geography,
        timeline
      } = body;

      const updatedName = (full_name || name || user.name || "").trim();
      const updatedPhone = (phone !== undefined ? phone : user.phone || "").trim();
      const updatedCompany = (company !== undefined ? company : user.company || "").trim();

      const profileData = {
        full_name: updatedName,
        phone: updatedPhone,
        company: updatedCompany,
        niche: niche || "",
        goals: Array.isArray(goals) ? goals : [],
        primary_goal: primary_goal || "",
        budget_band: budget_band || "",
        geography: geography || "",
        timeline: timeline || "",
        updated_at: new Date().toISOString()
      };

      let updatedProfile = null;

      // Update Supabase profiles table
      if (isServerSupabaseConfigured()) {
        try {
          const supabase = getSupabaseServer();
          const { data: sbProfile, error: sbError } = await supabase
            .from("profiles")
            .upsert([
              {
                id: user.id,
                email: user.email,
                ...profileData
              }
            ], { onConflict: "id" })
            .select()
            .maybeSingle();

          if (!sbError && sbProfile) {
            updatedProfile = sbProfile;
          }
        } catch (sbErr) {
          console.warn("Supabase profile update fallback:", sbErr);
        }
      }

      // Update local db fallback
      const localProfile = db.find("brand_profiles", "account_id", user.account_id || user.id);
      if (localProfile) {
        db.update("brand_profiles", "account_id", user.account_id || user.id, profileData);
      } else {
        db.insert("brand_profiles", {
          account_id: user.account_id || user.id,
          ...profileData
        });
      }

      // Update local user record
      const localUser = db.find("users", "id", user.id);
      if (localUser) {
        db.update("users", "id", user.id, {
          name: updatedName,
          phone: updatedPhone
        });
      }

      // Log audit trail
      db.insert("audit_logs", {
        actor_id: user.id,
        action: "update_profile",
        entity: "profiles",
        after: profileData,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        profile: updatedProfile || profileData,
        user: {
          ...user,
          name: updatedName,
          phone: updatedPhone,
          company: updatedCompany,
          profile: updatedProfile || profileData
        }
      });
    }

    // 2. DELETE ACCOUNT (DPDP compliance)
    if (action === "delete-account") {
      const accountId = user.account_id || user.id;
      
      // Mark local sessions as revoked
      const sessions = db.get("sessions", (s) => s.user_id === user.id);
      sessions.forEach((s) => {
        db.update("sessions", "id", s.id, { revoked_at: new Date().toISOString() });
      });

      // Update local account status to deleted / suspended
      db.update("accounts", "id", accountId, { state: "suspended", deleted_at: new Date().toISOString() });

      // Log administrative audit
      db.insert("audit_logs", {
        actor_id: user.id,
        action: "request_account_deletion",
        entity: "accounts",
        after: { id: accountId, state: "suspended", delete_requested_at: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });

      // Clear session cookie
      const cookieStore = await cookies();
      cookieStore.set("otz_session", "", { expires: new Date(0), path: "/" });
      cookieStore.set("otz_token", "", { expires: new Date(0), path: "/" });

      return NextResponse.json({ success: true, message: "Account deletion requested. 30-day retention window holds." });
    }

    // 3. EXPORT DATA (DPDP compliance)
    if (action === "export-data") {
      let brandRequests = [];
      let enquiries = [];

      if (isServerSupabaseConfigured()) {
        try {
          const supabase = getSupabaseServer();
          const { data: brData } = await supabase
            .from("brand_requests")
            .select("*")
            .or(`user_id.eq.${user.id},email.eq.${user.email}`);
          if (brData) brandRequests = brData;

          const { data: enqData } = await supabase
            .from("enquiries")
            .select("*")
            .or(`user_id.eq.${user.id},user_email.eq.${user.email}`);
          if (enqData) enquiries = enqData;
        } catch (_) {}
      }

      if (enquiries.length === 0) {
        enquiries = db.get("enquiries", (e) => e.account_id === user.account_id || e.user_id === user.id) || [];
      }

      const exportPayload = {
        exported_at: new Date().toISOString(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          company: user.company
        },
        profile: user.profile || null,
        enquiries: enquiries || [],
        brand_requests: brandRequests || []
      };

      return NextResponse.json({ success: true, data: exportPayload });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

