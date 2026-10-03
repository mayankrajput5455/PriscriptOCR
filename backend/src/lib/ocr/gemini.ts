import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { jsonrepair } from "jsonrepair";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const VISION_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-3.7-flash",
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

export type GeminiResponse = z.infer<typeof GeminiResponseSchema>;

const GENERATION_CONFIG = {
  temperature: 0.1,
  topP: 0.8,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  thinkingConfig: { thinkingBudget: 0 },
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
- CRITICAL: All string values MUST be valid JSON strings. Escape every backslash as \\\\ (e.g. write c\\\\o instead of c\\o, 1\\\\2 instead of 1\\2). Never emit unescaped backslashes or raw newlines inside JSON strings.
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

async function callWithRetry(
  makeCall: (modelName: string) => Promise<string>,
  models = [...VISION_MODELS] as string[]
): Promise<string> {
  let lastError: unknown = null;
  for (const modelName of models) {
    const MAX_ATTEMPTS = 2;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await makeCall(modelName);
      } catch (err) {
        lastError = err;
        const isLast = attempt === MAX_ATTEMPTS;
        if (isRetryable(err) && !isLast) {
          const delay = 1500 * attempt;
          console.warn(`[Gemini] ${modelName} overloaded (attempt ${attempt}), retrying in ${delay}ms...`);
          await sleep(delay);
        } else {
          console.warn(`[Gemini] ${modelName} failed (attempt ${attempt}):`, err instanceof Error ? err.message : err);
          break;
        }
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("All Gemini models are currently unavailable. Please try again in a moment.");
}

function cleanJsonText(raw: string): string {
  let str = raw.trim();
  const firstBrace = str.indexOf("{");
  const lastBrace = str.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    str = str.slice(firstBrace, lastBrace + 1);
  } else {
    str = str
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
  }
  return str;
}

function sanitizeEscapes(str: string): string {
  let out = "";
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (!inString) {
      if (ch === '"') {
        inString = true;
        isEscaped = false;
      }
      out += ch;
      continue;
    }

    if (isEscaped) {
      if (ch === '"' || ch === '\\' || ch === '/' || ch === 'b' || ch === 'f' || ch === 'n' || ch === 'r' || ch === 't') {
        out += ch;
      } else if (ch === 'u') {
        const hex = str.slice(i + 1, i + 5);
        if (/^[0-9a-fA-F]{4}$/.test(hex)) {
          out += 'u' + hex;
          i += 4;
        } else {
          out = out.slice(0, -1) + '\\\\u';
        }
      } else {
        // Bad escaped character (e.g., \o, \1, \d, \ ) -> turn previous \ into \\ and preserve char
        out = out.slice(0, -1) + '\\\\' + ch;
      }
      isEscaped = false;
    } else {
      if (ch === '\\') {
        isEscaped = true;
        out += '\\';
      } else if (ch === '"') {
        inString = false;
        out += '"';
      } else if (ch === '\n') {
        out += '\\n';
      } else if (ch === '\r') {
        out += '\\r';
      } else if (ch === '\t') {
        out += '\\t';
      } else {
        out += ch;
      }
    }
  }

  if (inString && isEscaped) {
    out += '\\';
  }
  if (inString) {
    out += '"';
  }
  return out;
}

function repairJson(s: string): string {
  let result = s;
  const stack: string[] = [];
  let inString = false;
  let i = 0;

  while (i < result.length) {
    const ch = result[i];
    if (inString) {
      if (ch === "\\" && i + 1 < result.length) { i += 2; continue; }
      if (ch === '"') inString = false;
    } else {
      if (ch === '"') { inString = true; stack.push('"'); }
      else if (ch === '{') stack.push('}');
      else if (ch === '[') stack.push(']');
      else if (ch === '}' || ch === ']') stack.pop();
    }
    i++;
  }

  if (inString) result += '"';
  while (stack.length > 0) {
    const close = stack.pop()!;
    if (close !== '"') result += close;
  }
  return result;
}

function parseGeminiJson(raw: string): unknown {
  const cleaned = cleanJsonText(raw);

  // 1. Standard fast JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    console.warn("[Gemini] Standard parse failed, trying jsonrepair:", err1 instanceof Error ? err1.message : err1);
  }

  // 2. Battle-tested jsonrepair library
  try {
    const repaired = jsonrepair(cleaned);
    return JSON.parse(repaired);
  } catch (err2) {
    console.warn("[Gemini] jsonrepair failed, trying escape sanitizer:", err2 instanceof Error ? err2.message : err2);
  }

  // 3. Escape sanitizer + jsonrepair (handles unescaped backslashes like \o, \1, \ , raw newlines)
  try {
    const sanitized = sanitizeEscapes(cleaned);
    const repaired = jsonrepair(sanitized);
    return JSON.parse(repaired);
  } catch (err3) {
    console.warn("[Gemini] Sanitized jsonrepair failed, trying fallback:", err3 instanceof Error ? err3.message : err3);
  }

  // 4. Fallback manual brace & quote closer
  const fallback = repairJson(sanitizeEscapes(cleaned));
  return JSON.parse(fallback);
}

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
