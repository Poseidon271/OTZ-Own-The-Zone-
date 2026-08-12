"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

// Import ScrollX primitives
import { ColumnLines } from "@/components/scrollx/column-lines";
import { ShinyButton } from "@/components/scrollx/shiny-button";
import { VercelCard } from "@/components/scrollx/vercel-card";
import { ChecklistIllustration } from "@/components/scrollx/how-it-works-illustrations";

export default function GoalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const goalData = {
    awareness: {
      title: "Drive Brand Awareness",
      desc: "Establish mass authority and visual mindshare in the attention economy. Ideal for new product rollouts, FMCG brands, and brand rejuvenations.",
      channels: ["TV Slots", "OOH Billboards", "IP Event Sponsorships"],
      strategy: "Combine gantry billboards at major highway tolls with prime time television broadcasting slots to secure multi-angle household recall.",
      deepLinkGoal: "Awareness"
    },
    "app-downloads": {
      title: "Maximize Mobile App Downloads",
      desc: "Minimize install friction by directing high-intent mobile users directly to your App Store & Google Play profiles.",
      channels: ["Digital Splash Box", "Influencer Shorts", "Radio commuter slots"],
      strategy: "Leverage mobile splash interstitials (JioCinema banners) coupled with short-form UGC influencer video reviews carrying promo codes.",
      deepLinkGoal: "App Downloads"
    },
    subscribers: {
      title: "Increase Newsletter Subscribers",
      desc: "Build direct-to-consumer relationship pipelines and own your audience distribution channels.",
      channels: ["Podcast mid-rolls", "Digital portal ads", "Conferences"],
      strategy: "Secure native sponsored posts on leading financial and business news sites combined with host-read sponsorships on top podcasts.",
      deepLinkGoal: "Subscribers"
    },
    orders: {
      title: "Boost E-Commerce Orders & Sales",
      desc: "Drive direct transaction triggers and e-commerce conversions from active consumer traffic zones.",
      channels: ["Influencer Reels", "Digital search ads", "Mall directory kiosks"],
      strategy: "Deploy dynamic creator hauls with link-sharing stickers combined with localized mall directories targeting active shoppers.",
      deepLinkGoal: "Sales"
    },
    "portal-visits": {
      title: "Increase Web & Portal Visits",
      desc: "Increase traffic pipelines to your web portal and landing pages for campaign actions.",
      channels: ["Digital banner boxes", "Podcast sponsor spots", "Transit bus wraps"],
      strategy: "Utilize digital banner slots on targeted directories combined with high-frequency commuter wraps to seed domain awareness.",
      deepLinkGoal: "Portal Visits"
    },
    footfall: {
      title: "Drive Local Retail Footfall",
      desc: "Direct geographical traffic to your physical showrooms, flagship retail stores, and events.",
      channels: ["OOH bus shelters", "Local FM Radio slots", "On-ground events"],
      strategy: "Leverage eye-level bus shelter backlit displays and high-frequency local FM broadcasts during drive-time commute windows.",
      deepLinkGoal: "Footfall"
    }
  };

  const goal = goalData[id] || goalData.awareness;

  const navigateToMarketplace = () => {
    router.push(`/media-buying?goal=${encodeURIComponent(goal.deepLinkGoal)}`);
  };

  return (
    <div className="theme-dark min-h-screen relative flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] overflow-hidden font-sans">
      {/* Background ScrollX Grid Lines */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={25}
        radialFadeEnd={70}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar onLogoClick={() => router.push("/")} />

      <main className="relative z-10 flex-grow pt-32 pb-20 px-6 max-w-5xl mx-auto w-full space-y-8 flex flex-col justify-center text-left">
        
        {/* Breadcrumb back */}
        <div className="space-y-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-xs uppercase font-bold text-[var(--action-primary)] hover:translate-x-[-4px] transition-transform cursor-pointer"
          >
            <MdiIcon name="arrow-left" /> Back to Home
          </button>

          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--action-primary)] animate-pulse" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--action-primary)] font-bold">GOAL-LED SOLUTIONS</p>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display leading-tight">{goal.title}</h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            {goal.desc}
          </p>
        </div>

        {/* Split Bento Layout: Tactics & Channels on Left, Live Progress Checklist on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column: Recommended Tactics & Channels */}
          <div className="lg:col-span-8 space-y-6 w-full">
            {/* Tactics Card */}
            <VercelCard bordered={true} className="p-1 bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl text-left w-full h-full">
              <div className="p-6 space-y-4 w-full text-left">
                <h3 className="text-base font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                  <MdiIcon name="lightbulb-on-outline" className="text-[var(--action-primary)] text-lg" />
                  <span>Recommended Tactics</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                  {goal.strategy}
                </p>
              </div>
            </VercelCard>

            {/* Channels List */}
            <div className="space-y-4 w-full">
              <h4 className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                Primary Target Channels
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {goal.channels.map((ch, idx) => (
                  <VercelCard
                    key={ch}
                    bordered={true}
                    animateOnHover={true}
                    className="p-1 bg-[var(--surface-raised)]/40 text-left w-full h-full"
                  >
                    <div className="p-4 flex items-center gap-3 w-full">
                      <span className="h-6 w-6 rounded-full bg-[var(--action-primary)]/10 text-[var(--action-primary)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--action-primary)]/20">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-white font-bold truncate">{ch}</span>
                    </div>
                  </VercelCard>
                ))}
              </div>
            </div>

            {/* Direct Action Button to pre-filtered marketplace */}
            <div className="pt-4 flex w-full">
              <ShinyButton
                onClick={navigateToMarketplace}
                className="px-8 py-3 text-xs font-bold shadow-lg w-full sm:w-auto"
              >
                <MdiIcon name="shopping-search-outline" className="mr-1.5" />
                <span>Browse Goal-Matched Inventory</span>
              </ShinyButton>
            </div>
          </div>

          {/* Right Column: Live Campaign Progress Checklist illustration */}
          <div className="lg:col-span-4 w-full">
            <VercelCard bordered={true} className="bg-[var(--surface-raised)]/40 backdrop-blur-md rounded-2xl text-left">
              <div className="w-full">
                <p className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-[var(--text-secondary)] mb-2">Campaign tracking SLA</p>
                <ChecklistIllustration />
              </div>
            </VercelCard>
          </div>

        </div>

      </main>
    </div>
  );
}
