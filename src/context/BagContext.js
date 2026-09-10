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

  const addToBag = (item) => {
    saveBag((prevBag) => {
      if (!prevBag.some((bagItem) => bagItem.id === item.id)) {
        // Default duration is 1 month
        return [...prevBag, { ...item, duration: item.duration || 1 }];
      }
      return prevBag;
    });
  };

  const addItemsToBag = (items) => {
    saveBag((prevBag) => {
      const newItems = items
        .filter((item) => !prevBag.some((bagItem) => bagItem.id === item.id))
        .map((item) => ({ ...item, duration: item.duration || 1 }));
      if (newItems.length > 0) {
        return [...prevBag, ...newItems];
      }
      return prevBag;
    });
  };

  const removeFromBag = (itemId) => {
    saveBag(bag.filter((item) => item.id !== itemId));
  };

  const updateDuration = (itemId, duration) => {
    saveBag(
      bag.map((item) =>
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
