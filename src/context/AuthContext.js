"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import MdiIcon from "@/components/MdiIcon";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync state changes across tabs/windows and verify session
  const syncSession = useCallback(async () => {
    try {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("otz_token") : null;
      const headers = { "Content-Type": "application/json" };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "get-session" }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("otz_user", JSON.stringify(data.user));
        }
      } else {
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("otz_user");
          localStorage.removeItem("otz_token");
        }
      }
    } catch (e) {
      console.error("Failed to sync session context", e);
    } finally {
      setLoading(false);
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    // 1. Eager restore from localStorage for instant snappy UI without flicker
    if (typeof window !== "undefined") {
      try {
        const savedUserStr = localStorage.getItem("otz_user");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.id) {
            setUser(savedUser);
          }
        }
      } catch (_) {}
    }

    // 2. Validate authoritative session with server
    syncSession();

    // 3. Supabase Auth state listener if configured
    let authSubscription = null;
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        if (currentSession) {
          setSession(currentSession);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          if (newSession?.user) {
            syncSession();
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("otz_user");
              localStorage.removeItem("otz_token");
            }
          }
        }
      );
      authSubscription = subscription;
    }

    // 4. Custom cross-tab / window events
    const handleAuthChange = () => {
      syncSession();
    };
    const handleOpenModal = () => setIsAuthModalOpen(true);

    window.addEventListener("auth-state-change", handleAuthChange);
    window.addEventListener("open-auth-modal", handleOpenModal);

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
      window.removeEventListener("auth-state-change", handleAuthChange);
      window.removeEventListener("open-auth-modal", handleOpenModal);
    };
  }, [syncSession]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Password / Supabase Login
  const loginWithPassword = async (email, password) => {
    try {
      // 1. Attempt Supabase Auth login if Supabase is configured
      if (isSupabaseConfigured()) {
        try {
          const { data: sbData } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (sbData?.session) {
            setSession(sbData.session);
          }
        } catch (sbErr) {
          console.warn("Supabase Auth direct sign-in fallback:", sbErr);
        }
      }

      // 2. Sync with server session
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login-password", email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setLoading(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("otz_user", JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem("otz_token", data.token);
          }
        }
        setIsAuthModalOpen(false);
        showToast(`Welcome, ${data.user.name}!`);
        window.dispatchEvent(new Event("auth-state-change"));
        return { success: true, user: data.user, token: data.token };
      }
      return data;
    } catch (err) {
      return { error: "Authentication connection failed." };
    }
  };

  const login = async (phone) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", phone }),
      });
      return await res.json();
    } catch (err) {
      return { error: "Network connection failed" };
    }
  };

  const verifyOtp = async (userId, code) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", userId, code }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setLoading(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("otz_user", JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem("otz_token", data.token);
          }
        }
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${data.user.name}!`);
        window.dispatchEvent(new Event("auth-state-change"));
        return { success: true };
      }
      return data;
    } catch (err) {
      return { error: "Verification failed." };
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn("Supabase signOut error:", e);
        }
      }

      const storedToken = typeof window !== "undefined" ? localStorage.getItem("otz_token") : null;
      const headers = { "Content-Type": "application/json" };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      await fetch("/api/auth", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "logout" }),
      });
      setUser(null);
      setSession(null);
      setLoading(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("otz_user");
        localStorage.removeItem("otz_token");
      }
      showToast("Logged out successfully.", "info");

      // Redirect to home page
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "ops";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        mounted,
        isAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        loginWithPassword,
        verifyOtp,
        logout,
        syncSession,
        toast,
        showToast,
      }}
    >
      {children}

      {/* Premium Toast Notification System */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-toast-slide-in pointer-events-none no-print">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl bg-[#0B1E3B] border-[#1E375C] text-white pointer-events-auto"
            style={{
              borderLeft: `4px solid ${toast.type === "success" ? "#2BD67B" : "#FF5A1F"}`,
            }}
          >
            {toast.type === "success" ? (
              <MdiIcon name="check-circle-outline" className="text-lg text-[#2BD67B] shrink-0" />
            ) : (
              <MdiIcon name="information-outline" className="text-lg text-[var(--action-primary)] shrink-0" />
            )}
            <p className="text-xs font-bold tracking-wide flex-1">{toast.message}</p>
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
