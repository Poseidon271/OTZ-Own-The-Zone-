"use client";

import React from "react";
import PublicationCardFlip from "./PublicationCardFlip";

export default function MagazineCard({ magazine }) {
  return <PublicationCardFlip publication={magazine} type="magazine" />;
}
