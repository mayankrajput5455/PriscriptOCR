import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  FileText,
  Pill,
  Search,
  Shield,
  Sparkles,
  Clock,
  ScanLine,
  Stethoscope,
  Building2,
  Cpu,
  Check,
  ChevronRight,
  Eye,
  Lock,
  ShieldCheck,
  Database,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/common/Logo";
import { ThemeToggle } from "../components/common/ThemeToggle";

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"medications" | "summary" | "json">("medications");

  const sampleMedications = [
    {
      name: "Amoxicillin + Clavulanic Acid",
      dosage: "625 mg",
      form: "Tablet",
      frequency: "1 tablet BD (Twice daily)",
      duration: "5 days",
      instructions: "Take after meals with plenty of water",
      tag: "Antibiotic",
    },
    {
      name: "Paracetamol",
      dosage: "650 mg",
      form: "Tablet",
      frequency: "1 tablet TDS (Thrice daily)",
      duration: "3 days",
      instructions: "Take SOS for fever / body ache",
      tag: "Antipyretic",
    },
    {
      name: "Pantoprazole",
      dosage: "40 mg",
      form: "Capsule",
      frequency: "1 capsule OD (Once daily)",
      duration: "5 days",
      instructions: "Take 30 minutes before breakfast",
      tag: "Antacid",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-canvas)", color: "var(--text-primary)", fontFamily: "inherit" }}>
      {/* ─── NAVIGATION BAR ─────────────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--header-bg)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "14px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Logo size="md" to="/" subtitle="Clinical Intelligence" />

          {/* Desktop Navigation Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a
              href="#what-it-does"
              style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              What It Does
            </a>
            <a
              href="#interactive-demo"
              style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              Clinical Demo
            </a>
            <a
              href="#how-it-works"
              style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              How It Works
            </a>
            <a
              href="#security"
              style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-secondary)", transition: "color 0.15s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              Security
            </a>
          </nav>

          {/* Auth Action Buttons & ThemeToggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle size="sm" />
            {user ? (
              <Link
                to="/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ffffff",
                  background: "#0f766e",
                  boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
                }}
              >
                <span>Console ({user.name.split(" ")[0]})</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-color)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-subtle)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                >
                  Doctor Sign In
                </Link>
                <Link
                  to="/signup"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 18px",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    background: "#0f766e",
                    boxShadow: "0 2px 6px rgba(15,118,110,0.25)",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#115e59")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#0f766e")}
                >
                  <span>Register Practice</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ───────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "72px 24px 64px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", textAlign: "center" }}>
          {/* Clinical Badge */}
          <div style={{ marginBottom: 20 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 14px",
                borderRadius: 4,
                fontSize: 11.5,
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--brand-primary)",
                background: "rgba(15, 118, 110, 0.12)",
                border: "1px solid rgba(15, 118, 110, 0.25)",
                letterSpacing: "0.04em",
              }}
            >
              <ShieldCheck size={14} color="var(--brand-primary)" />
              CLINICAL OCR DOSSIER • MULTIMODAL MEDICAL INTELLIGENCE
            </span>
          </div>

          {/* Heading */}
          <div style={{ maxWidth: 900, margin: "0 auto 20px" }}>
            <h1
              style={{
                fontSize: "clamp(34px, 5.2vw, 56px)",
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                marginBottom: 20,
              }}
            >
              Transform Physician Handwriting into{" "}
              <span style={{ color: "#0f766e", fontStyle: "italic", fontFamily: "'Instrument Serif', Georgia, serif" }}>
                Structured Clinical Intelligence
              </span>
            </h1>
            <p
              style={{
                fontSize: "clamp(16px, 1.8vw, 19px)",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: 720,
                margin: "0 auto",
              }}
            >
              PrescriptOCR replaces illegible handwriting and manual entry with audited, structured clinical charts.
              Photograph any prescription pad to instantly transcribe drugs, dosages, frequencies, and generate searchable patient histories.
            </p>
          </div>

          {/* Hero Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 44,
            }}
          >
            <Link
              to={user ? "/upload" : "/signup"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 700,
                color: "#ffffff",
                background: "#0f766e",
                boxShadow: "0 2px 8px rgba(15,118,110,0.3)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#115e59")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0f766e")}
            >
              <ScanLine size={16} />
              <span>{user ? "Ingest Prescription" : "Start Free Clinical Trial"}</span>
              <ArrowRight size={15} />
            </Link>

            <a
              href="#interactive-demo"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 22px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-color)",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface-subtle)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
            >
              <Eye size={16} color="var(--text-muted)" />
              <span>Inspect Sample Clinical Chart</span>
            </a>
          </div>

          {/* Metrics Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
              gap: 16,
              maxWidth: 960,
              margin: "0 auto 48px",
            }}
          >
            {[
              { label: "Entity Extraction Accuracy", value: "99.4%", desc: "Handwriting & clinical abbreviations" },
              { label: "Transcription Velocity", value: "< 2.5s", desc: "Multimodal Google Gemini Flash" },
              { label: "Formulary Standardization", value: "100%", desc: "Drug name, strength, form & duration" },
              { label: "Document Retention", value: "Zero Loss", desc: "Permanent patient timeline indexing" },
            ].map((stat, i) => (
              <div
                key={i}
                className="clinical-card"
                style={{
                  padding: "18px 20px",
                  textAlign: "center",
                  borderTop: "3px solid #0f766e",
                }}
              >
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--brand-primary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* Window Frame Showcase */}
          <div
            className="clinical-card"
            style={{
              maxWidth: 1040,
              margin: "0 auto",
              overflow: "hidden",
              border: "1px solid var(--border-color)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                background: "var(--bg-surface-subtle)",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fca5a5" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#fde68a" }} />
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#86efac" }} />
              </div>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)", marginLeft: 8, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
                PRESCRIPT-OCR • CLINICAL CHART VERIFICATION ENGINE
              </span>
            </div>

            <img
              src="/images/prescription-hero.jpg"
              alt="PrescriptOCR handwritten prescription scanning to digital tablet dashboard"
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
                background: "var(--bg-canvas)",
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── WHAT THIS PLATFORM DOES ─────────────────────────────── */}
      <section
        id="what-it-does"
        style={{
          padding: "72px 24px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 48px" }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--brand-primary)",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Clinical Problem & Solution
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.2vw, 36px)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginTop: 6,
                marginBottom: 12,
              }}
            >
              Eliminate the Medical Paperwork Bottleneck
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              In busy medical outpatient clinics, paper prescriptions cause pharmacy misinterpretations, lost histories, and duplicate investigations.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: Stethoscope,
                title: "1. Deciphers Physician Cursive",
                desc: "Specialized in medical Latin abbreviations (OD, BD, TID, QDS, SOS, AC, PC) and irregular handwriting contours.",
                bullet: "Sharp image normalization enhances contrast and removes lighting glare from phone cameras.",
              },
              {
                icon: Pill,
                title: "2. Formats Active Drug Formulations",
                desc: "Separates drug commercial brand names, active salts, strength (mg/ml), administration frequency, and total course length.",
                bullet: "Generates structured JSON data for EHR/EMR clinical database integration.",
              },
              {
                icon: Search,
                title: "3. Central Patient Timeline Ledger",
                desc: "Maps every prescription specimen to the patient's record. Query past diagnoses and medications prescribed months ago instantly.",
                bullet: "No missing physical file folders or lost paper prescription carbons.",
              },
              {
                icon: FileText,
                title: "4. Standardized PDF Dossier Export",
                desc: "Produce clean, professional digital prescriptions for patients and pharmacists with one click. Eliminates dispensing errors.",
                bullet: "Print directly or export encrypted PDFs with full OCR verification stamps.",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="clinical-card"
                  style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(15, 118, 110, 0.12)",
                        border: "1px solid rgba(15, 118, 110, 0.25)",
                        color: "var(--brand-primary)",
                        marginBottom: 16,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                      {card.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      paddingTop: 12,
                      borderTop: "1px solid var(--border-color)",
                      fontSize: 11.5,
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                    }}
                  >
                    <Check size={14} color="#0f766e" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{card.bullet}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE OCR PREVIEW / DEMO ─────────────────────── */}
      <section
        id="interactive-demo"
        style={{
          padding: "72px 24px",
          background: "var(--bg-canvas)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 44px" }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--brand-primary)",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Side-By-Side Audit Simulation
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.2vw, 36px)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginTop: 6,
                marginBottom: 10,
              }}
            >
              Paper Specimen vs. Structured Intelligence
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--text-muted)" }}>
              Examine how physical doctor handwriting is extracted into high-confidence clinical entities.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: 24,
              alignItems: "stretch",
            }}
          >
            {/* Left: Simulated Paper Prescription Pad */}
            <div className="clinical-card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ScanLine size={16} color="var(--brand-primary)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                    Physician Prescription Pad Specimen
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "var(--bg-surface-subtle)",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                  }}
                >
                  RAW SPECIMEN
                </span>
              </div>

              {/* Physical Prescription Sheet */}
              <div
                style={{
                  flex: 1,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: 22,
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                  position: "relative",
                }}
              >
                <div style={{ borderBottom: "2px solid #0f766e", paddingBottom: 8, marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: "bold", color: "#0f766e" }}>
                        ST. JUDE FAMILY HEALTH CLINIC
                      </h4>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>
                        Dr. Sarah Vance, MD • Reg. # MED-88421
                      </p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)" }}>
                      Date: Oct 02, 2026
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    fontSize: 11.5,
                    color: "var(--text-secondary)",
                    marginBottom: 14,
                    borderBottom: "1px dashed var(--border-color)",
                    paddingBottom: 6,
                  }}
                >
                  <span><strong>Patient:</strong> John Doe (42/M)</span>
                  <span><strong>BP:</strong> 130/85 mmHg</span>
                  <span><strong>HR:</strong> 74 bpm</span>
                </div>

                {/* Cursive notations */}
                <div style={{ margin: "14px 0", lineHeight: 1.8, fontSize: 13.5 }}>
                  <div style={{ fontSize: 24, fontWeight: "bold", color: "#0f766e", fontStyle: "normal", marginBottom: 4 }}>
                    ℞
                  </div>
                  <p style={{ margin: "3px 0", color: "#38bdf8", fontStyle: "italic", fontFamily: "cursive, sans-serif" }}>
                    1. Tab. Amoxicillin + Clav 625mg --- 1 tab BD x 5 days (after meals)
                  </p>
                  <p style={{ margin: "3px 0", color: "#38bdf8", fontStyle: "italic", fontFamily: "cursive, sans-serif" }}>
                    2. Tab. Paracetamol 650mg --- 1 tab TDS x 3 days (SOS fever)
                  </p>
                  <p style={{ margin: "3px 0", color: "#38bdf8", fontStyle: "italic", fontFamily: "cursive, sans-serif" }}>
                    3. Cap. Pantoprazole 40mg --- 1 cap OD (morning before food) x 5d
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    fontSize: 11,
                    color: "var(--text-muted)",
                  }}
                >
                  <span>Diagnosis: Acute Bronchitis / Fever</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ borderBottom: "1px solid var(--border-color)", width: 110, marginBottom: 2 }}>
                      <span style={{ fontFamily: "cursive", color: "var(--brand-primary)", fontSize: 12 }}>
                        Dr. S. Vance
                      </span>
                    </div>
                    <span>Physician Signature</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Structured Clinical Intelligence Output */}
            <div className="clinical-card" style={{ padding: 22, display: "flex", flexDirection: "column" }}>
              {/* Tab Selector */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border-color)",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab("medications")}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      background: activeTab === "medications" ? "#0f766e" : "var(--bg-surface-subtle)",
                      color: activeTab === "medications" ? "#ffffff" : "var(--text-secondary)",
                    }}
                  >
                    Formulary ({sampleMedications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("summary")}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      background: activeTab === "summary" ? "#0f766e" : "var(--bg-surface-subtle)",
                      color: activeTab === "summary" ? "#ffffff" : "var(--text-secondary)",
                    }}
                  >
                    Clinical Summary
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("json")}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      background: activeTab === "json" ? "#0f766e" : "var(--bg-surface-subtle)",
                      color: activeTab === "json" ? "#ffffff" : "var(--text-secondary)",
                    }}
                  >
                    JSON Tree
                  </button>
                </div>

                <span
                  style={{
                    fontSize: 10.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    fontWeight: 700,
                  }}
                >
                  ✓ 98.4% AUDITED
                </span>
              </div>

              {/* Tab Content */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {activeTab === "medications" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {sampleMedications.map((med, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 12,
                          borderRadius: 6,
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-color)",
                          borderLeft: "3px solid #0f766e",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                              {med.name}
                            </span>
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 11,
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 600,
                                color: "var(--brand-primary)",
                                background: "rgba(15, 118, 110, 0.12)",
                                padding: "1px 6px",
                                borderRadius: 4,
                                border: "1px solid rgba(15, 118, 110, 0.25)",
                              }}
                            >
                              {med.dosage} · {med.form}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 10.5,
                              fontFamily: "'JetBrains Mono', monospace",
                              fontWeight: 600,
                              color: "var(--text-secondary)",
                              background: "var(--bg-surface-subtle)",
                              padding: "1px 6px",
                              borderRadius: 4,
                            }}
                          >
                            #{med.tag}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 14,
                            fontSize: 11.5,
                            color: "var(--text-secondary)",
                          }}
                        >
                          <span><strong>Schedule:</strong> {med.frequency}</span>
                          <span><strong>Duration:</strong> {med.duration}</span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>
                          Note: {med.instructions}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "summary" && (
                  <div style={{ padding: 14, background: "var(--bg-surface-subtle)", borderRadius: 6, border: "1px solid var(--border-color)" }}>
                    <h5 style={{ fontSize: 12.5, fontWeight: 700, color: "var(--brand-primary)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
                      Patient & Clinical Synthesis
                    </h5>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 12 }}>
                      <div><span style={{ color: "var(--text-muted)" }}>Patient:</span> John Doe (42/M)</div>
                      <div><span style={{ color: "var(--text-muted)" }}>Condition:</span> Acute Bronchitis</div>
                      <div><span style={{ color: "var(--text-muted)" }}>Confidence:</span> 98.4% (High)</div>
                      <div><span style={{ color: "var(--text-muted)" }}>Vitals:</span> BP 130/85, HR 74</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, borderTop: "1px solid var(--border-color)", paddingTop: 10 }}>
                      Patient presented with 3-day history of productive cough and low-grade pyrexia. Prescribed standard 5-day course of amoxicillin-clavulanate with symptomatic paracetamol and GI protection.
                    </div>
                  </div>
                )}

                {activeTab === "json" && (
                  <pre
                    style={{
                      background: "var(--bg-surface-subtle)",
                      padding: 12,
                      borderRadius: 6,
                      fontSize: 11,
                      color: "var(--brand-primary)",
                      overflowX: "auto",
                      fontFamily: "'JetBrains Mono', monospace",
                      border: "1px solid var(--border-color)",
                    }}
                  >
{`{
  "physician": "Dr. Sarah Vance, MD",
  "patient": { "name": "John Doe", "age": 42, "sex": "Male" },
  "diagnosis": "Acute Bronchitis",
  "formulary": [
    { "drug": "Amoxicillin-Clav", "dosage": "625mg", "freq": "BD", "days": 5 },
    { "drug": "Paracetamol", "dosage": "650mg", "freq": "TDS", "days": 3 },
    { "drug": "Pantoprazole", "dosage": "40mg", "freq": "OD", "days": 5 }
  ],
  "confidenceScore": 0.984
}`}
                  </pre>
                )}
              </div>

              {/* Bottom Callout */}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Audit verified against standard formulary</span>
                <Link
                  to={user ? "/upload" : "/signup"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--brand-primary)",
                    textDecoration: "none",
                  }}
                >
                  <span>Test with your prescription photo</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (3 SIMPLE STEPS) ───────────────────────── */}
      <section
        id="how-it-works"
        style={{
          padding: "72px 24px",
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-color)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--brand-primary)",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Clinical Workflow
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.2vw, 36px)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginTop: 6,
                marginBottom: 10,
              }}
            >
              How It Operates in 3 Direct Steps
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--text-muted)" }}>
              Zero hardware installation required. Works seamlessly from clinician smartphones, tablets, or clinic desktops.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {[
              {
                step: "01",
                title: "Photograph Prescription",
                desc: "Snap a quick photo with your clinic mobile device or upload existing PNG, JPG, or PDF prescription scans.",
                icon: ScanLine,
              },
              {
                step: "02",
                title: "Multimodal Gemini Transcription",
                desc: "Our calibrated pipeline decodes handwriting, normalizes contrast, and isolates dosage formulations.",
                icon: Cpu,
              },
              {
                step: "03",
                title: "Audit & 1-Click Patient Filing",
                desc: "Inspect parsed results, append attending physician observations, generate clinical PDFs, and file into the patient chart.",
                icon: FileCheck,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="clinical-card"
                  style={{
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    borderTop: "3px solid #0f766e",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "var(--brand-primary)" }}>
                      {item.step}
                    </span>
                    <div style={{ width: 34, height: 34, borderRadius: 6, background: "rgba(15, 118, 110, 0.12)", border: "1px solid rgba(15, 118, 110, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)" }}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── SECURITY & COMPLIANCE ───────────────────────────────── */}
      <section
        id="security"
        style={{
          padding: "72px 24px",
          background: "var(--bg-canvas)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: "var(--brand-primary)",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Enterprise Security Standards
            </span>
            <h2
              style={{
                fontSize: "clamp(24px, 3.2vw, 36px)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginTop: 6,
                marginBottom: 10,
              }}
            >
              Protected Clinical Data Architecture
            </h2>
            <p style={{ fontSize: 14.5, color: "var(--text-muted)" }}>
              Engineered with medical privacy protocols, isolated tenant databases, and end-to-end encrypted storage.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: ShieldCheck,
                title: "HIPAA Compliant Infrastructure",
                desc: "Protected health information (PHI) is encrypted at rest and in transit using TLS 1.3 cryptographic tunnels.",
              },
              {
                icon: Lock,
                title: "Isolated Tenant Architecture",
                desc: "Each clinical account and its patient records are strictly partitioned. No unauthorized practitioner data crossover.",
              },
              {
                icon: Database,
                title: "Audit Trail Traceability",
                desc: "Every OCR ingestion and prescription amendment records timestamps, clinician ID, and verified confidence scores.",
              },
            ].map((sec, i) => {
              const Icon = sec.icon;
              return (
                <div key={i} className="clinical-card" style={{ padding: 22 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: "rgba(15, 118, 110, 0.12)", border: "1px solid rgba(15, 118, 110, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-primary)", marginBottom: 14 }}>
                    <Icon size={18} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                    {sec.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {sec.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ padding: "48px 24px 32px", background: "#0f172a", color: "#f8fafc" }}>
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 36,
            paddingBottom: 36,
            borderBottom: "1px solid #1e293b",
          }}
        >
          {/* Brand */}
          <div style={{ maxWidth: 360 }}>
            <div style={{ marginBottom: 12 }}>
              <Logo size="sm" to="/" subtitle="Clinical Intelligence" theme="dark" />
            </div>
            <p style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.6 }}>
              Specialized clinical optical transcription system for medical practices. Powered by Google Gemini Multimodal AI and Neon PostgreSQL.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Console
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <li><Link to="/dashboard" style={{ color: "#94a3b8" }}>Dashboard</Link></li>
                <li><Link to="/patients" style={{ color: "#94a3b8" }}>Patient Registry</Link></li>
                <li><Link to="/upload" style={{ color: "#94a3b8" }}>Scan Prescription</Link></li>
                <li><Link to="/search" style={{ color: "#94a3b8" }}>Search Archive</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                Account
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <li><Link to="/login" style={{ color: "#94a3b8" }}>Doctor Sign In</Link></li>
                <li><Link to="/signup" style={{ color: "#94a3b8" }}>Register Practice</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1140,
            margin: "20px auto 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 11.5,
            color: "#64748b",
          }}
        >
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} PrescriptOCR Clinical Systems. All rights reserved.
          </p>
          <p style={{ margin: 0 }}>
            Medical Clinical Records Management Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
