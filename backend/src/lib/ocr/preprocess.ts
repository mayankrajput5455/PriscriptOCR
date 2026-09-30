import sharp from "sharp";

export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  const processed = await sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .grayscale()
    .normalise()
    .sharpen({ sigma: 1.0 })
    .jpeg({ quality: 90 })
    .toBuffer();
  return processed;
}

export async function analyzeImageQuality(buffer: Buffer): Promise<{
  width: number;
  height: number;
  quality: "good" | "low_resolution" | "too_small";
}> {
  const meta = await sharp(buffer).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width < 200 || height < 200) return { width, height, quality: "too_small" };
  if (width < 600 || height < 600) return { width, height, quality: "low_resolution" };
  return { width, height, quality: "good" };
}
