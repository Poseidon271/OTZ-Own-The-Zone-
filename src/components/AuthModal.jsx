"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MdiIcon from "@/components/MdiIcon";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginWithPassword,
    signUpWithPassword,
    loginWithGoogle,
    resetPassword
  } = useAuth();

  // Mode: "login" | "signup" | "forgot" | "phone"
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("brand"); // "brand" | "host"

  // Input states
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Verification states (for phone OTP)
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState("");
  const [debugOtp, setDebugOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Listen to open events
  useEffect(() => {
    const handleOpen = (e) => {
      if (e?.detail?.mode) {
        setMode(e.detail.mode);
      } else if (e?.detail?.tab === "phone") {
        setMode("phone");
      } else {
        setMode("login");
      }
      setStep("request");
      setFullName("");
      setCompany("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setOtpCode("");
      setDebugOtp("");
      setErrors({});
      setSuccess(false);
      setSuccessMessage("");
      setIsAuthModalOpen(true);
    };

    window.addEventListener("open-auth-modal", handleOpen);
    return () => window.removeEventListener("open-auth-modal", handleOpen);
  }, [setIsAuthModalOpen]);

  const handleClose = () => {
    setIsAuthModalOpen(false);
  };

  // Google OAuth Handler
  const handleGoogleAuth = async () => {
    setErrors({});
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res?.error) {
        setErrors({ general: res.error });
        setGoogleLoading(false);
      }
    } catch (err) {
      setErrors({ general: "Google authentication could not be initiated." });
      setGoogleLoading(false);
    }
  };

  // Email/Password Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid work email address" });
      return;
    }
    if (!password) {
      setErrors({ password: "Password is required" });
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithPassword(email.trim(), password);
      if (result.success) {
        setSuccess(true);
        setSuccessMessage("Access Authorized. Initializing your secure session...");
        setTimeout(() => {
          setIsAuthModalOpen(false);
          const redirect = localStorage.getItem("post_login_redirect");
          if (redirect) {
            localStorage.removeItem("post_login_redirect");
            router.push(redirect);
          } else if (result.user?.role === "admin" || result.user?.role === "ops") {
            router.push("/admin");
          } else {
            router.refresh();
          }
        }, 800);
      } else {
        setErrors({ general: result.error || "Authentication failed. Please check your credentials." });
      }
    } catch (err) {
      setErrors({ general: "Server connection failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!fullName.trim()) {
      setErrors({ fullName: "Full name is required" });
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid work email address" });
      return;
    }
    if (phone && !/^\d{7,15}$/.test(phone.replace(/\D/g, ""))) {
      setErrors({ phone: "Please enter a valid phone number" });
      return;
    }
    if (!password || password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithPassword({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        company: company.trim() || "Personal Account",
        role
      });

      if (result.success) {
        setSuccess(true);
        setSuccessMessage("Account created successfully! Loading your dashboard...");
        setTimeout(() => {
          setIsAuthModalOpen(false);
          router.push("/dashboard");
        }, 800);
      } else {
        setErrors({ general: result.error || "Registration failed. Please try again." });
      }
    } catch (err) {
      setErrors({ general: "Server connection error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email.trim());
      if (result.success) {
        setSuccess(true);
        setSuccessMessage(`Password recovery link dispatched to ${email}. Please check your inbox.`);
      } else {
        setErrors({ general: result.error || "Unable to send reset instructions." });
      }
    } catch (err) {
      setErrors({ general: "Password reset request failed." });
    } finally {
      setLoading(false);
    }
  };

  // Phone SMS OTP Request Handler
  const handlePhoneRequest = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
      setErrors({ phone: "Please enter a valid 10-digit phone number" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", phone })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setUserId(data.userId);
        setDebugOtp(data.debugOtp);
        setStep("verify");
      } else {
        setErrors({ phone: data.error || "Failed to generate OTP challenge." });
      }
    } catch (err) {
      setErrors({ phone: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Phone SMS OTP Verification Handler
  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!otpCode || otpCode.length !== 6) {
      setErrors({ verify: "Please enter the 6-digit verification code" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          userId: userId,
          code: otpCode
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setSuccessMessage("Phone verified successfully!");
        if (data.token) {
          localStorage.setItem("otz_token", data.token);
        }
        localStorage.setItem("otz_user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("auth-state-change"));

        setTimeout(() => {
          setIsAuthModalOpen(false);
          const redirect = localStorage.getItem("post_login_redirect");
          if (redirect) {
            localStorage.removeItem("post_login_redirect");
            router.push(redirect);
          } else if (data.user?.role === "admin" || data.user?.role === "ops") {
            router.push("/admin");
          } else {
            router.refresh();
          }
        }, 800);
      } else {
        setErrors({ verify: data.error || "Verification failed." });
      }
    } catch (err) {
      setErrors({ verify: "Verification connection failed." });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1E3B]/75 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-scale-up border border-[var(--border-default)]"
        style={{ borderRadius: "14px" }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <MdiIcon name="close" className="text-xl" />
        </button>

        {/* Left Side: Midnight Zone Panel (Desktop Only) */}
        <div className="hidden md:flex md:col-span-5 bg-[#0B1E3B] p-8 flex-col justify-between text-white relative">
          <div className="space-y-6">
            {/* Wordmark logo */}
            <div className="flex items-center gap-2">
              <svg
                className="w-7 h-7 text-[var(--action-primary)]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="10" y="10" width="80" height="80" rx="14" stroke="currentColor" strokeWidth="6" />
                <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="6" />
              </svg>
              <span className="font-display font-black tracking-widest text-white text-lg">
                OWN THE ZONE
              </span>
            </div>

            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              &ldquo;Connecting premium advertisers with audited, high-recall media assets across India.&rdquo;
            </p>

            <div className="space-y-2 pt-2 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MdiIcon name="check-decagram" className="text-[var(--action-primary)] text-sm shrink-0" />
                <span>Verified media inventory</span>
              </div>
              <div className="flex items-center gap-2">
                <MdiIcon name="shield-check" className="text-[var(--action-primary)] text-sm shrink-0" />
                <span>Audited footfall & reach metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <MdiIcon name="lightning-bolt" className="text-[var(--action-primary)] text-sm shrink-0" />
                <span>Direct rate cards & instant proposals</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            ★ Production Supabase Auth
          </div>
        </div>

        {/* Right Side: Form Content Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white text-left">
          {success ? (
            <div className="text-center py-8 space-y-3 animate-fade-in">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-[var(--status-success-text)] flex items-center justify-center mx-auto text-2xl border border-emerald-200">
                <MdiIcon name="check-bold" />
              </div>
              <h3 className="text-h3 font-bold text-[var(--text-primary)]">Success</h3>
              <p className="text-xs text-[var(--text-secondary)]">{successMessage}</p>
              {mode === "forgot" && (
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setMode("login");
                  }}
                  className="btn-primary px-6 mt-4 text-xs font-bold"
                  style={{ color: "#0B1E3B" }}
                >
                  Return to Sign In
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Header Title */}
              <div>
                <h3 className="text-xl font-black font-display text-[var(--text-primary)]">
                  {mode === "login" && "Sign In to Your Account"}
                  {mode === "signup" && "Create Your OTZ Account"}
                  {mode === "forgot" && "Recover Your Password"}
                  {mode === "phone" && "SMS OTP Authentication"}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {mode === "login" && "Enter your credentials to access your campaign dashboard."}
                  {mode === "signup" && "Join OTZ to plan campaigns, track media and request rate cards."}
                  {mode === "forgot" && "We will dispatch password reset instructions to your email."}
                  {mode === "phone" && "Sign in instantly via one-time SMS verification code."}
                </p>
              </div>

              {/* General Error Alert */}
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-semibold flex items-center gap-2 animate-fade-in">
                  <MdiIcon name="alert-circle-outline" className="text-base shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Google OAuth (For login & signup modes) */}
              {(mode === "login" || mode === "signup") && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-4 rounded-lg border border-[var(--border-default)] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] cursor-pointer disabled:opacity-60"
                  >
                    {googleLoading ? (
                      <span className="text-xs text-slate-500">Connecting to Google...</span>
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

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-[1px] bg-[var(--border-default)]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                      Or with email
                    </span>
                    <div className="flex-1 h-[1px] bg-[var(--border-default)]" />
                  </div>
                </>
              )}

              {/* MODE 1: LOGIN FORM */}
              {mode === "login" && (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={`input-field focus-ring ${errors.email ? "error" : ""}`}
                    />
                    {errors.email && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.email}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Password</label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[11px] text-[var(--action-primary)] hover:underline font-bold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`input-field focus-ring pr-10 ${errors.password ? "error" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        tabIndex={-1}
                      >
                        <MdiIcon name={showPassword ? "eye-off-outline" : "eye-outline"} className="text-base" />
                      </button>
                    </div>
                    {errors.password && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.password}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-lg focus-ring mt-2 cursor-pointer font-bold"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>

                  <div className="flex items-center justify-between pt-3 text-xs text-[var(--text-secondary)]">
                    <button
                      type="button"
                      onClick={() => setMode("phone")}
                      className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold cursor-pointer"
                    >
                      Use Phone SMS OTP
                    </button>
                    <span>
                      New to OTZ?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-[var(--action-primary)] hover:underline font-bold cursor-pointer"
                      >
                        Create Account
                      </button>
                    </span>
                  </div>
                </form>
              )}

              {/* MODE 2: SIGNUP FORM */}
              {mode === "signup" && (
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Account Type</label>
                    <div className="flex p-1 bg-slate-100 rounded-lg border border-[var(--border-default)] w-fit">
                      <button
                        type="button"
                        onClick={() => setRole("brand")}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                          role === "brand" ? "bg-[#0B1E3B] text-white" : "text-slate-600 hover:text-black"
                        }`}
                      >
                        Brand / Advertiser
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("host")}
                        className={`px-3 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                          role === "host" ? "bg-[#0B1E3B] text-white" : "text-slate-600 hover:text-black"
                        }`}
                      >
                        Media Host
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="input-field focus-ring"
                      />
                      {errors.fullName && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Company</label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="input-field focus-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@company.com"
                        className="input-field focus-ring"
                      />
                      {errors.email && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9999999999"
                        className="input-field focus-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Password</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field focus-ring"
                      />
                      {errors.password && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Confirm</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field focus-ring"
                      />
                      {errors.confirmPassword && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-lg focus-ring mt-2 cursor-pointer font-bold"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>

                  <div className="text-center pt-2 text-xs text-[var(--text-secondary)]">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-[var(--action-primary)] hover:underline font-bold cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* MODE 3: FORGOT PASSWORD */}
              {mode === "forgot" && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Registered Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input-field focus-ring"
                    />
                    {errors.email && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.email}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-lg focus-ring cursor-pointer font-bold"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? "Dispatching..." : "Send Reset Link"}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-xs text-[var(--action-primary)] hover:underline font-bold cursor-pointer"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* MODE 4: PHONE SMS OTP */}
              {mode === "phone" && (
                <div>
                  {step === "request" ? (
                    <form onSubmit={handlePhoneRequest} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          placeholder="9999999999"
                          className="input-field focus-ring"
                        />
                        {errors.phone && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.phone}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full shadow-lg focus-ring cursor-pointer font-bold"
                        style={{ color: "#0B1E3B" }}
                      >
                        {loading ? "Sending OTP..." : "Send Verification Code"}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-xs text-[var(--action-primary)] hover:underline font-bold cursor-pointer"
                        >
                          Use Email & Password
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePhoneVerify} className="space-y-4">
                      <p className="text-xs text-slate-600 font-medium">
                        Enter the 6-digit SMS verification code sent to +91 {phone}:
                      </p>

                      {debugOtp && (
                        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center gap-2">
                          <MdiIcon name="cellphone-message" className="text-lg text-blue-500 shrink-0" />
                          <div>
                            <span className="font-bold">Code:</span>{" "}
                            <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-widest text-sm select-all">
                              {debugOtp}
                            </span>
                          </div>
                        </div>
                      )}

                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="w-full text-center h-12 border border-[var(--border-default)] rounded-lg text-xl font-bold tracking-[0.4em] focus-ring"
                      />
                      {errors.verify && <p className="text-xs text-[var(--status-error)] font-bold text-center">{errors.verify}</p>}

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full shadow-lg focus-ring cursor-pointer font-bold"
                        style={{ color: "#0B1E3B" }}
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </button>

                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => setStep("request")}
                          className="text-xs text-[var(--action-primary)] hover:underline font-bold cursor-pointer"
                        >
                          Change Phone Number
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
