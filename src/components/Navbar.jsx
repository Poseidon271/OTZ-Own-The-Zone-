"use client";

import React, { useState } from "react";
import { useBag } from "@/context/BagContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { bagCount, setIsBagOpen } = useBag();
  const { theme, toggleTheme } = useTheme();
  const { user, setIsAuthModalOpen, setIsCampaignsModalOpen, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 transition-colors duration-200 no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-500 group-hover:to-purple-500 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-500 dark:group-hover:from-violet-300 dark:group-hover:to-purple-400">
                OTZ
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-500 animate-pulse"></span>
            </a>
          </div>

          {/* Navigation Links, Bag Button & Theme Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-6 mr-2">
              <a
                href="#contact"
                className="text-sm font-medium text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Contact Us
              </a>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50/50 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:border-violet-500/50 hover:bg-white hover:text-violet-650 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-slate-900 dark:hover:text-white group cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-full bg-violet-600 dark:bg-violet-500 text-white flex items-center justify-center font-black text-[10px] tracking-tighter">
                      {user.name.charAt(0)}
                    </div>
                    <span className="max-w-[100px] truncate font-bold text-slate-800 dark:text-slate-200">@{user.handle}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      className={`h-3 w-3 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {isDropdownOpen && (
                    <>
                      {/* Invisible overlay to close dropdown */}
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setIsDropdownOpen(false)}
                      ></div>

                      <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-800 dark:bg-slate-950 z-40 animate-scale-up">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-900">
                          <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Signed in as
                          </p>
                          <p className="text-xs font-bold text-slate-850 truncate dark:text-slate-200">
                            {user.name}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setIsCampaignsModalOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-violet-650 dark:text-slate-350 dark:hover:bg-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="mr-2">📊</span> My Campaigns
                        </button>
                        <button
                          onClick={() => {
                            logout();
                            setIsDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <span className="mr-2">🚪</span> Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-sm font-semibold text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-455 dark:hover:text-white cursor-pointer"
                >
                  Login
                </button>
              )}
            </div>

            {/* Your Bag Button */}
            <button
              className="relative flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-300 hover:border-violet-500/50 hover:bg-white hover:text-violet-600 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-violet-500/50 dark:hover:bg-slate-900 dark:hover:text-white dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] group"
              onClick={() => setIsBagOpen(true)}
            >
              {/* Shopping Bag Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-4.5 w-4.5 text-slate-500 transition-colors duration-200 group-hover:text-violet-600 dark:text-slate-400 dark:group-hover:text-violet-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <span>Your Bag</span>

              {/* Interactive Count Badge */}
              <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold transition-all duration-300 ${
                bagCount > 0
                  ? "bg-violet-600 text-white shadow-[0_0_8px_rgba(139,92,246,0.6)] animate-bounce"
                  : "bg-slate-200 text-slate-650 dark:bg-slate-800 dark:text-slate-450"
              }`}>
                {bagCount}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-all duration-300 hover:border-violet-500/50 hover:bg-white hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-350 dark:hover:border-violet-500/50 dark:hover:bg-slate-900 dark:hover:text-white dark:hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                /* Sun Icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-5 w-5 text-amber-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25m0 13.5V21M9.75 12h-.5m11.25 0h-.5M5.029 5.03l1.59 1.59m10.762 10.762l1.59 1.59M5.03 18.97l1.59-1.59M18.97 5.03l1.59-1.59M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
                  />
                </svg>
              ) : (
                /* Moon Icon */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-5 w-5 text-indigo-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
