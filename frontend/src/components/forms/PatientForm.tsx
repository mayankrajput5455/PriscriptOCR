import { useState } from "react";
import { toast } from "sonner";
import api from "../../lib/api";
import type { Patient } from "../../types";

interface PatientFormProps {
  patient?: Patient;
  onClose: () => void;
  onSuccess?: () => void;
}

const genders = ["Male", "Female", "Other"];

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  background: "var(--input-bg)",
  border: "1px solid var(--border-input)",
  color: "var(--text-primary)",
  fontSize: 13.5,
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--text-secondary)",
  marginBottom: 6,
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
};

export function PatientForm({ patient, onClose, onSuccess }: PatientFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      age: Number((form.elements.namedItem("age") as HTMLInputElement).value),
      gender: (form.elements.namedItem("gender") as HTMLSelectElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
    };

    try {
      if (patient) {
        await api.put(`/patients/${patient.id}`, data);
        toast.success("Patient chart updated");
      } else {
        await api.post("/patients", data);
        toast.success("New patient registered");
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to save record";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>Patient Full Legal Name *</label>
        <input
          name="name"
          defaultValue={patient?.name}
          placeholder="e.g. Priya Sharma"
          required
          style={inputStyle}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Age *</label>
          <input
            name="age"
            type="number"
            min={0}
            max={150}
            defaultValue={patient?.age}
            placeholder="e.g. 35"
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Gender / Biological Sex *</label>
          <select
            name="gender"
            defaultValue={patient?.gender ?? ""}
            required
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="" disabled>
              Select gender...
            </option>
            {genders.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Contact Telephone / Mobile *</label>
        <input
          name="phone"
          type="tel"
          defaultValue={patient?.phone}
          placeholder="e.g. +91 98765 43210"
          required
          style={inputStyle}
        />
      </div>

      <div style={{ display: "flex", gap: 10, paddingTop: 10, borderTop: "1px solid var(--border-subtle)" }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: "9px 16px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "var(--bg-surface-subtle)",
            color: "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            flex: 1,
            padding: "9px 16px",
            borderRadius: 6,
            background: "var(--accent-primary)",
            border: "none",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
          }}
        >
          {loading ? "Registering..." : patient ? "Save Patient Record" : "Register Patient"}
        </button>
      </div>
    </form>
  );
}
