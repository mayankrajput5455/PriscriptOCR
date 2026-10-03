import { CheckCircle2 } from "lucide-react";

interface Step {
  label: string;
  description: string;
}

interface ProcessingStepsProps {
  steps: Step[];
  currentStep: number;
}

export function ProcessingSteps({ steps, currentStep }: ProcessingStepsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div
            key={step.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 6,
              transition: "all 0.2s ease",
              background: isActive ? "var(--accent-subtle)" : isDone ? "var(--bg-surface-subtle)" : "var(--bg-surface)",
              border: `1px solid ${isActive ? "var(--accent-primary)" : "var(--border-subtle)"}`,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: isDone ? "var(--accent-primary)" : isActive ? "var(--accent-subtle)" : "var(--bg-muted)",
                border: isActive ? "2px solid var(--accent-primary)" : isDone ? "none" : "1px solid var(--border-color)",
              }}
            >
              {isDone ? (
                <CheckCircle2 size={16} color="white" />
              ) : isActive ? (
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: "2px solid var(--accent-primary)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{i + 1}</span>
              )}
            </div>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isDone ? "var(--accent-primary)" : isActive ? "var(--accent-primary)" : "var(--text-primary)",
                }}
              >
                {step.label}
              </p>
              <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
