"use server";

import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.coerce.number().min(0).max(150),
  gender: z.enum(["Male", "Female", "Other"]),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
});

export async function createPatient(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    age: formData.get("age") as string,
    gender: formData.get("gender") as string,
    phone: formData.get("phone") as string,
  };

  const parsed = PatientSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const [patient] = await db
      .insert(patients)
      .values(parsed.data)
      .returning();
    revalidatePath("/patients");
    revalidatePath("/dashboard");
    return { success: true, patient };
  } catch (err) {
    console.error("createPatient error:", err);
    return { success: false, error: "Failed to create patient" };
  }
}

export async function updatePatient(id: string, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    age: formData.get("age") as string,
    gender: formData.get("gender") as string,
    phone: formData.get("phone") as string,
  };

  const parsed = PatientSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    const [patient] = await db
      .update(patients)
      .set(parsed.data)
      .where(eq(patients.id, id))
      .returning();
    revalidatePath("/patients");
    revalidatePath(`/patients/${id}`);
    return { success: true, patient };
  } catch (err) {
    console.error("updatePatient error:", err);
    return { success: false, error: "Failed to update patient" };
  }
}

export async function deletePatient(id: string) {
  try {
    await db.delete(patients).where(eq(patients.id, id));
    revalidatePath("/patients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("deletePatient error:", err);
    return { success: false, error: "Failed to delete patient" };
  }
}

export async function searchPatients(query: string) {
  try {
    const results = await db
      .select()
      .from(patients)
      .where(
        or(
          ilike(patients.name, `%${query}%`),
          ilike(patients.phone, `%${query}%`)
        )
      )
      .limit(20);
    return { success: true, patients: results };
  } catch (err) {
    console.error("searchPatients error:", err);
    return { success: false, error: "Search failed", patients: [] };
  }
}

export async function getAllPatients() {
  try {
    const results = await db
      .select()
      .from(patients)
      .orderBy(patients.createdAt);
    return { success: true, patients: results };
  } catch (err) {
    console.error("getAllPatients error:", err);
    return { success: false, error: "Failed to fetch patients", patients: [] };
  }
}

export async function getPatientById(id: string) {
  try {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, id));
    return { success: true, patient };
  } catch (err) {
    console.error("getPatientById error:", err);
    return { success: false, error: "Failed to fetch patient", patient: null };
  }
}
