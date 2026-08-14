"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { GeminiResponse } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model priority list — tried in order if a model returns 503/429/404
const VISION_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
] as const;

const MedicineSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
});

const GeminiResponseSchema = z.object({
  raw_ocr: z.string(),
  corrected_text: z.string(),
  summary: z.string(),
  medicines: z.array(MedicineSchema),
  important_findings: z.array(z.string()),
  tags: z.array(z.string()),
  confidence: z.number().min(0).max(100),
});

// Generation config — thinking disabled so all tokens go to actual JSON output
const GENERATION_CONFIG = {
  temperature: 0.1,
  topP: 0.8,
  maxOutputTokens: 8192,          // large enough for any prescription
  responseMimeType: "application/json",
  thinkingConfig: { thinkingBudget: 0 }, // disable thinking — saves tokens, prevents truncation
} as const;

const VISION_PROMPT = `You are a medical prescription OCR and analysis AI. You will receive an image of a handwritten or printed prescription.

Your job is to:
1. Read and transcribe ALL text visible in the prescription image exactly as written (raw OCR)
2. Correct OCR errors, fix medical abbreviations, and format the text clearly
3. Extract all medicines with their dosage and frequency
4. Generate a concise clinical summary (2-3 sentences)
5. Identify any important medical findings or warnings
6. Generate relevant tags (e.g., Fever, Antibiotic, Pediatric, Diabetes)
7. Estimate your OCR confidence (0-100) based on image clarity and handwriting legibility

RULES:
- NEVER hallucinate or add information not visible in the image
- Preserve uncertain text as-is in raw_ocr
- Prefix unclear medicine names with "Possibly " (e.g., "Possibly Levolin")
- Return ONLY valid JSON, no markdown, no explanation
- If the image is unreadable, return empty fields and confidence 0

Return ONLY this exact JSON structure:
{
  "raw_ocr": "exact text as visible in the image, preserving original wording",
  "corrected_text": "clean formatted version with corrections",
  "summary": "brief clinical summary",
  "medicines": [
    { "name": "medicine name", "dosage": "dosage amount", "frequency": "how often" }
  ],
  "important_findings": ["finding 1", "finding 2"],
  "tags": ["tag1", "tag2"],
  "confidence": 85
}`;

/** Sleep for ms milliseconds */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Returns true if the error is a transient server-side error worth retrying */
function isRetryable(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message;
    return (
      msg.includes("503") ||
      msg.includes("429") ||
      msg.includes("Service Unavailable") ||
      msg.includes("Too Many Requests") ||
      msg.includes("high demand")
    );
  }
  return false;
}

/**
 * Calls a Gemini model with exponential backoff retries.
 * Falls back to the next model in VISION_MODELS on persistent failure.
 */
async function callWithRetry(
  makeCall: (modelName: string) => Promise<string>,
  models = [...VISION_MODELS] as string[]
): Promise<string> {
  for (const modelName of models) {
    const MAX_ATTEMPTS = 3;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await makeCall(modelName);
      } catch (err) {
        const isLast = attempt === MAX_ATTEMPTS;
        const isLastModel = modelName === models[models.length - 1];

        if (isRetryable(err)) {
          if (isLast) {
            console.warn(`[Gemini] ${modelName} failed after ${MAX_ATTEMPTS} attempts, trying next model...`);
            break; // try next model
          }
          const delay = 2000 * attempt; // 2s, 4s
          console.warn(`[Gemini] ${modelName} overloaded (attempt ${attempt}), retrying in ${delay}ms...`);
          await sleep(delay);
        } else {
          // Non-retryable error (bad request, auth, etc.) — throw immediately
          throw err;
        }
      }
    }
    if (modelName === models[models.length - 1]) {
      throw new Error("All Gemini models are currently unavailable. Please try again in a moment.");
    }
  }
  throw new Error("Gemini: all retry attempts exhausted.");
}

/** Parse and strip markdown fences from Gemini JSON response.
 * If JSON is truncated mid-string, attempt a best-effort repair before giving up.
 */
function parseGeminiJson(raw: string) {
  const jsonText = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First try: clean JSON
  try {
    return JSON.parse(jsonText);
  } catch {
    // Second try: repair truncated JSON by closing open structures
    const repaired = repairJson(jsonText);
    return JSON.parse(repaired);
  }
}

/** Attempts to close unclosed JSON strings, arrays and objects from a truncated response */
function repairJson(s: string): string {
  let result = s;
  const stack: string[] = [];
  let inString = false;
  let i = 0;

  while (i < result.length) {
    const ch = result[i];
    if (inString) {
      if (ch === "\\" && i + 1 < result.length) { i += 2; continue; } // skip escaped char
      if (ch === '"') inString = false;
    } else {
      if (ch === '"') { inString = true; stack.push('"'); }
      else if (ch === '{') stack.push('}');
      else if (ch === '[') stack.push(']');
      else if (ch === '}' || ch === ']') stack.pop();
    }
    i++;
  }

  // Close any unterminated string first
  if (inString) result += '"';
  // Close remaining open structures in reverse order
  while (stack.length > 0) {
    const close = stack.pop()!;
    if (close !== '"') result += close; // skip the string marker we pushed
  }
  return result;
}

/**
 * Analyzes a prescription image directly using Gemini Vision.
 * Performs OCR + medical analysis in a single multimodal API call.
 * Automatically retries on 503 overload and falls back to lighter models.
 */
export async function analyzeImageWithGemini(
  imageBuffer: Buffer,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<GeminiResponse & { raw_ocr: string; confidence: number }> {
  const base64Image = imageBuffer.toString("base64");

  const raw = await callWithRetry(async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: VISION_PROMPT },
            { inlineData: { mimeType, data: base64Image } },
          ],
        },
      ],
      generationConfig: GENERATION_CONFIG,
    });
    return result.response.text();
  });

  const parsed = parseGeminiJson(raw);
  return GeminiResponseSchema.parse(parsed);
}

/**
 * Legacy text-only analysis — kept for backward compatibility.
 */
export async function analyzeWithGemini(rawOcr: string): Promise<GeminiResponse> {
  const prompt = `You are a medical prescription analysis AI. Analyze this raw OCR text from a prescription.

Correct errors, extract medicines, generate summary and tags.

Return ONLY this JSON:
{
  "raw_ocr": "${rawOcr.slice(0, 50).replace(/"/g, "'")}...",
  "corrected_text": "corrected prescription text",
  "summary": "brief clinical summary",
  "medicines": [{ "name": "", "dosage": "", "frequency": "" }],
  "important_findings": [],
  "tags": [],
  "confidence": 70
}

Raw OCR Text:
${rawOcr || "(empty)"}`;

  const raw = await callWithRetry(async (modelName) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: GENERATION_CONFIG,
    });
    return result.response.text();
  });

  const parsed = parseGeminiJson(raw);
  return GeminiResponseSchema.parse(parsed);
}
