"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const BagContext = createContext();

export function BagProvider({ children }) {
  const [bag, setBag] = useState(() => {
    if (typeof window !== "undefined") {
      const savedBag = localStorage.getItem("otz_bag");
      if (savedBag) {
        try {
          return JSON.parse(savedBag);
        } catch (e) {
          console.error("Failed to parse saved bag items", e);
        }
      }
    }
    return [];
  });
  const [isBagOpen, setIsBagOpen] = useState(false);

  // Sync bag to localStorage whenever it changes
  const saveBag = (updater) => {
    setBag((prevBag) => {
      const newBag = typeof updater === "function" ? updater(prevBag) : updater;
      if (typeof window !== "undefined") {
        localStorage.setItem("otz_bag", JSON.stringify(newBag));
      }
      return newBag;
    });
  };

  const addToBag = (item, targetDuration) => {
    saveBag((prevBag) => {
      if (prevBag.some((bagItem) => bagItem.id === item.id)) {
        return prevBag;
      }
      const newItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        dailyRate: item.dailyRate || item.price,
        duration: targetDuration || item.duration || 1,
        reach: item.reach || "Verified Reach",
        location: item.location || "National",
        image: item.image || "",
        channelDomain: item.channelDomain || item.subCategory || item.category || "Mass Media",
        category: item.category || "Mass Media",
        subCategory: item.subCategory || "OOH",
        specs: item.specs || "Standard placement",
      };
      return [...prevBag, newItem];
    });
  };

  const addItemsToBag = (items, targetDuration) => {
    saveBag((prevBag) => {
      const existingIds = new Set(prevBag.map((b) => b.id));
      const newItems = items
        .filter((item) => !existingIds.has(item.id))
        .map((item) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          dailyRate: item.dailyRate || item.price,
          duration: item.duration || targetDuration || 1,
          reach: item.reach || "Verified Reach",
          location: item.location || "National",
          image: item.image || "",
          channelDomain: item.channelDomain || item.subCategory || item.category || "Mass Media",
          category: item.category || "Mass Media",
          subCategory: item.subCategory || "OOH",
          specs: item.specs || "Standard placement",
        }));

      if (newItems.length === 0) return prevBag;
      return [...prevBag, ...newItems];
    });
  };

  const removeFromBag = (itemId) => {
    saveBag((prevBag) => prevBag.filter((item) => item.id !== itemId));
  };

  const updateDuration = (itemId, duration) => {
    saveBag((prevBag) =>
      prevBag.map((item) =>
        item.id === itemId ? { ...item, duration: parseInt(duration, 10) || 1 } : item
      )
    );
  };

  const clearBag = () => {
    saveBag([]);
  };

  const isInBag = (itemId) => {
    return bag.some((item) => item.id === itemId);
  };

  return (
    <BagContext.Provider
      value={{
        bag,
        isBagOpen,
        setIsBagOpen,
        addToBag,
        addItemsToBag,
        removeFromBag,
        updateDuration,
        clearBag,
        isInBag,
        bagCount: bag.length,
      }}
    >
      {children}
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
