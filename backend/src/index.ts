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

// ─── Reverse Proxy (Render / Cloudflare) ──────────────────────────────────────
app.set("trust proxy", 1);

// ─── Middleware ───────────────────────────────────────────────────────────────

const allowedOrigins = (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [])
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isLocalhost =
        /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
      const isVercel = /\.vercel\.app$/.test(origin);
      const isExplicitlyAllowed = allowedOrigins.includes(origin.replace(/\/+$/, ""));

      if (isLocalhost || isVercel || isExplicitlyAllowed || allowedOrigins.length === 0) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// ─── Health Check & Root ──────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "PrescriptOCR Backend API is running",
    healthCheck: "/api/health",
  });
});

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
