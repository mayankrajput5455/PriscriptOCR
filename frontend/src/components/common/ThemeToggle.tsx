import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ThemeToggle({
  size = "md",
  showLabel = false,
  className = "",
  style = {},
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const btnSize = size === "sm" ? 30 : 34;
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to Light Clinical Theme" : "Switch to Dark Dossier Theme"}
      aria-label="Toggle theme"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: btnSize,
        padding: showLabel ? "0 12px" : `0 ${size === "sm" ? "8px" : "10px"}`,
        borderRadius: 6,
        border: "1px solid var(--border-color)",
        background: "var(--bg-surface)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12,
        fontWeight: 600,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-primary)";
        e.currentTarget.style.color = "var(--text-primary)";
        e.currentTarget.style.background = "var(--accent-subtle)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.background = "var(--bg-surface)";
      }}
    >
      {isDark ? (
        <Sun size={iconSize} color="#f59e0b" style={{ flexShrink: 0 }} />
      ) : (
        <Moon size={iconSize} color="#0f766e" style={{ flexShrink: 0 }} />
      )}
      {showLabel && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );
}

export default ThemeToggle;
