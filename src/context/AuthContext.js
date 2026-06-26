"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  // Load user from localStorage on mount (client-side only)
  useEffect(() => {
    const savedUser = localStorage.getItem("otz_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user session", e);
      }
    }
    setMounted(true);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const login = (email, password) => {
    // Session Simulation: Any mock email and password completes the login flow.
    // Standard mock user details as requested.
    const mockUser = {
      name: "Sanskar",
      email: email || "test@otz.com",
      handle: "maver1ck",
    };
    setUser(mockUser);
    localStorage.setItem("otz_user", JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${mockUser.name}!`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("otz_user");
    setIsCampaignsModalOpen(false);
    showToast("Logged out successfully.", "info");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isCampaignsModalOpen,
        setIsCampaignsModalOpen,
        login,
        logout,
        toast,
        showToast,
      }}
    >
      {children}

      {/* Premium Toast Notification System */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-toast-slide-in pointer-events-none no-print">
          <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-colors duration-200 pointer-events-auto ${
            toast.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300"
              : "bg-indigo-50/90 border-indigo-200 text-indigo-800 dark:bg-indigo-950/90 dark:border-indigo-800/80 dark:text-indigo-300"
          }`}>
            {toast.type === "success" ? (
              <svg className="h-5 w-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063 1.06l-.041.02a.75.75 0 11-1.063-1.06zm0 3.5l.041-.02a.75.75 0 111.063 1.06l-.041.02a.75.75 0 11-1.063-1.06zM12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            )}
            <p className="text-sm font-semibold tracking-wide flex-1">{toast.message}</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
