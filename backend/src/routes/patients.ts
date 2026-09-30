import { Router, Response } from "express";
import { db } from "../db";
import { patients } from "../db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

const PatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(0).max(150),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
});

// GET /api/patients
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const results = await db
      .select()
      .from(patients)
      .where(eq(patients.userId, req.user!.userId))
      .orderBy(patients.createdAt);
    res.json({ success: true, patients: results });
  } catch (err) {
    console.error("getAllPatients error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch patients", patients: [] });
  }
});

// GET /api/patients/search?q=query
router.get("/search", async (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string) || "";
  try {
    const results = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.userId, req.user!.userId),
          or(ilike(patients.name, `%${query}%`), ilike(patients.phone, `%${query}%`))
        )
      )
      .limit(20);
    res.json({ success: true, patients: results });
  } catch (err) {
    console.error("searchPatients error:", err);
    res.status(500).json({ success: false, error: "Search failed", patients: [] });
  }
});

// GET /api/patients/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, req.params.id), eq(patients.userId, req.user!.userId)));
    if (!patient) {
      res.status(404).json({ success: false, error: "Patient not found", patient: null });
      return;
    }
    res.json({ success: true, patient });
  } catch (err) {
    console.error("getPatientById error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch patient", patient: null });
  }
});

// POST /api/patients
router.post("/", async (req: AuthRequest, res: Response) => {
  const raw = {
    name: req.body.name as string,
    age: req.body.age,
    gender: req.body.gender as string,
    phone: req.body.phone as string,
  };

  const parsed = PatientSchema.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const [patient] = await db
      .insert(patients)
      .values({ ...parsed.data, userId: req.user!.userId })
      .returning();
    res.json({ success: true, patient });
  } catch (err) {
    console.error("createPatient error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to create patient",
    });
  }
});

// PUT /api/patients/:id
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const raw = {
    name: req.body.name as string,
    age: req.body.age,
    gender: req.body.gender as string,
    phone: req.body.phone as string,
  };

  const parsed = PatientSchema.safeParse(raw);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    return;
  }

  try {
    const [patient] = await db
      .update(patients)
      .set(parsed.data)
      .where(and(eq(patients.id, req.params.id), eq(patients.userId, req.user!.userId)))
      .returning();
    if (!patient) {
      res.status(404).json({ success: false, error: "Patient not found" });
      return;
    }
    res.json({ success: true, patient });
  } catch (err) {
    console.error("updatePatient error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to update patient",
    });
  }
});

// DELETE /api/patients/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await db
      .delete(patients)
      .where(and(eq(patients.id, req.params.id), eq(patients.userId, req.user!.userId)));
    res.json({ success: true });
  } catch (err) {
    console.error("deletePatient error:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete patient",
    });
  }
});

export default router;
