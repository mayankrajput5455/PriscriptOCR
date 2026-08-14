import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const patients = pgTable("patients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  rawOcr: text("raw_ocr").notNull().default(""),
  correctedText: text("corrected_text").notNull().default(""),
  aiSummary: text("ai_summary").notNull().default(""),
  medicinesJson: jsonb("medicines_json").notNull().default([]),
  doctorNotes: text("doctor_notes").notNull().default(""),
  tags: jsonb("tags").notNull().default([]),
  important: boolean("important").notNull().default(false),
  ocrConfidence: integer("ocr_confidence").notNull().default(0),
  importantFindings: jsonb("important_findings").notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const patientsRelations = relations(patients, ({ many }) => ({
  prescriptions: many(prescriptions),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
}));

// Types inferred from schema
export type Patient = typeof patients.$inferSelect;
export type NewPatient = typeof patients.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
