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
  width: "100%", padding: "10px 12px", borderRadius: 8,
  background: "#1e293b", border: "1px solid #334155",
  color: "#f8fafc", fontSize: 14, outline: "none",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600,
  color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em",
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
        toast.success("Patient updated!");
      } else {
        await api.post("/patients", data);
        toast.success("Patient added successfully!");
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={labelStyle}>Full Name *</label>
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
            name="age" type="number" min={0} max={150}
            defaultValue={patient?.age}
            placeholder="e.g. 35"
            required style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Gender *</label>
          <select name="gender" defaultValue={patient?.gender ?? ""} required style={{ ...inputStyle, cursor: "pointer" }}>
            <option value="" disabled>Select...</option>
            {genders.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Phone Number *</label>
        <input
          name="phone" type="tel"
          defaultValue={patient?.phone}
          placeholder="e.g. 9876543210"
          required style={inputStyle}
        />
      </div>

      <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
        <button
          type="button" onClick={onClose}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 8,
            border: "1px solid #334155", background: "transparent",
            color: "#94a3b8", fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          type="submit" disabled={loading}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: 8,
            background: "#2563eb", border: "none",
            color: "white", fontSize: 14, fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}
        >
          {loading ? "Saving..." : patient ? "Save Changes" : "Add Patient"}
        </button>
      </div>
    </form>
  );
}
