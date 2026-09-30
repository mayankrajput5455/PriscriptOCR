import { CheckCircle } from "lucide-react";

interface Step { label: string; description: string; }

interface ProcessingStepsProps {
  steps: Step[];
  currentStep: number;
}

export function ProcessingSteps({ steps, currentStep }: ProcessingStepsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div
            key={step.label}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              borderRadius: 12, transition: "all 0.3s",
              background: isActive ? "rgba(59,130,246,0.08)" : isDone ? "rgba(16,185,129,0.05)" : "transparent",
              border: `1px solid ${isActive ? "rgba(59,130,246,0.2)" : isDone ? "rgba(16,185,129,0.15)" : "#1e293b"}`,
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                background: isDone ? "#10b981" : isActive ? "linear-gradient(135deg, #2563eb, #4f46e5)" : "#1e293b",
              }}
            >
              {isDone ? (
                <CheckCircle size={16} color="white" />
              ) : isActive ? (
                <div
                  style={{
                    width: 14, height: 14, border: "2px solid white",
                    borderTopColor: "transparent", borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              ) : (
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{i + 1}</span>
              )}
            </div>
            <div>
              <p
                style={{
                  fontSize: 13, fontWeight: 600,
                  color: isDone ? "#34d399" : isActive ? "#93c5fd" : "#64748b",
                }}
              >
                {step.label}
              </p>
              <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
