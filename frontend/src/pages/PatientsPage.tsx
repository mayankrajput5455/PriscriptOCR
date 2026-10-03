import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Search, Pencil, Trash2, Phone, Calendar, Users, ChevronRight, X, User } from "lucide-react";
import { toast } from "sonner";
import { PatientModal } from "../components/forms/PatientModal";
import { getInitials, formatDate } from "../lib/utils";
import type { Patient } from "../types";
import api from "../lib/api";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res =
        query.length >= 2
          ? await api.get(`/patients/search?q=${encodeURIComponent(query)}`)
          : await api.get("/patients");
      setPatients(res.data.patients ?? []);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(fetchPatients, 300);
    return () => clearTimeout(t);
  }, [fetchPatients]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/patients/${id}`);
      toast.success("Patient record archived");
      setDeleteConfirm(null);
      fetchPatients();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to remove patient");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: "100%", background: "var(--bg-canvas)" }}>
      {/* Sticky Header */}
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
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Patient Registry & Charts
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
            Central clinical directory of indexed patients and histories
          </p>
        </div>

        <PatientModal
          onSuccess={fetchPatients}
          trigger={
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "white",
                background: "var(--accent-primary)",
                border: "none",
                boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-primary-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent-primary)")}
            >
              <UserPlus size={15} /> Add Patient Chart
            </button>
          }
        />
      </div>

      <div style={{ padding: "32px 36px 60px", maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Search Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by legal name or phone number..."
              style={{
                width: "100%",
                padding: "10px 38px 10px 38px",
                borderRadius: 6,
                background: "var(--input-bg)",
                border: "1px solid var(--border-input)",
                color: "var(--text-primary)",
                fontSize: 13.5,
                outline: "none",
                fontFamily: "inherit",
                boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {!loading && (
            <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "var(--badge-text)", background: "var(--badge-bg)", padding: "4px 10px", borderRadius: 4, border: "1px solid var(--badge-border)", fontWeight: 600 }}>
              INDEXED: {patients.length} RECORDS {query ? `[FILTERED]` : ""}
            </span>
          )}
        </div>

        {/* Patient Ledger */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 68, borderRadius: 8 }} />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="clinical-card" style={{ padding: "64px 20px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--text-muted)" }}>
              <Users size={24} />
            </div>
            <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 16 }}>
              {query ? "No clinical records matching search query" : "No patient charts registered"}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              {query ? `Try searching by another name or phone number` : "Begin by creating a new patient chart"}
            </p>
          </div>
        ) : (
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 20px", background: "var(--bg-surface-subtle)", borderBottom: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1.5fr 100px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              <span>Patient Legal Name</span>
              <span>Demographics</span>
              <span>Contact / Registration</span>
              <span style={{ textAlign: "right" }}>Actions</span>
            </div>

            {patients.map((patient) => (
              <div
                key={patient.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1.5fr 1.5fr 100px",
                  alignItems: "center",
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "var(--bg-surface)",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
              >
                {/* Name & Initials */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 6,
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
                    {getInitials(patient.name)}
                  </div>
                  <div>
                    <Link
                      to={`/patients/${patient.id}`}
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    >
                      {patient.name}
                    </Link>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                      ID: {patient.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Demographics */}
                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  <span style={{ fontWeight: 600 }}>{patient.age} yrs</span> · {patient.gender}
                </div>

                {/* Contact */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-primary)", fontWeight: 500 }}>
                    <Phone size={12} color="var(--text-muted)" /> {patient.phone}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                    Joined {formatDate(patient.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <PatientModal
                    patient={patient}
                    onSuccess={fetchPatients}
                    trigger={
                      <button
                        title="Edit chart"
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-color)",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                    }
                  />

                  <button
                    onClick={() => setDeleteConfirm(patient.id)}
                    title="Archive chart"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-color)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#dc2626";
                      e.currentTarget.style.borderColor = "#fecaca";
                      e.currentTarget.style.background = "rgba(220, 38, 38, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.borderColor = "var(--border-color)";
                      e.currentTarget.style.background = "var(--bg-surface)";
                    }}
                  >
                    <Trash2 size={13} />
                  </button>

                  <Link
                    to={`/patients/${patient.id}`}
                    title="Open Chart"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--accent-subtle)",
                      border: "1px solid var(--accent-border)",
                      color: "var(--accent-primary)",
                      textDecoration: "none",
                    }}
                  >
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className="animate-fade-in"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 380,
              borderRadius: 10,
              padding: 24,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.3)", marginBottom: 16 }}>
              <Trash2 size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              Archive Patient Chart?
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.6 }}>
              This will permanently delete this patient record and all related prescriptions from the registry.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "9px 14px",
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
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  borderRadius: 6,
                  border: "none",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting ? "Archiving..." : "Archive Record"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
