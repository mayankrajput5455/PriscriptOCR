import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PatientForm } from "./PatientForm";
import type { Patient } from "../../types";
import { X, UserPlus, FileEdit } from "lucide-react";

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const modal = open && (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
        }}
        onClick={() => setOpen(false)}
      />
      <div
        className="animate-fade-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          borderRadius: 10,
          background: "var(--bg-surface)",
          border: "1px solid var(--border-color)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-surface-subtle)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: "var(--accent-subtle)",
                border: "1px solid var(--accent-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary)",
              }}
            >
              {patient ? <FileEdit size={16} /> : <UserPlus size={16} />}
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                {patient ? "Edit Patient Record" : "Register New Patient Chart"}
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {patient ? "Update clinical registration details" : "Add patient to the clinical archive"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <X size={15} />
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
      <div onClick={() => setOpen(true)} style={{ cursor: "pointer", display: "inline-block" }}>
        {trigger}
      </div>
      {mounted && createPortal(modal, document.body)}
    </>
  );
}
