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
    if (!user || user.role !== "host") {
      return NextResponse.json({ error: "Only registered hosts can submit listings." }, { status: 401 });
    }

    const body = await request.json();
    const { title, media_type, parent_network, geography, niche_tags, language, visibility_metric, reach_source, price_band, raw_price, formats, specs } = body;

    // Enforce required structured fields (Section 4.2 & 7.1)
    if (!title || !media_type || !parent_network || !geography || !niche_tags || !visibility_metric || !reach_source || !price_band || !formats) {
      return NextResponse.json({ error: "Missing mandatory listing fields." }, { status: 400 });
    }

    // Create submitted listing
    const listing = db.insert("listings", {
      owner_account_id: user.account_id,
      media_type,
      title,
      parent_network,
      geography: Array.isArray(geography) ? geography : [geography],
      niche_tags: Array.isArray(niche_tags) ? niche_tags : [niche_tags],
      language: Array.isArray(language) ? language : [language || "English"],
      visibility_metric,
      reach_source,
      reach_date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      price_band,
      raw_price: parseFloat(raw_price) || 50000,
      formats: Array.isArray(formats) ? formats : [formats],
      state: "submitted", // submitted | published | rejected
      verified: false,
      is_otz_original: false,
      specs: specs || ""
    });

    // Write audit log
    db.insert("audit_logs", {
      actor_id: user.id,
      action: "submit_host_listing",
      entity: "listings",
      after: listing.id,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      listingId: listing.id,
      message: "Listing submitted for ops review."
    });
  } catch (error) {
    console.error("Listing submission API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
