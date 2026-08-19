"use client";

import React, { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const theme = "dark";

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("theme-dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
