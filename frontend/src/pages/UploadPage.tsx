import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ImageDropzone } from "../components/upload/ImageDropzone";
import { ProcessingSteps } from "../components/upload/ProcessingSteps";
import { MedicineBadge } from "../components/prescription/MedicineBadge";
import { TagBadge } from "../components/prescription/TagBadge";
import { OCRConfidenceIndicator } from "../components/prescription/OCRConfidenceIndicator";
import { Users, CheckCircle, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import type { Patient, Medicine, GeminiResponse } from "../types";
import api from "../lib/api";

type Stage = "select" | "processing" | "review" | "saving" | "done";

const PROCESSING_STEPS = [
  { label: "Uploading Image", description: "Securely transferring to Cloudinary" },
  { label: "Preprocessing", description: "Enhancing image quality for OCR" },
  { label: "Gemini Vision OCR", description: "AI reading the prescription" },
  { label: "Analysis Complete", description: "Extracting medicines and summary" },
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
      toast.error("Please select a patient and a prescription image first.");
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
        throw new Error(res.data.error || "Processing failed");
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      toast.error(err?.response?.data?.error || err?.message || "Processing failed");
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
      toast.success("Prescription saved successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to save prescription");
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
    width: "100%", padding: "10px 12px", borderRadius: 10,
    background: "#111827", border: "1px solid #1e293b",
    color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit",
  };

  // ── Done ──────────────────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", textAlign: "center" }} className="animate-fade-in">
        <div style={{ width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", marginBottom: 24 }}>
          <CheckCircle size={36} color="#34d399" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Prescription Saved!</h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 32, maxWidth: 380 }}>
          The prescription has been digitized and saved to {selectedPatient?.name}'s record.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "1px solid #1e293b", background: "#111827", color: "#94a3b8", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            <RotateCcw size={16} /> Upload Another
          </button>
          <button onClick={() => navigate(`/prescriptions/${savedPrescriptionId}`)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #4f46e5)", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            View Prescription <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ── Processing ─────────────────────────────────────────────────────────────────
  if (stage === "processing") {
    return (
      <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>Processing Prescription</h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>AI is analyzing the prescription image...</p>
        </div>
        <div style={{ maxWidth: 500 }}>
          <ProcessingSteps steps={PROCESSING_STEPS} currentStep={processingStep} />
        </div>
        <div style={{ padding: 20, borderRadius: 16, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)", maxWidth: 500 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={18} color="#a78bfa" />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#c4b5fd" }}>Gemini Vision 2.5 at work</p>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 8, lineHeight: 1.6 }}>Reading handwriting, correcting OCR errors, extracting medicines, and generating clinical summary...</p>
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
      <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }} className="animate-fade-in">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>Review Results</h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Review AI-extracted data before saving</p>
          </div>
          <OCRConfidenceIndicator confidence={ocrConfidence} showDetails />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ borderRadius: 16, border: "1px solid #1e293b", overflow: "hidden" }}>
              <img src={imageUrl} alt="Prescription" style={{ width: "100%", objectFit: "contain", maxHeight: 280, display: "block", background: "#0f172a" }} />
            </div>

            <div style={{ borderRadius: 12, border: "1px solid #1e293b", background: "rgba(15,23,42,0.6)", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e293b" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Summary</p>
              </div>
              <div style={{ padding: 14 }}>
                <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{geminiResult.summary || "No summary generated."}</p>
              </div>
            </div>

            {findings.length > 0 && (
              <div style={{ padding: 14, borderRadius: 12, border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>⚠ Important Findings</p>
                <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {findings.map((f, i) => <li key={i} style={{ fontSize: 13, color: "rgba(252,211,77,0.8)", display: "flex", gap: 8 }}><span style={{ color: "#f59e0b" }}>·</span>{f}</li>)}
                </ul>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Tags</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{tags.map((tag) => <TagBadge key={tag} tag={tag} />)}</div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {meds.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Medicines ({meds.length})</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{meds.map((med, i) => <MedicineBadge key={i} medicine={med} />)}</div>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>Corrected Text</label>
              <div style={{ borderRadius: 12, border: "1px solid #1e293b", background: "rgba(15,23,42,0.6)", padding: 14, maxHeight: 160, overflowY: "auto" }}>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{geminiResult.corrected_text || "No corrected text."}</p>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 }}>Doctor Notes (Optional)</label>
              <textarea
                value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)}
                rows={4} placeholder="Add any additional clinical notes..."
                style={{ width: "100%", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#f8fafc", resize: "none", outline: "none", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={handleReset} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "1px solid #1e293b", background: "transparent", color: "#94a3b8", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                Start Over
              </button>
              <button onClick={handleSave} style={{ flex: 2, padding: "10px 16px", borderRadius: 12, background: "linear-gradient(135deg, #10b981, #059669)", border: "none", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Select ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>Upload Prescription</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Scan and digitize a prescription with Gemini AI</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Select Patient *</label>
            <div style={{ position: "relative" }}>
              <Users size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <select
                value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required
                style={{ ...inputStyle, paddingLeft: 36, cursor: "pointer" }}
              >
                <option value="">— Select a patient —</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.age} yrs · {p.phone}</option>)}
              </select>
            </div>
            {patients.length === 0 && (
              <p style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
                No patients yet. <a href="/patients" style={{ color: "#60a5fa" }}>Add a patient first →</a>
              </p>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Prescription Image *</label>
            <ImageDropzone selectedFile={selectedFile} onFileSelect={setSelectedFile} onClear={() => setSelectedFile(null)} />
          </div>
        </div>

        {/* Right — Process button + info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ padding: 20, borderRadius: 16, border: "1px solid rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(99,102,241,0.2)" }}>
                <Sparkles size={18} color="#a78bfa" />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#c4b5fd" }}>Gemini Vision 2.5</p>
                <p style={{ fontSize: 12, color: "#64748b" }}>AI-powered medical OCR</p>
              </div>
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["Reads handwritten & printed prescriptions", "Extracts medicines with dosage & frequency", "Generates clinical summaries & tags", "Flags important medical findings"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                  <CheckCircle size={14} color="#34d399" style={{ marginTop: 1, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleProcess}
            disabled={!selectedFile || !selectedPatientId || stage === "saving"}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 14,
              background: (!selectedFile || !selectedPatientId) ? "#1e293b" : "linear-gradient(135deg, #2563eb, #4f46e5)",
              border: "none", color: (!selectedFile || !selectedPatientId) ? "#475569" : "white",
              fontSize: 15, fontWeight: 700, cursor: (!selectedFile || !selectedPatientId) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: (!selectedFile || !selectedPatientId) ? "none" : "0 6px 20px rgba(37,99,235,0.4)",
              transition: "all 0.2s",
            }}
          >
            <Sparkles size={18} /> Analyze with Gemini AI
          </button>
        </div>
      </div>
    </div>
  );
}
