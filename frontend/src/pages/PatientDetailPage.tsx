import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Calendar, FileText, Star, Upload, Pencil, ArrowRight } from "lucide-react";
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

  useEffect(() => { fetchData(); }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="skeleton" style={{ height: 32, width: 160, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 128, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 192, borderRadius: 16 }} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: 32, textAlign: "center", paddingTop: 80 }}>
        <p style={{ color: "#94a3b8" }}>Patient not found.</p>
        <Link to="/patients" style={{ color: "#60a5fa", fontSize: 14, marginTop: 8, display: "block" }}>← Back to Patients</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
      <Link to="/patients" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 14, transition: "color 0.2s" }}>
        <ArrowLeft size={16} /> Back to Patients
      </Link>

      {/* Patient header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: 24, borderRadius: 20, border: "1px solid #1e293b", background: "rgba(15,23,42,0.6)" }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: 700, flexShrink: 0, background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 8px 25px rgba(59,130,246,0.25)" }}>
          {getInitials(patient.name)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>{patient.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
                <span style={{ fontSize: 14, color: "#94a3b8" }}>{patient.age} years · {patient.gender}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#64748b" }}><Phone size={14} />{patient.phone}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#475569" }}><Calendar size={14} />Since {formatDate(patient.createdAt)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <PatientModal
                patient={patient} onSuccess={fetchData}
                trigger={
                  <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, border: "1px solid #1e293b", background: "transparent", color: "#94a3b8", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    <Pencil size={14} /> Edit
                  </button>
                }
              />
              <Link to={`/upload?patientId=${patient.id}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#2563eb", color: "white", fontSize: 12, fontWeight: 600, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                <Upload size={14} /> New Prescription
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
          Prescription History <span style={{ fontSize: 14, fontWeight: 400, color: "#475569" }}>({prescriptions.length} records)</span>
        </h2>

        {prescriptions.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", borderRadius: 20, border: "1px dashed #1e293b", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", marginBottom: 16 }}>
              <FileText size={28} color="#475569" />
            </div>
            <p style={{ color: "#94a3b8", fontWeight: 600 }}>No prescriptions yet</p>
            <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Upload a prescription for {patient.name} to get started</p>
            <Link to={`/upload?patientId=${patient.id}`} style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: "#2563eb", color: "white", fontSize: 13, fontWeight: 500 }}>
              <Upload size={16} /> Upload Now
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {prescriptions.map((rx) => {
              const meds = (rx.medicinesJson as any[] ?? []);
              const tags = (rx.tags as string[] ?? []);
              return (
                <Link
                  key={rx.id} to={`/prescriptions/${rx.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 12, border: "1px solid #1e293b", background: "rgba(15,23,42,0.5)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(30,41,59,0.6)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#334155"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(15,23,42,0.5)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e293b"; }}
                >
                  <div style={{ width: 56, flexShrink: 0, textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#60a5fa" }}>{new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit" })}</p>
                    <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{new Date(rx.createdAt).toLocaleDateString("en-IN", { month: "short" })}</p>
                    <p style={{ fontSize: 11, color: "#475569" }}>{new Date(rx.createdAt).getFullYear()}</p>
                  </div>
                  <div style={{ width: 1, height: 40, background: "#1e293b", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {rx.important && <Star size={14} color="#fbbf24" fill="#fbbf24" />}
                      <p style={{ fontSize: 13, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rx.aiSummary || "No summary available"}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                      <OCRConfidenceIndicator confidence={rx.ocrConfidence} />
                      {meds.length > 0 && <span style={{ fontSize: 12, color: "#475569" }}>{meds.length} medicine{meds.length !== 1 ? "s" : ""}</span>}
                      {tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} size="sm" />)}
                    </div>
                  </div>
                  <ArrowRight size={16} color="#475569" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
