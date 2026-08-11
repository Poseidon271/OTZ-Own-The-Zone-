import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const listing = db.find("listings", "id", id);
      if (!listing || listing.state !== "published") {
        return NextResponse.json({ error: "Listing not found or pending review" }, { status: 404 });
      }
      return NextResponse.json({ listing });
    }

    // Return all published listings
    const listings = db.get("listings", (l) => l.state === "published");
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Listings API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
