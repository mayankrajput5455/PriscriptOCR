"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllPatients, searchPatients, deletePatient } from "@/actions/patients";
import { PatientModal } from "@/components/forms/PatientModal";
import { getInitials, formatDate } from "@/lib/utils";
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Calendar,
  Users,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import type { Patient } from "@/db/schema";
import { toast } from "sonner";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    const result = query.length >= 2
      ? await searchPatients(query)
      : await getAllPatients();
    if (result.success) {
      setPatients(result.patients ?? []);
    } else {
      setDbError(result.error ?? "Failed to connect to database");
      setPatients([]);
    }
    setLoading(false);
  }, [query]);

  useEffect(() => {
    const timeout = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timeout);
  }, [fetchPatients]);

  async function handleDelete(id: string) {
    setDeleting(true);
    const result = await deletePatient(id);
    if (result.success) {
      toast.success("Patient deleted");
      setDeleteConfirm(null);
      fetchPatients();
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
        style={{
          background: "rgba(15,23,42,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-50">Patients</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage and view patient records</p>
        </div>
        <PatientModal
          onSuccess={fetchPatients}
          trigger={
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              }}
            >
              <UserPlus className="w-4 h-4" />
              Add Patient
            </button>
          }
        />
      </div>

      {/* DB Error Banner */}
      {dbError && (
        <div
          className="mx-8 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#f87171",
          }}
        >
          <span className="shrink-0 text-base">⚠️</span>
          <div className="flex-1">
            <span className="font-semibold">Database error: </span>
            {dbError}
          </div>
          <button
            onClick={fetchPatients}
            className="shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5" }}
          >
            Retry
          </button>
        </div>
      )}

      <div className="p-8 space-y-5">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-slate-50 placeholder-slate-600 text-sm transition-colors"
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
              outline: "none",
            }}
            onFocus={(e) => { e.target.style.borderColor = "#3b82f6"; }}
            onBlur={(e) => { e.target.style.borderColor = "#1e293b"; }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Summary row */}
        {!loading && (
          <p className="text-xs text-slate-600 font-medium">
            {patients.length} patient{patients.length !== 1 ? "s" : ""}{query ? ` matching "${query}"` : " in the system"}
          </p>
        )}

        {/* Patient list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-[72px] w-full rounded-xl" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
            style={{ border: "1px dashed #1e293b", background: "rgba(15,23,42,0.4)" }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "#1e293b" }}>
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-300 font-semibold text-base">
              {query ? "No patients found" : "No patients yet"}
            </p>
            <p className="text-slate-600 text-sm mt-2">
              {query ? `No results for "${query}"` : "Add your first patient to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group"
                style={{ background: "#111827", border: "1px solid #1e293b" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1a2235";
                  (e.currentTarget as HTMLElement).style.borderColor = "#334155";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#111827";
                  (e.currentTarget as HTMLElement).style.borderColor = "#1e293b";
                }}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                >
                  {getInitials(patient.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-100 truncate">{patient.name}</p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}
                    >
                      {patient.gender}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0">{patient.age} yrs</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3 h-3" />
                      {patient.phone}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Calendar className="w-3 h-3" />
                      Added {formatDate(patient.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions (always visible on md+, hover on smaller) */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <PatientModal
                    patient={patient}
                    onSuccess={fetchPatients}
                    trigger={
                      <button
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors"
                        style={{ background: "#1e293b" }}
                        title="Edit patient"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    }
                  />
                  <button
                    onClick={() => setDeleteConfirm(patient.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
                    style={{ background: "#1e293b" }}
                    title="Delete patient"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/patients/${patient.id}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
                    style={{ background: "#1e293b" }}
                    title="View patient"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            onClick={() => setDeleteConfirm(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-fade-in"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-slate-50 mb-1">Delete Patient?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              This will permanently delete the patient and all their prescriptions. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-slate-400 text-sm font-medium hover:text-slate-200 transition-colors"
                style={{ border: "1px solid #1e293b", background: "#111827" }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50"
                style={{ background: "#dc2626" }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
