"use server";

import { db } from "@/db";
import { prescriptions, patients } from "@/db/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { preprocessImage } from "@/lib/ocr/preprocess";
import { analyzeImageWithGemini } from "@/lib/ocr/gemini";
import type { Medicine } from "@/types";

// ─── Upload + Process Pipeline ───────────────────────────────────────────────

export async function uploadAndProcess(formData: FormData) {
  const file = formData.get("file") as File;
  const patientId = formData.get("patientId") as string;

  if (!file || !patientId) {
    return { success: false, error: "Missing file or patient ID" };
  }

  try {
    // 1. Get raw buffer
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 2. Upload original to Cloudinary and preprocess for Vision in parallel
    const timestamp = Date.now();
    const [imageUrl, processedBuffer] = await Promise.all([
      uploadToCloudinary(rawBuffer, `prescription-${patientId}-${timestamp}`),
      preprocessImage(rawBuffer),
    ]);

    // 3. Gemini Vision: OCR + analysis in one multimodal call
    //    Dramatically better than Tesseract for handwritten prescriptions
    //    Auto-retries on 503 overload, falls back to lighter models
    const geminiResult = await analyzeImageWithGemini(processedBuffer, "image/jpeg");

    return {
      success: true,
      imageUrl,
      rawOcr: geminiResult.raw_ocr,
      ocrConfidence: geminiResult.confidence,
      gemini: geminiResult,
    };
  } catch (err) {
    console.error("uploadAndProcess error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Processing failed",
    };
  }
}

// ─── Save Prescription ────────────────────────────────────────────────────────

export async function savePrescription(data: {
  patientId: string;
  imageUrl: string;
  rawOcr: string;
  ocrConfidence: number;
  correctedText: string;
  aiSummary: string;
  medicines: Medicine[];
  importantFindings: string[];
  tags: string[];
  doctorNotes?: string;
}) {
  try {
    const [prescription] = await db
      .insert(prescriptions)
      .values({
        patientId: data.patientId,
        imageUrl: data.imageUrl,
        rawOcr: data.rawOcr,
        ocrConfidence: data.ocrConfidence,
        correctedText: data.correctedText,
        aiSummary: data.aiSummary,
        medicinesJson: data.medicines as unknown as typeof prescriptions.$inferInsert["medicinesJson"],
        importantFindings: data.importantFindings as unknown as typeof prescriptions.$inferInsert["importantFindings"],
        tags: data.tags as unknown as typeof prescriptions.$inferInsert["tags"],
        doctorNotes: data.doctorNotes ?? "",
      })
      .returning();

    revalidatePath(`/patients/${data.patientId}`);
    revalidatePath("/dashboard");
    revalidatePath("/prescriptions");
    return { success: true, prescription };
  } catch (err) {
    console.error("savePrescription error:", err);
    return { success: false, error: "Failed to save prescription" };
  }
}

// ─── Update Prescription ─────────────────────────────────────────────────────

export async function updatePrescription(
  id: string,
  data: Partial<{
    correctedText: string;
    aiSummary: string;
    medicines: Medicine[];
    doctorNotes: string;
    tags: string[];
    importantFindings: string[];
  }>
) {
  try {
    const [prescription] = await db
      .update(prescriptions)
      .set({
        ...(data.correctedText !== undefined && {
          correctedText: data.correctedText,
        }),
        ...(data.aiSummary !== undefined && { aiSummary: data.aiSummary }),
        ...(data.medicines !== undefined && {
          medicinesJson: data.medicines as unknown as typeof prescriptions.$inferInsert["medicinesJson"],
        }),
        ...(data.doctorNotes !== undefined && {
          doctorNotes: data.doctorNotes,
        }),
        ...(data.tags !== undefined && {
          tags: data.tags as unknown as typeof prescriptions.$inferInsert["tags"],
        }),
        ...(data.importantFindings !== undefined && {
          importantFindings: data.importantFindings as unknown as typeof prescriptions.$inferInsert["importantFindings"],
        }),
      })
      .where(eq(prescriptions.id, id))
      .returning();

    revalidatePath(`/prescriptions/${id}`);
    revalidatePath(`/patients/${prescription.patientId}`);
    return { success: true, prescription };
  } catch (err) {
    console.error("updatePrescription error:", err);
    return { success: false, error: "Failed to update prescription" };
  }
}

// ─── Toggle Important ─────────────────────────────────────────────────────────

export async function toggleImportant(id: string) {
  try {
    const [current] = await db
      .select({ important: prescriptions.important })
      .from(prescriptions)
      .where(eq(prescriptions.id, id));

    const [updated] = await db
      .update(prescriptions)
      .set({ important: !current.important })
      .where(eq(prescriptions.id, id))
      .returning();

    revalidatePath(`/prescriptions/${id}`);
    revalidatePath(`/patients/${updated.patientId}`);
    return { success: true, important: updated.important };
  } catch (err) {
    console.error("toggleImportant error:", err);
    return { success: false, error: "Failed to toggle important" };
  }
}

// ─── Delete Prescription ──────────────────────────────────────────────────────

export async function deletePrescription(id: string, patientId: string) {
  try {
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
    revalidatePath(`/patients/${patientId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("deletePrescription error:", err);
    return { success: false, error: "Failed to delete prescription" };
  }
}

// ─── Get Prescriptions ────────────────────────────────────────────────────────

export async function getPrescriptionsByPatient(patientId: string) {
  try {
    const results = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.important), desc(prescriptions.createdAt));
    return { success: true, prescriptions: results };
  } catch (err) {
    console.error("getPrescriptionsByPatient error:", err);
    return { success: false, error: "Failed to fetch prescriptions", prescriptions: [] };
  }
}

export async function getPrescriptionById(id: string) {
  try {
    const [prescription] = await db
      .select({
        prescription: prescriptions,
        patient: patients,
      })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(eq(prescriptions.id, id));

    return { success: true, ...prescription };
  } catch (err) {
    console.error("getPrescriptionById error:", err);
    return { success: false, error: "Failed to fetch prescription", prescription: null, patient: null };
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

export async function searchPrescriptions(query: string) {
  try {
    const results = await db
      .select({
        prescription: prescriptions,
        patient: patients,
      })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(
        or(
          ilike(patients.name, `%${query}%`),
          ilike(patients.phone, `%${query}%`),
          ilike(prescriptions.correctedText, `%${query}%`),
          ilike(prescriptions.aiSummary, `%${query}%`)
        )
      )
      .orderBy(desc(prescriptions.createdAt))
      .limit(50);

    return { success: true, results };
  } catch (err) {
    console.error("searchPrescriptions error:", err);
    return { success: false, error: "Search failed", results: [] };
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  try {
    const [totalPatients, totalPrescriptions, recentPrescriptions] = await Promise.all([
      db.select().from(patients),
      db.select().from(prescriptions),
      db
        .select({
          prescription: prescriptions,
          patient: patients,
        })
        .from(prescriptions)
        .leftJoin(patients, eq(prescriptions.patientId, patients.id))
        .orderBy(desc(prescriptions.createdAt))
        .limit(5),
    ]);

    return {
      success: true,
      totalPatients: totalPatients.length,
      totalPrescriptions: totalPrescriptions.length,
      recentPrescriptions,
    };
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return {
      success: false,
      error: "Failed to fetch stats",
      totalPatients: 0,
      totalPrescriptions: 0,
      recentPrescriptions: [],
    };
  }
}
