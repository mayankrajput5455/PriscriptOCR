import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Calendar, FileText, Star, Upload, Pencil, ArrowRight, User } from "lucide-react";
import { PatientModal } from "../components/forms/PatientModal";
import { TagBadge } from "../components/prescription/TagBadge";
import { OCRConfidenceIndicator } from "../components/prescription/OCRConfidenceIndicator";
import { getInitials, formatDate } from "../lib/utils";
import type { Patient, Prescription } from "../types";
import api from "../lib/api";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [pRes, rxRes] = await Promise.all([
        api.get(`/patients/${id}`),
        api.get(`/prescriptions/patient/${id}`),
      ]);
      setPatient(pRes.data.patient ?? null);
      setPrescriptions(rxRes.data.prescriptions ?? []);
    } catch {
      setPatient(null);
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="skeleton" style={{ height: 32, width: 160, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 260, borderRadius: 10 }} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", maxWidth: 440, margin: "0 auto" }}>
        <p style={{ color: "#0f172a", fontSize: 16, fontWeight: 700 }}>Patient chart not found.</p>
        <Link
          to="/patients"
          style={{
            color: "#0f766e",
            fontSize: 13,
            fontWeight: 600,
            marginTop: 10,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowLeft size={14} /> Return to Patient Registry
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 36px 60px", maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24, minHeight: "100%", background: "var(--bg-canvas)" }} className="animate-fade-in">
      <Link
        to="/patients"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "var(--text-muted)",
          fontSize: 13,
          fontWeight: 500,
          padding: "6px 10px",
          borderRadius: 6,
          transition: "background 0.15s ease",
          width: "fit-content",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <ArrowLeft size={15} /> Back to Patient Registry
      </Link>

      {/* Patient Dossier Header */}
      <div
        className="clinical-card"
        style={{
          borderLeft: "5px solid var(--accent-primary)",
          padding: "24px 28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 18,
              fontWeight: 800,
              flexShrink: 0,
              background: "var(--accent-primary)",
              boxShadow: "0 2px 8px rgba(15,118,110,0.25)",
            }}
          >
            {getInitials(patient.name)}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {patient.name}
              </h1>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--badge-text)", background: "var(--badge-bg)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--badge-border)" }}>
                ID: {patient.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8, flexWrap: "wrap", fontSize: 13, color: "var(--text-muted)" }}>
              <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                {patient.age} yrs · {patient.gender}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Phone size={13} color="var(--text-muted)" /> {patient.phone}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar size={13} color="var(--text-muted)" /> Registered {formatDate(patient.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <PatientModal
            patient={patient}
            onSuccess={fetchData}
            trigger={
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 6,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Pencil size={13} /> Edit Chart
              </button>
            }
          />

          <Link
            to={`/upload?patientId=${patient.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 6,
              background: "var(--accent-primary)",
              color: "white",
              fontSize: 12.5,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
            }}
          >
            <Upload size={14} /> Scan New Prescription
          </Link>
        </div>
      </div>

      {/* Prescription Dossier Ledger */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Prescription Clinical History
          </h2>
          <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--badge-text)", background: "var(--badge-bg)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--badge-border)", fontWeight: 600 }}>
            {prescriptions.length} RECORDS ARCHIVED
          </span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="clinical-card" style={{ padding: "64px 20px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-muted)" }}>
              <FileText size={22} />
            </div>
            <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}>No prescription history recorded</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              Digitize the first prescription document for {patient.name}.
            </p>
            <Link
              to={`/upload?patientId=${patient.id}`}
              style={{
                marginTop: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 6,
                background: "var(--accent-primary)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <Upload size={14} /> Ingest Prescription
            </Link>
          </div>
        ) : (
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            {prescriptions.map((rx) => {
              const meds = (rx.medicinesJson as any[]) ?? [];
              const tags = (rx.tags as string[]) ?? [];
              return (
                <Link
                  key={rx.id}
                  to={`/prescriptions/${rx.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "18px 22px",
                    borderBottom: "1px solid var(--border-subtle)",
                    background: "var(--bg-surface)",
                    textDecoration: "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                >
                  {/* Date badge */}
                  <div style={{ width: 56, flexShrink: 0, textAlign: "center", background: "var(--bg-surface-subtle)", padding: "8px 4px", borderRadius: 6, border: "1px solid var(--border-color)" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "var(--accent-primary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                      {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit" })}
                    </p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginTop: 2 }}>
                      {new Date(rx.createdAt).toLocaleDateString("en-IN", { month: "short" })}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      {new Date(rx.createdAt).getFullYear()}
                    </p>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {rx.important && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.14)", padding: "1px 6px", borderRadius: 4, border: "1px solid rgba(245,158,11,0.3)" }}>
                          <Star size={10} fill="#f59e0b" /> PRIORITY
                        </span>
                      )}
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {rx.aiSummary || "Clinical prescription record"}
                      </p>
                    </div>

                    {rx.doctorNotes && (
                      <p style={{ fontSize: 12, color: "var(--accent-primary)", marginTop: 4, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        Chart Note: {rx.doctorNotes}
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                      <OCRConfidenceIndicator confidence={rx.ocrConfidence} />
                      {meds.length > 0 && (
                        <span style={{ fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-secondary)", fontWeight: 600 }}>
                          {meds.length} item{meds.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {tags.slice(0, 3).map((tag) => (
                        <TagBadge key={tag} tag={tag} size="sm" />
                      ))}
                    </div>
                  </div>

                  <ArrowRight size={16} color="var(--text-muted)" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
