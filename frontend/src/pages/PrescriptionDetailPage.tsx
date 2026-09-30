import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Star, Trash2, Download, Save, Pencil, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
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
    api.get(`/prescriptions/${id}`).then((res) => {
      setPrescription(res.data.prescription ?? null);
      setDoctorNotes(res.data.prescription?.doctorNotes ?? "");
      setPatient(res.data.patient ?? null);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleToggleImportant = async () => {
    if (!prescription) return;
    setTogglingImportant(true);
    try {
      const res = await api.patch(`/prescriptions/${prescription.id}/toggle-important`);
      setPrescription((p) => p ? { ...p, important: res.data.important } : p);
      toast.success(res.data.important ? "Marked as important" : "Removed from important");
    } catch { toast.error("Failed to update"); }
    setTogglingImportant(false);
  };

  const handleSaveNotes = async () => {
    if (!prescription) return;
    setSavingNotes(true);
    try {
      await api.put(`/prescriptions/${prescription.id}`, { doctorNotes });
      toast.success("Notes saved");
      setEditingNotes(false);
    } catch { toast.error("Failed to save notes"); }
    setSavingNotes(false);
  };

  const handleDelete = async () => {
    if (!prescription || !patient) return;
    setDeleting(true);
    try {
      await api.delete(`/prescriptions/${prescription.id}`);
      toast.success("Prescription deleted");
      navigate(`/patients/${patient.id}`);
    } catch { toast.error("Failed to delete"); setDeleting(false); }
  };

  const handleDownloadPDF = async () => {
    if (!prescription || !patient) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const meds = (prescription.medicinesJson as Medicine[]) ?? [];
    const tags = (prescription.tags as string[]) ?? [];

    doc.setFontSize(20); doc.setTextColor(37, 99, 235); doc.text("PrescriptOCR", 20, 20);
    doc.setFontSize(12); doc.setTextColor(100, 116, 139); doc.text("AI Prescription Intelligence", 20, 28);
    doc.setFontSize(14); doc.setTextColor(15, 23, 42); doc.text(`Patient: ${patient.name}`, 20, 45);
    doc.setFontSize(10); doc.setTextColor(100, 116, 139);
    doc.text(`Age: ${patient.age} | Gender: ${patient.gender} | Phone: ${patient.phone}`, 20, 53);
    doc.text(`Date: ${formatDate(prescription.createdAt)} at ${formatTime(prescription.createdAt)}`, 20, 60);
    doc.setDrawColor(226, 232, 240); doc.line(20, 65, 190, 65);

    let y = 73;
    doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.text("AI Summary", 20, y); y += 7;
    doc.setFontSize(10); doc.setTextColor(71, 85, 105);
    const summaryLines = doc.splitTextToSize(prescription.aiSummary || "N/A", 170);
    doc.text(summaryLines, 20, y); y += summaryLines.length * 5 + 8;

    doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.text("Medicines", 20, y); y += 7;
    if (meds.length === 0) { doc.setFontSize(10); doc.setTextColor(100, 116, 139); doc.text("No medicines recorded.", 20, y); y += 8; }
    else { meds.forEach((med) => { doc.setFontSize(10); doc.setTextColor(37, 99, 235); doc.text(`• ${med.name}`, 22, y); doc.setTextColor(100, 116, 139); doc.text(`  ${med.dosage} — ${med.frequency}`, 22, y + 5); y += 12; }); }

    y += 4; doc.line(20, y, 190, y); y += 8;
    doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.text("Corrected Prescription Text", 20, y); y += 7;
    doc.setFontSize(9); doc.setTextColor(71, 85, 105);
    const textLines = doc.splitTextToSize(prescription.correctedText || "N/A", 170);
    doc.text(textLines, 20, y); y += textLines.length * 5 + 8;

    if (prescription.doctorNotes) { doc.setFontSize(12); doc.setTextColor(15, 23, 42); doc.text("Doctor Notes", 20, y); y += 7; doc.setFontSize(10); doc.setTextColor(71, 85, 105); doc.text(prescription.doctorNotes, 20, y); y += 10; }
    if (tags.length > 0) { doc.setFontSize(10); doc.setTextColor(100, 116, 139); doc.text(`Tags: ${tags.join(", ")}`, 20, y); }

    doc.save(`prescription-${patient.name}-${formatDate(prescription.createdAt)}.pdf`);
    toast.success("PDF downloaded!");
  };

  if (loading) {
    return (
      <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: i === 0 ? 32 : i === 1 ? 128 : 192, borderRadius: 12 }} />)}
      </div>
    );
  }

  if (!prescription || !patient) {
    return (
      <div style={{ padding: 32, textAlign: "center", paddingTop: 80 }}>
        <p style={{ color: "#94a3b8" }}>Prescription not found.</p>
        <Link to="/patients" style={{ color: "#60a5fa", fontSize: 14, marginTop: 8, display: "block" }}>Back to Patients</Link>
      </div>
    );
  }

  const meds = (prescription.medicinesJson as Medicine[]) ?? [];
  const tags = (prescription.tags as string[]) ?? [];
  const importantFindings = (prescription.importantFindings as string[]) ?? [];

  const sectionStyle = { borderRadius: 12, border: "1px solid #1e293b", background: "rgba(15,23,42,0.6)", overflow: "hidden" };
  const sectionHeader = { padding: "12px 16px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8 };

  return (
    <div style={{ padding: 32, maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      <Link to={`/patients/${patient.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 14 }}>
        <ArrowLeft size={16} /> Back to {patient.name}
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 20, borderRadius: 20, border: "1px solid #1e293b", background: "rgba(15,23,42,0.6)" }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, flexShrink: 0, background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>{getInitials(patient.name)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>{patient.name}</h1>
            {prescription.important && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)", fontWeight: 600 }}><Star size={12} fill="#fbbf24" /> Important</span>}
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{formatDate(prescription.createdAt)} at {formatTime(prescription.createdAt)} · {patient.age} yrs · {patient.phone}</p>
          <div style={{ marginTop: 8 }}><OCRConfidenceIndicator confidence={prescription.ocrConfidence} showDetails /></div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={handleToggleImportant} disabled={togglingImportant} title={prescription.important ? "Remove from important" : "Mark as important"} style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid", background: prescription.important ? "rgba(245,158,11,0.12)" : "transparent", borderColor: prescription.important ? "rgba(245,158,11,0.3)" : "#1e293b", color: prescription.important ? "#fbbf24" : "#64748b", cursor: "pointer" }}>
            <Star size={16} fill={prescription.important ? "#fbbf24" : "none"} />
          </button>
          <button onClick={handleDownloadPDF} title="Download PDF" style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e293b", background: "transparent", color: "#64748b", cursor: "pointer" }}>
            <Download size={16} />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} title="Delete prescription" style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e293b", background: "transparent", color: "#64748b", cursor: "pointer" }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{tags.map((tag) => <TagBadge key={tag} tag={tag} />)}</div>}

      {/* Prescription Image */}
      <div style={sectionStyle}>
        <div style={sectionHeader}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa" }} /><p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Original Prescription Image</p></div>
        <div style={{ background: "#0f172a" }}>
          <img src={prescription.imageUrl} alt="Prescription" style={{ width: "100%", objectFit: "contain", maxHeight: 400, display: "block" }} />
        </div>
      </div>

      {/* Raw OCR */}
      <div style={sectionStyle}>
        <button onClick={() => setShowRawOcr(!showRawOcr)} style={{ width: "100%", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} /><p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Raw OCR Output</p></div>
          {showRawOcr ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </button>
        {showRawOcr && <div style={{ padding: 16, borderTop: "1px solid #1e293b" }}><pre style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "pre-wrap", fontFamily: "monospace", lineHeight: 1.6, maxHeight: 160, overflowY: "auto" }}>{prescription.rawOcr || "(No raw text)"}</pre></div>}
      </div>

      {/* AI Summary */}
      <div style={sectionStyle}>
        <div style={sectionHeader}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa" }} /><p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Summary</p></div>
        <div style={{ padding: 16 }}><p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7 }}>{prescription.aiSummary || "No summary available."}</p></div>
      </div>

      {/* Corrected Text */}
      <div style={sectionStyle}>
        <div style={sectionHeader}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#60a5fa" }} /><p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Corrected Prescription Text</p></div>
        <div style={{ padding: 16 }}><p style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{prescription.correctedText || "No corrected text."}</p></div>
      </div>

      {/* Medicines */}
      {meds.length > 0 && (
        <div style={sectionStyle}>
          <div style={sectionHeader}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} /><p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Medicines ({meds.length})</p></div>
          <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {meds.map((med, i) => <MedicineBadge key={i} medicine={med} />)}
          </div>
        </div>
      )}

      {/* Important Findings */}
      {importantFindings.length > 0 && (
        <div style={{ padding: 16, borderRadius: 12, border: "1px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><AlertCircle size={16} color="#fbbf24" /><p style={{ fontSize: 11, fontWeight: 600, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em" }}>Important Findings</p></div>
          <ul style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {importantFindings.map((f, i) => <li key={i} style={{ fontSize: 14, color: "rgba(252,211,77,0.8)", display: "flex", gap: 8 }}><span style={{ color: "#f59e0b" }}>·</span>{f}</li>)}
          </ul>
        </div>
      )}

      {/* Doctor Notes */}
      <div style={sectionStyle}>
        <div style={{ ...sectionHeader, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2dd4bf" }} /><p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Doctor Notes</p></div>
          {!editingNotes && <button onClick={() => setEditingNotes(true)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer" }}><Pencil size={12} /> Edit</button>}
        </div>
        <div style={{ padding: 16 }}>
          {editingNotes ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <textarea value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} rows={3} placeholder="Add notes..." style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 14, color: "#cbd5e1", resize: "none", outline: "none", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setEditingNotes(false); setDoctorNotes(prescription.doctorNotes); }} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSaveNotes} disabled={savingNotes} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#2563eb", border: "none", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Save size={12} />{savingNotes ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, color: prescription.doctorNotes ? "#cbd5e1" : "#475569", lineHeight: 1.7, fontStyle: prescription.doctorNotes ? "normal" : "italic" }}>
              {prescription.doctorNotes || "No notes yet. Click edit to add."}
            </p>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }} onClick={() => setShowDeleteConfirm(false)} />
          <div className="animate-fade-in" style={{ position: "relative", width: "100%", maxWidth: 360, borderRadius: 20, padding: 24, background: "#0f172a", border: "1px solid #1e293b", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16 }}><Trash2 size={20} color="#f87171" /></div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>Delete Prescription?</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 1.6 }}>This will permanently delete this prescription record. This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "1px solid #1e293b", background: "#111827", color: "#94a3b8", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", background: "#dc2626", color: "white", fontSize: 14, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
