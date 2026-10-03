import React from "react";
import { Link } from "react-router-dom";

interface LogoIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function LogoIcon({ size = 36, className = "", style = {} }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "inline-block", flexShrink: 0, ...style }}
    >
      <defs>
        {/* Surgical Teal Gradient */}
        <linearGradient id="p_logo_bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#115e59" />
        </linearGradient>

        {/* Scan Reticle Gradient */}
        <linearGradient id="p_scan_beam" x1="6" y1="24" x2="42" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Clinical Squircle Badge */}
      <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#p_logo_bg)" />
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="10"
        stroke="#14b8a6"
        strokeOpacity="0.4"
        strokeWidth="1.2"
      />

      {/* Optical Precision Corner Brackets */}
      <path
        d="M8.5 14V9.5C8.5 8.94772 8.94772 8.5 9.5 8.5H14"
        stroke="#99f6e4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <path
        d="M34 8.5H38.5C39.0523 8.5 39.5 8.94772 39.5 9.5V14"
        stroke="#99f6e4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <path
        d="M39.5 34V38.5C39.5 39.0523 39.0523 39.5 38.5 39.5H34"
        stroke="#99f6e4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />
      <path
        d="M14 39.5H9.5C8.94772 39.5 8.5 39.0523 8.5 38.5V34"
        stroke="#99f6e4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.85"
      />

      {/* Prescription 'Rx' Core Monogram */}
      <path
        d="M17.5 14V34"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M17.5 14H24C26.5 14 28.5 15.8 28.5 18.5C28.5 21.2 26.5 23 24 23H17.5"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 23L31 34"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Rx Cross Hatch */}
      <path
        d="M23 32.5L31 27.5"
        stroke="#5eead4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Optical Scan Line */}
      <line
        x1="7"
        y1="24"
        x2="41"
        y2="24"
        stroke="url(#p_scan_beam)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg" | number;
  showSubtitle?: boolean;
  subtitle?: string;
  to?: string;
  className?: string;
  style?: React.CSSProperties;
  theme?: "dark" | "light";
}

export function Logo({
  size = "md",
  showSubtitle = true,
  subtitle = "Clinical Intelligence",
  to,
  className = "",
  style = {},
  theme,
}: LogoProps) {
  let iconPx = 36;
  let titleFontSize = 16;
  let subtitleFontSize = 10;
  let ocrBadgeFontSize = 11;

  if (typeof size === "number") {
    iconPx = size;
    titleFontSize = Math.max(14, Math.round(size * 0.45));
    subtitleFontSize = Math.max(9, Math.round(size * 0.26));
    ocrBadgeFontSize = Math.max(10, Math.round(size * 0.3));
  } else if (size === "sm") {
    iconPx = 28;
    titleFontSize = 14;
    subtitleFontSize = 9;
    ocrBadgeFontSize = 10;
  } else if (size === "lg") {
    iconPx = 44;
    titleFontSize = 21;
    subtitleFontSize = 11;
    ocrBadgeFontSize = 12;
  }

  const titleColor = theme ? (theme === "light" ? "#0f172a" : "#f8fafc") : "var(--text-primary)";
  const subtitleColor = theme ? (theme === "light" ? "#64748b" : "#94a3b8") : "var(--text-muted)";

  const content = (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: iconPx > 36 ? 12 : 10,
        textDecoration: "none",
        ...style,
      }}
    >
      <LogoIcon size={iconPx} />

      <div style={{ lineHeight: 1.15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              fontSize: titleFontSize,
              fontWeight: 800,
              color: titleColor,
              letterSpacing: "-0.02em",
              transition: "color 0.2s ease",
            }}
          >
            Prescript
          </span>
          <span
            style={{
              fontSize: ocrBadgeFontSize,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "var(--accent-primary)",
              background: "var(--accent-subtle)",
              padding: "1px 5px",
              borderRadius: 4,
              border: "1px solid var(--accent-border)",
              fontFamily: "'JetBrains Mono', monospace",
              transition: "all 0.2s ease",
            }}
          >
            OCR
          </span>
        </div>

        {showSubtitle && (
          <span
            style={{
              display: "block",
              fontSize: subtitleFontSize,
              fontWeight: 600,
              color: subtitleColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginTop: 3,
              transition: "color 0.2s ease",
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
