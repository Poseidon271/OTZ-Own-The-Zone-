"use client";

import React, { useState, useEffect } from "react";
import MdiIcon from "@/components/MdiIcon";

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("phone"); // "phone" | "email"
  const [role, setRole] = useState("brand"); // "brand" | "host"

  // Input states
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Verification states
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [otpCode, setOtpCode] = useState("");
  const [userId, setUserId] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [debugToken, setDebugToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Listen to open events
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setStep("request");
      setPhone("");
      setEmail("");
      setOtpCode("");
      setDebugOtp("");
      setDebugToken("");
      setErrors({});
      setSuccess(false);
    };

    window.addEventListener("open-auth-modal", handleOpen);
    return () => window.removeEventListener("open-auth-modal", handleOpen);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    if (activeTab === "phone") {
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
    } else {
      // Email Magic Link Request
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrors({ email: "Please enter a valid work email address" });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "magic-link", email })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setUserId(data.userId);
          setDebugToken(data.debugToken);
          setStep("verify");
        } else {
          setErrors({ email: data.error || "Failed to issue magic link." });
        }
      } catch (err) {
        setErrors({ email: "Server error. Please try again." });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrors({});

    const verifyCode = activeTab === "phone" ? otpCode : debugToken;
    if (!verifyCode) {
      setErrors({ verify: "Verification token is empty" });
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
          code: verifyCode
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        localStorage.setItem("otz_user", JSON.stringify(data.user));
        
        // Dispatch event for navbar sync
        window.dispatchEvent(new Event("auth-state-change"));

        setTimeout(() => {
          setIsOpen(false);
          // Redirect to target or reload path
          const redirect = localStorage.getItem("post_login_redirect");
          if (redirect) {
            localStorage.removeItem("post_login_redirect");
            window.location.href = redirect;
          } else {
            window.location.reload();
          }
        }, 1200);
      } else {
        setErrors({ verify: data.error || "Verification failed." });
      }
    } catch (err) {
      setErrors({ verify: "Verification connection failed." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B1E3B]/70 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Split layout modal container (Section 8.5) */}
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl z-10 overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-scale-up border border-[var(--border-default)]"
        style={{ borderRadius: "14px" }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors z-20 cursor-pointer md:text-white"
          aria-label="Close modal"
        >
          <MdiIcon name="close" className="text-xl" />
        </button>

        {/* Left Side: Midnight Zone Panel (Desktop Only) */}
        <div className="hidden md:flex md:col-span-5 bg-[#0B1E3B] p-8 flex-col justify-between text-white relative">
          <div className="space-y-6">
            {/* Wordmark logo */}
            <div className="flex items-center gap-1.5">
              <svg
                className="w-8 h-8 text-[var(--action-primary)]"
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
              &ldquo;We connect premium brands with high-recall media zones, backed by audited reach metrics.&rdquo;
            </p>
          </div>

          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            ★ verified demand capture
          </div>
        </div>

        {/* Right Side: raised form card */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center space-y-6 bg-white">
          {success ? (
            <div className="text-center py-8 space-y-3 animate-fade-in">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-[var(--status-success-text)] flex items-center justify-center mx-auto text-2xl border border-emerald-200 animate-sweep-green">
                <MdiIcon name="check-bold" />
              </div>
              <h3 className="text-h3 font-bold text-[var(--text-primary)]">Access Authorized</h3>
              <p className="text-xs text-[var(--text-secondary)]">Welcome back. Initializing your secure session workspace...</p>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Header Title */}
              <div>
                <h3 className="text-h2 font-display text-[var(--text-primary)]">Passwordless Sign In</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Enter your credentials to generate a secure session key.
                </p>
              </div>

              {step === "request" ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {/* Role Selection Toggle (Section 8.5) */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] uppercase font-bold text-[var(--text-tertiary)]">Workspace Role</label>
                    <div className="flex p-1 bg-slate-100 rounded-xl border border-[var(--border-default)] w-fit">
                      <button
                        type="button"
                        onClick={() => setRole("brand")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          role === "brand"
                            ? "bg-[#0B1E3B] text-white shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        Brand Desk
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("host")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          role === "host"
                            ? "bg-[#0B1E3B] text-white shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        Media Host
                      </button>
                    </div>
                  </div>

                  {/* Auth Method Tab (Phone vs Email Fallback) */}
                  <div className="flex gap-4 border-b border-[var(--border-default)] pb-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab("phone")}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                        activeTab === "phone"
                          ? "border-[var(--action-primary)] text-[var(--text-primary)]"
                          : "border-transparent text-[var(--text-secondary)]"
                      }`}
                    >
                      Phone SMS OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("email")}
                      className={`text-xs font-bold pb-2 border-b-2 transition-all cursor-pointer ${
                        activeTab === "email"
                          ? "border-[var(--action-primary)] text-[var(--text-primary)]"
                          : "border-transparent text-[var(--text-secondary)]"
                      }`}
                    >
                      Email Magic Link Fallback
                    </button>
                  </div>

                  {/* Phone Input */}
                  {activeTab === "phone" ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9999999999"
                        className={`input-field focus-ring ${errors.phone ? "error" : ""}`}
                      />
                      {errors.phone && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.phone}</p>}
                    </div>
                  ) : (
                    // Email input
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Work Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="test@otz.com"
                        className={`input-field focus-ring ${errors.email ? "error" : ""}`}
                      />
                      {errors.email && <p className="text-[10px] text-[var(--status-error)] font-bold">{errors.email}</p>}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-lg focus-ring"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? (
                      <span>Generating credentials...</span>
                    ) : (
                      <>
                        <MdiIcon name="send" />
                        <span>Send Authentication Key</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // Verification Code step
                <form onSubmit={handleVerify} className="space-y-4">
                  {/* Phone OTP Verification */}
                  {activeTab === "phone" ? (
                    <div className="space-y-4">
                      <p className="text-xs text-[var(--text-secondary)] font-semibold">
                        Enter the 6-digit SMS code dispatched to +91 {phone}:
                      </p>

                      {debugOtp && (
                        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex items-center gap-2">
                          <MdiIcon name="cellphone-message" className="text-lg text-blue-500 shrink-0" />
                          <div>
                            <span className="font-bold">Simulated SMS:</span> Verification code is{" "}
                            <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-widest text-sm select-all">{debugOtp}</span>
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="000000"
                          className="w-full text-center h-12 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-xl font-bold tracking-[0.4em] focus-ring"
                        />
                        {errors.verify && <p className="text-xs text-[var(--status-error)] font-bold text-center mt-1">{errors.verify}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full shadow-lg focus-ring mt-2"
                        style={{ color: "#0B1E3B" }}
                      >
                        {loading ? "Verifying..." : "Verify & Sign In"}
                      </button>
                    </div>
                  ) : (
                    // Email Magic Link Verification simulation
                    <div className="space-y-4">
                      <p className="text-xs text-[var(--text-secondary)] font-semibold">
                        We&apos;ve generated a magic login token for {email}:
                      </p>

                      {debugToken && (
                        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs flex flex-col gap-1">
                          <span className="font-bold">Simulated Magic Link fallback token:</span>
                          <span className="font-mono text-[10px] break-all bg-blue-100 p-2 rounded text-blue-700">{debugToken}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full shadow-lg focus-ring mt-2"
                        style={{ color: "#0B1E3B" }}
                      >
                        {loading ? "Simulating link click..." : "Click to Verify Magic Link"}
                      </button>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("request")}
                      className="text-xs text-[var(--action-primary)] hover:underline font-bold"
                    >
                      Use another phone or email
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
