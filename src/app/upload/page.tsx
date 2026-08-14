"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getAllPatients } from "@/actions/patients";
import { uploadAndProcess, savePrescription } from "@/actions/prescriptions";
import { ImageDropzone } from "@/components/upload/ImageDropzone";
import { ProcessingSteps } from "@/components/upload/ProcessingSteps";
import { MedicineBadge } from "@/components/prescription/MedicineBadge";
import { OCRConfidenceIndicator } from "@/components/prescription/OCRConfidenceIndicator";
import { TagBadge } from "@/components/prescription/TagBadge";
import { getInitials } from "@/lib/utils";
import type { Patient } from "@/db/schema";
import type { GeminiResponse, Medicine } from "@/types";
import {
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";

const PROCESSING_STEPS = [
  { label: "Uploading Image", description: "Saving to secure cloud storage" },
  { label: "Preprocessing", description: "Optimising image quality for Vision AI" },
  { label: "Gemini Vision OCR", description: "AI reading and transcribing prescription text" },
  { label: "AI Analysis", description: "Extracting medicines, summary & tags" },
];

type Step = "select-patient" | "upload" | "processing" | "review" | "done";

function UploadPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId");

  const [step, setStep] = useState<Step>(
    preselectedPatientId ? "upload" : "select-patient"
  );
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState(-1);
  const [saving, setSaving] = useState(false);

  // Processing result
  const [rawOcr, setRawOcr] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [gemini, setGemini] = useState<GeminiResponse | null>(null);

  // Editable review fields
  const [correctedText, setCorrectedText] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [importantFindings, setImportantFindings] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [newTag, setNewTag] = useState("");

  // Load patients
  useEffect(() => {
    getAllPatients().then((r) => {
      if (r.success) {
        setPatients(r.patients ?? []);
        if (preselectedPatientId) {
          const p = r.patients?.find((p) => p.id === preselectedPatientId);
          if (p) setSelectedPatient(p);
        }
      }
    });
  }, [preselectedPatientId]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientQuery.toLowerCase()) ||
      p.phone.includes(patientQuery)
  );

  // ─── Process ───────────────────────────────────────────────────────────────

  const handleProcess = useCallback(async () => {
    if (!file || !selectedPatient) return;

    setStep("processing");
    setProcessingStep(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("patientId", selectedPatient.id);

      // Simulate step progression
      const stepTimer = (delay: number, step: number) =>
        new Promise<void>((resolve) => setTimeout(() => { setProcessingStep(step); resolve(); }, delay));

      await stepTimer(800, 1);
      const resultPromise = uploadAndProcess(formData);
      await stepTimer(1500, 2);
      await stepTimer(2000, 3);

      const result = await resultPromise;
      setProcessingStep(4); // Done

      if (!result.success || !result.gemini) {
        throw new Error(result.error ?? "Processing failed");
      }

      setRawOcr(result.rawOcr ?? "");
      setOcrConfidence(result.ocrConfidence ?? 0);
      setImageUrl(result.imageUrl ?? "");
      setGemini(result.gemini);
      setCorrectedText(result.gemini.corrected_text);
      setAiSummary(result.gemini.summary);
      setMedicines(result.gemini.medicines ?? []);
      setImportantFindings(result.gemini.important_findings ?? []);
      setTags(result.gemini.tags ?? []);

      setTimeout(() => setStep("review"), 600);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Processing failed. Please try again.");
      setStep("upload");
      setProcessingStep(-1);
    }
  }, [file, selectedPatient]);

  // ─── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedPatient) return;
    setSaving(true);

    const result = await savePrescription({
      patientId: selectedPatient.id,
      imageUrl,
      rawOcr,
      ocrConfidence,
      correctedText,
      aiSummary,
      medicines,
      importantFindings,
      tags,
      doctorNotes,
    });

    setSaving(false);

    if (result.success && result.prescription) {
      toast.success("Prescription saved successfully!");
      router.push(`/prescriptions/${result.prescription.id}`);
    } else {
      toast.error(result.error ?? "Failed to save");
    }
  };

  // ─── Medicine helpers ──────────────────────────────────────────────────────

  const updateMedicine = (i: number, field: keyof Medicine, value: string) => {
    setMedicines((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };
  const removeMedicine = (i: number) => setMedicines((prev) => prev.filter((_, idx) => idx !== i));
  const addMedicine = () => setMedicines((prev) => [...prev, { name: "", dosage: "", frequency: "" }]);

  const addTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t)) { setTags((prev) => [...prev, t]); setNewTag(""); }
  };
  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t));

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 px-8 py-4"
        style={{
          background: "rgba(15,23,42,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e293b",
        }}
      >
        <h1 className="text-xl font-bold text-slate-50">Upload Prescription</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload a prescription image and let AI digitize it for you
        </p>
      </div>

      <div className="p-8 max-w-3xl animate-fade-in">
      {/* Step indicator */}
      <div className="flex items-center mb-8" style={{ gap: 0 }}>
        {["Select Patient", "Upload Image", "AI Processing", "Review & Save"].map((label, i) => {
          const stepKeys: Step[] = ["select-patient", "upload", "processing", "review"];
          const isActive = stepKeys[i] === step || (step === "done" && i === 3);
          const isDone =
            (step === "upload" && i === 0) ||
            (step === "processing" && i <= 1) ||
            (step === "review" && i <= 2) ||
            (step === "done" && i <= 3);

          const circleStyle = isDone && !isActive
            ? { background: "#10b981", color: "#fff" }
            : isActive
            ? { background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "#fff", boxShadow: "0 0 0 3px rgba(37,99,235,0.2)" }
            : { background: "#1e293b", color: "#475569" };

          return (
            <div key={label} className="flex items-center" style={{ flex: i < 3 ? 1 : "none" }}>
              <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={circleStyle}
                >
                  {isDone && !isActive ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className="text-xs font-medium mt-1.5 hidden sm:block"
                  style={{ color: isActive ? "#60a5fa" : isDone ? "#34d399" : "#475569", whiteSpace: "nowrap" }}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div
                  className="flex-1 h-px mx-2"
                  style={{ background: isDone ? "#10b981" : "#1e293b", marginBottom: 22 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Select Patient ── */}
      {step === "select-patient" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={patientQuery}
              onChange={(e) => setPatientQuery(e.target.value)}
              placeholder="Search patient by name or phone..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No patients found. <a href="/patients" className="text-blue-400 hover:underline">Add one first.</a>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPatient(p); setStep("upload"); }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-500/30 text-left transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {getInitials(p.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.age} yrs · {p.gender} · {p.phone}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Upload ── */}
      {step === "upload" && (
        <div className="space-y-6">
          {selectedPatient && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(selectedPatient.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-300">{selectedPatient.name}</p>
                  <p className="text-xs text-slate-500">{selectedPatient.age} yrs · {selectedPatient.phone}</p>
                </div>
              </div>
              {!preselectedPatientId && (
                <button
                  onClick={() => { setSelectedPatient(null); setStep("select-patient"); }}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <ImageDropzone
            onFileSelect={setFile}
            selectedFile={file}
            onClear={() => setFile(null)}
          />

          <div className="flex gap-3">
            {!preselectedPatientId && (
              <button
                onClick={() => { setSelectedPatient(null); setStep("select-patient"); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleProcess}
              disabled={!file}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200"
            >
              Analyze Prescription
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Processing ── */}
      {step === "processing" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
            <h2 className="text-base font-bold text-slate-200 mb-2">
              Processing Prescription...
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              This may take up to 15 seconds. Please wait.
            </p>
            <ProcessingSteps
              steps={PROCESSING_STEPS}
              currentStep={processingStep}
            />
          </div>
        </div>
      )}

      {/* ── Step 4: Review ── */}
      {step === "review" && gemini && (
        <div className="space-y-6">
          {/* OCR confidence */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
                OCR Quality
              </p>
              <OCRConfidenceIndicator confidence={ocrConfidence} showDetails />
            </div>
          </div>

          {/* Raw OCR */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raw OCR Output
              </p>
              <span className="text-xs text-slate-600 ml-auto">Original — unmodified</span>
            </div>
            <div className="p-4">
              <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
                {rawOcr || "(No text extracted)"}
              </pre>
            </div>
          </div>

          {/* Corrected Text */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                AI-Corrected Text
              </p>
              <span className="text-xs text-slate-600 ml-auto">Edit if needed</span>
            </div>
            <div className="p-4">
              <textarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                rows={5}
                className="w-full bg-transparent text-sm text-slate-300 resize-none focus:outline-none placeholder-slate-600 leading-relaxed"
                placeholder="No corrected text..."
              />
            </div>
          </div>

          {/* AI Summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                AI Summary
              </p>
            </div>
            <div className="p-4">
              <textarea
                value={aiSummary}
                onChange={(e) => setAiSummary(e.target.value)}
                rows={2}
                className="w-full bg-transparent text-sm text-slate-300 resize-none focus:outline-none placeholder-slate-600 leading-relaxed"
                placeholder="No summary..."
              />
            </div>
          </div>

          {/* Medicines */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Medicines ({medicines.length})
                </p>
              </div>
              <button
                onClick={addMedicine}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="p-4 space-y-3">
              {medicines.length === 0 && (
                <p className="text-sm text-slate-600 text-center py-2">No medicines extracted.</p>
              )}
              {medicines.map((med, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-start">
                  <input
                    value={med.name}
                    onChange={(e) => updateMedicine(i, "name", e.target.value)}
                    placeholder="Medicine name"
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <input
                    value={med.dosage}
                    onChange={(e) => updateMedicine(i, "dosage", e.target.value)}
                    placeholder="Dosage"
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <div className="flex gap-2">
                    <input
                      value={med.frequency}
                      onChange={(e) => updateMedicine(i, "frequency", e.target.value)}
                      placeholder="Frequency"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={() => removeMedicine(i)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Findings */}
          {importantFindings.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                Important Findings
              </p>
              <ul className="space-y-1">
                {importantFindings.map((f, i) => (
                  <li key={i} className="text-sm text-amber-300/80 flex gap-2">
                    <span className="text-amber-500 shrink-0">·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</p>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-1">
                    <TagBadge tag={tag} size="sm" />
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Doctor Notes */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Doctor Notes
              </p>
              <span className="text-xs text-slate-600 ml-auto">Optional</span>
            </div>
            <div className="p-4">
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Follow-up after 5 days. Increase fluids."
                className="w-full bg-transparent text-sm text-slate-300 resize-none focus:outline-none placeholder-slate-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Save button */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep("upload")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Re-upload
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all duration-200 text-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
      <UploadPageInner />
    </Suspense>
  );
}
