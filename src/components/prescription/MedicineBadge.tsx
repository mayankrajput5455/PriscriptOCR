import { cn } from "@/lib/utils";
import { Pill, AlertCircle } from "lucide-react";
import type { Medicine } from "@/types";

interface MedicineBadgeProps {
  medicine: Medicine;
  size?: "sm" | "md";
}

export function MedicineBadge({ medicine, size = "md" }: MedicineBadgeProps) {
  const isPossible = medicine.name.toLowerCase().startsWith("possibly");

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border transition-all",
        isPossible
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-blue-500/10 border-blue-500/20",
        size === "sm" ? "px-2.5 py-1.5" : "px-3 py-2.5"
      )}
    >
      <div className={cn("shrink-0 mt-0.5", isPossible ? "text-amber-400" : "text-blue-400")}>
        {isPossible ? (
          <AlertCircle className={cn(size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
        ) : (
          <Pill className={cn(size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4")} />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold truncate",
            isPossible ? "text-amber-300" : "text-blue-300",
            size === "sm" ? "text-xs" : "text-sm"
          )}
        >
          {medicine.name}
        </p>
        {(medicine.dosage || medicine.frequency) && (
          <p className={cn("text-slate-400", size === "sm" ? "text-xs" : "text-xs mt-0.5")}>
            {[medicine.dosage, medicine.frequency].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
}
