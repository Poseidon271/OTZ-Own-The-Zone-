"use client";

import React from "react";
import PublicationCardFlip from "./PublicationCardFlip";

export default function NewspaperCard({ newspaper }) {
  return <PublicationCardFlip publication={newspaper} type="newspaper" />;
}
