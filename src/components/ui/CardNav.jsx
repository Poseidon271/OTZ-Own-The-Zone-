"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MdiIcon from "@/components/MdiIcon";
import { ShinyButton } from "@/components/ui/shiny-button";

export default function CardNav({ onLogoClick }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setIsAuthModalOpen, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenLogin = () => {
    setIsAuthModalOpen(true);
    window.dispatchEvent(new CustomEvent("open-auth-modal"));
  };

  const handleDashboardRedirect = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (!user) return;
    
    if (user.role === "ops" || user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl no-print">
      <div
        className="relative rounded-full px-6 py-3 transition-all duration-300 border transition-theme"
        style={{
          background: "var(--surface-raised)",
          borderColor: "var(--border-default)",
          boxShadow: "var(--shadow-floating)",
        }}
      >
        <div className="flex items-center justify-between">
          
          {/* Logo SVG Wordmark (Section 8.6) */}
          <button
            onClick={() => {
              if (onLogoClick) onLogoClick();
              else router.push("/");
            }}
            className="flex items-center space-x-2 group focus:outline-none cursor-pointer bg-transparent border-0 p-0 text-[var(--text-primary)]"
          >
            <svg
              className="w-7 h-7 text-[var(--action-primary)]"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="10" y="10" width="80" height="80" rx="14" stroke="currentColor" strokeWidth="6" />
              <circle cx="50" cy="50" r="22" stroke="currentColor" strokeWidth="6" />
            </svg>
            <span className="text-xl font-display font-black tracking-widest uppercase">
              OTZ
            </span>
          </button>

          {/* Desktop Navigation links */}
          <div className="hidden md:flex items-center space-x-6 text-[var(--text-primary)]">
            <button
              onClick={() => router.push("/")}
              className={`text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                pathname === "/"
                  ? "text-white font-extrabold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => router.push("/for-brands")}
              className={`text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                pathname === "/for-brands"
                  ? "text-white font-extrabold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              For Brands
            </button>
            <button
              onClick={() => router.push("/media-owners")}
              className={`text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                pathname === "/media-owners"
                  ? "text-white font-extrabold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              For Media Owners
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 rounded-full border border-[var(--border-default)] bg-[var(--surface-canvas)] px-3.5 py-1.5 text-xs font-bold transition-all hover:border-[var(--border-strong)] cursor-pointer text-[var(--text-primary)]"
                >
                  <div className="h-6 w-6 rounded-full bg-[#0B1E3B] text-white flex items-center justify-center font-black text-[10px] shadow-sm">
                    {user.role === "admin" ? "A" : user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="max-w-[120px] truncate">
                    {user.role === "admin" ? "ADMIN" : user.phone ? `@${user.phone}` : user.name || "User"}
                  </span>
                  <MdiIcon
                    name="chevron-down"
                    className={`transition-transform duration-200 text-sm ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div
                      className="absolute right-0 mt-3 w-52 rounded-xl p-2 shadow-2xl z-40 bg-white border border-[var(--border-default)]"
                    >
                      <div className="px-3 py-2 border-b border-[var(--border-default)] text-left">
                        <p className="text-[9px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-wider">
                          Workspace Session
                        </p>
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                          {user.email || user.name}
                        </p>
                      </div>
                      <button
                        onClick={handleDashboardRedirect}
                        className="flex w-full items-center px-3 py-2.5 mt-1 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-slate-50 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        <MdiIcon
                          name="view-dashboard-outline"
                          className="mr-2 text-base text-[var(--action-primary)]"
                        />{" "}
                        {user.role === "ops" || user.role === "admin" ? "Admin Console" : "My Dashboard"}
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center px-3 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <MdiIcon name="logout" className="mr-2 text-base" />{" "}
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleOpenLogin}
                  className="text-xs uppercase font-bold text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
                >
                  Log in
                </button>
                 <ShinyButton
                  onClick={() => window.open("https://wa.me/919999999999?text=I%27m%20interested%20in%20Own%20The%20Zone%20campaigns", "_blank")}
                  className="px-5 py-1.5 text-xs font-bold shadow-md rounded-full ml-3"
                >
                  Talk to us
                </ShinyButton>
              </>
            )}
          </div>

          {/* Mobile Right Menu controls */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--surface-canvas)] text-[var(--text-primary)] hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <MdiIcon
                name={isMobileMenuOpen ? "close" : "menu"}
                className="text-xl"
              />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden overflow-hidden transition-all mt-3 border-t border-[var(--border-default)] pt-3 space-y-2 text-left">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/");
              }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-slate-50"
            >
              Home
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/for-brands");
              }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-slate-50"
            >
              For Brands
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/media-owners");
              }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-slate-50"
            >
              For Media Owners
            </button>

            {user ? (
              <div className="pt-2 border-t border-[var(--border-default)] space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold text-[var(--text-tertiary)]">
                  SIGNED IN: @{user.phone}
                </div>
                <button
                  onClick={handleDashboardRedirect}
                  className="flex w-full items-center px-3 py-2.5 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:bg-slate-50"
                >
                  <MdiIcon name="view-dashboard-outline" className="mr-2 text-base text-[var(--action-primary)]" />
                  {user.role === "ops" || user.role === "admin" ? "Ops Console" : "My Dashboard"}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center px-3 py-2.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50"
                >
                  <MdiIcon name="logout" className="mr-2 text-base" /> Log Out
                </button>
              </div>
            ) : (
              <ShinyButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenLogin();
                }}
                className="w-full text-center font-bold"
              >
                Sign In
              </ShinyButton>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
