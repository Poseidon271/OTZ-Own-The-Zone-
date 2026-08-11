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
    if (!user || (user.role !== "ops" && user.role !== "admin")) {
      return NextResponse.json({ error: "Access Denied. Operations authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // 1. APPROVE & PUBLISH LISTING (Section 7.2)
    if (action === "publish-listing") {
      const { id } = body;
      const listing = db.find("listings", "id", id);
      if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

      db.update("listings", "id", id, { state: "published", verified: true });
      
      // Audit log
      db.insert("audit_logs", {
        actor_id: user.id,
        action: "publish_listing",
        entity: "listings",
        before: { state: listing.state, verified: listing.verified },
        after: { state: "published", verified: true },
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: "Listing approved and published." });
    }

    // 2. REJECT LISTING (Section 7.2)
    if (action === "reject-listing") {
      const { id, reason } = body;
      if (!reason) return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });

      const listing = db.find("listings", "id", id);
      if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

      db.update("listings", "id", id, { state: "rejected", rejection_reason: reason });

      // Audit log
      db.insert("audit_logs", {
        actor_id: user.id,
        action: "reject_listing",
        entity: "listings",
        before: { state: listing.state },
        after: { state: "rejected", rejection_reason: reason },
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: "Listing marked as rejected." });
    }

    // 3. TOGGLE ACCOUNT SUSPENSION (Section 8.3)
    if (action === "toggle-suspension") {
      const { accountId } = body;
      const account = db.find("accounts", "id", accountId);
      if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

      const newState = account.state === "suspended" ? "verified" : "suspended";
      db.update("accounts", "id", accountId, { state: newState });

      // Audit log
      db.insert("audit_logs", {
        actor_id: user.id,
        action: newState === "suspended" ? "suspend_account" : "restore_account",
        entity: "accounts",
        before: { state: account.state },
        after: { state: newState },
        timestamp: new Date().toISOString()
      });

      return NextResponse.json({ success: true, state: newState });
    }

    // 4. CSV BULK IMPORT (Section 8.1)
    if (action === "import-csv") {
      const { csvText } = body;
      if (!csvText) return NextResponse.json({ error: "CSV data is empty" }, { status: 400 });

      const lines = csvText.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      
      const successItems = [];
      const errorRows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV cell splitter (handles double quotes lightly)
        const cells = line.split(",").map(c => c.replace(/^["']|["']$/g, "").trim());
        
        // Construct row object
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = cells[idx] || "";
        });

        // Validate mandatory structured fields (Section 4.2)
        const rowNum = i + 1;
        if (!row.title) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: title" });
          continue;
        }
        if (!row.media_type) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: media_type" });
          continue;
        }
        if (!row.parent_network) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: parent_network" });
          continue;
        }
        if (!row.geography) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: geography" });
          continue;
        }
        if (!row.visibility_metric) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: visibility_metric" });
          continue;
        }
        if (!row.reach_source) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: reach_source" });
          continue;
        }
        if (!row.price_band) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: price_band" });
          continue;
        }
        if (!row.formats) {
          errorRows.push({ row: rowNum, error: "Missing mandatory: formats" });
          continue;
        }

        // Insert listing directly as verified & published (since it's uploaded by admin)
        const listing = db.insert("listings", {
          owner_account_id: "acc-ops-1",
          media_type: row.media_type,
          title: row.title,
          parent_network: row.parent_network,
          geography: [row.geography],
          niche_tags: [row.niche_tags || "FMCG"],
          language: [row.language || "English"],
          visibility_metric: row.visibility_metric,
          reach_source: row.reach_source,
          reach_date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          price_band: row.price_band,
          raw_price: parseFloat(row.raw_price) || 50000,
          formats: row.formats.split(";").map(f => f.trim()),
          state: "published",
          verified: true,
          is_otz_original: row.is_otz_original?.toLowerCase() === "true"
        });

        successItems.push(listing.id);
      }

      // Audit logs
      if (successItems.length > 0) {
        db.insert("audit_logs", {
          actor_id: user.id,
          action: "csv_bulk_import",
          entity: "listings",
          after: { count: successItems.length, ids: successItems },
          timestamp: new Date().toISOString()
        });
      }

      return NextResponse.json({
        success: true,
        importedCount: successItems.length,
        errorRows
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin POST API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
