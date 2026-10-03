import type { Medicine } from "../../types";
import { Pill, Clock } from "lucide-react";

interface MedicineBadgeProps {
  medicine: Medicine;
}

export function MedicineBadge({ medicine }: MedicineBadgeProps) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 8,
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderLeft: "4px solid #0f766e",
        boxShadow: "0 1px 3px rgba(15,23,42,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: "#f0fdfa", border: "1px solid #ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f766e" }}>
            <Pill size={14} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
            {medicine.name}
          </span>
        </div>
        {medicine.form && (
          <span
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 4,
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #e2e8f0",
            }}
          >
            {medicine.form}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 2 }}>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            color: "#0f766e",
            background: "#f0fdfa",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid #99f6e4",
          }}
        >
          {medicine.dosage}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#475569", fontWeight: 500 }}>
          <Clock size={13} color="#64748b" />
          <span>{medicine.frequency}</span>
        </div>
      </div>

      {medicine.instructions && (
        <p style={{ fontSize: 11.5, color: "#64748b", fontStyle: "italic", borderTop: "1px dashed #f1f5f9", paddingTop: 6, marginTop: 2 }}>
          Note: {medicine.instructions}
        </p>
      )}
    </div>
  );
}
