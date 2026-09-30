# 🏥 PrescriptOCR (MERN Stack)

<div align="center">

![PrescriptOCR Banner](https://img.shields.io/badge/AI-Powered%20Prescription%20Digitization-009688?style=for-the-badge&logo=medscape&logoColor=white)

**An intelligent medical prescription transcription and clinic management platform powered by Express.js, React + Vite, Google Gemini 2.5 Flash Multimodal AI, Sharp image preprocessing, Neon Serverless PostgreSQL, and Drizzle ORM.**

[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-black?style=flat-square&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Neon Database](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)

[Features](#-key-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Reference](#-backend-api-reference) • [Environment Setup](#-environment-variables)

</div>

---

## 🌟 Overview

Prescription handwriting is notoriously difficult to decipher, creating bottlenecks in pharmacies, clinics, and electronic health record (EHR) management. **PrescriptOCR** bridges this gap by combining state-of-the-art computer vision and multimodal Large Language Models (LLMs) to automatically digitize handwritten and printed medical prescriptions with high accuracy and clinical structured formatting.

---

## 📁 Repository Structure

```
PriscriptOCR/
├── backend/                  # Node.js + Express.js + TypeScript REST API
│   ├── src/
│   │   ├── db/              # Drizzle ORM schema & Neon Postgres connection
│   │   ├── lib/             # Gemini AI OCR, Cloudinary, Email, JWT auth
│   │   ├── middleware/      # Auth & file upload middleware
│   │   ├── routes/          # Express route controllers
│   │   └── index.ts         # Express app entry point
│   ├── drizzle.config.ts    # Drizzle Kit config
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # React 18 + Vite + TypeScript Client
    ├── src/
    │   ├── components/      # UI & layout components (Sidebar, ProtectedRoute, etc.)
    │   ├── context/         # AuthContext state management
    │   ├── lib/             # Axios API client & utilities
    │   ├── pages/           # All application views & routes
    │   ├── types/           # TypeScript interfaces & types
    │   ├── App.tsx          # React Router v6 routing
    │   └── main.tsx         # Client mounting
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```
*(Or install inside each folder: `cd backend && npm install`, `cd frontend && npm install`)*

### 2. Start Both Services

In separate terminal windows:

```powershell
# Terminal 1: Backend (Port 5000)
npm run dev:backend

# Terminal 2: Frontend (Port 5173)
npm run dev:frontend
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

---

## 🌐 Backend API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new doctor / clinic account |
| `POST` | `/api/auth/login` | Authenticate & set secure HTTP-only JWT cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Fetch active session & doctor profile |
| `POST` | `/api/verification/verify` | Verify email with token or 6-digit OTP |
| `POST` | `/api/verification/resend` | Resend verification email |
| `GET` | `/api/patients` | Search & list clinic patients |
| `POST` | `/api/patients` | Create patient profile |
| `GET` | `/api/patients/:id` | Get patient details & prescription history |
| `PUT` | `/api/patients/:id` | Update patient record |
| `DELETE` | `/api/patients/:id` | Remove patient record |
| `GET` | `/api/prescriptions/dashboard` | Dashboard metrics & recent activity |
| `GET` | `/api/prescriptions/search?q=` | Full-text search across medications & diagnoses |
| `POST` | `/api/prescriptions/upload` | Upload image, preprocess via Sharp, OCR via Gemini AI |
| `POST` | `/api/prescriptions` | Save prescription to database |
| `GET` | `/api/prescriptions/:id` | Get prescription details & parsed JSON entities |
| `PUT` | `/api/prescriptions/:id` | Update prescription metadata |
| `PATCH`| `/api/prescriptions/:id/toggle-important` | Toggle prescription star/flag |
| `DELETE`| `/api/prescriptions/:id` | Delete prescription |

---

## 🖥️ Frontend Pages

- `/login` – Doctor sign in (email & password + Google OAuth trigger)
- `/signup` – Register new doctor / clinic profile
- `/verify` – Email verification link landing
- `/verify-email` – 6-digit OTP verification interface
- `/dashboard` – Analytics summary, recent prescriptions, quick actions
- `/patients` – Patient directory with real-time search & filters
- `/patients/:id` – Patient profile, vitals, timeline, prescription records
- `/upload` – Drag-and-drop prescription scan & interactive AI verification editor
- `/search` – Global clinical entity search
- `/prescriptions/:id` – Full prescription view with PDF export

---

## ⚙️ Environment Variables

### `backend/.env`
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### `frontend/.env`
```env
VITE_API_URL=https://priscriptocr.onrender.com
```

---

## 🛠️ Build & Production

```powershell
# Build both backend and frontend
npm run build

# Or individually:
npm run build:backend   # outputs to backend/dist/
npm run build:frontend  # outputs to frontend/dist/
```
