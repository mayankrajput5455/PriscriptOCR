import type { Medicine } from "../../types";

interface MedicineBadgeProps {
  medicine: Medicine;
}

export function MedicineBadge({ medicine }: MedicineBadgeProps) {
  return (
    <div
      style={{
        padding: "10px 14px", borderRadius: 12,
        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)",
      }}
    >
      <p style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7", marginBottom: 4 }}>
        {medicine.name}
      </p>
      <p style={{ fontSize: 11, color: "#94a3b8" }}>
        {medicine.dosage} · {medicine.frequency}
      </p>
    </div>
  );
}
