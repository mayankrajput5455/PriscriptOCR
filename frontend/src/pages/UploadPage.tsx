import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ImageDropzone } from "../components/upload/ImageDropzone";
import { ProcessingSteps } from "../components/upload/ProcessingSteps";
import { MedicineBadge } from "../components/prescription/MedicineBadge";
import { TagBadge } from "../components/prescription/TagBadge";
import { OCRConfidenceIndicator } from "../components/prescription/OCRConfidenceIndicator";
import { Users, CheckCircle2, ArrowRight, ShieldCheck, RotateCcw, FileText, Check, Cpu } from "lucide-react";
import type { Patient, Medicine, GeminiResponse } from "../types";
import api from "../lib/api";

type Stage = "select" | "processing" | "review" | "saving" | "done";

const PROCESSING_STEPS = [
  { label: "Document Ingestion", description: "Securely transferring specimen to clinical storage" },
  { label: "Optical Image Enhancement", description: "Calibrating contrast and binarizing prescription contours" },
  { label: "Google Gemini Clinical OCR", description: "Deciphering handwriting and doctor notations" },
  { label: "Formulary Extraction", description: "Cross-referencing medications, dosages, and diagnostic tags" },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId") || "";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("select");
  const [processingStep, setProcessingStep] = useState(0);

  // Processing results
  const [imageUrl, setImageUrl] = useState("");
  const [rawOcr, setRawOcr] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [geminiResult, setGeminiResult] = useState<GeminiResponse | null>(null);

  // Editable review fields
  const [doctorNotes, setDoctorNotes] = useState("");
  const [savedPrescriptionId, setSavedPrescriptionId] = useState("");

  useEffect(() => {
    api.get("/patients").then((res) => setPatients(res.data.patients ?? []));
  }, []);

  const handleProcess = async () => {
    if (!selectedFile || !selectedPatientId) {
      toast.error("Please select a patient chart and a prescription specimen.");
      return;
    }

    setStage("processing");
    setProcessingStep(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("patientId", selectedPatientId);

    const stepInterval = setInterval(() => {
      setProcessingStep((p) => Math.min(p + 1, PROCESSING_STEPS.length - 1));
    }, 2000);

    try {
      const res = await api.post("/prescriptions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(stepInterval);
      setProcessingStep(PROCESSING_STEPS.length);

      if (res.data.success) {
        setImageUrl(res.data.imageUrl);
        setRawOcr(res.data.rawOcr || "");
        setOcrConfidence(res.data.ocrConfidence || 0);
        setGeminiResult(res.data.gemini);
        setTimeout(() => setStage("review"), 500);
      } else {
        throw new Error(res.data.error || "OCR digitization failed");
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      toast.error(err?.response?.data?.error || err?.message || "Transcription failed");
      setStage("select");
    }
  };

  const handleSave = async () => {
    if (!geminiResult) return;
    setStage("saving");

    try {
      const res = await api.post("/prescriptions", {
        patientId: selectedPatientId,
        imageUrl,
        rawOcr,
        ocrConfidence,
        correctedText: geminiResult.corrected_text,
        aiSummary: geminiResult.summary,
        medicines: geminiResult.medicines,
        importantFindings: geminiResult.important_findings,
        tags: geminiResult.tags,
        doctorNotes,
      });

      setSavedPrescriptionId(res.data.prescription.id);
      setStage("done");
      toast.success("Prescription filed to patient chart");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to commit record");
      setStage("review");
    }
  };

  const handleReset = () => {
    setStage("select");
    setSelectedFile(null);
    setProcessingStep(0);
    setGeminiResult(null);
    setImageUrl("");
    setRawOcr("");
    setOcrConfidence(0);
    setDoctorNotes("");
    setSavedPrescriptionId("");
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 6,
    background: "var(--input-bg)",
    border: "1px solid var(--border-input)",
    color: "var(--text-primary)",
    fontSize: 13.5,
    outline: "none",
    fontFamily: "inherit",
  };

  // ── Done ──────────────────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <div
        style={{
          padding: "60px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100%",
          background: "var(--bg-canvas)",
          textAlign: "center",
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(22, 163, 74, 0.14)",
            border: "1.5px solid rgba(34, 197, 94, 0.35)",
            color: "#22c55e",
            marginBottom: 20,
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
          Prescription Record Committed
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 28, maxWidth: 420 }}>
          The prescription has been audited, transcribed, and indexed into {selectedPatient?.name}'s medical chart.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleReset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface)",
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} /> Ingest Another
          </button>
          <button
            onClick={() => navigate(`/prescriptions/${savedPrescriptionId}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 6,
              background: "var(--accent-primary)",
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
            }}
          >
            Open Clinical Dossier <ArrowRight size={15} />
          </button>
        </div>
      </div>
    );
  }

  // ── Processing ─────────────────────────────────────────────────────────────────
  if (stage === "processing") {
    return (
      <div style={{ padding: "36px 40px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 640, margin: "0 auto", minHeight: "100%", background: "var(--bg-canvas)" }} className="animate-fade-in">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Processing Prescription Specimen
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Optical OCR and clinical entity extraction in progress
          </p>
        </div>

        <div className="clinical-card" style={{ padding: 24 }}>
          <ProcessingSteps steps={PROCESSING_STEPS} currentStep={processingStep} />
        </div>

        <div style={{ padding: "16px 20px", borderRadius: 8, border: "1px solid var(--accent-border)", background: "var(--accent-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={18} color="var(--accent-primary)" />
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace" }}>
              Clinical Intelligence Pipeline
            </p>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.6 }}>
            Deciphering handwritten abbreviations, cross-verifying active drug formulations, and standardizing medical instructions.
          </p>
        </div>
      </div>
    );
  }

  // ── Review ─────────────────────────────────────────────────────────────────────
  if (stage === "review" && geminiResult) {
    const meds = geminiResult.medicines ?? [];
    const tags = geminiResult.tags ?? [];
    const findings = geminiResult.important_findings ?? [];
    return (
      <div style={{ padding: "28px 36px 60px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1120, margin: "0 auto", minHeight: "100%", background: "var(--bg-canvas)" }} className="animate-fade-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Pre-Commit Clinical Audit
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              Verify extracted formulary items before filing to {selectedPatient?.name}'s medical chart
            </p>
          </div>
          <OCRConfidenceIndicator confidence={ocrConfidence} showDetails />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
          {/* Left Column: Specimen & Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="clinical-card" style={{ overflow: "hidden" }}>
              <div className="clinical-dossier-header">
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Ingested Specimen
                </span>
              </div>
              <div style={{ padding: 12, background: "var(--bg-surface-subtle)" }}>
                <img
                  src={imageUrl}
                  alt="Prescription"
                  style={{ width: "100%", objectFit: "contain", maxHeight: 320, display: "block" }}
                />
              </div>
            </div>

            <div className="clinical-card" style={{ overflow: "hidden" }}>
              <div className="clinical-dossier-header">
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Clinical Synthesis
                </span>
              </div>
              <div style={{ padding: 18 }}>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {geminiResult.summary || "No summary generated."}
                </p>
              </div>
            </div>

            {findings.length > 0 && (
              <div style={{ padding: 16, borderRadius: 8, border: "1px solid rgba(245,158,11,0.3)", background: "rgba(245,158,11,0.12)" }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                  ⚠ Critical Observations
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 4, listStyle: "none" }}>
                  {findings.map((f, i) => (
                    <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 8 }}>
                      <span style={{ color: "#f59e0b" }}>›</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Medicines & Doctor Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {meds.length > 0 && (
              <div className="clinical-card" style={{ overflow: "hidden" }}>
                <div className="clinical-dossier-header" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Detected Medicines ({meds.length})
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-primary)", fontWeight: 700 }}>
                    FORMULARY EXTRACTED
                  </span>
                </div>
                <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  {meds.map((med, i) => (
                    <MedicineBadge key={i} medicine={med} />
                  ))}
                </div>
              </div>
            )}

            <div className="clinical-card" style={{ overflow: "hidden" }}>
              <div className="clinical-dossier-header">
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Standardized Transcription
                </span>
              </div>
              <div style={{ padding: 16, maxHeight: 160, overflowY: "auto", background: "var(--bg-surface-subtle)" }}>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "'JetBrains Mono', monospace" }}>
                  {geminiResult.corrected_text || "No transcription generated."}
                </p>
              </div>
            </div>

            <div className="clinical-card" style={{ padding: 18 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Physician Chart Notes (Optional)
              </label>
              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                rows={3}
                placeholder="Append clinical impressions or follow-up directions..."
                style={{
                  width: "100%",
                  background: "var(--input-bg)",
                  border: "1px solid var(--border-input)",
                  borderRadius: 6,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "var(--text-primary)",
                  resize: "vertical",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  padding: "11px 16px",
                  borderRadius: 6,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Discard & Retry
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 2,
                  padding: "11px 16px",
                  borderRadius: 6,
                  background: "var(--accent-primary)",
                  border: "none",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
                }}
              >
                Commit & File to Patient Chart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Select Stage ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100%", background: "var(--bg-canvas)" }}>
      {/* Header */}
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
            Prescription Ingestion & OCR Station
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
            Photograph or upload handwritten doctor prescriptions for clinical transcription
          </p>
        </div>
      </div>

      <div style={{ padding: "32px 36px 60px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "start" }}>
        {/* Left Form: Select Patient and Upload File */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="clinical-card" style={{ padding: 24 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Target Patient Chart *
            </label>
            <div style={{ position: "relative" }}>
              <Users size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
                style={{ ...inputStyle, paddingLeft: 38, cursor: "pointer" }}
              >
                <option value="">— Select registered patient chart —</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.age} yrs · {p.phone}
                  </option>
                ))}
              </select>
            </div>
            {patients.length === 0 && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
                No patient records found. <a href="/patients" style={{ color: "var(--accent-primary)", fontWeight: 600 }}>Create a patient chart first →</a>
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Prescription Document Specimen *
            </label>
            <ImageDropzone selectedFile={selectedFile} onFileSelect={setSelectedFile} onClear={() => setSelectedFile(null)} />
          </div>
        </div>

        {/* Right Callout: Analysis trigger */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="clinical-card" style={{ padding: 24, borderTop: "4px solid var(--accent-primary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent-subtle)", border: "1px solid var(--accent-border)", color: "var(--accent-primary)" }}>
                <Cpu size={18} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Google Gemini OCR Engine</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Clinical intelligence pipeline</p>
              </div>
            </div>

            <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none" }}>
              {[
                "Parses complex handwriting and cursive clinical terminology",
                "Extracts structured medicine entities (Dosage, Form, Frequency)",
                "Generates standardized physician summaries and diagnostic tags",
                "Flags urgent medical interactions and important clinical findings",
              ].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <CheckCircle2 size={16} color="var(--accent-primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleProcess}
            disabled={!selectedFile || !selectedPatientId || stage === "saving"}
            style={{
              width: "100%",
              padding: "13px 20px",
              borderRadius: 6,
              background: !selectedFile || !selectedPatientId ? "var(--bg-muted)" : "var(--accent-primary)",
              border: "none",
              color: !selectedFile || !selectedPatientId ? "var(--text-muted)" : "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: !selectedFile || !selectedPatientId ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: !selectedFile || !selectedPatientId ? "none" : "0 2px 8px rgba(15,118,110,0.3)",
              transition: "all 0.15s ease",
            }}
          >
            <ShieldCheck size={16} /> Ingest & Transcribe Document
          </button>
        </div>
      </div>
    </div>
  );
}
