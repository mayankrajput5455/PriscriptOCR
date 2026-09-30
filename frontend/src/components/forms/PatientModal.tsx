import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PatientForm } from "./PatientForm";
import type { Patient } from "../../types";
import { X } from "lucide-react";

interface PatientModalProps {
  patient?: Patient;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function PatientModal({ patient, trigger, onSuccess }: PatientModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const modal = open && (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        onClick={() => setOpen(false)}
      />
      <div
        className="animate-fade-in"
        style={{
          position: "relative", width: "100%", maxWidth: 460, borderRadius: 20,
          background: "#0f172a", border: "1px solid #1e293b",
          maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #1e293b" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
              {patient ? "Edit Patient" : "Add New Patient"}
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {patient ? "Update patient information" : "Register a new patient to the system"}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          <PatientForm patient={patient} onClose={() => setOpen(false)} onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: "pointer" }}>{trigger}</div>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
