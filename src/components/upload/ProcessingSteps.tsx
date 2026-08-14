import { cn } from "@/lib/utils";
import { CheckCircle, Loader2, Circle } from "lucide-react";

interface Step {
  label: string;
  description: string;
}

interface ProcessingStepsProps {
  steps: Step[];
  currentStep: number; // 0-indexed, -1 = not started, steps.length = done
}

export function ProcessingSteps({ steps, currentStep }: ProcessingStepsProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const isPending = i > currentStep;

        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500",
              isDone && "bg-emerald-500/10 border-emerald-500/20",
              isActive && "bg-blue-500/10 border-blue-500/30",
              isPending && "bg-slate-800/50 border-slate-800"
            )}
          >
            {/* Icon */}
            <div className="shrink-0">
              {isDone && (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
              {isActive && (
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              )}
              {isPending && (
                <Circle className="w-5 h-5 text-slate-600" />
              )}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  isDone && "text-emerald-300",
                  isActive && "text-blue-300",
                  isPending && "text-slate-600"
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  "text-xs mt-0.5",
                  isDone && "text-emerald-500/70",
                  isActive && "text-blue-400/70",
                  isPending && "text-slate-700"
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
