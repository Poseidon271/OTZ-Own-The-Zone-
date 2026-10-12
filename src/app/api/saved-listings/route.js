import { NextResponse } from "next/server";
import { getSupabaseServer, isServerSupabaseConfigured } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/serverAuth";

export async function GET(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data, error } = await supabase
          .from("saved_listings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
          return NextResponse.json({ success: true, saved_listings: data });
        }
      } catch (e) {
        console.warn("Supabase saved listings fetch notice:", e);
      }
    }

    return NextResponse.json({ success: true, saved_listings: [] });
  } catch (error) {
    console.error("GET saved listings error:", error);
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
    const { listing_id, listing_data } = body;

    if (!listing_id) {
      return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
    }

    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        const { data, error } = await supabase
          .from("saved_listings")
          .upsert([
            {
              user_id: user.id,
              listing_id: String(listing_id),
              listing_data: listing_data || {},
              created_at: new Date().toISOString()
            }
          ], { onConflict: "user_id,listing_id" })
          .select();

        if (!error) {
          return NextResponse.json({ success: true, item: data?.[0] });
        }
      } catch (e) {
        console.warn("Supabase save listing notice:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST saved listings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listing_id") || searchParams.get("id");

    if (!listingId) {
      return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
    }

    if (isServerSupabaseConfigured()) {
      try {
        const supabase = getSupabaseServer();
        await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", String(listingId));
      } catch (e) {
        console.warn("Supabase delete saved listing notice:", e);
      }
    }

    return NextResponse.json({ success: true, message: "Removed from saved listings" });
  } catch (error) {
    console.error("DELETE saved listings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
