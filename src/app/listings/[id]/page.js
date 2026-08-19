import React from "react";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import ListingClientPage from "./ListingClientPage";

// Dynamic metadata generation for SEO (Section 4.3 & 10.2)
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const listing = db.find("listings", "id", id);
  
  if (!listing) {
    return {
      title: "Listing Not Found | Own The Zone",
      description: "This advertising zone is not available in our catalog."
    };
  }

  return {
    title: `Advertise on ${listing.title} | OTZ`,
    description: `Book prime ${listing.media_type} ad slots on ${listing.title} with verified reach of ${listing.visibility_metric} (${listing.reach_source}).`,
    alternates: {
      canonical: `/listings/${listing.id}`
    }
  };
}

export default async function ListingPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const listing = db.find("listings", "id", id);

  if (!listing) {
    return (
      <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-h1 text-[var(--status-error)] mb-2">Listing Not Found</h1>
        <p className="text-small text-[var(--text-secondary)]">The requested advertisement zone does not exist or has been removed.</p>
        <a href="/media-buying" className="btn-primary mt-6">Return to Marketplace</a>
      </div>
    );
  }

  // Generate JSON-LD Schema (Section 4.3)
  const isEvent = listing.media_type === "Event or Venue";
  const jsonLd = isEvent
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": listing.title,
        "description": `Sponsor ${listing.title} with verified target audience visibility of ${listing.visibility_metric}.`,
        "startDate": listing.event_date || "2026-11-01",
        "location": {
          "@type": "Place",
          "name": listing.geography[0] || "Mumbai",
          "address": listing.geography[0] || "Mumbai, India"
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": listing.price_band,
          "category": "Sponsorship"
        }
      }
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": listing.title,
        "image": listing.image_url,
        "description": `Book advertising space on ${listing.title} with verified reach of ${listing.visibility_metric}.`,
        "brand": {
          "@type": "Brand",
          "name": listing.parent_network
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": listing.price_band,
          "availability": "https://schema.org/InStock"
        }
      };

  return (
    <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      {/* Schema.org Structured Data Injector */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <ListingClientPage listing={listing} />
    </div>
  );
}
