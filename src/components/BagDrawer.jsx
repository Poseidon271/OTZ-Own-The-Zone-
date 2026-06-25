"use client";

import React, { useState } from "react";
import { useBag } from "@/context/BagContext";

export default function BagDrawer() {
  const {
    bag,
    isBagOpen,
    setIsBagOpen,
    removeFromBag,
    updateDuration,
    clearBag,
  } = useBag();

  const [isCheckedOut, setIsCheckedOut] = useState(false);

  // Calculate dynamic pricing
  const totalBudget = bag.reduce(
    (sum, item) => sum + item.price * (item.duration || 1),
    0
  );

  const handleCheckout = () => {
    setIsCheckedOut(true);
    // Wait a brief moment to clear the bag and close, or let the user click close
  };

  const handleCloseSuccess = () => {
    clearBag();
    setIsCheckedOut(false);
    setIsBagOpen(false);
  };

  if (!isBagOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background Backdrop Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={isCheckedOut ? handleCloseSuccess : () => setIsBagOpen(false)}
      ></div>

      {/* Sliding Sidebar Panel */}
      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="mr-2 h-5 w-5 text-violet-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              Your Media Plan
            </h2>
            <button
              onClick={isCheckedOut ? handleCloseSuccess : () => setIsBagOpen(false)}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
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
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between">
            {isCheckedOut ? (
              /* Success Checkout State */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                    stroke="currentColor"
                    className="h-8 w-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Quote Requested!</h3>
                <p className="text-sm text-slate-400 max-w-sm mb-8">
                  Your campaign plan has been submitted! Our team will verify asset availability and email you a verified quote.
                </p>
                <button
                  type="button"
                  onClick={handleCloseSuccess}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-violet-500 transition-all duration-300"
                >
                  Return to Marketplace
                </button>
              </div>
            ) : bag.length === 0 ? (
              /* Empty Cart State */
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-12 w-12 text-slate-600 mb-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25-3v16.5m-3-16.5h6M3.75 7.5h16.5M9 3h6"
                  />
                </svg>
                <h4 className="text-base font-semibold text-white">Your bag is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-2">
                  Browse our selection of advertising channels and click "Add to Bag" to start drafting your media plan.
                </p>
              </div>
            ) : (
              /* Cart Items List */
              <div className="space-y-4 flex-grow py-2">
                {bag.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950/40 relative group"
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-20 rounded-lg object-cover bg-slate-900 border border-slate-800"
                    />

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-white truncate pr-6">
                            {item.title}
                          </h4>
                          {/* Remove button */}
                          <button
                            onClick={() => removeFromBag(item.id)}
                            className="text-slate-500 hover:text-rose-400 absolute top-3 right-3 transition-colors p-1"
                            title="Remove item"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="2"
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">{item.category}</p>
                      </div>

                      {/* Controls and pricing */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Duration Selector */}
                        <div className="flex items-center space-x-1.5">
                          <label className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
                            Duration:
                          </label>
                          <select
                            value={item.duration || 1}
                            onChange={(e) => updateDuration(item.id, e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-slate-200 outline-none focus:border-violet-500"
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1} {i + 1 === 1 ? "Month" : "Months"}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Calculations */}
                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-400">
                            ${item.price * (item.duration || 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Plan Summary & Checkout (Only shown if not checked out and items > 0) */}
            {!isCheckedOut && bag.length > 0 && (
              <div className="border-t border-slate-800 pt-5 mt-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Items in Plan</span>
                  <span className="text-white font-bold">{bag.length}</span>
                </div>
                <div className="flex justify-between items-end border-t border-slate-800/60 pt-3">
                  <div>
                    <span className="text-xs text-slate-500 block">Total Est. Budget</span>
                    <span className="text-slate-400 text-xs">Based on selected durations</span>
                  </div>
                  <span className="text-2xl font-black text-violet-400">
                    ${totalBudget.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:bg-violet-500 hover:shadow-violet-600/30 transition-all duration-300 focus:outline-none"
                >
                  Generate Plan / Request Quote
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
