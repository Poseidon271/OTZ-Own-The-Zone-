"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const CardFlipContext = createContext({
  isFlipped: false,
  setIsFlipped: () => {},
  toggleFlip: () => {},
});

export function useCardFlip() {
  const context = useContext(CardFlipContext);
  if (!context) {
    throw new Error("useCardFlip must be used within a CardFlip component");
  }
  return context;
}

export function CardFlip({
  children,
  className,
  isFlipped: controlledFlipped,
  onFlip,
  ...props
}) {
  const [uncontrolledFlipped, setUncontrolledFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : uncontrolledFlipped;

  const toggleFlip = useCallback(
    (e) => {
      if (e) {
        // If clicking inside interactive elements like buttons, links, inputs, prevent default flip
        const target = e.target;
        if (
          target.closest("button") ||
          target.closest("a") ||
          target.closest("input") ||
          target.closest("[data-no-flip]")
        ) {
          return;
        }
      }
      const next = !isFlipped;
      if (controlledFlipped === undefined) {
        setUncontrolledFlipped(next);
      }
      onFlip?.(next);
    },
    [isFlipped, controlledFlipped, onFlip]
  );

  return (
    <CardFlipContext.Provider
      value={{
        isFlipped,
        setIsFlipped: setUncontrolledFlipped,
        toggleFlip,
      }}
    >
      <div
        className={cn(
          "relative w-full [perspective:1000px]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d]",
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          )}
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </CardFlipContext.Provider>
  );
}

export function CardFlipFront({ children, className, ...props }) {
  const { isFlipped } = useCardFlip();

  return (
    <div
      className={cn(
        "w-full h-full [backface-visibility:hidden] [WebkitBackfaceVisibility:hidden] flex flex-col justify-between overflow-hidden rounded-xl",
        isFlipped ? "pointer-events-none opacity-0" : "opacity-100 pointer-events-auto",
        className
      )}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(0deg)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFlipBack({ children, className, ...props }) {
  const { isFlipped } = useCardFlip();

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full [backface-visibility:hidden] [WebkitBackfaceVisibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between overflow-hidden rounded-xl",
        !isFlipped ? "pointer-events-none opacity-0" : "opacity-100 pointer-events-auto",
        className
      )}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFlipHeader({ children, className, ...props }) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFlipTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn("font-display text-base font-bold text-white leading-snug", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardFlipDescription({ children, className, ...props }) {
  return (
    <p className={cn("text-xs text-[#A5B5CD]", className)} {...props}>
      {children}
    </p>
  );
}

export function CardFlipAction({ children, className, onClick, ...props }) {
  const { toggleFlip } = useCardFlip();

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
    toggleFlip();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center cursor-pointer transition-colors focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function CardFlipContent({ children, className, ...props }) {
  return (
    <div
      className={cn("flex-grow flex flex-col justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardFlipFooter({ children, className, ...props }) {
  return (
    <div
      className={cn("border-t border-[#1E375C] flex items-center justify-between gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

