"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import { useAuth } from "@/context/AuthContext";
import { ColumnLines } from "@/components/scrollx/column-lines";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email.trim());
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.error || "Unable to send password reset link.");
      }
    } catch (err) {
      setError("Failed to connect to reset service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] flex flex-col relative overflow-hidden font-sans">
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={30}
        radialFadeEnd={80}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 pt-28 pb-16 relative z-10">
        <div className="w-full max-w-md bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-8 shadow-2xl space-y-6 animate-scale-up">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0B1E3B] border border-[var(--border-default)] text-[var(--action-primary)] shadow-sm">
              <MdiIcon name="key-change" className="text-2xl" />
            </div>
            <h1 className="text-2xl font-black font-display text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter your registered email address and we&apos;ll send you a password recovery link.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold flex items-center gap-2.5 animate-fade-in">
              <MdiIcon name="alert-circle-outline" className="text-base shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-5 bg-[#0B1E3B] border border-emerald-500/30 rounded-xl text-center space-y-3 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                <MdiIcon name="email-check-outline" />
              </div>
              <h3 className="text-sm font-bold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account exists for <span className="text-white font-bold">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="btn-primary w-full shadow-md text-xs font-bold"
                  style={{ color: "#0B1E3B" }}
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  className="input-field focus-ring"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full shadow-lg focus-ring mt-2 cursor-pointer font-bold"
                style={{ color: "#0B1E3B" }}
              >
                {loading ? (
                  <span>Dispatching Link...</span>
                ) : (
                  <>
                    <MdiIcon name="send-outline" className="text-base" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-[var(--text-secondary)]">
            Remember your credentials?{" "}
            <Link href="/login" className="text-[var(--action-primary)] hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
