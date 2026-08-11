"use client";

import React from "react";

export default function MdiIcon({ name, className = "", style = {}, ...props }) {
  const iconName = name.startsWith("mdi-") ? name : `mdi-${name}`;
  return (
    <i
      className={`mdi ${iconName} ${className}`}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", ...style }}
      {...props}
    />
  );
}
