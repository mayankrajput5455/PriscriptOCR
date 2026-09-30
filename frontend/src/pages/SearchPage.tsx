import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Star, FileSearch } from "lucide-react";
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
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
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
    const t = setTimeout(() => handleSearch(q), 400);
    return () => clearTimeout(t);
  };

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }} className="animate-fade-in">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>Search</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Search prescriptions by patient name, phone, medicine, or summary</p>
      </div>

      <div style={{ position: "relative", maxWidth: 560 }}>
        <Search size={20} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
        <input
          value={query} onChange={(e) => onQueryChange(e.target.value)}
          placeholder="e.g. Paracetamol, John Doe, 9876543210..."
          style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: 20, background: "#1e293b", border: "1px solid #334155", color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(0,0,0,0.25)" }}
        />
        {loading && (
          <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}>
            <div style={{ width: 16, height: 16, border: "2px solid #3b82f6", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        )}
      </div>

      {!searched && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", marginBottom: 16 }}>
            <FileSearch size={32} color="#475569" />
          </div>
          <p style={{ color: "#94a3b8", fontWeight: 600, fontSize: 16 }}>Search across all prescriptions</p>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 8, maxWidth: 320 }}>Find records by patient name, phone number, medicine name, or prescription content</p>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", marginBottom: 16 }}>
            <Search size={32} color="#475569" />
          </div>
          <p style={{ color: "#94a3b8", fontWeight: 600, fontSize: 16 }}>No results found</p>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 8 }}>Try a different search term</p>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          {results.map(({ prescription, patient }) => {
            const tags = (prescription.tags as string[] ?? []);
            return (
              <Link
                key={prescription.id} to={`/prescriptions/${prescription.id}`}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 12, border: "1px solid #1e293b", background: "rgba(15,23,42,0.5)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(30,41,59,0.6)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#334155"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(15,23,42,0.5)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1e293b"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0, background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                  {patient ? getInitials(patient.name) : "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{patient?.name ?? "Unknown Patient"}</p>
                    {prescription.important && <Star size={14} color="#fbbf24" fill="#fbbf24" />}
                    <span style={{ fontSize: 12, color: "#475569", flexShrink: 0 }}>{formatDate(prescription.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prescription.aiSummary || "No summary"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <OCRConfidenceIndicator confidence={prescription.ocrConfidence} />
                    {tags.slice(0, 3).map((tag) => <TagBadge key={tag} tag={tag} size="sm" />)}
                  </div>
                </div>
                <ArrowRight size={16} color="#475569" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
