import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  FileText,
  Calendar,
  Phone,
  User,
  Activity,
  CheckCircle,
  Eye,
  Maximize2,
  ClipboardList,
} from "lucide-react";
import { MedicineBadge } from "../components/prescription/MedicineBadge";
import { OCRConfidenceIndicator } from "../components/prescription/OCRConfidenceIndicator";
import { TagBadge } from "../components/prescription/TagBadge";
import { getInitials, formatDate, formatTime } from "../lib/utils";
import type { Patient, Prescription, Medicine } from "../types";
import api from "../lib/api";

export default function PrescriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    if (!id) return;
    api
      .get(`/prescriptions/${id}`)
      .then((res) => {
        setPrescription(res.data.prescription ?? null);
        setDoctorNotes(res.data.prescription?.doctorNotes ?? "");
        setPatient(res.data.patient ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleImportant = async () => {
    if (!prescription) return;
    setTogglingImportant(true);
    try {
      const res = await api.patch(`/prescriptions/${prescription.id}/toggle-important`);
      setPrescription((p) => (p ? { ...p, important: res.data.important } : p));
      toast.success(res.data.important ? "Marked as priority" : "Removed from priority");
    } catch {
      toast.error("Failed to update status");
    }
    setTogglingImportant(false);
  };

  const handleSaveNotes = async () => {
    if (!prescription) return;
    setSavingNotes(true);
    try {
      const res = await api.put(`/prescriptions/${prescription.id}`, { doctorNotes });
      const savedNotes = res.data.prescription?.doctorNotes ?? doctorNotes;
      setPrescription((p) => (p ? { ...p, doctorNotes: savedNotes } : p));
      setDoctorNotes(savedNotes);
      toast.success("Clinical notes updated");
      setEditingNotes(false);
    } catch {
      toast.error("Failed to save clinical notes");
    }
    setSavingNotes(false);
  };

  const handleDelete = async () => {
    if (!prescription || !patient) return;
    setDeleting(true);
    try {
      await api.delete(`/prescriptions/${prescription.id}`);
      toast.success("Prescription record removed");
      navigate(`/patients/${patient.id}`);
    } catch {
      toast.error("Failed to delete record");
      setDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!prescription || !patient) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const meds = (prescription.medicinesJson as Medicine[]) ?? [];
    const tags = (prescription.tags as string[]) ?? [];

    doc.setFontSize(20);
    doc.setTextColor(15, 118, 110);
    doc.text("PrescriptOCR — Clinical Record", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("AUDITED MEDICAL DOSSIER & PRESCRIPTION TRANSCRIPTION", 20, 26);

    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(`Patient: ${patient.name}`, 20, 42);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Demographics: Age ${patient.age} | Sex ${patient.gender} | Contact ${patient.phone}`, 20, 49);
    doc.text(`Recorded: ${formatDate(prescription.createdAt)} at ${formatTime(prescription.createdAt)}`, 20, 55);
    doc.setDrawColor(203, 213, 225);
    doc.line(20, 60, 190, 60);

    let y = 68;
    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text("AI CLINICAL SUMMARY", 20, y);
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const summaryLines = doc.splitTextToSize(prescription.aiSummary || "N/A", 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 5 + 8;

    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text("PRESCRIBED MEDICINES (Rx)", 20, y);
    y += 7;
    if (meds.length === 0) {
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("No medications detected in prescription.", 20, y);
      y += 8;
    } else {
      meds.forEach((med) => {
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${med.name} (${med.dosage || "Standard"})`, 22, y);
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`  Schedule: ${med.frequency || "As directed"} ${med.instructions ? " | " + med.instructions : ""}`, 22, y + 5);
        y += 11;
      });
    }

    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(20, y, 190, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(15, 118, 110);
    doc.text("STANDARDIZED CLINICAL TRANSCRIPTION", 20, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const textLines = doc.splitTextToSize(prescription.correctedText || "N/A", 170);
    doc.text(textLines, 20, y);
    y += textLines.length * 4.5 + 8;

    if (prescription.doctorNotes) {
      doc.setFontSize(12);
      doc.setTextColor(15, 118, 110);
      doc.text("PHYSICIAN CLINICAL OBSERVATIONS", 20, y);
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const noteLines = doc.splitTextToSize(prescription.doctorNotes, 170);
      doc.text(noteLines, 20, y);
      y += noteLines.length * 4.5 + 8;
    }

    if (tags.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Diagnostic Tags: ${tags.join(", ")}`, 20, y);
    }

    doc.save(`clinical-dossier-${patient.name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast.success("Clinical PDF exported successfully");
  };

  if (loading) {
    return (
      <div style={{ padding: "36px 40px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 120, borderRadius: 10 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="skeleton" style={{ height: 420, borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 420, borderRadius: 10 }} />
        </div>
      </div>
    );
  }

  if (!prescription || !patient) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#fef2f2", border: "1px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#b91c1c" }}>
          <AlertCircle size={24} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Clinical Record Not Found</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>The requested prescription chart cannot be accessed or has been archived.</p>
        <Link
          to="/patients"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 6,
            background: "#0f766e",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={14} /> Return to Patient Registry
        </Link>
      </div>
    );
  }

  const meds = (prescription.medicinesJson as Medicine[]) ?? [];
  const tags = (prescription.tags as string[]) ?? [];
  const importantFindings = (prescription.importantFindings as string[]) ?? [];

  return (
    <div style={{ padding: "28px 36px 60px", maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link
          to={`/patients/${patient.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--text-secondary)",
            fontSize: 13,
            fontWeight: 500,
            padding: "6px 10px",
            borderRadius: 6,
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border-subtle)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ArrowLeft size={15} /> Back to Patient Chart: <strong style={{ color: "var(--text-primary)" }}>{patient.name}</strong>
        </Link>

        <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", background: "var(--bg-surface-subtle)", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--border-color)" }}>
          DOC-ID: {prescription.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Main Patient Chart Header Card */}
      <div
        className="clinical-card"
        style={{
          borderLeft: prescription.important ? "5px solid #d97706" : "5px solid #0f766e",
          padding: "24px 28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, minWidth: 280 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
              background: "#0f766e",
              boxShadow: "0 2px 8px rgba(15,118,110,0.25)",
            }}
          >
            {getInitials(patient.name)}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {patient.name}
              </h1>

              {prescription.important && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "rgba(217, 119, 6, 0.15)",
                    color: "#f59e0b",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <Star size={11} fill="#f59e0b" color="#f59e0b" /> CLINICAL PRIORITY
                </span>
              )}
            </div>

            {/* Demographics row */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 6, flexWrap: "wrap", fontSize: 12.5, color: "var(--text-secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <User size={13} color="var(--text-muted)" /> {patient.age} yrs · {patient.gender}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Phone size={13} color="var(--text-muted)" /> {patient.phone}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar size={13} color="var(--text-muted)" /> {formatDate(prescription.createdAt)} at {formatTime(prescription.createdAt)}
              </span>
            </div>

            <div style={{ marginTop: 10 }}>
              <OCRConfidenceIndicator confidence={prescription.ocrConfidence} showDetails />
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleToggleImportant}
            disabled={togglingImportant}
            title={prescription.important ? "Remove priority flag" : "Mark as clinical priority"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: prescription.important ? "rgba(245, 158, 11, 0.4)" : "var(--border-color)",
              background: prescription.important ? "rgba(217, 119, 6, 0.15)" : "var(--bg-surface)",
              color: prescription.important ? "#f59e0b" : "var(--text-secondary)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Star size={14} fill={prescription.important ? "#f59e0b" : "none"} color={prescription.important ? "#f59e0b" : "var(--text-muted)"} />
            <span>{prescription.important ? "Flagged" : "Flag"}</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface)",
              color: "var(--brand-primary)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
          >
            <Download size={14} />
            <span>Export Chart</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Archive or delete record"
            style={{
              width: 34,
              height: 34,
              borderRadius: 6,
              border: "1px solid var(--border-color)",
              background: "var(--bg-surface)",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.background = "var(--bg-surface)";
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Diagnostic Category Badges */}
      {tags.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Diagnostics:
          </span>
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Critical Findings Alert Callout */}
      {importantFindings.length > 0 && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 8,
            border: "1px solid rgba(245, 158, 11, 0.35)",
            background: "rgba(217, 119, 6, 0.1)",
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b", flexShrink: 0 }}>
            <AlertCircle size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
              Critical Clinical Findings Detected
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, listStyle: "none" }}>
              {importantFindings.map((f, i) => (
                <li key={i} style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5 }}>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>›</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Dual Column Clinical Dossier Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Left Column: Specimen Image & Raw Optical Readings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Specimen Viewer */}
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            <div className="clinical-dossier-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0f766e" }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Original Prescription Specimen
                </span>
              </div>
              <a
                href={prescription.imageUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "var(--brand-primary)",
                  fontWeight: 600,
                }}
              >
                <Maximize2 size={12} /> FULL RES
              </a>
            </div>

            <div style={{ background: "var(--bg-surface-subtle)", padding: 12, borderBottom: "1px solid var(--border-color)" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-canvas)",
                }}
              >
                <img
                  src={prescription.imageUrl}
                  alt="Prescription document"
                  style={{
                    width: "100%",
                    objectFit: "contain",
                    maxHeight: 460,
                    display: "block",
                  }}
                />
              </div>
            </div>

            <div style={{ padding: "10px 16px", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)" }}>
              <span>Specimen format: High-res medical capture</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>STATUS: AUDITED</span>
            </div>
          </div>

          {/* Raw Optical Character Recognition Data (Collapsible) */}
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            <button
              onClick={() => setShowRawOcr(!showRawOcr)}
              style={{
                width: "100%",
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-surface)",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={14} color="var(--text-muted)" />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Raw OCR Telemetry & Diagnostic Stream
                </span>
              </div>
              {showRawOcr ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
            </button>

            {showRawOcr && (
              <div style={{ padding: "16px", borderTop: "1px solid var(--border-color)", background: "var(--bg-surface-subtle)" }}>
                <pre
                  style={{
                    fontSize: 11.5,
                    color: "var(--text-secondary)",
                    whiteSpace: "pre-wrap",
                    fontFamily: "'JetBrains Mono', monospace",
                    lineHeight: 1.6,
                    maxHeight: 220,
                    overflowY: "auto",
                    background: "var(--bg-canvas)",
                    padding: "12px 14px",
                    borderRadius: 6,
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {prescription.rawOcr || "(No raw OCR stream recorded)"}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured Formulary & Clinical Synthesis */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Detected Medicines List (Rx) */}
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            <div className="clinical-dossier-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0f766e" }} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Prescribed Formulary (Rx)
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "var(--brand-primary)",
                  background: "rgba(15, 118, 110, 0.1)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  border: "1px solid rgba(15, 118, 110, 0.25)",
                }}
              >
                {meds.length} MEDICATIONS
              </span>
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {meds.length > 0 ? (
                meds.map((med, i) => <MedicineBadge key={i} medicine={med} />)
              ) : (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, background: "var(--bg-surface-subtle)", borderRadius: 8, border: "1px dashed var(--border-color)" }}>
                  No active medicines extracted from this prescription.
                </div>
              )}
            </div>
          </div>

          {/* AI Clinical Summary */}
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            <div className="clinical-dossier-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb" }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                AI Clinical Synthesis
              </span>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 400 }}>
                {prescription.aiSummary || "No automated summary synthesized for this record."}
              </p>
            </div>
          </div>

          {/* Standardized Transcription */}
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            <div className="clinical-dossier-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#64748b" }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Standardized Clinical Transcription
              </span>
            </div>
            <div style={{ padding: "18px 20px" }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {prescription.correctedText || "No transcription generated."}
              </p>
            </div>
          </div>

          {/* Doctor Observations & Clinical Notes */}
          <div className="clinical-card" style={{ overflow: "hidden" }}>
            <div className="clinical-dossier-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ClipboardList size={14} color="#0f766e" />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Physician Chart Notes
                </span>
              </div>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: "var(--brand-primary)",
                    background: "rgba(15, 118, 110, 0.1)",
                    border: "1px solid rgba(15, 118, 110, 0.25)",
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={12} /> Edit
                </button>
              )}
            </div>

            <div style={{ padding: "18px 20px" }}>
              {editingNotes ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter diagnostic impressions, follow-up scheduling, or patient warnings..."
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
                      lineHeight: 1.6,
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      onClick={() => {
                        setEditingNotes(false);
                        setDoctorNotes(prescription.doctorNotes ?? "");
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-surface)",
                        color: "var(--text-secondary)",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 6,
                        background: "#0f766e",
                        border: "none",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Save size={12} /> {savingNotes ? "Saving..." : "Save Chart Notes"}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {prescription.doctorNotes ? (
                    <div
                      style={{
                        padding: "12px 14px",
                        borderRadius: 6,
                        background: "rgba(15, 118, 110, 0.08)",
                        border: "1px solid rgba(15, 118, 110, 0.2)",
                      }}
                    >
                      <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                        {prescription.doctorNotes}
                      </p>
                    </div>
                  ) : (
                    <p
                      onClick={() => setEditingNotes(true)}
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                        fontStyle: "italic",
                        cursor: "pointer",
                        background: "var(--bg-surface-subtle)",
                        padding: "12px 14px",
                        borderRadius: 6,
                        border: "1px dashed var(--border-color)",
                      }}
                    >
                      No clinical notes recorded yet. Click to append physician observations...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div
            className="animate-fade-in"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 380,
              borderRadius: 12,
              padding: 24,
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", marginBottom: 16 }}>
              <Trash2 size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              Archive / Delete Prescription?
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.6 }}>
              This will permanently remove this prescription and its clinical transcriptions from the patient's record. This action cannot be reverted.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
                onClick={handleDelete}
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
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
