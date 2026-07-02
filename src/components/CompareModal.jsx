"use client";

import React from "react";
import { useBag } from "@/context/BagContext";

export default function CompareModal({ selectedAssets, isOpen, onClose }) {
  const { addToBag, isInBag } = useBag();

  if (!isOpen || selectedAssets.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scale-up max-h-[90vh] dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 backdrop-blur-md transition-colors z-20 border border-slate-250 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-950/50 dark:border-slate-800/40"
          title="Close Modal"
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

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
            <span className="mr-2">⚖️</span> Media Space Comparison
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review base pricing, creative specifications, and reach side-by-side.
          </p>
        </div>

        {/* Comparison Table Content */}
        <div className="overflow-x-auto p-6 flex-1">
          <table className="w-full min-w-[600px] text-left border-collapse table-fixed">
            <thead>
              <tr className="border-b border-slate-250 dark:border-slate-800">
                <th className="w-1/4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Feature
                </th>
                {selectedAssets.map((asset) => (
                  <th
                    key={asset.id}
                    className="py-3 px-4 text-slate-900 dark:text-white"
                  >
                    <div className="flex flex-col space-y-2">
                      <img
                        src={asset.image}
                        alt={asset.title}
                        className="h-24 w-full rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950"
                      />
                      <span className="text-sm font-bold line-clamp-2 text-left">{asset.title}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {/* Row 2: Category */}
              <tr>
                <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Category
                </td>
                {selectedAssets.map((asset) => (
                  <td key={asset.id} className="py-4 px-4 font-bold text-slate-700 dark:text-slate-350">
                    <span className="inline-block rounded-full bg-slate-50 dark:bg-slate-950 px-2.5 py-1 text-xs text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-slate-800">
                      {asset.category}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Row 3: Base Rental Pricing */}
              <tr>
                <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Base Price
                </td>
                {selectedAssets.map((asset) => (
                  <td key={asset.id} className="py-4 px-4 font-black text-slate-900 dark:text-white text-lg">
                    ₹{asset.price.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">/day</span>
                  </td>
                ))}
              </tr>

              {/* Row 4: Estimated Reach */}
              <tr>
                <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Est. Reach
                </td>
                {selectedAssets.map((asset) => (
                  <td key={asset.id} className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {asset.reach}
                  </td>
                ))}
              </tr>

              {/* Row 5: Creative Specifications */}
              <tr>
                <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Specs
                </td>
                {selectedAssets.map((asset) => (
                  <td key={asset.id} className="py-4 px-4 text-xs font-mono text-slate-700 dark:text-slate-300">
                    {asset.specs}
                  </td>
                ))}
              </tr>

              {/* Row 6: Availability */}
              <tr>
                <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Availability
                </td>
                {selectedAssets.map((asset) => {
                  const availability = asset.availability || {};
                  const isCompletelyBooked = Object.values(availability).length > 0 && Object.values(availability).every((val) => val === false);
                  const availableCount = Object.values(availability).filter(Boolean).length;
                  return (
                    <td key={asset.id} className="py-4 px-4 text-xs">
                      {isCompletelyBooked ? (
                        <span className="font-bold text-red-600 dark:text-red-400">
                          Unavailable (Fully Booked)
                        </span>
                      ) : (
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {availableCount}/6 Months Available
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 7: Actions */}
              <tr>
                <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">
                  Order Action
                </td>
                {selectedAssets.map((asset) => {
                  const inBag = isInBag(asset.id);
                  const availability = asset.availability || {};
                  const isCompletelyBooked = Object.values(availability).length > 0 && Object.values(availability).every((val) => val === false);

                  return (
                    <td key={asset.id} className="py-4 px-4">
                      <button
                        type="button"
                        disabled={isCompletelyBooked || inBag}
                        onClick={() => {
                          if (!inBag && !isCompletelyBooked) {
                            addToBag(asset);
                          }
                        }}
                        className={`w-full rounded-xl py-2 px-3 text-xs font-bold transition-all duration-300 text-center ${
                          isCompletelyBooked
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700"
                            : inBag
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40 cursor-not-allowed"
                            : "bg-violet-600 hover:bg-violet-500 text-white shadow-sm hover:shadow-violet-600/25"
                        }`}
                      >
                        {isCompletelyBooked
                          ? "Fully Booked"
                          : inBag
                          ? "Added to Bag"
                          : "Add to Bag"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
