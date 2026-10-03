const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fever: { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", border: "rgba(239, 68, 68, 0.25)" },
  Antibiotic: { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6", border: "rgba(59, 130, 246, 0.25)" },
  Paediatric: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", border: "rgba(168, 85, 247, 0.25)" },
  Pediatric: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", border: "rgba(168, 85, 247, 0.25)" },
  Diabetes: { bg: "rgba(245, 158, 11, 0.12)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.25)" },
  Hypertension: { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", border: "rgba(239, 68, 68, 0.25)" },
  Cardiac: { bg: "rgba(244, 63, 94, 0.12)", text: "#f43f5e", border: "rgba(244, 63, 94, 0.25)" },
  Respiratory: { bg: "rgba(16, 185, 129, 0.12)", text: "#10b981", border: "rgba(16, 185, 129, 0.25)" },
  Neurological: { bg: "rgba(99, 102, 241, 0.12)", text: "#818cf8", border: "rgba(99, 102, 241, 0.25)" },
};

const DEFAULT_COLOR = { bg: "var(--bg-surface-subtle)", text: "var(--text-secondary)", border: "var(--border-color)" };

interface TagBadgeProps {
  tag: string;
  size?: "sm" | "md";
}

export function TagBadge({ tag, size = "md" }: TagBadgeProps) {
  const c = TAG_COLORS[tag] || DEFAULT_COLOR;
  const px = size === "sm" ? 7 : 10;
  const py = size === "sm" ? 2 : 4;
  const fs = size === "sm" ? 11 : 12;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${py}px ${px}px`,
        borderRadius: 4,
        fontSize: fs,
        fontWeight: 600,
        fontFamily: "'JetBrains Mono', monospace",
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        letterSpacing: "0.02em",
      }}
    >
      #{tag}
    </span>
  );
}
