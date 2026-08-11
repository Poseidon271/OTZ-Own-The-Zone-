"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

const curtainVariants = {
  initial: {
    scaleY: 1,
  },
  animate: {
    scaleY: 0,
    transition: {
      duration: 0.65,
      ease: [0.76, 0, 0.24, 1],
    },
  },
  exit: {
    scaleY: 1,
    transition: {
      duration: 0.65,
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

export default function PageCurtains() {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className="fixed inset-0 pointer-events-none z-50 flex"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="h-full flex-1 relative origin-top backdrop-blur-[4px]"
            style={{
              background: "linear-gradient(180deg, rgba(18, 24, 34, 0.98) 0%, rgba(184, 199, 217, 0.08) 100%)",
            }}
            variants={curtainVariants}
          >
            {/* Frost Blue edge highlight line for neon wipe effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)] shadow-[0_0_15px_rgba(184,199,217,0.8)] opacity-90" />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
