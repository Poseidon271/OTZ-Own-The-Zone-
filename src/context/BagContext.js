"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const BagContext = createContext();

export function BagProvider({ children }) {
  const [bag, setBag] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Safe client-side hydration from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedBag = localStorage.getItem("otz_bag") || localStorage.getItem("otz_media_cart");
      if (savedBag) {
        const parsed = JSON.parse(savedBag);
        if (Array.isArray(parsed)) {
          setBag(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved cart items", e);
    }
  }, []);

  // Sync cart to localStorage whenever it changes (after mount)
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("otz_bag", JSON.stringify(bag));
      localStorage.setItem("otz_media_cart", JSON.stringify(bag));
    } catch (e) {
      console.error("Failed to sync cart items to localStorage", e);
    }
  }, [bag, isMounted]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  const addToBag = (item, targetDuration) => {
    const publicationName = item.name || item.title || "Publication";
    const cartItem = {
      id: item.id,
      title: item.title || `${publicationName} Advertising`,
      name: publicationName,
      price: typeof item.price === "number" ? item.price : (typeof item.minimumSpend === "number" ? item.minimumSpend : 0),
      dailyRate: item.dailyRate || item.minimumSpend || item.price || 0,
      duration: targetDuration || item.duration || 1,
      reach: item.reach || (item.audienceReach ? `${item.audienceReach} Readers` : "Verified Readership"),
      location: typeof item.location === "object"
        ? `${item.location.city}${item.location.region ? ` • ${item.location.region}` : ""}`
        : item.location || "National",
      image: item.image || item.coverImage || item.logo || "",
      logo: item.logo || item.coverImage || item.image || "",
      category: item.category || "General Interest",
      subCategory: item.subCategory || (item.mediaType === "Magazine" ? "Magazine" : "Newspaper"),
      mediaType: item.mediaType || (item.subCategory?.toLowerCase() === "magazine" ? "Magazine" : "Newspaper"),
      channelDomain: item.channelDomain || "Print Media",
      specs: item.specs || (Array.isArray(item.adOptions) && item.adOptions.length > 0 ? item.adOptions[0] : "Standard Placement"),
      frequency: item.frequency || "Regular Edition",
      languages: Array.isArray(item.languages) ? item.languages : [],
    };

    setBag((prevBag) => {
      // Duplicate prevention: check both ID and placement specs
      const alreadyExists = prevBag.some(
        (b) => b.id === cartItem.id && (!cartItem.specs || b.specs === cartItem.specs)
      );

      if (alreadyExists) {
        showToast(`${publicationName} is already in your cart`, "info");
        return prevBag;
      }

      showToast(`Added ${publicationName} to cart`, "success");
      return [...prevBag, cartItem];
    });
  };

  const addItemsToBag = (items, targetDuration) => {
    setBag((prevBag) => {
      const existingKeys = new Set(prevBag.map((b) => `${b.id}-${b.specs || ""}`));
      const newItems = items
        .filter((item) => !existingKeys.has(`${item.id}-${item.specs || ""}`))
        .map((item) => {
          const pubName = item.name || item.title || "Publication";
          return {
            id: item.id,
            title: item.title || `${pubName} Advertising`,
            name: pubName,
            price: typeof item.price === "number" ? item.price : (typeof item.minimumSpend === "number" ? item.minimumSpend : 0),
            dailyRate: item.dailyRate || item.minimumSpend || item.price || 0,
            duration: item.duration || targetDuration || 1,
            reach: item.reach || (item.audienceReach ? `${item.audienceReach} Readers` : "Verified Readership"),
            location: typeof item.location === "object"
              ? `${item.location.city}${item.location.region ? ` • ${item.location.region}` : ""}`
              : item.location || "National",
            image: item.image || item.coverImage || item.logo || "",
            logo: item.logo || item.coverImage || item.image || "",
            category: item.category || "General Interest",
            subCategory: item.subCategory || (item.mediaType === "Magazine" ? "Magazine" : "Newspaper"),
            mediaType: item.mediaType || (item.subCategory?.toLowerCase() === "magazine" ? "Magazine" : "Newspaper"),
            channelDomain: item.channelDomain || "Print Media",
            specs: item.specs || (Array.isArray(item.adOptions) && item.adOptions.length > 0 ? item.adOptions[0] : "Standard Placement"),
            frequency: item.frequency || "Regular Edition",
            languages: Array.isArray(item.languages) ? item.languages : [],
          };
        });

      if (newItems.length === 0) {
        showToast("Selected items are already in your cart", "info");
        return prevBag;
      }

      showToast(`Added ${newItems.length} items to cart`, "success");
      return [...prevBag, ...newItems];
    });
  };

  const removeFromBag = (itemId, specs) => {
    setBag((prevBag) => {
      const target = prevBag.find((b) => b.id === itemId && (!specs || b.specs === specs));
      const filtered = prevBag.filter(
        (item) => !(item.id === itemId && (!specs || item.specs === specs))
      );
      if (target) {
        showToast(`Removed ${target.name || target.title || "item"} from cart`, "info");
      }
      return filtered;
    });
  };

  const updateDuration = (itemId, duration) => {
    setBag((prevBag) =>
      prevBag.map((item) =>
        item.id === itemId ? { ...item, duration: parseInt(duration, 10) || 1 } : item
      )
    );
  };

  const clearBag = () => {
    setBag([]);
  };

  const isInBag = (itemId, specs) => {
    if (!isMounted) return false;
    return bag.some(
      (item) => item.id === itemId && (!specs || item.specs === specs)
    );
  };

  // Safe cart count (0 before mount to prevent SSR hydration mismatch)
  const cartCount = isMounted ? bag.length : 0;

  return (
    <BagContext.Provider
      value={{
        bag,
        cart: bag,
        isMounted,
        isBagOpen,
        setIsBagOpen,
        addToBag,
        addToCart: addToBag,
        addItemsToBag,
        removeFromBag,
        removeFromCart: removeFromBag,
        updateDuration,
        clearBag,
        clearCart: clearBag,
        isInBag,
        isInCart: isInBag,
        bagCount: cartCount,
        cartCount,
        showToast,
      }}
    >
      {children}

      {/* Global Lightweight Midnight Zone Notification Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0F2444] border border-[#1E375C] shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-white text-xs font-semibold animate-slide-up transition-all pointer-events-auto"
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === "info"
                ? "bg-[#132A4F] text-[#FF5A1F]"
                : "bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {toast.type === "info" ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
          <span className="text-white tracking-wide">{toast.message}</span>
        </div>
      )}
    </BagContext.Provider>
  );
}

export function useBag() {
  const context = useContext(BagContext);
  if (!context) {
    throw new Error("useBag must be used within a BagProvider");
  }
  return context;
}

export const useCart = useBag;
