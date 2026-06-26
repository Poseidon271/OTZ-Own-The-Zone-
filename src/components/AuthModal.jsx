"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // "login" | "signup"

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [errors, setErrors] = useState({});

  if (!isAuthModalOpen) return null;

  const validate = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (activeTab === "signup") {
      if (!name.trim()) {
        newErrors.name = "Full name is required";
      }
      if (!handle.trim()) {
        newErrors.handle = "Username/Handle is required";
      } else if (handle.length < 3) {
        newErrors.handle = "Handle must be at least 3 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Simulate session logic:
      // Passing custom details if signing up, else defaults.
      login(email, password);
      // Reset form
      setEmail("");
      setPassword("");
      setName("");
      setHandle("");
      setErrors({});
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsAuthModalOpen(false)}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scale-up dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200 z-10">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors z-20"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Brand Header */}
        <div className="pt-8 px-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center space-x-1.5 mb-2">
            <span className="text-3xl font-black tracking-wider bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-400 dark:to-purple-500">
              OTZ
            </span>
            <span className="h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-500 animate-pulse"></span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-450">
            {activeTab === "login"
              ? "Access your dashboard and save premium ad spaces"
              : "Register to manage campaigns and download verified quotes"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 pb-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-950/80 rounded-2xl border border-slate-200/40 dark:border-slate-850">
            <button
              onClick={() => handleTabChange("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === "login"
                  ? "bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange("signup")}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === "signup"
                  ? "bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {activeTab === "signup" && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Sanskar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:bg-slate-950/40 dark:text-white dark:placeholder-slate-600 ${
                    errors.name
                      ? "border-rose-500 dark:border-rose-500/80"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-1.5">
                  Username/Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-650 text-sm font-medium">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="maver1ck"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:bg-slate-950/40 dark:text-white dark:placeholder-slate-600 ${
                      errors.handle
                        ? "border-rose-500 dark:border-rose-500/80"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  />
                </div>
                {errors.handle && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">
                    {errors.handle}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 mb-1.5">
              Email Address
            </label>
            <input
              type="text"
              placeholder="test@otz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:bg-slate-950/40 dark:text-white dark:placeholder-slate-600 ${
                errors.email
                  ? "border-rose-500 dark:border-rose-500/80"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 dark:text-slate-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all dark:bg-slate-950/40 dark:text-white dark:placeholder-slate-600 ${
                errors.password
                  ? "border-rose-500 dark:border-rose-500/80"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-500 font-medium">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 hover:from-violet-500 hover:to-purple-500 dark:from-violet-500 dark:to-purple-600 dark:hover:from-violet-400 dark:hover:to-purple-500 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all active:scale-[0.98]"
          >
            {activeTab === "login" ? "Sign In" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
