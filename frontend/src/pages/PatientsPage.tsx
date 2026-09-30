import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Search, Pencil, Trash2, Phone, Calendar, Users, ChevronRight, X } from "lucide-react";
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
      const res = query.length >= 2
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
      toast.success("Patient deleted");
      setDeleteConfirm(null);
      fetchPatients();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1e293b" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>Patients</h1>
          <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Manage and view patient records</p>
        </div>
        <PatientModal
          onSuccess={fetchPatients}
          trigger={
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "white", background: "linear-gradient(135deg, #2563eb, #4f46e5)", border: "none", boxShadow: "0 4px 14px rgba(37,99,235,0.35)", cursor: "pointer" }}>
              <UserPlus size={16} /> Add Patient
            </button>
          }
        />
      </div>

      <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Search */}
        <div style={{ position: "relative", maxWidth: 400 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            style={{ width: "100%", padding: "10px 40px 10px 42px", borderRadius: 12, background: "#111827", border: "1px solid #1e293b", color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
              <X size={16} />
            </button>
          )}
        </div>

        {!loading && <p style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{patients.length} patient{patients.length !== 1 ? "s" : ""}{query ? ` matching "${query}"` : " in the system"}</p>}

        {/* Patient list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />)}
          </div>
        ) : patients.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", borderRadius: 20, border: "1px dashed #1e293b", background: "rgba(15,23,42,0.4)", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", marginBottom: 20 }}>
              <Users size={32} color="#475569" />
            </div>
            <p style={{ color: "#cbd5e1", fontWeight: 600, fontSize: 16 }}>{query ? "No patients found" : "No patients yet"}</p>
            <p style={{ color: "#475569", fontSize: 13, marginTop: 8 }}>{query ? `No results for "${query}"` : "Add your first patient to get started"}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {patients.map((patient) => (
              <div key={patient.id} className="patient-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 12, background: "#0f172a", border: "1px solid #1e293b", transition: "all 0.2s", position: "relative" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#1e293b"; (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"; const btns = (e.currentTarget as HTMLDivElement).querySelector(".patient-actions") as HTMLDivElement; if (btns) btns.style.opacity = "1"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#0f172a"; (e.currentTarget as HTMLDivElement).style.borderColor = "#1e293b"; const btns = (e.currentTarget as HTMLDivElement).querySelector(".patient-actions") as HTMLDivElement; if (btns) btns.style.opacity = "0"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 14, fontWeight: 700, flexShrink: 0, background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                  {getInitials(patient.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patient.name}</p>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", flexShrink: 0 }}>{patient.gender}</span>
                    <span style={{ fontSize: 12, color: "#64748b", flexShrink: 0 }}>{patient.age} yrs</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}><Phone size={12} />{patient.phone}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#475569" }}><Calendar size={12} />Added {formatDate(patient.createdAt)}</span>
                  </div>
                </div>
                <div className="patient-actions" style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0, transition: "opacity 0.2s" }}>
                  <PatientModal
                    patient={patient} onSuccess={fetchPatients}
                    trigger={
                      <button style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", border: "none", color: "#64748b", cursor: "pointer", transition: "color 0.2s" }}>
                        <Pencil size={14} />
                      </button>
                    }
                  />
                  <button onClick={() => setDeleteConfirm(patient.id)} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", border: "none", color: "#64748b", cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                  <Link to={`/patients/${patient.id}`} style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", color: "#64748b" }}>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={() => setDeleteConfirm(null)} />
          <div className="animate-fade-in" style={{ position: "relative", width: "100%", maxWidth: 380, borderRadius: 20, padding: 24, background: "#0f172a", border: "1px solid #1e293b", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16 }}>
              <Trash2 size={20} color="#f87171" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>Delete Patient?</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>This will permanently delete the patient and all their prescriptions. This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "1px solid #1e293b", background: "#111827", color: "#94a3b8", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", background: "#dc2626", color: "white", fontSize: 14, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
