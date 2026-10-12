"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MdiIcon from "@/components/MdiIcon";
import { useAuth } from "@/context/AuthContext";
import { ColumnLines } from "@/components/scrollx/column-lines";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signUpWithPassword, loginWithGoogle } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("brand"); // "brand" | "host"
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = searchParams?.get("redirect") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "ops") {
        router.push("/admin");
      } else {
        router.push(redirectTo);
      }
    }
  }, [user, router, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid work email address.");
      return;
    }
    if (phone && !/^\d{7,15}$/.test(phone.replace(/\D/g, ""))) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUpWithPassword({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        company: company.trim() || "Personal Account",
        role
      });

      if (res.success) {
        if (res.user?.role === "admin" || res.user?.role === "ops") {
          router.push("/admin");
        } else {
          router.push(redirectTo);
        }
      } else {
        setError(res.error || "Failed to create account. Please try again.");
      }
    } catch (err) {
      setError("Unable to connect to registration service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle(redirectTo);
      if (res?.error) {
        setError(res.error);
        setGoogleLoading(false);
      }
    } catch (err) {
      setError("Google authentication could not be initiated.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="theme-dark min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] flex flex-col relative overflow-hidden font-sans">
      {/* Background Grid Accent */}
      <ColumnLines
        columnWidth={80}
        columnCount={16}
        radialFadeStart={30}
        radialFadeEnd={80}
        noiseOpacity={0.03}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <Navbar onLogoClick={() => router.push("/")} />

      <main className="flex-1 flex items-center justify-center p-4 pt-28 pb-16 relative z-10">
        <div className="w-full max-w-lg bg-[#132A4F] border border-[var(--border-default)] rounded-2xl p-8 shadow-2xl space-y-6 animate-scale-up">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0B1E3B] border border-[var(--border-default)] text-[var(--action-primary)] shadow-sm">
              <MdiIcon name="account-plus-outline" className="text-2xl" />
            </div>
            <h1 className="text-2xl font-black font-display text-white tracking-tight">
              Create Your OTZ Account
            </h1>
            <p className="text-xs text-[var(--text-secondary)]">
              Connect to verified media inventory, rate cards, and advertising spaces.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-semibold flex items-center gap-2.5 animate-fade-in">
              <MdiIcon name="alert-circle-outline" className="text-base shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm h-11 px-4 rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="text-xs text-slate-600">Connecting with Google...</span>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[var(--border-default)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Or register with email
            </span>
            <div className="flex-1 h-[1px] bg-[var(--border-default)]" />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selection */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B1E3B] rounded-xl border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => setRole("brand")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === "brand"
                      ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Brand / Advertiser
                </button>
                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    role === "host"
                      ? "bg-[var(--action-primary)] text-[#0B1E3B] shadow-md"
                      : "text-[var(--text-secondary)] hover:text-white"
                  }`}
                >
                  Media Owner / Host
                </button>
              </div>
            </div>

            {/* Full Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="input-field focus-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Company / Brand
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="input-field focus-ring"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Work Email
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9999999999"
                  className="input-field focus-ring"
                />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Confirm Password
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full shadow-lg focus-ring mt-3 cursor-pointer font-bold"
              style={{ color: "#0B1E3B" }}
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <MdiIcon name="check-bold" className="text-base" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Link to Login */}
          <div className="pt-2 text-center text-xs text-[var(--text-secondary)]">
            Already have an OTZ account?{" "}
            <Link
              href={redirectTo !== "/dashboard" ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
              className="text-[var(--action-primary)] hover:underline font-bold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B1E3B] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-[var(--action-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
