const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fever: { bg: "rgba(239,68,68,0.1)", text: "#fca5a5", border: "rgba(239,68,68,0.2)" },
  Antibiotic: { bg: "rgba(59,130,246,0.1)", text: "#93c5fd", border: "rgba(59,130,246,0.2)" },
  Paediatric: { bg: "rgba(139,92,246,0.1)", text: "#c4b5fd", border: "rgba(139,92,246,0.2)" },
  Pediatric: { bg: "rgba(139,92,246,0.1)", text: "#c4b5fd", border: "rgba(139,92,246,0.2)" },
  Diabetes: { bg: "rgba(245,158,11,0.1)", text: "#fcd34d", border: "rgba(245,158,11,0.2)" },
  Hypertension: { bg: "rgba(239,68,68,0.1)", text: "#fca5a5", border: "rgba(239,68,68,0.2)" },
  Cardiac: { bg: "rgba(239,68,68,0.15)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
  Respiratory: { bg: "rgba(16,185,129,0.1)", text: "#6ee7b7", border: "rgba(16,185,129,0.2)" },
  Neurological: { bg: "rgba(99,102,241,0.1)", text: "#a5b4fc", border: "rgba(99,102,241,0.2)" },
};

const DEFAULT_COLOR = { bg: "rgba(100,116,139,0.15)", text: "#94a3b8", border: "rgba(100,116,139,0.25)" };

interface TagBadgeProps {
  tag: string;
  size?: "sm" | "md";
}

export function TagBadge({ tag, size = "md" }: TagBadgeProps) {
  const c = TAG_COLORS[tag] || DEFAULT_COLOR;
  const px = size === "sm" ? 6 : 8;
  const py = size === "sm" ? 2 : 3;
  const fs = size === "sm" ? 10 : 11;

  return (
    <span
      style={{
        display: "inline-block",
        padding: `${py}px ${px}px`,
        borderRadius: 6,
        fontSize: fs,
        fontWeight: 600,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
      }}
    >
      {tag}
    </span>
  );
}
