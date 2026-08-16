"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import MdiIcon from "@/components/MdiIcon";

export default function LeadPopup() {
  const router = useRouter();
  const pathname = usePathname();

  // Onboarding Wizard state
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(""); // "brand" | "host"
  const [step, setStep] = useState(0); // 0: role selection, 1-5: Brand flow, 11-13: Host flow
  
  // Brand choices state
  const [niche, setNiche] = useState("");
  const [goals, setGoals] = useState([]);
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [budgetBand, setBudgetBand] = useState("");
  const [geography, setGeography] = useState("");
  const [timeline, setTimeline] = useState("");

  // Host choices state
  const [mediaType, setMediaType] = useState("");

  // Registration Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    consent: false
  });

  // OTP Verification state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState("");
  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    sessionStorage.setItem("otz_onboarding_session", "dismissed");
    setIsOpen(false);
    // Reset state
    setStep(0);
    setRole("");
    setNiche("");
    setGoals([]);
    setPrimaryGoal("");
    setBudgetBand("");
    setGeography("");
    setTimeline("");
    setMediaType("");
    setFormData({ name: "", email: "", phone: "", company: "", consent: false });
    setOtpCode("");
    setDebugOtp("");
    setErrors({});
  };

  // Esc key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && step !== 5 && step !== 13) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step]);



  // Listen to custom open triggers
  useEffect(() => {
    const handleOpen = (e) => {
      const intent = e.detail?.intent; // "brand" | "host"
      setIsOpen(true);
      if (intent === "brand") {
        setRole("brand");
        setStep(1);
      } else if (intent === "host") {
        setRole("host");
        setStep(11);
      } else {
        setRole("");
        setStep(0);
      }
    };

    window.addEventListener("open-lead-popup", handleOpen);
    return () => window.removeEventListener("open-lead-popup", handleOpen);
  }, []);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^\d{10}$/.test(phone); // Indian 10-digit format
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "brand") {
      setStep(1);
    } else {
      setStep(11);
    }
  };

  const handleGoalToggle = (goal) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter(g => g !== goal));
      if (primaryGoal === goal) setPrimaryGoal("");
    } else {
      setGoals([...goals, goal]);
      if (!primaryGoal) setPrimaryGoal(goal); // default primary
    }
  };

  // Submit profile details & trigger OTP creation
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.company.trim()) newErrors.company = "Company/organization is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Work email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid work email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.consent) {
      newErrors.consent = "You must consent to our Privacy Policy and Terms.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          role: role,
          consent: formData.consent,
          profileData: role === "brand" ? {
            niche,
            goals,
            primary_goal: primaryGoal,
            budget_band: budgetBand,
            geography,
            timeline
          } : null
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserId(data.userId);
        setDebugOtp(data.debugOtp); // SMS bypass
        setOtpSent(true);
        // Move to OTP step
        setStep(role === "brand" ? 5 : 13);
      } else {
        setErrors({ form: data.error || "Registration failed." });
      }
    } catch (err) {
      setErrors({ form: "Server connection error." });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & complete onboarding session
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit verification code" });
      return;
    }

    setLoading(true);
    setErrors({});

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
        sessionStorage.setItem("otz_onboarding_session", "completed");
        
        // Save user to local storage for instant sync in Navbar client actions
        localStorage.setItem("otz_user", JSON.stringify(data.user));
        
        // Trigger Navbar profile state update
        window.dispatchEvent(new Event("auth-state-change"));

        // Notify ops
        console.log("Onboarding verification completed for account:", data.user.company);

        // Redirect based on role
        setTimeout(() => {
          setIsOpen(false);
          if (role === "brand") {
            // land on marketplace pre-filtered by niche & primary goal (Section 3.4)
            router.push(`/media-buying?goal=${encodeURIComponent(primaryGoal)}&channel=`);
          } else {
            // land on host dashboard listing submission (Section 3.5)
            router.push("/dashboard?tab=submit");
          }
        }, 1500);
      } else {
        setErrors({ otp: data.error || "OTP verification failed." });
      }
    } catch (err) {
      setErrors({ otp: "Server connection error." });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const niches = [
    "FMCG", "Fashion & Lifestyle", "Technology & SaaS", 
    "Real Estate & Infrastructure", "Healthcare & Wellness", "Automobiles",
    "Entertainment & Sports", "Finance & Insurance", "Food & Hospitality"
  ];

  const goalOptions = [
    { value: "awareness", label: "Brand Awareness" },
    { value: "app downloads", label: "App Downloads" },
    { value: "subscribers", label: "Subscribers" },
    { value: "orders", label: "Orders / Sales" },
    { value: "portal visits", label: "Portal Visits" },
    { value: "footfall", label: "Local Retail Footfall" }
  ];

  const priceBands = ["₹10K - ₹50K", "₹50K - ₹2L", "₹2L - ₹10L", "₹10L+"];
  const geographies = ["Mumbai", "Delhi-NCR", "Pan-India"];
  const timelines = ["Immediate", "1-3 Months", "3+ Months"];

  const mediaTypes = [
    { value: "TV", label: "Television (TV)" },
    { value: "Print", label: "Print Media" },
    { value: "Radio", label: "Radio spots" },
    { value: "OOH", label: "Out-of-Home (OOH)" },
    { value: "Digital", label: "Digital banners" },
    { value: "Influencer-Creator", label: "Influencers" },
    { value: "Event or Venue", label: "Events & Exhibitions" },
    { value: "Production partner", label: "Creative production" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark scrim overlay */}
      <div
        className="fixed inset-0 bg-[#0B1E3B]/70 backdrop-blur-md transition-opacity duration-300"
        onClick={() => {
          if (step !== 5 && step !== 13) handleClose();
        }}
      ></div>

      {/* Floating Modal Panel */}
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl z-10 p-8 flex flex-col animate-scale-up border border-[var(--border-default)]"
        style={{ borderRadius: "14px" }}
      >
        {/* Close button */}
        {step !== 5 && step !== 13 && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-slate-100 transition-colors z-20 cursor-pointer"
            aria-label="Close modal"
          >
            <MdiIcon name="close" className="text-xl" />
          </button>
        )}

        {/* Back navigation arrow */}
        {step > 0 && step !== 5 && step !== 13 && (
          <button
            onClick={() => {
              if (role === "brand") {
                setStep(step - 1);
              } else if (role === "host") {
                if (step === 11) setStep(0);
                else setStep(step - 1);
              }
            }}
            className="absolute top-4 left-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 rounded-lg hover:bg-slate-100 transition-colors z-20 cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <MdiIcon name="arrow-left" /> Back
          </button>
        )}

        {/* Success Sweep state */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 text-[var(--status-success-text)] rounded-full flex items-center justify-center text-3xl border border-emerald-200 animate-sweep-green">
              <MdiIcon name="check-bold" />
            </div>
            <h3 className="text-h2 text-[var(--text-primary)]">Onboarding Completed</h3>
            <p className="text-small text-[var(--text-secondary)] leading-relaxed">
              Your verified account has been configured. Routing you to your goal-matched panel...
            </p>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            
            {/* Step 0: Intent Role Selection (Section 3.2 & Mockup screenshot) */}
            {step === 0 && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-[#1C2430] font-display">What brings you to OTZ?</h2>
                  <p className="text-xs text-[#55606E] font-semibold">
                    Pick a side of the marketplace &mdash; you can switch anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Brand Intent Card */}
                  <button
                    onClick={() => handleRoleSelect("brand")}
                    className="p-5 rounded-2xl border-2 border-[#FF5A1F] bg-white text-left flex flex-col justify-between h-48 cursor-pointer transition-all shadow-md hover:shadow-lg focus:outline-none"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#FF5A1F]/10 text-[#FF5A1F] flex items-center justify-center text-lg">
                      <MdiIcon name="bullseye-arrow" />
                    </div>
                    
                    <div className="space-y-1 mt-3">
                      <h4 className="text-sm font-bold text-[#1C2430] uppercase tracking-wider font-display">I&apos;m a Brand</h4>
                      <p className="text-[11px] text-[#55606E] leading-normal font-medium">
                        I want to plan, buy and measure media against a goal.
                      </p>
                    </div>

                    <div className="text-xs font-bold text-[#FF5A1F] mt-2 flex items-center gap-1">
                      Start with your niche &rarr;
                    </div>
                  </button>

                  {/* Host Intent Card */}
                  <button
                    onClick={() => handleRoleSelect("host")}
                    className="p-5 rounded-2xl border border-slate-200 bg-white text-left flex flex-col justify-between h-48 cursor-pointer transition-all hover:border-slate-300 focus:outline-none"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-lg">
                      <MdiIcon name="office-building" />
                    </div>
                    
                    <div className="space-y-1 mt-3">
                      <h4 className="text-sm font-bold text-[#1C2430] uppercase tracking-wider font-display">I&apos;m a Host</h4>
                      <p className="text-[11px] text-[#55606E] leading-normal font-medium">
                        I own media, events or audiences and want brand demand.
                      </p>
                    </div>

                    <div className="text-xs font-bold text-[#8A94A1] mt-2 flex items-center gap-1">
                      List your zone &rarr;
                    </div>
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={handleClose}
                    className="text-xs font-bold text-[#8A94A1] hover:text-[#1C2430] transition-colors cursor-pointer bg-transparent border-none focus:outline-none"
                  >
                    Skip for now &mdash; browse the marketplace freely
                  </button>
                </div>
              </div>
            )}

            {/* BRAND FLOW */}
            {/* Step 1: Brand Niche Selection (Section 3.3) */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)]">1. Select Brand Niche</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Which industry niche describes your brand?</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {niches.map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setNiche(n);
                        setStep(2);
                      }}
                      className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                        niche === n
                          ? "border-[var(--action-primary)] bg-[var(--action-primary)]/5 text-[var(--action-primary)]"
                          : "border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Brand Goals Selection (Section 3.3) */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)]">2. Objectives & Primary Goal</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Toggle objectives (multi-select) and choose one primary goal.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {goalOptions.map((opt) => {
                      const isSelected = goals.includes(opt.value);
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => handleGoalToggle(opt.value)}
                          className={`px-3 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-[var(--action-primary)] bg-[var(--action-primary)] text-white shadow-sm"
                              : "border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:bg-slate-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {goals.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)]">Set Primary Goal</label>
                      <select
                        value={primaryGoal}
                        onChange={(e) => setPrimaryGoal(e.target.value)}
                        className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm font-semibold"
                      >
                        {goals.map((g) => {
                          const opt = goalOptions.find(o => o.value === g);
                          return (
                            <option key={g} value={g}>{opt?.label}</option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    disabled={goals.length === 0}
                    onClick={() => setStep(3)}
                    className="btn-primary"
                    style={{ color: "#0B1E3B" }}
                  >
                    <span>Next step</span> <MdiIcon name="arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Brand Metadata Selection (Section 3.3) */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)]">3. Budget & Geography</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Help us route relevant packages by adding boundaries.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Budget Band</label>
                    <select
                      value={budgetBand}
                      onChange={(e) => setBudgetBand(e.target.value)}
                      className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                    >
                      <option value="">Select budget...</option>
                      {priceBands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Target City</label>
                    <select
                      value={geography}
                      onChange={(e) => setGeography(e.target.value)}
                      className="w-full h-11 px-3 border border-[var(--border-default)] bg-white rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-sm"
                    >
                      <option value="">Select location...</option>
                      {geographies.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Campaign Timeline</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timelines.map(t => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTimeline(t)}
                        className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-colors cursor-pointer ${
                          timeline === t
                            ? "border-[var(--action-primary)] bg-[var(--action-primary)]/5 text-[var(--action-primary)]"
                            : "border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:bg-slate-50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setStep(4)}
                    className="btn-primary"
                    style={{ color: "#0B1E3B" }}
                  >
                    <span>Contact Info</span> <MdiIcon name="arrow-right" />
                  </button>
                </div>
              </div>
            )}

            {/* HOST FLOW */}
            {/* Step 11: Host Media Type Selection (Section 3.5) */}
            {step === 11 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)]">1. Select Inventory Media Type</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Which primary media type describes your supply?</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {mediaTypes.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setMediaType(opt.value);
                        setStep(12);
                      }}
                      className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                        mediaType === opt.value
                          ? "border-[var(--action-primary)] bg-[var(--action-primary)]/5 text-[var(--action-primary)]"
                          : "border-[var(--border-default)] bg-white text-[var(--text-secondary)] hover:bg-slate-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* REGISTRATION FORM (Steps 4 & 12 - Section 2.2) */}
            {(step === 4 || step === 12) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)]">Register {role === "brand" ? "Brand" : "Host"} Workspace</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">Specify credentials to initialize passwordless verification.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Sanskar"
                        className={`input-field focus-ring ${errors.name ? "error" : ""}`}
                      />
                      {errors.name && <p className="text-[10px] text-[var(--status-error)] font-bold mt-0.5">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Company / Organization</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Ad Company"
                        className={`input-field focus-ring ${errors.company ? "error" : ""}`}
                      />
                      {errors.company && <p className="text-[10px] text-[var(--status-error)] font-bold mt-0.5">{errors.company}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Work Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="test@otz.com"
                      className={`input-field focus-ring ${errors.email ? "error" : ""}`}
                    />
                    {errors.email && <p className="text-[10px] text-[var(--status-error)] font-bold mt-0.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Phone Number (OTP Verification)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9999999999"
                      className={`input-field focus-ring ${errors.phone ? "error" : ""}`}
                    />
                    {errors.phone && <p className="text-[10px] text-[var(--status-error)] font-bold mt-0.5">{errors.phone}</p>}
                  </div>

                  <div className="pt-1">
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="register-consent"
                        checked={formData.consent}
                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                        className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--action-primary)] focus:ring-[var(--border-focus)] mt-0.5"
                      />
                      <label htmlFor="register-consent" className="text-xs text-[var(--text-secondary)] leading-relaxed cursor-pointer font-semibold">
                        I explicitly consent to Own The Zone&apos;s{" "}
                        <a href="/about#privacy" target="_blank" className="text-[var(--action-primary)] hover:underline">Privacy Policy</a>{" "}
                        and{" "}
                        <a href="/about#terms" target="_blank" className="text-[var(--action-primary)] hover:underline">Terms of Service</a>.
                      </label>
                    </div>
                    {errors.consent && <p className="text-[10px] text-[var(--status-error)] font-bold mt-1">{errors.consent}</p>}
                  </div>

                  {errors.form && (
                    <p className="text-xs text-[var(--status-error)] font-bold flex items-center gap-1 bg-red-50 p-2.5 rounded-lg">
                      <MdiIcon name="alert-circle-outline" /> {errors.form}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-lg focus-ring mt-2"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? (
                      <span>Generating OTP...</span>
                    ) : (
                      <>
                        <MdiIcon name="lock-open-outline" />
                        <span>Request OTP Verification</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* OTP VERIFICATION STEP (Steps 5 & 13 - Section 2.3) */}
            {(step === 5 || step === 13) && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-h3 text-[var(--text-primary)]">Verify Phone OTP</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    We&apos;ve sent a 6-digit confirmation code to your phone number (+91 {formData.phone}).
                  </p>
                </div>

                {/* SMS Bypass Notification Banner (Section 13 SMS lead time mitigation) */}
                {debugOtp && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg flex items-center gap-2 text-xs">
                    <MdiIcon name="cellphone-message" className="text-lg text-blue-500 shrink-0" />
                    <div>
                      <span className="font-bold">Simulated SMS Delivery:</span> Your verification code is{" "}
                      <span className="font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-widest text-sm select-all">{debugOtp}</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full text-center h-12 border border-[var(--border-default)] rounded-lg focus:outline-none focus:border-[var(--border-focus)] text-xl font-bold tracking-[0.4em] focus-ring"
                    />
                    {errors.otp && <p className="text-xs text-[var(--status-error)] font-bold mt-1 text-center">{errors.otp}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full shadow-lg focus-ring mt-2 animate-sweep-green"
                    style={{ color: "#0B1E3B" }}
                  >
                    {loading ? <span>Verifying OTP...</span> : "Verify & Initialize Session"}
                  </button>

                  <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] font-semibold px-1">
                    <span>Code expires in 5 minutes</span>
                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      className="text-[var(--action-primary)] hover:underline"
                    >
                      Resend SMS Code
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
