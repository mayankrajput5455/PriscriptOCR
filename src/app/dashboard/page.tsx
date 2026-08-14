import { getDashboardStats } from "@/actions/prescriptions";
import { TagBadge } from "@/components/prescription/TagBadge";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import {
  Users,
  FileText,
  Upload,
  UserPlus,
  ArrowRight,
  Star,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | PriscriptOCR",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const { totalPatients, totalPrescriptions, recentPrescriptions } = stats;

  return (
    <div className="min-h-full">
      {/* Top header bar */}
      <div
        className="sticky top-0 z-10 px-8 py-4 flex items-center justify-between"
        style={{
          background: "rgba(15,23,42,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <div>
          <h1 className="text-xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Overview of your clinic's digital records</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/patients"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-50 transition-colors"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            <UserPlus className="w-4 h-4" />
            Add Patient
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
            }}
          >
            <Upload className="w-4 h-4" />
            Upload Prescription
          </Link>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-5">
          {/* Total Patients */}
          <div
            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0.05) 100%)",
              border: "1px solid rgba(37,99,235,0.25)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.2)" }}
              >
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-blue-400 opacity-40" />
            </div>
            <p className="text-3xl font-bold text-blue-300 leading-none mb-2">{totalPatients}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</p>
            <p className="text-xs text-slate-600 mt-1">Registered in the system</p>
          </div>

          {/* Total Prescriptions */}
          <div
            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(16,185,129,0.2)" }}
              >
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-400 opacity-40" />
            </div>
            <p className="text-3xl font-bold text-emerald-300 leading-none mb-2">{totalPrescriptions}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Prescriptions</p>
            <p className="text-xs text-slate-600 mt-1">Digitized records</p>
          </div>

          {/* Recent Uploads */}
          <div
            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.05) 100%)",
              border: "1px solid rgba(139,92,246,0.25)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.2)" }}
              >
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-violet-400 opacity-40" />
            </div>
            <p className="text-3xl font-bold text-violet-300 leading-none mb-2">{recentPrescriptions.length}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Uploads</p>
            <p className="text-xs text-slate-600 mt-1">Last 5 prescriptions</p>
          </div>
        </div>

        {/* Recent Prescriptions */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-100">Recent Uploads</h2>
              <p className="text-xs text-slate-600 mt-0.5">Latest digitized prescriptions</p>
            </div>
            <Link
              href="/search"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentPrescriptions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
              style={{ border: "1px dashed #1e293b", background: "rgba(15,23,42,0.4)" }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "#1e293b" }}
              >
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-300 font-semibold text-base">No prescriptions yet</p>
              <p className="text-slate-600 text-sm mt-2 max-w-xs">
                Upload your first prescription to start building your clinic's digital archive
              </p>
              <Link
                href="/upload"
                className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}
              >
                <Upload className="w-4 h-4" />
                Upload Now
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPrescriptions.map(({ prescription, patient }) => {
                const meds = (prescription.medicinesJson as { name: string; dosage: string; frequency: string }[]) ?? [];
                const tags = (prescription.tags as string[]) ?? [];

                return (
                  <Link
                    key={prescription.id}
                    href={`/prescriptions/${prescription.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group"
                    style={{ background: "#111827", border: "1px solid #1e293b" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#1e293b";
                      (e.currentTarget as HTMLElement).style.borderColor = "#334155";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#111827";
                      (e.currentTarget as HTMLElement).style.borderColor = "#1e293b";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
                    >
                      {patient ? getInitials(patient.name) : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {patient?.name ?? "Unknown Patient"}
                        </p>
                        {prescription.important && (
                          <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" style={{ fill: "#fbbf24" }} />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-slate-500">
                          {formatDate(prescription.createdAt)} · {formatTime(prescription.createdAt)}
                        </p>
                        {meds.length > 0 && (
                          <span className="text-xs text-slate-600">
                            {meds.length} medicine{meds.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      {tags.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {tags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag} tag={tag} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
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
