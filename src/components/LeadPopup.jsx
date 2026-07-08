"use client";

import React, { useState, useEffect } from "react";

export default function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed or completed the form in this session
    const isCaptured = localStorage.getItem("otz_lead_captured");
    if (isCaptured === "true") {
      return;
    }

    // Set 30-second timer to show the modal
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem("otz_lead_captured", "true");
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show success state
    setIsSuccess(true);
    localStorage.setItem("otz_lead_captured", "true");

    // Close the modal after a short delay to let the user read the success message
    setTimeout(() => {
      setIsOpen(false);
    }, 2500); // 2.5 seconds
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in no-print">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl flex flex-col animate-scale-up dark:bg-slate-900 dark:border-slate-800 transition-colors duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 dark:text-slate-500 dark:hover:text-white dark:hover:bg-slate-800 transition-colors z-20 border border-slate-100 dark:border-slate-800/80"
          title="Close modal"
          aria-label="Close modal"
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

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-3xl animate-bounce">
              ✓
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Thank you!
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We'll be in touch shortly.
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                Looking for the Perfect Campaign Match?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Leave your details and our growth experts will curate a custom media deck tailored specifically to your brand and budget goals.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="relative">
                <input
                  type="text"
                  id="lead-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-slate-50 border rounded-2xl appearance-none dark:text-white dark:bg-slate-950/40 focus:outline-none focus:ring-0 focus:border-violet-500 transition-all ${
                    errors.name
                      ? "border-red-500 dark:border-red-550 focus:border-red-500"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                />
                <label
                  htmlFor="lead-name"
                  className="absolute text-sm text-slate-400 dark:text-slate-500 duration-250 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-violet-500 dark:peer-focus:text-violet-400 pointer-events-none transition-all"
                >
                  Name
                </label>
                {errors.name && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 pl-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  id="lead-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-slate-50 border rounded-2xl appearance-none dark:text-white dark:bg-slate-950/40 focus:outline-none focus:ring-0 focus:border-violet-500 transition-all ${
                    errors.email
                      ? "border-red-500 dark:border-red-550 focus:border-red-500"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                />
                <label
                  htmlFor="lead-email"
                  className="absolute text-sm text-slate-400 dark:text-slate-500 duration-250 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-violet-500 dark:peer-focus:text-violet-400 pointer-events-none transition-all"
                >
                  Email Address
                </label>
                {errors.email && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 pl-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Input */}
              <div className="relative">
                <input
                  type="tel"
                  id="lead-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder=" "
                  className={`peer block w-full px-4 pt-6 pb-2 text-sm text-slate-900 bg-slate-50 border rounded-2xl appearance-none dark:text-white dark:bg-slate-950/40 focus:outline-none focus:ring-0 focus:border-violet-500 transition-all ${
                    errors.phone
                      ? "border-red-500 dark:border-red-550 focus:border-red-500"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                />
                <label
                  htmlFor="lead-phone"
                  className="absolute text-sm text-slate-400 dark:text-slate-500 duration-250 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-violet-500 dark:peer-focus:text-violet-400 pointer-events-none transition-all"
                >
                  Phone Number
                </label>
                {errors.phone && (
                  <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 pl-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-[0.98] text-sm cursor-pointer"
              >
                Get Free Recommendations
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
