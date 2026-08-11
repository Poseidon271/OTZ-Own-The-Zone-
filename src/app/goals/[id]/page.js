"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

export default function GoalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const goalData = {
    awareness: {
      title: "Drive Brand Awareness",
      desc: "Establish mass authority and visual mindshare in the attention economy. Ideal for new product rollouts, FMCG brands, and brand rejuvenations.",
      channels: ["TV Slots", "OOH Billboards", "IP Event Sponsorships"],
      strategy: "Combine high-reach gantry billboards at major tolls (like Bandra Worli Sea Link or DND Flyway) with prime time broadcasting slots to secure multi-angle household recall.",
      deepLinkGoal: "Awareness"
    },
    "app-downloads": {
      title: "Maximize Mobile App Downloads",
      desc: "Minimize install friction by directing high-intent mobile users directly to your App Store & Google Play profiles.",
      channels: ["Digital In-App Splash Box", "Influencer YouTube Shorts", "Radio commuter slots"],
      strategy: "Leverage mobile splash interstitials (JioCinema banners) coupled with short-form UGC influencer video reviews carrying promo codes.",
      deepLinkGoal: "App Downloads"
    },
    subscribers: {
      title: "Increase Newsletter & Portal Subscribers",
      desc: "Build direct-to-consumer relationship pipelines and own your audience distribution channels.",
      channels: ["Tech & Fin Podcast mid-rolls", "Digital News portal box ads", "Conferences"],
      strategy: "Secure native sponsored posts on leading financial and business news sites combined with host-read sponsorships on top podcasts.",
      deepLinkGoal: "Subscribers"
    },
    orders: {
      title: "Boost E-Commerce Orders & Sales",
      desc: "Drive direct transaction triggers and e-commerce conversions from active consumer traffic zones.",
      channels: ["Influencer Reels", "Digital search displays", "Mall directory kiosks"],
      strategy: "Deploy dynamic creator hauls with link-sharing stickers combined with localized mall directories targeting active shoppers.",
      deepLinkGoal: "Sales"
    },
    "portal-visits": {
      title: "Increase Web & Portal Visits",
      desc: "Increase traffic pipelines to your web portal and landing pages for campaign actions.",
      channels: ["Digital banner boxes", "Podcast sponsor mentions", "Transit bus wraps"],
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
    <div className="theme-dark min-h-screen relative flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      <Navbar onLogoClick={() => router.push("/")} />

      <main className="relative z-10 flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full space-y-8 flex flex-col justify-center">
        <div className="space-y-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-caption-default uppercase font-bold text-[var(--action-primary)] hover:translate-x-[-4px] transition-transform"
          >
            <MdiIcon name="arrow-left" /> Back to Home
          </button>

          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--action-primary)] animate-pulse" />
            <p className="text-caption-default uppercase tracking-[0.2em] text-[var(--action-primary)]">GOAL-LED SOLUTIONS</p>
          </div>

          <h1 className="text-display text-white">{goal.title}</h1>
          <p className="text-body-default text-[var(--text-secondary)] leading-relaxed">
            {goal.desc}
          </p>
        </div>

        {/* Strategy Advice */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <h3 className="text-h3 text-white flex items-center gap-2">
            <MdiIcon name="lightbulb-on-outline" className="text-[var(--action-primary)]" />
            <span>Recommended Tactics</span>
          </h3>
          <p className="text-small text-[var(--text-secondary)] leading-relaxed">
            {goal.strategy}
          </p>
        </div>

        {/* Recommended Channels List */}
        <div className="space-y-4">
          <h4 className="text-caption-default uppercase font-bold tracking-wider text-[var(--text-tertiary)]">
            Primary Target Channels
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {goal.channels.map((ch, idx) => (
              <div
                key={ch}
                className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-3"
              >
                <span className="h-6 w-6 rounded-full bg-[var(--action-primary)]/20 text-[var(--action-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </span>
                <span className="text-small text-white font-bold">{ch}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Action Button to pre-filtered marketplace */}
        <div className="pt-6 text-center">
          <button
            onClick={navigateToMarketplace}
            className="btn-primary px-8 font-bold focus-ring shadow-lg w-full sm:w-auto"
            style={{ color: "#0B1E3B" }}
          >
            <MdiIcon name="shopping-search-outline" />
            <span>Browse Goal-Matched Inventory</span>
          </button>
        </div>
      </main>
    </div>
  );
}
