import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, FileText, Upload, UserPlus, ArrowRight, Star, Clock, TrendingUp } from "lucide-react";
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
    api.get("/prescriptions/dashboard").then((res) => {
      if (res.data.success) setData(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const { totalPatients, totalPrescriptions, recentPrescriptions } = data;

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e293b" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Overview of your clinic's digital records</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/patients" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#cbd5e1", background: "#1e293b", border: "1px solid #334155" }}>
            <UserPlus size={16} /> Add Patient
          </Link>
          <Link to="/upload" style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "white", background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 4px 14px rgba(37,99,235,0.35)" }}>
            <Upload size={16} /> Upload Prescription
          </Link>
        </div>
      </div>

      <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {/* Total Patients */}
          <div style={{ borderRadius: 20, padding: 20, background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(37,99,235,0.05))", border: "1px solid rgba(37,99,235,0.25)", transition: "transform 0.2s" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(37,99,235,0.2)" }}>
                <Users size={20} color="#60a5fa" />
              </div>
              <TrendingUp size={16} color="#60a5fa" style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 30, fontWeight: 700, color: "#93c5fd", lineHeight: 1, marginBottom: 8 }}>{loading ? "—" : totalPatients}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Patients</p>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Registered in the system</p>
          </div>

          {/* Total Prescriptions */}
          <div style={{ borderRadius: 20, padding: 20, background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))", border: "1px solid rgba(16,185,129,0.25)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,0.2)" }}>
                <FileText size={20} color="#34d399" />
              </div>
              <TrendingUp size={16} color="#34d399" style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 30, fontWeight: 700, color: "#6ee7b7", lineHeight: 1, marginBottom: 8 }}>{loading ? "—" : totalPrescriptions}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Prescriptions</p>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Digitized records</p>
          </div>

          {/* Recent Uploads */}
          <div style={{ borderRadius: 20, padding: 20, background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))", border: "1px solid rgba(139,92,246,0.25)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(139,92,246,0.2)" }}>
                <Clock size={20} color="#c4b5fd" />
              </div>
              <TrendingUp size={16} color="#c4b5fd" style={{ opacity: 0.4 }} />
            </div>
            <p style={{ fontSize: 30, fontWeight: 700, color: "#ddd6fe", lineHeight: 1, marginBottom: 8 }}>{loading ? "—" : recentPrescriptions.length}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Uploads</p>
            <p style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Last 5 prescriptions</p>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Recent Uploads</h2>
              <p style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Latest digitized prescriptions</p>
            </div>
            <Link to="/search" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#60a5fa", fontWeight: 500 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
            </div>
          ) : recentPrescriptions.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", borderRadius: 20, border: "1px dashed #1e293b", background: "rgba(15,23,42,0.4)", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", marginBottom: 20 }}>
                <FileText size={32} color="#475569" />
              </div>
              <p style={{ color: "#cbd5e1", fontWeight: 600, fontSize: 16 }}>No prescriptions yet</p>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 8, maxWidth: 300 }}>Upload your first prescription to start building your clinic's digital archive</p>
              <Link to="/upload" style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 600, background: "linear-gradient(135deg, #2563eb, #4f46e5)", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
                <Upload size={16} /> Upload Now
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentPrescriptions.map(({ prescription, patient }) => {
                const meds = (prescription.medicinesJson as any[] ?? []);
                const tags = (prescription.tags as string[] ?? []);
                return (
                  <Link
                    key={prescription.id}
                    to={`/prescriptions/${prescription.id}`}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 12, background: "#0f172a", border: "1px solid #1e293b", transition: "all 0.2s", textDecoration: "none" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#1e293b"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#334155"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#0f172a"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e293b"; }}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0, background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                      {patient ? getInitials(patient.name) : "?"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patient?.name ?? "Unknown Patient"}</p>
                        {prescription.important && <Star size={14} color="#fbbf24" fill="#fbbf24" style={{ flexShrink: 0 }} />}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                        <p style={{ fontSize: 12, color: "#64748b" }}>{formatDate(prescription.createdAt)} · {formatTime(prescription.createdAt)}</p>
                        {meds.length > 0 && <span style={{ fontSize: 12, color: "#475569" }}>{meds.length} medicine{meds.length !== 1 ? "s" : ""}</span>}
                      </div>
                      {tags.length > 0 && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          {tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} size="sm" />)}
                        </div>
                      )}
                    </div>
                    <ArrowRight size={16} color="#475569" />
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
