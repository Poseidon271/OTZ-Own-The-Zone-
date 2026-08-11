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

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // 1. UPDATE BRAND PROFILE (Section 2.8)
    if (action === "update-profile") {
      if (user.role !== "brand") {
        return NextResponse.json({ error: "Only brands can update brand profiles" }, { status: 403 });
      }

      const { niche, goals, primary_goal, budget_band, geography, timeline } = body;

      // Find profile
      const profile = db.find("brand_profiles", "account_id", user.account_id);
      let updatedProfile;

      const profileData = {
        niche: niche || "",
        goals: goals || [],
        primary_goal: primary_goal || "",
        budget_band: budget_band || "",
        geography: geography || "",
        timeline: timeline || ""
      };

      if (profile) {
        updatedProfile = db.update("brand_profiles", "account_id", user.account_id, profileData);
      } else {
        updatedProfile = db.insert("brand_profiles", {
          account_id: user.account_id,
          ...profileData
        });
      }

      // Log audit trail
      db.insert("audit_logs", {
        actor_id: user.id,
        action: "update_brand_profile",
        entity: "brand_profiles",
        after: updatedProfile,
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true, profile: updatedProfile });
    }

    // 2. DELETE ACCOUNT (Section 2.10)
    if (action === "delete-account") {
      // DPDP Account Deletion Rule
      const accountId = user.account_id;
      
      // Mark sessions as revoked
      const sessions = db.get("sessions", (s) => s.user_id === user.id);
      sessions.forEach((s) => {
        db.update("sessions", "id", s.id, { revoked_at: new Date().toISOString() });
      });

      // Update account status to deleted / suspended (or delete entirely in 30 days)
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

      return NextResponse.json({ success: true, message: "Account deletion requested. 30-day retention window holds." });
    }

    // 3. EXPORT DATA (Section 2.10)
    if (action === "export-data") {
      const brandProfile = db.find("brand_profiles", "account_id", user.account_id);
      const enquiries = db.get("enquiries", (e) => e.account_id === user.account_id);
      const sessions = db.get("sessions", (s) => s.user_id === user.id);

      const exportPayload = {
        exported_at: new Date().toISOString(),
        account: user.account,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        brand_profile: brandProfile || null,
        enquiries: enquiries || [],
        session_history: sessions || []
      };

      return NextResponse.json({ success: true, data: exportPayload });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
