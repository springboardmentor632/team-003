import React from "react";

export default function BrandMark({ stroke = "#EDEEE9", dot = "#B9862F" }) {
  return (
    <div className="brand-mark">
      <svg viewBox="0 0 26 26" fill="none">
        <path d="M2 13 L13 5 L24 13 L13 21 Z" stroke={stroke} strokeWidth="1.4" />
        <line x1="13" y1="5" x2="13" y2="21" stroke={dot} strokeWidth="1.4" />
        <circle cx="13" cy="13" r="1.6" fill={dot} />
      </svg>
    </div>
  );
}
