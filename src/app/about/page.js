"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="theme-dark min-h-screen relative flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)]">
      <Navbar onLogoClick={() => router.push("/")} />

      <main className="relative z-10 flex-grow pt-32 pb-20 px-6 max-w-4xl mx-auto w-full space-y-12">
        {/* Back navigation */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-caption-default uppercase font-bold text-[var(--action-primary)] hover:translate-x-[-4px] transition-transform"
        >
          <MdiIcon name="arrow-left" /> Back to Home
        </button>

        {/* Section 1: About Us / How it works */}
        <section id="about" className="space-y-4">
          <h1 className="text-display text-white">About Own The Zone</h1>
          <p className="text-body-default text-[var(--text-secondary)] leading-relaxed">
            Own The Zone (OTZ) is a premium media and advertising marketplace connecting verified brands with high-recall physical and creator inventory zones. We eliminate agency overhead, offering verified reach statistics (BARC, IRS, and platform analytics) and secure direct booking pipelines in minutes.
          </p>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="text-h3 text-white">How it Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-caption-default text-[var(--action-primary)] font-bold">1. PROFILE</span>
                <p className="text-small text-[var(--text-secondary)] mt-1">Specify your campaign objective, budget parameters, and audience niches.</p>
              </div>
              <div>
                <span className="text-caption-default text-[var(--action-primary)] font-bold">2. DISCOVER</span>
                <p className="text-small text-[var(--text-secondary)] mt-1">Browse goal-matched properties from OOH billboards to premium creator channels.</p>
              </div>
              <div>
                <span className="text-caption-default text-[var(--action-primary)] font-bold">3. SECURE</span>
                <p className="text-small text-[var(--text-secondary)] mt-1">Submit inquiries directly. Our ops desk coordinates quotes, schedules, and assets.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Privacy Policy (DPDP / GDPR Compliant) */}
        <section id="privacy" className="space-y-4 border-t border-white/10 pt-8">
          <h2 className="text-h2 text-white">Privacy Policy</h2>
          <p className="text-small text-[var(--text-secondary)] leading-relaxed">
            Last Updated: August 12, 2026. In accordance with the Digital Personal Data Protection (DPDP) Act, this privacy policy details how we handle registration, phone verification, and brand data:
          </p>
          <div className="space-y-3 text-small text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong>1. Data Collection:</strong> We collect Name, Work Email, Phone Number, and Organization details solely for verification and enquiry coordination. We do not sell or lease PII data to third parties.
            </p>
            <p>
              <strong>2. Media Owner Gating:</strong> To protect brand privacy, brand identities are strictly hidden from Media Owners (Hosts) until a brand explicitly submits a direct listing enquiry (Section 7.3 compliance). Interest, view logs, and profile search metrics are entirely anonymized.
            </p>
            <p>
              <strong>3. Deletion & Data Portability:</strong> You may request complete account deletion or data exports at any time from your Account Settings area (Section 2.10).
            </p>
            <p>
              <strong>4. Data Retention Window:</strong> Upon executing an account deletion request, your data is retained in our secure, encrypted backup vault for a maximum of <strong>30 days</strong> (retention window) to settle pending enquiry coordinates, after which it is permanently purged.
            </p>
          </div>
        </section>

        {/* Section 3: Terms of Service */}
        <section id="terms" className="space-y-4 border-t border-white/10 pt-8">
          <h2 className="text-h2 text-white">Terms of Service</h2>
          <div className="space-y-3 text-small text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong>1. Listing Integrity:</strong> Media Owners (Hosts) warrant that all listings represent active, owned inventory and carry accurate reach metrics sourced from BARC, IRS, or verified platform reports. Inflated or unsourced claims will trigger immediate listing rejection or suspension.
            </p>
            <p>
              <strong>2. Account Security:</strong> Access to Own The Zone utilizes passwordless phone OTP credentials. Users are responsible for keeping handset sessions secure and reporting any unauthorized OTP generations immediately.
            </p>
            <p>
              <strong>3. Booking mediated by Ops:</strong> All catalog selections, quotes, and confirmed schedules remain tentative until explicitly finalized, signed, and authorized by the named Sales-Operations coordinator.
            </p>
          </div>
        </section>

        {/* Contact and WhatsApp click-to-chat */}
        <section className="p-6 rounded-2xl border border-[#2BD67B]/30 bg-[#2BD67B]/5 space-y-4 text-center">
          <h3 className="text-h3 text-white">Need Immediate Sourcing?</h3>
          <p className="text-small text-[var(--text-secondary)]">
            Our team handles same-day first response turnarounds for all registered queries. Get in touch directly:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <a
              href="mailto:ops@otz.com"
              className="btn-secondary px-6 font-bold flex items-center justify-center gap-1.5 focus-ring"
            >
              <MdiIcon name="email-outline" /> Email Ops Desk
            </a>
            <a
              href="https://wa.me/919999999999?text=I%27m%2520interested%2520in%2520booking%2520premium%2520advertising%2520zones"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 font-bold flex items-center justify-center gap-1.5 focus-ring"
              style={{ backgroundColor: "#2BD67B", color: "#0B1E3B" }}
            >
              <MdiIcon name="whatsapp" /> Chat on WhatsApp
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
