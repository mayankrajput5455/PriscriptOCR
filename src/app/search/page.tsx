"use client";

import { useState, useCallback } from "react";
import { searchPrescriptions } from "@/actions/prescriptions";
import { TagBadge } from "@/components/prescription/TagBadge";
import { OCRConfidenceIndicator } from "@/components/prescription/OCRConfidenceIndicator";
import { formatDate, getInitials } from "@/lib/utils";
import { Search, ArrowRight, Star, FileSearch } from "lucide-react";
import Link from "next/link";
import type { Prescription, Patient } from "@/db/schema";
import type { Metadata } from "next";

type SearchResult = {
  prescription: Prescription;
  patient: Patient | null;
};

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
    const result = await searchPrescriptions(q.trim());
    if (result.success) {
      setResults((result.results as SearchResult[]) ?? []);
    }
    setLoading(false);
  }, []);

  const onQueryChange = (q: string) => {
    setQuery(q);
    const timeout = setTimeout(() => handleSearch(q), 400);
    return () => clearTimeout(timeout);
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Search</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search prescriptions by patient name, phone, medicine, or summary
        </p>
      </div>

      {/* Search bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="e.g. Paracetamol, John Doe, 9876543210..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors shadow-lg"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results */}
      {!searched && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <FileSearch className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-semibold">Search across all prescriptions</p>
          <p className="text-slate-600 text-sm mt-1 max-w-sm">
            Find records by patient name, phone number, medicine name, or prescription content
          </p>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400 font-semibold">No results found</p>
          <p className="text-slate-600 text-sm mt-1">
            Try a different search term
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          {results.map(({ prescription, patient }) => {
            const tags = (prescription.tags as string[]) ?? [];
            return (
              <Link
                key={prescription.id}
                href={`/prescriptions/${prescription.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {patient ? getInitials(patient.name) : "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-200 truncate">
                      {patient?.name ?? "Unknown Patient"}
                    </p>
                    {prescription.important && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    <span className="text-xs text-slate-600 shrink-0">
                      {formatDate(prescription.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {prescription.aiSummary || "No summary"}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <OCRConfidenceIndicator confidence={prescription.ocrConfidence} />
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
  );
}
