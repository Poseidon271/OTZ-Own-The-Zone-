"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const BagContext = createContext();

export function BagProvider({ children }) {
  const [bag, setBag] = useState([]);
  const [isBagOpen, setIsBagOpen] = useState(false);

  // Load bag from localStorage on mount (client-side only)
  useEffect(() => {
    const savedBag = localStorage.getItem("otz_bag");
    if (savedBag) {
      try {
        setBag(JSON.parse(savedBag));
      } catch (e) {
        console.error("Failed to parse saved bag items", e);
      }
    }
  }, []);

  // Sync bag to localStorage whenever it changes
  const saveBag = (newBag) => {
    setBag(newBag);
    localStorage.setItem("otz_bag", JSON.stringify(newBag));
  };

  const addToBag = (item) => {
    if (!bag.some((bagItem) => bagItem.id === item.id)) {
      // Default duration is 1 month
      saveBag([...bag, { ...item, duration: 1 }]);
    }
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
