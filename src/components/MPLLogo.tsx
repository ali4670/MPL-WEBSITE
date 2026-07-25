import React from "react";

export function MPLLogo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: { w: 36, h: 36, text: 11, icon: 7 },
    md: { w: 44, h: 44, text: 13, icon: 9 },
    lg: { w: 64, h: 64, text: 18, icon: 13 },
  }[size];

  return (
    <svg
      width={dims.w}
      height={dims.h}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="32" cy="32" r="31" fill="#F9C74F" stroke="#D4A017" strokeWidth="2" />

      {/* Book icon */}
      <g transform="translate(32, 26)">
        {/* Left page */}
        <path
          d="M0,-10 C-1,-10 -9,-9 -9,-7 L-9,7 C-9,7 -1,6 0,6 Z"
          fill="#0C0A09"
          opacity="0.85"
        />
        {/* Right page */}
        <path
          d="M0,-10 C1,-10 9,-9 9,-7 L9,7 C9,7 1,6 0,6 Z"
          fill="#0C0A09"
          opacity="0.95"
        />
        {/* Spine */}
        <line x1="0" y1="-10" x2="0" y2="6" stroke="#F9C74F" strokeWidth="1" />
        {/* Pages left */}
        <path d="M-7,-6 L-2,-5.5" stroke="#F9C74F" strokeWidth="0.6" opacity="0.6" />
        <path d="M-7,-3 L-2,-2.5" stroke="#F9C74F" strokeWidth="0.6" opacity="0.6" />
        <path d="M-7,0 L-2,-0.5" stroke="#F9C74F" strokeWidth="0.6" opacity="0.6" />
        {/* Pages right */}
        <path d="M2,-5.5 L7,-6" stroke="#F9C74F" strokeWidth="0.6" opacity="0.6" />
        <path d="M2,-2.5 L7,-3" stroke="#F9C74F" strokeWidth="0.6" opacity="0.6" />
        <path d="M2,-0.5 L7,0" stroke="#F9C74F" strokeWidth="0.6" opacity="0.6" />
      </g>

      {/* MPL text */}
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fill="#0C0A09"
        fontSize={dims.text}
        fontWeight="900"
        fontFamily="'Arial Black', Impact, sans-serif"
        letterSpacing="1"
      >
        MPL
      </text>
    </svg>
  );
}
