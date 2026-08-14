"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPrescriptionById } from "@/actions/prescriptions";
import { toggleImportant, deletePrescription, updatePrescription } from "@/actions/prescriptions";
import { MedicineBadge } from "@/components/prescription/MedicineBadge";
import { OCRConfidenceIndicator } from "@/components/prescription/OCRConfidenceIndicator";
import { TagBadge } from "@/components/prescription/TagBadge";
import { formatDate, formatTime, getInitials } from "@/lib/utils";
import type { Medicine } from "@/types";
import {
  ArrowLeft,
  Star,
  Trash2,
  Download,
  Save,
  Pencil,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Prescription, Patient } from "@/db/schema";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PrescriptionDetailPage({ params }: Props) {
  const router = useRouter();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawOcr, setShowRawOcr] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [togglingImportant, setTogglingImportant] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      getPrescriptionById(id).then((result) => {
        if (result.prescription) {
          setPrescription(result.prescription);
          setDoctorNotes(result.prescription.doctorNotes);
        }
        if (result.patient) setPatient(result.patient as Patient);
        setLoading(false);
      });
    });
  }, [params]);

  const handleToggleImportant = async () => {
    if (!prescription) return;
    setTogglingImportant(true);
    const result = await toggleImportant(prescription.id);
    if (result.success) {
      setPrescription((p) => p ? { ...p, important: result.important! } : p);
      toast.success(result.important ? "Marked as important" : "Removed from important");
    } else {
      toast.error(result.error);
    }
    setTogglingImportant(false);
  };

  const handleSaveNotes = async () => {
    if (!prescription) return;
    setSavingNotes(true);
    const result = await updatePrescription(prescription.id, { doctorNotes });
    setSavingNotes(false);
    if (result.success) {
      toast.success("Notes saved");
      setEditingNotes(false);
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!prescription || !patient) return;
    setDeleting(true);
    const result = await deletePrescription(prescription.id, patient.id);
    if (result.success) {
      toast.success("Prescription deleted");
      router.push(`/patients/${patient.id}`);
    } else {
      toast.error(result.error);
      setDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!prescription || !patient) return;
    const jsPDFModule = await import("jspdf");
    const jsPDF = jsPDFModule.default ?? (jsPDFModule as unknown as { jsPDF: typeof jsPDFModule.default }).jsPDF;
    const doc = new jsPDF();
    const meds = (prescription.medicinesJson as Medicine[]) ?? [];
    const tags = (prescription.tags as string[]) ?? [];

    // Header
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text("PriscriptOCR", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("AI Prescription Intelligence", 20, 28);

    // Patient info
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Patient: ${patient.name}`, 20, 45);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Age: ${patient.age} | Gender: ${patient.gender} | Phone: ${patient.phone}`, 20, 53);
    doc.text(`Date: ${formatDate(prescription.createdAt)} at ${formatTime(prescription.createdAt)}`, 20, 60);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 65, 190, 65);

    // Summary
    let y = 73;
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("AI Summary", 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(prescription.aiSummary || "N/A", 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 5 + 8;

    // Medicines
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Medicines", 20, y);
    y += 7;
    if (meds.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("No medicines recorded.", 20, y);
      y += 8;
    } else {
      meds.forEach((med) => {
        doc.setFontSize(10);
        doc.setTextColor(37, 99, 235);
        doc.text(`• ${med.name}`, 22, y);
        doc.setTextColor(100, 116, 139);
        doc.text(`  ${med.dosage} — ${med.frequency}`, 22, y + 5);
        y += 12;
      });
    }

    // Corrected text
    y += 4;
    doc.line(20, y, 190, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Corrected Prescription Text", 20, y);
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const textLines = doc.splitTextToSize(prescription.correctedText || "N/A", 170);
    doc.text(textLines, 20, y);
    y += textLines.length * 5 + 8;

    // Doctor notes
    if (prescription.doctorNotes) {
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text("Doctor Notes", 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(prescription.doctorNotes, 20, y);
      y += 10;
    }

    // Tags
    if (tags.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Tags: ${tags.join(", ")}`, 20, y);
    }

    doc.save(`prescription-${patient.name}-${formatDate(prescription.createdAt)}.pdf`);
    toast.success("PDF downloaded!");
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="skeleton h-8 w-40 rounded" />
        <div className="skeleton h-32 w-full rounded-xl" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!prescription || !patient) {
    return (
      <div className="p-8 text-center py-20">
        <p className="text-slate-400">Prescription not found.</p>
        <Link href="/patients" className="text-blue-400 hover:underline text-sm mt-2 block">
          Back to Patients
        </Link>
      </div>
    );
  }

  const meds = (prescription.medicinesJson as Medicine[]) ?? [];
  const tags = (prescription.tags as string[]) ?? [];
  const importantFindings = (prescription.importantFindings as string[]) ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Back */}
      <Link
        href={`/patients/${patient.id}`}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {patient.name}
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/60">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
          {getInitials(patient.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-slate-50">{patient.name}</h1>
            {prescription.important && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-semibold">
                <Star className="w-3 h-3 fill-amber-400" /> Important
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {formatDate(prescription.createdAt)} at {formatTime(prescription.createdAt)} · {patient.age} yrs · {patient.phone}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <OCRConfidenceIndicator confidence={prescription.ocrConfidence} showDetails />
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleToggleImportant}
            disabled={togglingImportant}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
              prescription.important
                ? "bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                : "border-slate-700 text-slate-500 hover:text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10"
            }`}
            title={prescription.important ? "Remove from important" : "Mark as important"}
          >
            <Star className={`w-4 h-4 ${prescription.important ? "fill-amber-400" : ""}`} />
          </button>
          <button
            onClick={handleDownloadPDF}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-700 text-slate-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
            title="Delete prescription"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Image */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Original Prescription Image
          </p>
        </div>
        <div className="bg-slate-900">
          <Image
            src={prescription.imageUrl}
            alt="Prescription"
            width={800}
            height={500}
            className="w-full object-contain max-h-[400px]"
          />
        </div>
      </div>

      {/* Raw OCR (collapsible) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <button
          onClick={() => setShowRawOcr(!showRawOcr)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Raw OCR Output
            </p>
          </div>
          {showRawOcr ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {showRawOcr && (
          <div className="px-4 pb-4 border-t border-slate-800">
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed mt-3 max-h-40 overflow-y-auto">
              {prescription.rawOcr || "(No raw text)"}
            </pre>
          </div>
        )}
      </div>

      {/* AI Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Summary</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {prescription.aiSummary || "No summary available."}
          </p>
        </div>
      </div>

      {/* Corrected Text */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Corrected Prescription Text
          </p>
        </div>
        <div className="p-4">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {prescription.correctedText || "No corrected text."}
          </p>
        </div>
      </div>

      {/* Medicines */}
      {meds.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Medicines ({meds.length})
            </p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {meds.map((med, i) => (
              <MedicineBadge key={i} medicine={med} />
            ))}
          </div>
        </div>
      )}

      {/* Important Findings */}
      {importantFindings.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Important Findings
            </p>
          </div>
          <ul className="space-y-1.5">
            {importantFindings.map((f, i) => (
              <li key={i} className="text-sm text-amber-300/80 flex gap-2">
                <span className="text-amber-500 shrink-0">·</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Doctor Notes */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doctor Notes</p>
          </div>
          {!editingNotes && (
            <button
              onClick={() => setEditingNotes(true)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Pencil className="w-3 h-3" /> Edit
            </button>
          )}
        </div>
        <div className="p-4">
          {editingNotes ? (
            <div className="space-y-3">
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 resize-none focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Add notes..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingNotes(false); setDoctorNotes(prescription.doctorNotes); }}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold transition-colors disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  {savingNotes ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {prescription.doctorNotes || (
                <span className="text-slate-600 italic">No notes yet. Click edit to add.</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-bold text-slate-50 mb-1">Delete Prescription?</h3>
            <p className="text-sm text-slate-400 mb-6">
              This will permanently delete this prescription record. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
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
