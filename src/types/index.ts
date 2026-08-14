// Shared TypeScript types for PrescriptOCR

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  createdAt: Date;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  imageUrl: string;
  rawOcr: string;
  correctedText: string;
  aiSummary: string;
  medicinesJson: Medicine[];
  doctorNotes: string;
  tags: string[];
  important: boolean;
  createdAt: Date;
  patient?: Patient;
}

export interface GeminiResponse {
  raw_ocr?: string;         // OCR text as seen in image (from Vision mode)
  corrected_text: string;
  summary: string;
  medicines: Medicine[];
  important_findings: string[];
  tags: string[];
  confidence?: number;      // Vision OCR confidence 0-100
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export interface ProcessingResult {
  rawOcr: string;
  ocrConfidence: number;
  gemini: GeminiResponse;
  imageUrl: string;
}

export type OCRConfidenceLevel = "Excellent" | "Good" | "Needs Review";

export function getConfidenceLevel(confidence: number): OCRConfidenceLevel {
  if (confidence >= 80) return "Excellent";
  if (confidence >= 60) return "Good";
  return "Needs Review";
}

export interface DashboardStats {
  totalPatients: number;
  totalPrescriptions: number;
  recentPrescriptions: (Prescription & { patient: Patient })[];
}
