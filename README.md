# 🩺 HealPoint — AI-Powered Healthcare Appointment, Telemedicine & Intelligent Lab Report Assistant

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![WebRTC](https://img.shields.io/badge/Telemedicine-WebRTC%20%7C%20PeerJS%20%7C%20Socket.IO-333333?logo=webrtc&logoColor=white)](https://webrtc.org/)
[![AI](https://img.shields.io/badge/AI%20Engine-Clinical%20Biomarker%20%26%20Report%20Analyzer-0f766e)](./AI)

**HealPoint** is a next-generation, AI-powered healthcare ecosystem that bridges the gap between laboratory diagnostic reports, specialist medical discovery, real-time appointment scheduling, and browser-based WebRTC telemedicine consultations.

> **Core Value Proposition:**
> **Upload Lab Report ➔ Understand Important Findings ➔ Identify Conditions Worth Discussing ➔ Find the Right Specialist ➔ One-Click Appointment Booking & Telemedicine Consultation.**

---

## 📖 Table of Contents

- [🌟 About The Platform](#-about-the-platform)
- [✨ Core Innovation: AI Lab Report Analyzer](#-core-innovation-ai-lab-report-analyzer)
- [🚀 Key Features by User Role](#-key-features-by-user-role)
  - [🧑‍🦱 Patient Experience](#-patient-experience)
  - [👨‍⚕️ Doctor Portal](#-doctor-portal)
  - [🛡️ Administrator Control](#️-administrator-control)
- [🔄 Complete End-to-End AI Workflow](#-complete-end-to-end-ai-workflow)
- [📹 Built-In WebRTC Telemedicine](#-built-in-webrtc-telemedicine)
- [🛠️ System Architecture & Technology Stack](#️-system-architecture--technology-stack)
- [🗄️ Database Schema & Entities](#️-database-schema--entities)
- [📡 Comprehensive Backend API Reference](#-comprehensive-backend-api-reference)
- [💻 Quickstart & Installation Guide](#-quickstart--installation-guide)
- [🧪 Running AI Verification Tests](#-running-ai-verification-tests)
- [🎯 Demonstration Walkthrough for Evaluators](#-demonstration-walkthrough-for-evaluators)
- [🛡️ Medical Safety & Disclaimer](#️-medical-safety--disclaimer)

---

## 🌟 About The Platform

Traditional healthcare booking systems require patients to manually decipher confusing laboratory test values, search blindly for unknown specialties, navigate disjointed booking portals, and install third-party video software for remote care.

**HealPoint unifies the complete patient journey into one cohesive web platform:**
1. **Intelligent Diagnostics:** Patients upload lab reports (PDF, PNG, JPG, or text) to extract biomarker values, highlight abnormal ranges, and receive plain-English explanations.
2. **Clinical Safety Guardrails:** Clear framing that **AI observation ≠ medical diagnosis**, using cautious clinical language ("may indicate", "can be associated with", "possible condition to discuss").
3. **Explainable Doctor Recommendations:** Maps detected abnormalities (e.g., elevated fasting blood sugar, high cholesterol, low hemoglobin, vitamin deficiencies) to qualified specialties and matches top-rated available doctors.
4. **Frictionless 1-Click Booking:** Books real-time available time slots without restarting the appointment process.
5. **In-Browser Telemedicine:** High-definition video/audio consultations using WebRTC with zero software downloads.
6. **Electronic Health Records (EHR):** Digital prescriptions, past appointment history, payment records, and longitudinal biomarker trend analysis over time.

---

## ✨ Core Innovation: AI Lab Report Analyzer

The **AI Lab Report Analyzer** is integrated directly into the **Patient Dashboard**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🧪 AI Lab Report Analyzer                                              │
│                                                                        │
│ Understand your lab report with HealPoint AI.                          │
│ Upload your laboratory report (CBC, Blood Sugar, Lipid Profile,        │
│ Thyroid, Liver/Kidney tests, Vitamins) to extract parameters, identify │
│ abnormal values, and find the right medical specialist.                │
│                                                                        │
│   [ 📤 Upload Lab Report ]      [ ⚡ Try Demo Report (1-Click) ]       │
└────────────────────────────────────────────────────────────────────────┘
```

### Supported Laboratory Panels & Biomarkers:
- **Complete Blood Count (CBC):** Hemoglobin, RBC Count, WBC (Leukocytes), Platelet Count, Hematocrit (PCV).
- **Blood Sugar & Diabetes Panel:** Fasting Blood Glucose (FBS), Random Glucose (RBS), HbA1c (Glycated Hemoglobin).
- **Lipid Profile (Cardiovascular):** Total Cholesterol, LDL ("Bad" Cholesterol), HDL ("Good" Cholesterol), Triglycerides.
- **Thyroid Function Test:** Thyroid Stimulating Hormone (TSH), Total/Free T3, Total/Free T4.
- **Kidney Function Test (KFT / Renal):** Serum Creatinine, Blood Urea Nitrogen (BUN), Uric Acid.
- **Liver Function Test (LFT / Hepatic):** SGPT / ALT, SGOT / AST, Total Bilirubin.
- **Vitamins & Essential Minerals:** Vitamin D (25-OH), Vitamin B12 (Cobalamin), Serum Calcium.

### Structured Output Capabilities:
- **Printed Reference Range Priority:** Extracts and uses reference ranges printed directly on the uploaded report, falling back to clinical standards.
- **Abnormal Findings Breakdown:** Displays current value, status (`Low`, `High`, `Critical`), reference interval, and clinical significance.
- **Possible Conditions to Discuss:** Categorized with confidence tags (`Possible`, `Needs medical evaluation`, `Worth discussing with a doctor`).
- **Emergency Triage Filter:** Automatically triggers red alert banners for severe values (e.g., acute hyperglycemia, critical thrombocytopenia, severe anemia) directing the patient to emergency services.
- **Longitudinal Biomarker Health Trends:** Tracks biomarker progression across multiple reports over time (e.g., Hemoglobin Jan 10.2 ➔ Mar 11.1 ➔ Jun 12.0 g/dL).
- **Pre-Configured Demo Samples:** One-click sample reports (CBC + Glucose + Vit D, Lipid Panel, Thyroid Panel, Liver/Kidney Panel, Routine Wellness) for instant demonstration without local files.

---

## 🚀 Key Features by User Role

### 🧑‍🦱 Patient Experience
- **AI Lab Report Analyzer:** Upload PDF/Image lab reports, view summaries, structured tables, and recommended doctors.
- **Symptom AI Chatbot:** Conversational assistant for symptom triage, FAQs, and slot queries.
- **Doctor Directory & Filtering:** Search doctors by specialty, location, consultation fees, and patient ratings.
- **Dynamic Slot Booking:** Real-time 30-minute availability slot generator.
- **WebRTC Video Consultations:** 1-click video calls with real-time in-call chat.
- **Patient Dashboard:** Manage upcoming visits, reschedule/cancel bookings, view digital prescriptions, and track payment transactions.

### 👨‍⚕️ Doctor Portal
- **Doctor Schedule Dashboard:** View today's consultations, patient queues, and appointment statuses.
- **Availability Management:** Set working days, hours, and slot durations.
- **In-Browser Video Consultation Room:** Connect with patients over WebRTC with full camera/microphone controls.
- **Digital Prescription Writer:** Write medications, dosages, and instructions attached to patient records.
- **EHR Patient History:** Review previous diagnosis logs and past reports before consultations.

### 🛡️ Administrator Control
- **Doctor Credential Verification:** Review qualifications and approve or reject doctor signups.
- **Specialty Directory Management:** Add, update, or reorganize clinical departments.
- **Platform Analytics:** Track total appointments, active practitioners, and system performance.

---

## 🔄 Complete End-to-End AI Workflow

```text
               Patient Dashboard
                      │
           [ Upload Lab Report ] (PDF / JPG / PNG / Sample)
                      │
               File Validation (MIME & 10MB Limit)
                      │
           Document / Image Processing (pdf-parse / OCR)
                      │
           Biomarker Extraction (Name, Value, Unit, Printed Range)
                      │
           AI Clinical Evaluation Engine
           ├── Overall Diagnostic Summary
           ├── Abnormal Findings Detection
           ├── Clinical Significance Explanation
           ├── Possible Conditions (AI observation ≠ diagnosis)
           └── Emergency Threshold Check
                      │
           Specialty Recommendation Algorithm
                      │
           Doctor Database Search & Availability Lookup
                      │
           Recommendation Scoring ("Why this doctor?")
                      │
           Results Display & Lab Values Table
                      │
           [ One-Click Appointment Booking ]
                      │
           Existing HealPoint Appointment API (`POST /api/appointments`)
                      │
           Appointment Confirmed & Telemedicine Room Ready
```

---

## 📹 Built-In WebRTC Telemedicine

HealPoint features zero-install, browser-to-browser video calling:
- **Peer-to-Peer Streaming:** Uses WebRTC and PeerJS for low-latency, encrypted video/audio streaming.
- **Socket.IO Signaling:** Coordinates room creation, connection handshakes, and live chat messaging.
- **Cross-Platform Compatibility:** Works out-of-the-box on Chrome, Edge, Firefox, Safari, and mobile browsers.

---

## 🛠️ System Architecture & Technology Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                       React 19 Frontend                     │
│  • Patient Dashboard     • AI Lab Report Analyzer           │
│  • Doctor Dashboard      • WebRTC Telemedicine Call Room    │
│  • Doctor Listing & Booking Modal • HealPoint AI Chat       │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST APIs & WebSocket
┌──────────────────────────────▼──────────────────────────────┐
│                    Express.js Backend Server                │
│  • Lab Report Controller (Upload, Analysis, Trends)         │
│  • Doctor & Appointment Controllers                         │
│  • Socket.IO Signaling Server                               │
│  • Multer File Storage & Validation                         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐┌──────────────▼───────────────┐
│     Modular AI Engine       ││      MySQL Database          │
│  • Lab Report Analyzer      ││  • users & patients          │
│  • Medical Taxonomy & RAG   ││  • doctors & availability    │
│  • Recommendation Scorer    ││  • appointments & records    │
│  • Emergency Triage         ││  • ai_lab_reports (JSON)     │
└─────────────────────────────┘└──────────────────────────────┘
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, Vite, Vanilla CSS | Responsive, fast SPA with rich healthcare aesthetics |
| **Video & Chat** | WebRTC, PeerJS, Socket.io-client | In-browser real-time audio/video consultations |
| **Backend API** | Node.js, Express.js (ES Modules) | RESTful APIs, business logic, file upload pipelines |
| **Document Parsing** | `pdf-parse`, `multer` | Digital PDF text extraction and file validation |
| **AI Intelligence** | Custom Modular Engine (`AI/`) | Clinical biomarker extraction, scoring, safety triage |
| **Database** | MySQL 8.0 (`healpoint_db`) | Relational persistence with JSON support for AI findings |

---

## 🗄️ Database Schema & Entities

The database schema (`Healpoint_db.sql`) consists of 12 tables:

| Table | Description |
| :--- | :--- |
| **`users`** | Authentication credentials, email, password hash, role (`PATIENT`, `DOCTOR`, `ADMIN`). |
| **`patients`** | Patient profiles (first name, last name, DOB, phone number, gender, blood group). |
| **`doctors`** | Doctor profiles (bio, location, consultation fee, approval status). |
| **`specialties`** | Medical specialties (Cardiology, Dermatology, General Medicine, Neurology, etc.). |
| **`doctor_specialties`** | Many-to-many relationship mapping doctors to clinical specialties. |
| **`doctor_availability`** | Day-of-week working hours and slot durations for dynamic scheduling. |
| **`appointments`** | Booked visits with status (`SCHEDULED`, `COMPLETED`, `CANCELLED`), datetime, telemedicine room URL. |
| **`ai_lab_reports`** | Stores uploaded lab reports, file metadata, AI analysis JSON, and recommended specialties. |
| **`medical_records`** | Doctor clinical notes and consultation diagnosis logs. |
| **`prescriptions`** | Medication details, dosage, and intake instructions. |
| **`reviews`** | Patient ratings (1–5 stars) and feedback comments. |
| **`payments`** | Financial transactions, co-pays, Stripe transaction IDs, and refunds. |

---

## 📡 Comprehensive Backend API Reference

### 🧪 AI Lab Report Analyzer Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/lab-reports/upload` | Upload PDF/image report, extract parameters, perform AI analysis, match doctors. |
| `GET` | `/api/lab-reports` | Retrieve all analyzed reports for the logged-in patient. |
| `GET` | `/api/lab-reports/samples` | Get pre-configured demo test reports for 1-click evaluation. |
| `GET` | `/api/lab-reports/trends` | Fetch longitudinal biomarker progression across multiple reports over time. |
| `GET` | `/api/lab-reports/:id` | Get single report details and full structured analysis. |
| `GET` | `/api/lab-reports/:id/recommendations` | Get matched doctors and real-time available slots for a specific report. |
| `DELETE` | `/api/lab-reports/:id` | Delete a report from patient history. |

### 💬 Conversational AI Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Natural language symptom detection, doctor search, and triage assistant. |
| `GET` | `/api/ai/recommendations` | Personalized doctor recommendations based on past patient history. |
| `GET` | `/api/ai/quick-slots` | Fetch real-time available slots for a specialty or doctor. |

### 📅 Appointments, Doctors & Profiles
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/doctors` | List all verified doctors with ratings and specialties. |
| `GET` | `/api/doctors/:id` | Get detailed doctor profile and availability. |
| `GET` | `/api/appointments` | Retrieve scheduled appointments. |
| `POST` | `/api/appointments` | Book an appointment (used by both manual booking & AI 1-click booking). |
| `PUT` | `/api/appointments/:id/status` | Update status (`COMPLETED`, `CANCELLED`, `ACCEPTED`). |
| `GET` | `/api/patients/:id` | Get patient profile details. |
| `POST` | `/api/users/login` | User authentication for patients, doctors, and admins. |

---

## 💻 Quickstart & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- [MySQL](https://www.mysql.com/) (Version 8.0 or higher)
- Git

---

### Step 1: Database Setup
1. Start your MySQL server.
2. Open MySQL client or workbench and execute:
   ```sql
   SOURCE Healpoint_db.sql;
   ```
   *Creates `healpoint_db` with all tables including `ai_lab_reports`.*

---

### Step 2: Backend Setup
1. Open terminal and navigate to `ExpressJs`:
   ```bash
   cd ExpressJs
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   *Backend runs on `http://localhost:3001`.*

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to `React`:
   ```bash
   cd React
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🧪 Running AI Verification Tests

Run the standalone AI engine test suite:

```bash
node AI/tests/aiEngine.test.js
```

**Verified Test Cases:**
- ✅ **Test 1:** Natural Language Symptom & Specialty Detection (Dermatology, Neurology, Cardiology).
- ✅ **Test 2:** Emergency Safety Redirection & Urgent Medical Triage.
- ✅ **Test 3:** Doctor Recommendation Flow & Slot Matching.
- ✅ **Test 4:** Medical Report Summarizer.
- ✅ **Test 5:** Complex Multi-Biomarker Lab Report Analysis (Low Hemoglobin 10.2 g/dL, Elevated Glucose 145 mg/dL, Low Vitamin D 14 ng/mL ➔ Anemia / Glycemic / Vit D condition mapping ➔ General Medicine specialist recommendation).

---

## 🎯 Demonstration Walkthrough for Evaluators

1. **Login:** Log in as a Patient (or use demo patient credentials).
2. **Access AI Analyzer:** On the **Patient Dashboard**, click the **`🧪 AI Lab Analyzer`** tab or the prominent hero banner.
3. **Select a Demo Report:** Click **`⚡ Try Demo Report (CBC + Glucose + Vit D)`** (or upload your own PDF/Image).
4. **Click Analyze:** Click **`🧪 Analyze Lab Report Now`** to watch the multi-step animated extraction pipeline.
5. **Review AI Findings:**
   - **Overall Summary:** Clinical synopsis of findings.
   - **⚠️ Abnormal Findings:** Hemoglobin (10.2 g/dL Low), Glucose (145 mg/dL High), Vitamin D (14 ng/mL Low) with plain-English significance.
   - **🔍 Possible Conditions:** Anemia, Blood Sugar Dysregulation, Vitamin D Deficiency (framed as topics for doctor discussion).
   - **📋 Structured Table:** Filter by *All*, *Abnormal Only*, or *Normal*.
   - **👨‍⚕️ Recommended Doctors:** Top specialists with "Why this doctor?" badges, ratings, and next available slots.
6. **Book Appointment:** Click **`📅 Book Appointment`** on any recommended doctor card ➔ select date/time ➔ confirm booking.
7. **View History & Trends:** Switch to **`📜 Report History`** or **`📈 Biomarker Health Trends`** to view longitudinal progression over time.

---

## 🛡️ Medical Safety & Disclaimer

> **IMPORTANT MEDICAL NOTICE:**
> HealPoint AI and the AI Lab Report Analyzer provide educational observations, parameter breakdowns, and doctor matching assistance. **AI observations do not constitute a definitive medical diagnosis, prescription, or clinical treatment plan.** Patients must always consult a qualified, licensed healthcare professional for clinical evaluation. In cases of acute or life-threatening symptoms, immediate emergency medical care must be sought.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
