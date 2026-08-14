import sharp from "sharp";

/**
 * Preprocesses a prescription image for better OCR accuracy.
 * Steps: grayscale → auto-rotate → resize → normalize contrast → threshold
 */
export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  const processed = await sharp(buffer)
    .rotate()                                    // auto-rotate from EXIF
    .resize({ width: 2000, withoutEnlargement: true })
    .grayscale()                                 // reduce noise, smaller payload
    .normalise()                                 // auto contrast/brightness
    .sharpen({ sigma: 1.0 })                     // light sharpen — don't over-process
    // NOTE: no .threshold() — binarization hurts Gemini Vision (was for Tesseract)
    .jpeg({ quality: 90 })                       // JPEG is smaller than PNG, faster upload
    .toBuffer();

  return processed;
}

/**
 * Check basic image quality metrics using sharp metadata.
 */
export async function analyzeImageQuality(buffer: Buffer): Promise<{
  width: number;
  height: number;
  quality: "good" | "low_resolution" | "too_small";
}> {
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width < 200 || height < 200) {
    return { width, height, quality: "too_small" };
  }
  if (width < 600 || height < 600) {
    return { width, height, quality: "low_resolution" };
  }
  return { width, height, quality: "good" };
}
