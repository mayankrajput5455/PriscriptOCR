import { getConfidenceLevel } from "../../types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface OCRConfidenceIndicatorProps {
  confidence: number;
  showDetails?: boolean;
}

export function OCRConfidenceIndicator({ confidence, showDetails }: OCRConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence);

  const config =
    level === "Excellent"
      ? {
          bg: "#f0fdf4",
          border: "#86efac",
          text: "#15803d",
          icon: CheckCircle2,
          label: "HIGH CONFIDENCE",
        }
      : level === "Good"
      ? {
          bg: "#fffbeb",
          border: "#fde68a",
          text: "#b45309",
          icon: AlertTriangle,
          label: "AUDITED",
        }
      : {
          bg: "#fef2f2",
          border: "#fecaca",
          text: "#b91c1c",
          icon: XCircle,
          label: "MANUAL VERIFY",
        };

  const Icon = config.icon;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 8px",
        borderRadius: 4,
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <Icon size={12} color={config.text} strokeWidth={2.5} />
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: config.text,
          letterSpacing: "0.02em",
        }}
      >
        {confidence}% {showDetails ? `[${config.label}]` : ""}
      </span>
    </div>
  );
}
