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
  const syncSession = useCallback(async (customToken = null, customUser = null) => {
    try {
      const storedToken =
        customToken ||
        (typeof window !== "undefined" ? localStorage.getItem("otz_token") : null);

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
          if (storedToken) {
            localStorage.setItem("otz_token", storedToken);
            document.cookie = `otz_session=${storedToken}; path=/; max-age=2592000; SameSite=Lax;`;
            document.cookie = `otz_token=${storedToken}; path=/; max-age=2592000; SameSite=Lax;`;
          }
        }
      } else if (customUser) {
        // Fallback user if server sync has slight latency
        const fallbackUser = {
          id: customUser.id,
          account_id: customUser.id,
          email: customUser.email,
          name: customUser.user_metadata?.full_name || customUser.user_metadata?.name || customUser.email?.split("@")[0] || "User",
          phone: customUser.user_metadata?.phone || "",
          company: customUser.user_metadata?.company || "Personal Account",
          role: customUser.user_metadata?.role || "brand",
          state: "verified"
        };
        setUser(fallbackUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("otz_user", JSON.stringify(fallbackUser));
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
          if (typeof window !== "undefined") {
            localStorage.setItem("otz_token", currentSession.access_token);
            document.cookie = `otz_session=${currentSession.access_token}; path=/; max-age=2592000; SameSite=Lax;`;
            document.cookie = `otz_token=${currentSession.access_token}; path=/; max-age=2592000; SameSite=Lax;`;
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          if (newSession?.user) {
            if (typeof window !== "undefined") {
              localStorage.setItem("otz_token", newSession.access_token);
              document.cookie = `otz_session=${newSession.access_token}; path=/; max-age=2592000; SameSite=Lax;`;
              document.cookie = `otz_token=${newSession.access_token}; path=/; max-age=2592000; SameSite=Lax;`;
            }
            syncSession(newSession.access_token, newSession.user);
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setSession(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("otz_user");
              localStorage.removeItem("otz_token");
              document.cookie = "otz_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
              document.cookie = "otz_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
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

  // 1. Password / Supabase Login
  const loginWithPassword = async (email, password) => {
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      let sbToken = null;

      // Attempt client-side Supabase login first if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: sbData, error: sbErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (!sbErr && sbData?.session) {
            setSession(sbData.session);
            sbToken = sbData.session.access_token;
          }
        } catch (sbErr) {
          console.warn("Supabase Auth direct sign-in fallback:", sbErr);
        }
      }

      // Sync with server session
      const headers = { "Content-Type": "application/json" };
      if (sbToken) {
        headers["Authorization"] = `Bearer ${sbToken}`;
      }

      const res = await fetch("/api/auth", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "login-password", email: cleanEmail, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setLoading(false);
        const activeToken = sbToken || data.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("otz_user", JSON.stringify(data.user));
          if (activeToken) {
            localStorage.setItem("otz_token", activeToken);
            document.cookie = `otz_session=${activeToken}; path=/; max-age=2592000; SameSite=Lax;`;
            document.cookie = `otz_token=${activeToken}; path=/; max-age=2592000; SameSite=Lax;`;
          }
        }
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${data.user.name || "Member"}!`);
        window.dispatchEvent(new Event("auth-state-change"));
        return { success: true, user: data.user, token: activeToken };
      }
      return data;
    } catch (err) {
      return { error: "Authentication connection failed." };
    }
  };

  // 2. Email & Password Sign Up
  const signUpWithPassword = async ({ name, email, password, phone = "", company = "", role = "brand" }) => {
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanName = (name || "").trim();
      const cleanPhone = (phone || "").trim();
      const cleanCompany = (company || "").trim() || "Personal Account";

      // 1. Try client-side Supabase Auth signUp if configured
      if (isSupabaseConfigured()) {
        try {
          const { data: sbSignUp, error: sbErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
                name: cleanName,
                phone: cleanPhone,
                company: cleanCompany,
                role
              },
              emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined
            }
          });

          if (sbErr) {
            return { error: sbErr.message };
          }

          if (sbSignUp?.session) {
            setSession(sbSignUp.session);
          }
        } catch (sbEx) {
          console.warn("Client-side signup notice:", sbEx);
        }
      }

      // 2. Register & sync with server API
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "signup",
          name: cleanName,
          email: cleanEmail,
          password,
          phone: cleanPhone,
          company: cleanCompany,
          role
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setLoading(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("otz_user", JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem("otz_token", data.token);
            document.cookie = `otz_session=${data.token}; path=/; max-age=2592000; SameSite=Lax;`;
            document.cookie = `otz_token=${data.token}; path=/; max-age=2592000; SameSite=Lax;`;
          }
        }
        setIsAuthModalOpen(false);
        showToast(`Account created! Welcome to OTZ, ${data.user.name}.`);
        window.dispatchEvent(new Event("auth-state-change"));
        return { success: true, user: data.user };
      }
      return data;
    } catch (err) {
      return { error: "Failed to create account. Please try again." };
    }
  };

  // 3. Continue with Google OAuth
  const loginWithGoogle = async (redirectTo = "/dashboard") => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("post_login_redirect", redirectTo);
      }

      if (!isSupabaseConfigured()) {
        showToast("Google OAuth requires active Supabase configuration.", "error");
        return { error: "Supabase not configured." };
      }

      const callbackUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/auth/callback` 
        : "/auth/callback";

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        showToast(error.message, "error");
        return { error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      return { error: "Google authentication could not be initiated." };
    }
  };

  // 4. Forgot / Reset Password
  const resetPassword = async (email) => {
    try {
      const cleanEmail = (email || "").trim().toLowerCase();
      if (!cleanEmail) {
        return { error: "Please enter your email address" };
      }

      if (isSupabaseConfigured()) {
        const redirectTo = typeof window !== "undefined" 
          ? `${window.location.origin}/reset-password` 
          : "/reset-password";

        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
        });

        if (error) {
          return { error: error.message };
        }

        showToast("Password reset instructions dispatched to your email.", "info");
        return { success: true, message: "Check your email for the password reset link." };
      }

      return { error: "Password reset service unavailable." };
    } catch (err) {
      return { error: "Unable to process password reset request." };
    }
  };

  // 5. Update Password (from Reset Password page or Account Settings)
  const updatePassword = async (newPassword) => {
    try {
      if (!newPassword || newPassword.length < 6) {
        return { error: "Password must be at least 6 characters long." };
      }

      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { error: error.message };
        }

        showToast("Password updated successfully!");
        return { success: true };
      }

      return { error: "Password update unavailable." };
    } catch (err) {
      return { error: "Failed to update password." };
    }
  };

  // 6. Update User Profile
  const updateProfile = async (profileData) => {
    try {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("otz_token") : null;
      const headers = { "Content-Type": "application/json" };
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "update-profile", ...profileData })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("otz_user", JSON.stringify(data.user));
        }
        showToast("Profile changes saved successfully!");
        return { success: true, user: data.user };
      }

      return { error: data.error || "Failed to update profile." };
    } catch (err) {
      return { error: "Profile update connection error." };
    }
  };

  // 7. Legacy SMS OTP flow
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
            document.cookie = `otz_session=${data.token}; path=/; max-age=2592000; SameSite=Lax;`;
            document.cookie = `otz_token=${data.token}; path=/; max-age=2592000; SameSite=Lax;`;
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

  // 8. Log Out
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
        document.cookie = "otz_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie = "otz_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
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
        signUpWithPassword,
        loginWithGoogle,
        resetPassword,
        updatePassword,
        updateProfile,
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
              borderLeft: `4px solid ${toast.type === "success" ? "#2BD67B" : toast.type === "error" ? "#D64545" : "#FF5A1F"}`,
            }}
          >
            {toast.type === "success" ? (
              <MdiIcon name="check-circle-outline" className="text-lg text-[#2BD67B] shrink-0" />
            ) : toast.type === "error" ? (
              <MdiIcon name="alert-circle-outline" className="text-lg text-[#D64545] shrink-0" />
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

