// Shared TypeScript types for PrescriptOCR Frontend

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  createdAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  id: string;
  userId: string;
  patientId: string;
  imageUrl: string;
  rawOcr: string;
  correctedText: string;
  aiSummary: string;
  medicinesJson: Medicine[];
  doctorNotes: string;
  tags: string[];
  important: boolean;
  ocrConfidence: number;
  importantFindings: string[];
  createdAt: string;
}

export interface GeminiResponse {
  raw_ocr?: string;
  corrected_text: string;
  summary: string;
  medicines: Medicine[];
  important_findings: string[];
  tags: string[];
  confidence?: number;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  clinicName: string;
  role: string;
}

export type OCRConfidenceLevel = "Excellent" | "Good" | "Needs Review";

export function getConfidenceLevel(confidence: number): OCRConfidenceLevel {
  if (confidence >= 80) return "Excellent";
  if (confidence >= 60) return "Good";
  return "Needs Review";
}
