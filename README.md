# 🏥 PrescriptOCR

<div align="center">

![PrescriptOCR Banner](https://img.shields.io/badge/AI-Powered%20Prescription%20Digitization-009688?style=for-the-badge&logo=medscape&logoColor=white)

**An intelligent medical prescription transcription and management platform powered by Next.js 16, Google Gemini 2.5 Flash Multimodal AI, Sharp image preprocessing, Neon Serverless PostgreSQL, and Drizzle ORM.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Neon Database](https://img.shields.io/badge/Neon-Serverless_Postgres-00E599?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=flat-square&logo=cloudinary)](https://cloudinary.com/)

[Key Features](#-key-features) • [System Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Setup](#-environment-variables) • [Database Schema](#-database-schema) • [Project Structure](#-project-structure)

</div>

---

## 🌟 Overview

Prescription handwriting is notoriously difficult to decipher, creating bottlenecks in pharmacies, clinics, and electronic health record (EHR) management. **PrescriptOCR** bridges this gap by combining state-of-the-art computer vision and multimodal Large Language Models (LLMs) to automatically digitize handwritten and printed medical prescriptions with high accuracy and clinical structured formatting.

### Why PrescriptOCR?
- ⚡ **Zero Manual Transcription**: Converts illegible prescription images into structured JSON in seconds.
- 💊 **Dosage & Frequency Parsing**: Isolates medications, dosage amounts, intake schedules, and critical doctor notes.
- 🛡️ **Failover AI Architecture**: Dynamic multi-tier model fallback (`gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-flash-latest`) with exponential backoff for high availability.
- 🔒 **Clinical Records**: Organizes prescriptions under patient profiles with searchable medical tags, clinical summaries, and downloadable PDF reports.

---

## ✨ Key Features

### 🔍 Multimodal OCR & AI Parsing
- **Computer Vision Preprocessing**: Utilizes `Sharp` for EXIF orientation correction, resolution optimization, normalization, and contrast enhancement.
- **Multimodal LLM Intelligence**: Leverages Google Gemini 2.5 Flash Vision with constrained JSON schema decoding to prevent hallucinations and extract clinical entities.
- **Confidence Scoring**: Computes OCR confidence scores (0–100%) to indicate transcription legibility and alert medical professionals when manual verification is recommended.
- **Medical Tagging & Summaries**: Automatically classifies prescriptions with smart tags (e.g., *Antibiotic*, *Hypertension*, *Pediatric*) and generates a concise 2–3 sentence clinical summary.

### 📋 Prescription & Patient Management
- **Interactive Verification Studio**: View original prescription scans alongside digitized medications, edit details, append doctor notes, and flag high-priority findings.
- **Patient History Timeline**: Track longitudinal prescription histories per patient with full chronological logs.
- **Real-Time Global Search**: Filter prescriptions and patients by name, medication, diagnosis, tags, date range, or confidence level.
- **PDF Report Generation**: Export standardized, clean clinical reports and summaries directly via client-side `jsPDF`.
- **Cloud Storage**: Secure, scalable image hosting and CDN delivery powered by Cloudinary.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[Prescription Image Upload] --> B[Image Preprocessing - Sharp]
    B -->|EXIF Rotate, Grayscale, Normalise| C[Cloudinary CDN Storage]
    B --> D[Multimodal Gemini Vision Pipeline]
    
    subgraph "AI Inference & Fallback Engine"
        D --> E{Gemini 2.5 Flash}
        E -->|503 / 429 / Error| F{Gemini 2.5 Flash Lite}
        F -->|Fallback| G{Gemini Flash Latest}
    end

    E -->|Structured JSON Output| H[Zod Schema Validation]
    F -->|Structured JSON Output| H
    G -->|Structured JSON Output| H

    H --> I[Drizzle ORM / Neon PostgreSQL]
    C --> I

    I --> J[Next.js App Dashboard & Patient Workspace]
    J --> K[Interactive Editor & PDF Report Export]
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | High-performance React server components and server actions |
| **Frontend** | [React 19](https://react.dev/) | Modern concurrent UI engine |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern atomic styling engine |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) | Accessible, unstyled primitives (Dialogs, Tooltips, Tabs, Dropdowns) |
| **AI / Vision** | [Google Gemini AI](https://deepmind.google/technologies/gemini/) | Multimodal LLMs (`gemini-2.5-flash`, `gemini-2.5-flash-lite`) |
| **Image Processing** | [Sharp](https://sharp.pixelplumbing.com/) & [Tesseract.js](https://tesseract.projectnaptha.com/) | High-performance raster image transformation and optical processing |
| **Database & ORM** | [Neon PostgreSQL](https://neon.tech/) + [Drizzle ORM](https://orm.drizzle.team/) | Serverless relational database with type-safe schema definitions |
| **Asset Storage** | [Cloudinary](https://cloudinary.com/) | Cloud-hosted image storage and CDN delivery |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) | Client-side document compilation |
| **Validation** | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) | Runtime type checking and resilient form handling |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Opinionated toast notifications |

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your environment:
- **Node.js**: `v20.x` or higher
- **npm**, **pnpm**, or **yarn**
- **Neon PostgreSQL Database** (or any Postgres instance)
- **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
- **Cloudinary Account** (for prescription image hosting)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mayankrajput5455/PriscriptOCR.git
   cd PriscriptOCR
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and configure the required keys (see below).

4. **Synchronize Database Schema:**
   Push your Drizzle schema migrations to your Neon database:
   ```bash
   npm run db:push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```

6. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to access the application.

---

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following configuration:

```env
# Database (Neon Serverless PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/prescriptocr?sslmode=require"

# Google Gemini AI API Key
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

---

## 🗄️ Database Schema

The database model is built with Drizzle ORM and Neon Postgres:

```
┌─────────────────────────┐         ┌───────────────────────────────┐
│        PATIENTS         │         │         PRESCRIPTIONS         │
├─────────────────────────┤         ├───────────────────────────────┤
│ id (UUID, PK)           │ 1     * │ id (UUID, PK)                 │
│ name (TEXT)             │◄────────┼─ patientId (UUID, FK)          │
│ age (INTEGER)           │         │ imageUrl (TEXT)               │
│ gender (TEXT)           │         │ rawOcr (TEXT)                 │
│ phone (TEXT)            │         │ correctedText (TEXT)          │
│ createdAt (TIMESTAMP)   │         │ aiSummary (TEXT)              │
└─────────────────────────┘         │ medicinesJson (JSONB)         │
                                    │ doctorNotes (TEXT)            │
                                    │ tags (JSONB)                  │
                                    │ important (BOOLEAN)           │
                                    │ ocrConfidence (INTEGER)       │
                                    │ importantFindings (JSONB)     │
                                    │ createdAt (TIMESTAMP)         │
                                    └───────────────────────────────┘
```

---

## 📁 Project Structure

```plaintext
PriscriptOCR/
├── src/
│   ├── actions/               # Server Actions (Patients, Prescriptions, AI OCR)
│   │   ├── patients.ts        # Patient mutations and queries
│   │   └── prescriptions.ts   # Prescription pipeline and OCR orchestration
│   ├── app/                   # Next.js App Router (Pages, Layouts, Routes)
│   │   ├── dashboard/         # Clinical overview and analytics
│   │   ├── patients/          # Patient directory and individual records
│   │   ├── prescriptions/     # Prescription detail viewer, editor & PDF export
│   │   ├── search/            # Global multi-parameter search
│   │   ├── upload/            # Prescription upload and real-time OCR runner
│   │   ├── layout.tsx         # Root layout with sidebar navigation
│   │   └── globals.css        # Tailwind CSS and theme design tokens
│   ├── components/            # Reusable UI Component Library
│   │   ├── cards/             # Statistic and metric cards
│   │   ├── forms/             # Patient creation and edit forms
│   │   ├── layout/            # Navigation bars, sidebar, wrappers
│   │   ├── prescription/      # Medicine badges, confidence meters, tag badges
│   │   └── upload/            # Dropzone uploaders, scanner previews
│   ├── db/                    # Drizzle ORM Configuration & Schemas
│   │   ├── index.ts           # Neon serverless client instance
│   │   └── schema.ts          # Relational table definitions (Patients, Prescriptions)
│   ├── lib/                   # Utility and Integration Libraries
│   │   ├── cloudinary.ts      # Cloudinary uploader helper
│   │   ├── utils.ts           # Style helpers (clsx, twMerge)
│   │   └── ocr/               # Image Processing & Gemini Vision pipeline
│   │       ├── gemini.ts      # Gemini API caller with backoff & failover
│   │       ├── preprocess.ts  # Sharp image transformations
│   │       └── tesseract.ts   # Tesseract optical engine helper
│   └── types/                 # TypeScript interfaces and type definitions
├── drizzle.config.ts          # Drizzle Kit configuration
├── next.config.ts             # Next.js runtime configuration
├── package.json               # Project manifest and scripts
└── tsconfig.json              # TypeScript configuration
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with hot-reload at `http://localhost:3000` |
| `npm run build` | Compiles the production build |
| `npm run start` | Boots the compiled production server |
| `npm run lint` | Runs ESLint validation across all source files |
| `npm run db:push` | Pushes the Drizzle schema directly to the Neon PostgreSQL database |
| `npm run db:generate` | Generates SQL migration files from Drizzle schema definitions |
| `npm run db:studio` | Launches Drizzle Studio GUI for inspecting and editing database records |

---

## ⚠️ Disclaimer

> [!IMPORTANT]
> **PrescriptOCR is intended as a clinical assistive tool and transcription accelerator.** It does not provide medical diagnoses or replace licensed pharmacists and medical practitioners. Always verify critical medications, dosages, and clinical findings against original handwritten prescriptions.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with ❤️ for healthcare modernization.</sub>
</div>
