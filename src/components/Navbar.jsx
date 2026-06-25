"use client";

import React from "react";
import { useBag } from "@/context/BagContext";

export default function Navbar() {
  const { bagCount } = useBag();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className="flex items-center space-x-2 group">
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent transition-all duration-300 group-hover:from-violet-300 group-hover:to-purple-400">
                OTZ
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse"></span>
            </a>
          </div>

          {/* Navigation Links & Bag Button */}
          <div className="flex items-center space-x-8">
            <div className="hidden sm:flex items-center space-x-6">
              <a
                href="#contact"
                className="text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-slate-100"
              >
                Contact Us
              </a>
              <a
                href="#login"
                className="text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-slate-100"
              >
                Login
              </a>
            </div>

            {/* Your Bag Button */}
            <button
              className="relative flex items-center space-x-2 rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-900 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] group"
              onClick={() => alert(`Your Bag contains ${bagCount} items.`)}
            >
              {/* Shopping Bag Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-4.5 w-4.5 text-slate-400 transition-colors duration-200 group-hover:text-violet-400"
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
                  : "bg-slate-800 text-slate-400"
              }`}>
                {bagCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
