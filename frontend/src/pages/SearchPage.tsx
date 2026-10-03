import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Star, FileSearch, FileText, CheckCircle2 } from "lucide-react";
import { TagBadge } from "../components/prescription/TagBadge";
import { OCRConfidenceIndicator } from "../components/prescription/OCRConfidenceIndicator";
import { getInitials, formatDate } from "../lib/utils";
import type { Patient, Prescription } from "../types";
import api from "../lib/api";

interface SearchResult {
  prescription: Prescription;
  patient: Patient | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/prescriptions/search?q=${encodeURIComponent(q.trim())}`);
      setResults(res.data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const onQueryChange = (q: string) => {
    setQuery(q);
    const t = setTimeout(() => handleSearch(q), 350);
    return () => clearTimeout(t);
  };

  return (
    <div style={{ minHeight: "100%", background: "var(--bg-canvas)" }}>
      {/* Sticky Header */}
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
            Prescription Search Registry
          </h1>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
            Instant optical query across patient names, telephone numbers, medicine entities, and summaries
          </p>
        </div>
      </div>

      <div style={{ padding: "32px 36px 60px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
        {/* Search Bar */}
        <div style={{ position: "relative", maxWidth: 640 }}>
          <Search
            size={18}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by medicine name, patient name, phone, or clinical symptom..."
            style={{
              width: "100%",
              padding: "13px 48px 13px 48px",
              borderRadius: 8,
              background: "var(--input-bg)",
              border: "1px solid var(--border-input)",
              color: "var(--text-primary)",
              fontSize: 14,
              outline: "none",
              fontFamily: "inherit",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
          />
          {loading && (
            <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid var(--accent-primary)",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          )}
        </div>

        {!searched && (
          <div className="clinical-card" style={{ padding: "64px 20px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-subtle)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "var(--accent-primary)" }}>
              <FileSearch size={24} />
            </div>
            <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 16 }}>
              Query the Central Prescription Archive
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4, maxWidth: 380, marginInline: "auto" }}>
              Type at least 2 characters to search across transcribed drug formulations, patient charts, and doctor instructions.
            </p>
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="clinical-card" style={{ padding: "64px 20px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#f87171" }}>
              <Search size={22} />
            </div>
            <p style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 16 }}>No clinical matches found</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
              No prescription record matched "{query}". Try checking medication spelling or searching by phone.
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "var(--accent-primary)", background: "var(--accent-subtle)", padding: "3px 8px", borderRadius: 4, border: "1px solid var(--accent-border)", fontWeight: 700 }}>
                {results.length} MATCHING CLINICAL DOSSIER{results.length !== 1 ? "S" : ""}
              </span>
            </div>

            <div className="clinical-card" style={{ overflow: "hidden" }}>
              {results.map(({ prescription, patient }) => {
                const tags = (prescription.tags as string[]) ?? [];
                return (
                  <Link
                    key={prescription.id}
                    to={`/prescriptions/${prescription.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 20px",
                      borderBottom: "1px solid var(--border-subtle)",
                      background: "var(--bg-surface)",
                      textDecoration: "none",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-subtle)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                        background: "var(--accent-primary)",
                      }}
                    >
                      {patient ? getInitials(patient.name) : "Rx"}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                          {patient?.name ?? "Unknown Patient"}
                        </p>
                        {prescription.important && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.14)", padding: "1px 6px", borderRadius: 4, border: "1px solid rgba(245,158,11,0.3)" }}>
                            <Star size={10} fill="#f59e0b" /> PRIORITY
                          </span>
                        )}
                        <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                          · {formatDate(prescription.createdAt)}
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {prescription.aiSummary || "Clinical prescription record"}
                      </p>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                        <OCRConfidenceIndicator confidence={prescription.ocrConfidence} />
                        {tags.slice(0, 3).map((tag) => (
                          <TagBadge key={tag} tag={tag} size="sm" />
                        ))}
                      </div>
                    </div>

                    <ArrowRight size={16} color="var(--text-muted)" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
