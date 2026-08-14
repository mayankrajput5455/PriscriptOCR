import { getConfidenceLevel, type OCRConfidenceLevel } from "@/types";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface OCRConfidenceIndicatorProps {
  confidence: number;
  showDetails?: boolean;
}

const levelConfig: Record<
  OCRConfidenceLevel,
  { color: string; bg: string; border: string; icon: typeof CheckCircle; label: string }
> = {
  Excellent: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: CheckCircle,
    label: "Excellent OCR Quality",
  },
  Good: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: AlertCircle,
    label: "Good OCR Quality",
  },
  "Needs Review": {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: AlertTriangle,
    label: "Needs Manual Review",
  },
};

export function OCRConfidenceIndicator({
  confidence,
  showDetails = false,
}: OCRConfidenceIndicatorProps) {
  const level = getConfidenceLevel(confidence);
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold",
        config.bg,
        config.border,
        config.color
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{level}</span>
      {showDetails && (
        <span className="text-slate-500 font-normal ml-1">
          ({confidence}% confidence)
        </span>
      )}
    </div>
  );
}
