import { createWorker } from "tesseract.js";
import type { OCRResult } from "@/types";

/**
 * Runs Tesseract OCR on a preprocessed image buffer.
 * Returns the extracted text and average confidence score.
 */
export async function runOCR(imageBuffer: Buffer): Promise<OCRResult> {
  const worker = await createWorker("eng", 1, {
    logger: () => {}, // suppress verbose logging
  });

  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(imageBuffer);

    return {
      text: text.trim(),
      confidence: Math.round(confidence),
    };
  } finally {
    await worker.terminate();
  }
}
