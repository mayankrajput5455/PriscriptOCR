import { getConfidenceLevel } from "../../types";

interface OCRConfidenceIndicatorProps {
  confidence: number;
  showDetails?: boolean;
}

export function OCRConfidenceIndicator({ confidence, showDetails }: OCRConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence);
  const color =
    level === "Excellent" ? "#34d399" : level === "Good" ? "#fbbf24" : "#f87171";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }}
      />
      <span style={{ fontSize: 11, color, fontWeight: 600 }}>
        {confidence}% {showDetails ? `· ${level}` : ""}
      </span>
    </div>
  );
}
