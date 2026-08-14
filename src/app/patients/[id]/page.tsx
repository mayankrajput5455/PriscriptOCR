import { getPatientById } from "@/actions/patients";
import { getPrescriptionsByPatient } from "@/actions/prescriptions";
import { PatientModal } from "@/components/forms/PatientModal";
import { TagBadge } from "@/components/prescription/TagBadge";
import { OCRConfidenceIndicator } from "@/components/prescription/OCRConfidenceIndicator";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Calendar,
  FileText,
  Star,
  Upload,
  Pencil,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { patient } = await getPatientById(id);
  return {
    title: patient ? `${patient.name} | PriscriptOCR` : "Patient | PriscriptOCR",
  };
}

export default async function PatientDetailPage({ params }: Props) {
  const { id } = await params;
  const [{ patient }, { prescriptions }] = await Promise.all([
    getPatientById(id),
    getPrescriptionsByPatient(id),
  ]);

  if (!patient) notFound();

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Back */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patients
      </Link>

      {/* Patient header */}
      <div className="flex items-start gap-5 p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg shadow-blue-500/20">
          {getInitials(patient.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-50">{patient.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-slate-400">
                  {patient.age} years old · {patient.gender}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  {patient.phone}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Calendar className="w-3.5 h-3.5" />
                  Since {formatDate(patient.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <PatientModal
                patient={patient}
                trigger={
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                }
              />
              <Link
                href={`/upload?patientId=${patient.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-600/20"
              >
                <Upload className="w-3.5 h-3.5" />
                New Prescription
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-200">
            Prescription History
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({prescriptions?.length ?? 0} records)
            </span>
          </h2>
        </div>

        {!prescriptions || prescriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-400 font-semibold">No prescriptions yet</p>
            <p className="text-slate-600 text-sm mt-1">
              Upload a prescription for {patient.name} to get started
            </p>
            <Link
              href={`/upload?patientId=${patient.id}`}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((rx) => {
              const meds = (rx.medicinesJson as { name: string; dosage: string; frequency: string }[]) ?? [];
              const tags = (rx.tags as string[]) ?? [];

              return (
                <Link
                  key={rx.id}
                  href={`/prescriptions/${rx.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-200 group"
                >
                  {/* Date column */}
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs font-bold text-blue-400">
                      {new Date(rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit" })}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(rx.createdAt).toLocaleDateString("en-IN", { month: "short" })}
                    </p>
                    <p className="text-xs text-slate-600">
                      {new Date(rx.createdAt).getFullYear()}
                    </p>
                  </div>

                  <div className="w-px h-10 bg-slate-800 shrink-0" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {rx.important && (
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                      <p className="text-sm text-slate-400 truncate">
                        {rx.aiSummary || "No summary available"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <OCRConfidenceIndicator confidence={rx.ocrConfidence} />
                      {meds.length > 0 && (
                        <span className="text-xs text-slate-500">
                          {meds.length} medicine{meds.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {tags.slice(0, 3).map((tag) => (
                        <TagBadge key={tag} tag={tag} size="sm" />
                      ))}
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
