"use client";

import React from "react";
import { FadeIn } from "../fade-in";
import { KineticTestimonials } from "../kinetic-testimonials";
import { cn } from "@/lib/utils";

const defaultRow1 = [
  {
    quote: "OTZ matched our brand with local cinema spots that tripled offline footfalls in Bandra. The AI mix advisor is incredible.",
    name: "Aria Chen",
    role: "Marketing Director, Luminary Labs",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    quote: "The self-serve marketplace cut our buying process by 80% in the first week. Pre-negotiated rates are extremely competitive.",
    name: "Marcus Webb",
    role: "Head of Growth, Apex Capital",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    quote: "We require strict placement audit logs. The SLA auditing report and host checks made compliance conversations a breeze.",
    name: "Priya Nair",
    role: "Ops Lead, Cirrus Logistics",
    avatar: "https://i.pravatar.cc/100?img=13",
  },
  {
    quote: "Built what would have been a 3-month ad campaign plan in 5 minutes. The verification tracking loops proved the conversion outcomes.",
    name: "Jordan Ito",
    role: "Founder, Stackform",
    avatar: "https://i.pravatar.cc/100?img=14",
  },
];

const defaultRow2 = [
  {
    quote: "Registering our host billboard spots was seamless. Listings went live instantly, and OTP verified workspace sessions are secure.",
    name: "Sam Rivera",
    role: "Host Partner, Bloom Adspace",
    avatar: "https://i.pravatar.cc/100?img=15",
  },
  {
    quote: "Switched from a manual Excel campaign planning spreadsheet. Absolute night and day difference in reach optimization.",
    name: "Lea Hoffmann",
    role: "Brand Exec, DataKraft",
    avatar: "https://i.pravatar.cc/100?img=16",
  },
  {
    quote: "Watch goal conversions mapped directly to live progress gauges. Track SLA reports directly inside the workspace.",
    name: "Kwame Asante",
    role: "VP Marketing, Fora Travel",
    avatar: "https://i.pravatar.cc/100?img=17",
  },
  {
    quote: "Self-serve buying is miles ahead. The workspace cart drawer and automated invoice receipt printout are extremely slick.",
    name: "Mei Zhang",
    role: "VP Operations, Cadence",
    avatar: "https://i.pravatar.cc/100?img=18",
  },
];

export default function Testimonials({
  heading = "Loved by brands & hosts alike.",
  rows = [defaultRow1, defaultRow2],
  className,
}) {
  return (
    <section id="testimonials" className={cn("border-t border-[var(--border-default)] py-24 overflow-hidden text-left relative z-10", className)}>
      <div className="mx-auto max-w-6xl px-5">
        <FadeIn>
          <h2 className="mb-16 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {heading}
          </h2>
        </FadeIn>
      </div>
      <KineticTestimonials rows={rows} />
    </section>
  );
}
