import { Router, Response } from "express";
import multer from "multer";
import { db } from "../db";
import { prescriptions, patients } from "../db/schema";
import { eq, desc, ilike, or, and } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { uploadToCloudinary } from "../lib/cloudinary";
import { preprocessImage } from "../lib/ocr/preprocess";
import { analyzeImageWithGemini } from "../lib/ocr/gemini";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.use(requireAuth);

// POST /api/prescriptions/upload — upload & process image
router.post("/upload", upload.single("file"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, error: "No file uploaded" });
    return;
  }

  const patientId = req.body.patientId as string;
  if (!patientId) {
    res.status(400).json({ success: false, error: "Missing patient ID" });
    return;
  }

  try {
    const rawBuffer = req.file.buffer;
    const timestamp = Date.now();

    const [imageUrl, processedBuffer] = await Promise.all([
      uploadToCloudinary(rawBuffer, `prescription-${patientId}-${timestamp}`),
      preprocessImage(rawBuffer),
    ]);

    const geminiResult = await analyzeImageWithGemini(processedBuffer, "image/jpeg");

    res.json({
      success: true,
      imageUrl,
      rawOcr: geminiResult.raw_ocr,
      ocrConfidence: geminiResult.confidence,
      gemini: geminiResult,
    });
  } catch (err) {
    console.error("uploadAndProcess error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Processing failed",
    });
  }
});

// POST /api/prescriptions — save prescription
router.post("/", async (req: AuthRequest, res: Response) => {
  const {
    patientId, imageUrl, rawOcr, ocrConfidence,
    correctedText, aiSummary, medicines, importantFindings, tags, doctorNotes,
  } = req.body;

  if (!patientId || !imageUrl) {
    res.status(400).json({ success: false, error: "Missing required fields" });
    return;
  }

  try {
    const [prescription] = await db
      .insert(prescriptions)
      .values({
        userId: req.user!.userId,
        patientId,
        imageUrl,
        rawOcr: rawOcr || "",
        ocrConfidence: Math.round(Number(ocrConfidence) || 0),
        correctedText: correctedText || "",
        aiSummary: aiSummary || "",
        medicinesJson: (medicines ?? []) as any,
        importantFindings: (importantFindings ?? []) as any,
        tags: (tags ?? []) as any,
        doctorNotes: doctorNotes ?? "",
      })
      .returning();
    res.json({ success: true, prescription });
  } catch (err) {
    console.error("savePrescription error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to save prescription",
    });
  }
});

// GET /api/prescriptions/dashboard — dashboard stats
router.get("/dashboard", async (req: AuthRequest, res: Response) => {
  const runWithRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
    try { return await fn(); }
    catch (err) {
      if (retries > 0) { await new Promise((r) => setTimeout(r, 200)); return runWithRetry(fn, retries - 1); }
      throw err;
    }
  };

  try {
    const userId = req.user!.userId;

    const [totalPatients, totalPrescriptions, recentPrescriptions] = await Promise.all([
      runWithRetry(() => db.select({ id: patients.id }).from(patients).where(eq(patients.userId, userId))),
      runWithRetry(() => db.select({ id: prescriptions.id }).from(prescriptions).where(eq(prescriptions.userId, userId))),
      runWithRetry(() =>
        db
          .select({ prescription: prescriptions, patient: patients })
          .from(prescriptions)
          .leftJoin(patients, eq(prescriptions.patientId, patients.id))
          .where(eq(prescriptions.userId, userId))
          .orderBy(desc(prescriptions.createdAt))
          .limit(5)
      ),
    ]);

    res.json({
      success: true,
      totalPatients: totalPatients.length,
      totalPrescriptions: totalPrescriptions.length,
      recentPrescriptions,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.json({ success: true, totalPatients: 0, totalPrescriptions: 0, recentPrescriptions: [] });
  }
});

// GET /api/prescriptions/search?q=query — search
router.get("/search", async (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string) || "";
  try {
    const results = await db
      .select({ prescription: prescriptions, patient: patients })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(
        and(
          eq(prescriptions.userId, req.user!.userId),
          or(
            ilike(patients.name, `%${query}%`),
            ilike(patients.phone, `%${query}%`),
            ilike(prescriptions.correctedText, `%${query}%`),
            ilike(prescriptions.aiSummary, `%${query}%`),
            ilike(prescriptions.doctorNotes, `%${query}%`)
          )
        )
      )
      .orderBy(desc(prescriptions.createdAt))
      .limit(50);
    res.json({ success: true, results });
  } catch (err) {
    console.error("searchPrescriptions error:", err);
    res.status(500).json({ success: false, error: "Search failed", results: [] });
  }
});

