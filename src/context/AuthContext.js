"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import MdiIcon from "@/components/MdiIcon";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync state changes across tabs/windows
  const syncSession = async () => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-session" })
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("otz_user", JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem("otz_user");
      }
    } catch (e) {
      console.error("Failed to sync session context", e);
    }
  };

  useEffect(() => {
    // Initial fetch to sync session state on mount
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get-session" })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setMounted(true);
      })
      .catch((e) => {
        console.error("Session sync failed on mount", e);
        setMounted(true);
      });

    // Listen to custom registration login completions
    const handleAuthChange = () => {
      syncSession();
    };
    window.addEventListener("auth-state-change", handleAuthChange);
    window.addEventListener("open-auth-modal", () => setIsAuthModalOpen(true));

    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange);
      window.removeEventListener("open-auth-modal", () => setIsAuthModalOpen(true));
    };
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000); // 5s auto-dismiss (Section 8.5)
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const login = async (phone) => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-otp", phone })
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
        body: JSON.stringify({ action: "verify-otp", userId, code })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("otz_user", JSON.stringify(data.user));
        setIsAuthModalOpen(false);
        showToast(`Welcome back, ${data.user.name}!`);
        return { success: true };
      }
      return data;
    } catch (err) {
      return { error: "Verification failed." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" })
      });
      setUser(null);
      localStorage.removeItem("otz_user");
      showToast("Logged out successfully.", "info");
      
      // Redirect to home page
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        verifyOtp,
        logout,
        toast,
        showToast,
      }}
    >
      {children}

      {/* Premium Toast Notification System (Section 8.5) */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-toast-slide-in pointer-events-none no-print">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl bg-[#0B1E3B] border-[#1E375C] text-white pointer-events-auto"
            style={{
              borderLeft: `4px solid ${toast.type === "success" ? "#2BD67B" : "#FF5A1F"}`
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
