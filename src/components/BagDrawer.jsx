"use client";

import React, { useState } from "react";
import { useBag } from "@/context/BagContext";
import MdiIcon from "@/components/MdiIcon";

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
  };

  const handleCloseSuccess = () => {
    clearBag();
    setIsCheckedOut(false);
    setIsBagOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isBagOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden no-print">
        {/* Background Backdrop Overlay */}
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 no-print"
          onClick={isCheckedOut ? handleCloseSuccess : () => setIsBagOpen(false)}
        ></div>

        {/* Sliding Sidebar Panel */}
        <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex no-print">
          <div
            className="w-screen max-w-md frost-card flex flex-col transition-colors duration-200"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F2F6FA] flex items-center">
                <MdiIcon
                  name="shopping-outline"
                  className="mr-2 text-xl text-[#B8C7D9]"
                />
                Your Media Plan
              </h2>
              <button
                onClick={isCheckedOut ? handleCloseSuccess : () => setIsBagOpen(false)}
                className="text-[#A5B2BF] hover:text-[#F2F6FA] transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <MdiIcon name="close" className="text-xl" />
              </button>
            </div>

            {/* Body Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-between">
              {isCheckedOut ? (
                /* Success Checkout State */
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 animate-fade-in">
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <MdiIcon name="check-circle-outline" className="text-3xl" />
                  </div>
                  <h3 className="text-xl font-bold text-[#F2F6FA] mb-2">Quote Requested!</h3>
                  <p className="text-sm text-[#A5B2BF] max-w-sm mb-8">
                    Your campaign plan has been submitted! Our team will verify asset availability and email you a verified quote.
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseSuccess}
                    className="w-full rounded-xl bg-[#B8C7D9] px-4 py-3 text-sm font-semibold text-[#111827] shadow-lg hover:bg-[#D4E2EC] transition-all duration-300 cursor-pointer"
                  >
                    Return to Marketplace
                  </button>
                </div>
              ) : bag.length === 0 ? (
                /* Empty Cart State */
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 animate-fade-in">
                  <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-[#B8C7D9] border border-white/10 mb-6 shadow-sm">
                    <MdiIcon
                      name="shopping-search-outline"
                      className="text-4xl text-[#B8C7D9]"
                    />
                  </div>
                  <h4 className="text-base font-extrabold text-[#F2F6FA] mb-2">
                    Your Campaign Plan is Empty
                  </h4>
                  <p className="text-xs text-[#A5B2BF] max-w-xs mt-2 leading-relaxed">
                    Browse our catalog and add billboards, digital ads, or radio slots to start planning your campaign.
                  </p>
                </div>
              ) : (
                /* Cart Items List */
                <div className="space-y-4 flex-grow py-2">
                  {bag.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 rounded-xl border border-white/10 bg-white/5 relative group transition-colors duration-200"
                    >
                      {/* Item Thumbnail */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-20 rounded-lg object-cover bg-slate-900 border border-white/10"
                      />

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-[#F2F6FA] truncate pr-6">
                              {item.title}
                            </h4>
                            {/* Remove button */}
                            <button
                              onClick={() => removeFromBag(item.id)}
                              className="text-[#7F8B99] hover:text-rose-400 absolute top-3 right-3 transition-colors p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <MdiIcon name="trash-can-outline" className="text-lg" />
                            </button>
                          </div>
                          <p className="text-xs text-[#A5B2BF]">{item.category}</p>
                        </div>

                        {/* Controls and pricing */}
                        <div className="flex items-center justify-between mt-2">
                          {/* Duration Selector */}
                          <div className="flex items-center space-x-1.5">
                            <label className="text-[#7F8B99] text-[10px] font-medium uppercase tracking-wider">
                              Duration:
                            </label>
                            <select
                              value={item.duration || 1}
                              onChange={(e) => updateDuration(item.id, e.target.value)}
                              className="bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-xs text-[#F2F6FA] outline-none focus:border-[#B8C7D9]"
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
                            <span className="text-xs font-semibold text-[#B8C7D9]">
                              ₹{(item.price * (item.duration || 1)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Plan Summary & Checkout */}
              {!isCheckedOut && bag.length > 0 && (
                <div className="border-t border-white/10 pt-5 mt-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#A5B2BF] font-medium">Items in Plan</span>
                    <span className="text-[#F2F6FA] font-bold">{bag.length}</span>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/10 pt-3">
                    <div>
                      <span className="text-xs text-[#7F8B99] block">Total Est. Budget</span>
                      <span className="text-[#A5B2BF] text-xs">Based on selected durations</span>
                    </div>
                    <span className="text-2xl font-black text-[#B8C7D9]">
                      ₹{totalBudget.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-[#F2F6FA] shadow-sm hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                      Download Estimate Summary
                    </button>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="w-full rounded-xl bg-[#B8C7D9] px-4 py-3.5 text-sm font-bold text-[#111827] shadow-lg shadow-[#B8C7D9]/15 hover:bg-[#D4E2EC] transition-all duration-300 cursor-pointer"
                    >
                      Generate Plan / Request Quote
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Template */}
      <div className="hidden print:block p-10 bg-white text-slate-900 min-h-screen font-sans">
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-widest text-slate-900">OTZ MARKETPLACE</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Premium Advertising Campaign Estimate</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p className="mt-1">Estimate ID: EST-59281</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Plan Details</h2>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 border border-slate-200 rounded-xl p-4">
            <div>
              <span className="font-semibold block text-slate-900">Prepared For:</span>
              <span>Media Campaign Team</span>
            </div>
            <div>
              <span className="font-semibold block text-slate-900">Status:</span>
              <span>Draft Estimate Summary</span>
            </div>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-10">
          <thead>
            <tr className="border-b border-slate-300 text-xs uppercase tracking-wider text-slate-500">
              <th className="py-3 font-semibold">Media Slot</th>
              <th className="py-3 font-semibold">Category</th>
              <th className="py-3 font-semibold">Location</th>
              <th className="py-3 font-semibold">Duration</th>
              <th className="py-3 font-semibold text-right">Price/Slot</th>
              <th className="py-3 font-semibold text-right">Total Est.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {bag.map((item) => (
              <tr key={item.id}>
                <td className="py-4 font-bold text-slate-900">{item.title}</td>
                <td className="py-4 text-slate-600">{item.category}</td>
                <td className="py-4 text-slate-600">{item.location}</td>
                <td className="py-4 text-slate-700">{item.duration || 1} {item.duration === 1 ? 'Month' : 'Months'}</td>
                <td className="py-4 text-right text-slate-705">₹{item.price.toLocaleString()}</td>
                <td className="py-4 text-right font-bold text-slate-900">₹{(item.price * (item.duration || 1)).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-slate-900 pt-6 flex justify-between items-end mb-16">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</h3>
            <p className="text-lg font-bold text-slate-800">{bag.length} items in campaign</p>
          </div>
          <div className="text-right">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Campaign Budget</h3>
            <p className="text-3xl font-black text-slate-900">₹{totalBudget.toLocaleString()}</p>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-8">
          <p className="font-medium">Thank you for choosing OTZ Marketplace. This estimate is for planning purposes only.</p>
          <p className="mt-1">OTZ Marketplace Inc. | Website: otz-marketplace.com | contact@otz.media</p>
        </div>
      </div>
    </>
  );
}
