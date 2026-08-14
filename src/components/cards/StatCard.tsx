import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  trend?: string;
  color?: "blue" | "emerald" | "violet" | "amber";
  loading?: boolean;
}

const colorMap = {
  blue:    { bg: "bg-blue-500/10",    border: "border-blue-500/20",    icon: "text-blue-400",    value: "text-blue-300" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", value: "text-emerald-300" },
  violet:  { bg: "bg-violet-500/10",  border: "border-violet-500/20",  icon: "text-violet-400",  value: "text-violet-300" },
  amber:   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: "text-amber-400",   value: "text-amber-300" },
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = "blue",
  loading = false,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl",
        colors.bg,
        colors.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            {label}
          </p>
          {loading ? (
            <div className="skeleton h-8 w-24 rounded mb-1" />
          ) : (
            <p className={cn("text-3xl font-bold", colors.value)}>{value}</p>
          )}
          {trend && (
            <p className="text-xs text-slate-500 mt-1">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            colors.bg,
            colors.icon
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
