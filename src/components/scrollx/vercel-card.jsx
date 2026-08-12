"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function VercelCard({
  children,
  className,
  showIcons = true,
  iconClassName,
  animateOnHover = false,
  glowEffect = false,
  bordered = true,
  ...props
}) {
  return (
    <motion.div
      className={cn(
        "group/canvas-card relative flex flex-col items-center justify-center w-full h-full min-h-50",
        bordered && "border border-black/20 dark:border-white/20 rounded-xl",
        className
      )}
      whileHover={animateOnHover ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {showIcons && (
        <>
          <Icon
            className={cn(
              "absolute -left-3 -top-3 h-6 w-6 text-black dark:text-white",
              iconClassName
            )}
          />
          <Icon
            className={cn(
              "absolute -bottom-3 -left-3 h-6 w-6 text-black dark:text-white",
              iconClassName
            )}
          />
          <Icon
            className={cn(
              "absolute -right-3 -top-3 h-6 w-6 text-black dark:text-white",
              iconClassName
            )}
          />
          <Icon
            className={cn(
              "absolute -bottom-3 -right-3 h-6 w-6 text-black dark:text-white",
              iconClassName
            )}
          />
        </>
      )}

      {glowEffect && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-[#FF5A1F]/12 to-emerald-500/15 opacity-0 blur-xl transition-opacity duration-500 group-hover/canvas-card:opacity-100 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      )}

      <div className="relative h-full w-full p-6 flex flex-col items-center justify-center">
        {children}
      </div>
    </motion.div>
  );
}

function Icon({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
}
