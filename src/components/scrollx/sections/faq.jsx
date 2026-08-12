"use client";

import React, { useState } from "react";
import { FadeIn } from "../fade-in";
import { ShinyButton } from "../shiny-button";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const defaultItems = [
  { q: "How does the pricing engine calculate campaign rates?", a: "OTZ aggregates negotiated bulk rates directly from parent OOH, TV, and print networks, bypassing standard middleman agency markups. This translates to lower CPMs and optimized budgets for our brands." },
  { q: "Can I bring my own creative assets?", a: "Yes. Brands can upload custom image (PNG/JPG), video (MP4), and digital HTML5 assets directly inside the campaign builder. Alternatively, our upcoming Production engine will generate creative assets optimized for the exact zones you own." },
  { q: "How are campaign outcomes verified?", a: "We compile host logs, GPS spot logs, cinema ticket sales reports, and digital impressions to verify placements. A complete SLA audit verification report is published to your dashboard." },
  { q: "Is there a minimum budget limit?", a: "You can buy individual marketplace listing spots for as low as ₹1,000. For multi-channel AI-planned strategies, the mixing engine is optimized to generate packages between ₹1L and ₹1Cr." },
  { q: "How do host listings get verified in the marketplace?", a: "Hosts submit placement details (specs, rates, reach metrics). Our admin operations desk reviews coordinates, verifies parameters, and lists the approved assets live in the marketplace catalog." },
];

function FAQRow({ q, a, isOpen, onToggle }) {
  return (
    <motion.div layout className="border-b border-[var(--border-default)]">
      <button onClick={onToggle} className="flex w-full items-start justify-between gap-4 py-5 text-left cursor-pointer group">
        <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--action-primary)] transition-colors">{q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-secondary)]", isOpen && "border-[var(--action-primary)] bg-[var(--action-primary)] text-[#0B1E3B]")}
        >
          {isOpen ? <Minus className="size-3" /> : <Plus className="size-3" />}
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="overflow-hidden">
            <motion.p initial={{ y: -6 }} animate={{ y: 0 }} exit={{ y: -6 }} transition={{ duration: 0.25, ease: "easeOut" }} className="pb-5 text-xs leading-relaxed text-[var(--text-secondary)]">
              {a}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ({
  heading = "Questions? We've got answers.",
  subtext = "Still not sure? Start a secure workspace session or chat with our operations desk.",
  ctaText = "Chat with Ops",
  ctaHref = "https://wa.me/919999999999?text=I%27m%20interested%20in%20Own%20The%20Zone%20campaigns",
  items = defaultItems,
  className,
}) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className={cn("border-t border-[var(--border-default)] px-5 py-24 text-left relative z-10", className)}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <FadeIn>
            <div className="flex flex-col gap-4 lg:sticky lg:top-28">
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">{heading}</h2>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-[var(--text-secondary)]">{subtext}</p>
              <ShinyButton href={ctaHref} className="mt-2 w-fit gap-2 font-bold">{ctaText}</ShinyButton>
            </div>
          </FadeIn>
          <FadeIn delay={0.1} className="w-full">
            <div className="border-t border-[var(--border-default)]">
              {items.map((item, idx) => (
                <FAQRow key={idx} q={item.q} a={item.a} isOpen={openIndex === idx} onToggle={() => setOpenIndex(openIndex === idx ? null : idx)} />
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
