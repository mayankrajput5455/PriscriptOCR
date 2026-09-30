import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth";
import verificationRoutes from "./routes/verification";
import patientRoutes from "./routes/patients";
import prescriptionRoutes from "./routes/prescriptions";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PrescriptOCR API is running" });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Error Handler ───────────────────────────────────────────────────────────

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Server Error]", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 PrescriptOCR API running at http://localhost:${PORT}`);
  console.log(`   Frontend expected at: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

export default app;