// GET /api/prescriptions/patient/:patientId — by patient
router.get("/patient/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    const results = await db
      .select()
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.patientId, req.params.patientId),
          eq(prescriptions.userId, req.user!.userId)
        )
      )
      .orderBy(desc(prescriptions.important), desc(prescriptions.createdAt));
    res.json({ success: true, prescriptions: results });
  } catch (err) {
    console.error("getPrescriptionsByPatient error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch prescriptions", prescriptions: [] });
  }
});

// GET /api/prescriptions/:id — single prescription
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const [result] = await db
      .select({ prescription: prescriptions, patient: patients })
      .from(prescriptions)
      .leftJoin(patients, eq(prescriptions.patientId, patients.id))
      .where(
        and(
          eq(prescriptions.id, req.params.id),
          eq(prescriptions.userId, req.user!.userId)
        )
      );
    if (!result) {
      res.status(404).json({ success: false, error: "Prescription not found", prescription: null, patient: null });
      return;
    }
    res.json({ success: true, prescription: result.prescription, patient: result.patient });
  } catch (err) {
    console.error("getPrescriptionById error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch prescription", prescription: null, patient: null });
  }
});

// PUT /api/prescriptions/:id — update prescription
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const { correctedText, aiSummary, medicines, doctorNotes, tags, importantFindings } = req.body;
  try {
    const updateData: Record<string, any> = {};
    if (correctedText !== undefined) updateData.correctedText = correctedText;
    if (aiSummary !== undefined) updateData.aiSummary = aiSummary;
    if (medicines !== undefined) updateData.medicinesJson = medicines;
    if (doctorNotes !== undefined) updateData.doctorNotes = doctorNotes;
    if (tags !== undefined) updateData.tags = tags;
    if (importantFindings !== undefined) updateData.importantFindings = importantFindings;

    const [prescription] = await db
      .update(prescriptions)
      .set(updateData)
      .where(and(eq(prescriptions.id, req.params.id), eq(prescriptions.userId, req.user!.userId)))
      .returning();
    res.json({ success: true, prescription });
  } catch (err) {
    console.error("updatePrescription error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to update prescription",
    });
  }
});

// PATCH /api/prescriptions/:id/toggle-important
router.patch("/:id/toggle-important", async (req: AuthRequest, res: Response) => {
  try {
    const [current] = await db
      .select({ important: prescriptions.important })
      .from(prescriptions)
      .where(and(eq(prescriptions.id, req.params.id), eq(prescriptions.userId, req.user!.userId)));

    if (!current) {
      res.status(404).json({ success: false, error: "Prescription not found" });
      return;
    }

    const [updated] = await db
      .update(prescriptions)
      .set({ important: !current.important })
      .where(and(eq(prescriptions.id, req.params.id), eq(prescriptions.userId, req.user!.userId)))
      .returning();

    res.json({ success: true, important: updated.important });
  } catch (err) {
    console.error("toggleImportant error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to toggle important",
    });
  }
});

// DELETE /api/prescriptions/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await db
      .delete(prescriptions)
      .where(and(eq(prescriptions.id, req.params.id), eq(prescriptions.userId, req.user!.userId)));
    res.json({ success: true });
  } catch (err) {
    console.error("deletePrescription error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete prescription",
    });
  }
});

export default router;
