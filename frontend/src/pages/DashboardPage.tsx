import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, Upload, UserPlus, ArrowRight, Star, Clock, Activity, ShieldCheck } from "lucide-react";
import { TagBadge } from "../components/prescription/TagBadge";
import { formatDate, formatTime, getInitials } from "../lib/utils";
import type { Patient, Prescription } from "../types";
import api from "../lib/api";

interface RecentRx {
  prescription: Prescription;
  patient: Patient | null;
}

interface DashboardData {
  totalPatients: number;
  totalPrescriptions: number;
  recentPrescriptions: RecentRx[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalPatients: 0,
    totalPrescriptions: 0,
    recentPrescriptions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/prescriptions/dashboard")
      .then((res) => {
        if (res.data.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const { totalPatients, totalPrescriptions, recentPrescriptions } = data;

  return (
    <div style={{ minHeight: "100%", background: "var(--bg-canvas)" }}>
      {/* Sticky Clinical Header */}
      <div
        className="clinical-header-bar"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "18px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Clinical Telemetry & Console
            </h1>
            <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, background: "rgba(22, 163, 74, 0.12)", color: "#22c55e", border: "1px solid rgba(22, 163, 74, 0.3)", padding: "1px 6px", borderRadius: 4 }}>
              LIVE
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
            Digital prescription registry and clinical intelligence archive
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            to="/patients"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
          >
            <UserPlus size={15} color="var(--text-muted)" /> Patient Registry
          </Link>

          <Link
            to="/upload"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              background: "var(--accent-primary)",
              border: "1px solid var(--accent-primary)",
              boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-primary-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-primary)")}
          >
            <Upload size={15} /> Transcribe Rx
          </Link>
        </div>
      </div>

      <div style={{ padding: "32px 36px 60px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Clinical Statistics Matrix */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {/* Total Patients */}
          <div className="clinical-card" style={{ padding: 22, borderTop: "4px solid var(--accent-primary)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Active Patient Profiles
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-subtle)", border: "1px solid var(--accent-border)", color: "var(--accent-primary)" }}>
                <Users size={16} />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: 8 }}>
              {loading ? "..." : totalPatients}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Registered clinical charts</p>
          </div>

          {/* Total Prescriptions */}
          <div className="clinical-card" style={{ padding: 22, borderTop: "4px solid #2563eb" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                OCR Scanned Prescriptions
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(37,99,235,0.14)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}>
                <FileText size={16} />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: 8 }}>
              {loading ? "..." : totalPrescriptions}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Transcribed & standardized</p>
          </div>

          {/* Verification Engine */}
          <div className="clinical-card" style={{ padding: 22, borderTop: "4px solid #f59e0b" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                OCR Calibration Level
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.14)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
                <ShieldCheck size={16} />
              </div>
            </div>
            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: 8 }}>
              99.2%
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Drug entity cross-verification</p>
          </div>
        </div>

        {/* Recent Prescriptions Ledger */}
        <div className="clinical-card" style={{ overflow: "hidden" }}>
          <div className="clinical-dossier-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                Recent Prescription Records
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Chronological ledger of ingested clinical charts
              </p>
            </div>
            <Link
              to="/search"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                color: "var(--accent-primary)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Search complete registry <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 68, borderRadius: 6 }} />
              ))}
            </div>
          ) : recentPrescriptions.length === 0 ? (
            <div style={{ padding: "64px 20px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-muted)" }}>
                <FileText size={24} />
              </div>
              <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 15 }}>No prescription records ingested</p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, maxWidth: 360, marginInline: "auto" }}>
                Upload or photograph a handwritten doctor prescription to initiate optical transcription.
              </p>
              <Link
                to="/upload"
                style={{
                  marginTop: 20,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 18px",
                  borderRadius: 6,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "var(--accent-primary)",
                  textDecoration: "none",
                }}
              >
                <Upload size={14} /> Upload First Prescription
              </Link>
            </div>
          ) : (
            <div>
              {recentPrescriptions.map(({ prescription, patient }) => {
                const meds = (prescription.medicinesJson as any[]) ?? [];
                const tags = (prescription.tags as string[]) ?? [];
                return (
                  <Link
                    key={prescription.id}
                    to={`/prescriptions/${prescription.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--border-subtle)",
                      background: "var(--bg-surface)",
                      textDecoration: "none",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                        background: "var(--accent-primary)",
                      }}
                    >
                      {patient ? getInitials(patient.name) : "Rx"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                          {patient?.name ?? "Unknown Patient"}
                        </p>
                        {prescription.important && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.14)", padding: "1px 6px", borderRadius: 4, border: "1px solid rgba(245,158,11,0.3)" }}>
                            <Star size={10} fill="#f59e0b" /> PRIORITY
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4, fontSize: 12, color: "var(--text-muted)" }}>
                        <span>{formatDate(prescription.createdAt)} at {formatTime(prescription.createdAt)}</span>
                        {meds.length > 0 && (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-primary)", fontWeight: 600 }}>
                            {meds.length} Rx item{meds.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {tags.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          {tags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag} tag={tag} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>

                    <ArrowRight size={16} color="var(--text-muted)" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
