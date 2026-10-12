"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import { useAuth } from "@/context/AuthContext";
import { ColumnLines } from "@/components/scrollx/column-lines";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(res.error || "Failed to update password. Please request a new link.");
      }
    } catch (err) {
      setError("Unable to update password. Please try again.");
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
              <MdiIcon name="lock-reset" className="text-2xl" />
            </div>
            <h1 className="text-2xl font-black font-display text-white tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter and confirm your new account password below.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold flex items-center gap-2.5 animate-fade-in">
              <MdiIcon name="alert-circle-outline" className="text-base shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-5 bg-[#0B1E3B] border border-emerald-500/30 rounded-xl text-center space-y-3 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xl">
                <MdiIcon name="check-bold" />
              </div>
              <h3 className="text-sm font-bold text-white">Password Updated Successfully</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your password has been changed. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="btn-primary w-full shadow-md text-xs font-bold"
                  style={{ color: "#0B1E3B" }}
                >
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field focus-ring pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    tabIndex={-1}
                  >
                    <MdiIcon name={showPassword ? "eye-off-outline" : "eye-outline"} className="text-base" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
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
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <MdiIcon name="check-circle-outline" className="text-base" />
                    <span>Set New Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-xs text-[var(--text-secondary)]">
            <Link href="/login" className="text-[var(--action-primary)] hover:underline font-bold">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
