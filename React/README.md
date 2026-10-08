# 🩺 HealPoint — Doctor Appointment & Telemedicine Platform

HealPoint is a full-stack web application designed to simplify healthcare by connecting patients with qualified doctors for both in-person and online video consultations. It brings doctor discovery, real-time appointment scheduling, browser-based video calling, digital prescriptions, and medical record management together in one clean, easy-to-use platform.

---

## 📖 Table of Contents
- [About The Project](#-about-the-project)
- [Why HealPoint? (Problem & Solution)](#-why-healpoint-problem--solution)
- [Core Features](#-core-features)
  - [For Patients](#-for-patients)
  - [For Doctors](#-for-doctors)
  - [For Administrators](#-for-administrators)
- [How It Works (Step-by-Step Flow)](#-how-it-works-step-by-step-flow)
- [Real-Time Telemedicine & Video Calls](#-real-time-telemedicine--video-calls)
- [Technology Stack](#-technology-stack)
- [Database Design & Structure](#-database-design--structure)
- [Installation & Setup Guide](#-installation--setup-guide)
- [Future Enhancements](#-future-enhancements)

---

## 🌟 About The Project

Booking doctor appointments often involves long phone calls, waiting rooms, and complicated paperwork. HealPoint modernizes this entire process. 

With HealPoint:
- Patients can search for doctors by specialty, check ratings, view fees, pick open time slots, and consult doctors over live video from the comfort of their homes.
- Doctors can manage their weekly schedules, conduct video consultations directly from their browser, view patient history, and generate digital prescriptions.
- Administrators can monitor platform activity, verify doctors, and keep operations running smoothly.

---

## 💡 Why HealPoint? (Problem & Solution)

### The Problems in Traditional Healthcare:
1. **Long Waiting Times:** Patients spend hours waiting at clinics without knowing exact consultation times.
2. **Scheduling Hassles & Double Bookings:** Manual paper appointments often result in scheduling overlaps or confusion.
3. **Distance & Travel Barriers:** Patients living far away or unable to travel struggle to reach specialists.
4. **Lost Medical Papers:** Physical prescriptions and diagnosis slips get misplaced over time.
5. **No-Shows & Empty Slots:** When patients cancel without notice, doctors lose time that another patient could have used.

### The HealPoint Solution:
1. **Instant Online Booking:** Live available slots updated in real-time.
2. **Built-in Video Consultations (Telemedicine):** High-quality video calls right inside the browser without installing any third-party software like Zoom.
3. **Digital Medical Records (EHR):** Prescriptions, appointment logs, and clinical notes are saved safely in one profile.
4. **Smart Waitlists & Notifications:** If an appointment is cancelled, patients on the waitlist can be alerted immediately.
5. **Transparent Doctor Profiles:** Patients can see doctor qualifications, consultation fees, and reviews before booking.

---

## 🚀 Core Features

### 🧑‍🦱 For Patients
- **Doctor Search & Filters:** Find doctors quickly by medical specialty (Cardiology, Dermatology, Pediatrics, Neurology, etc.), location, and consultation fees.
- **Dynamic Slot Booking:** Select dates and choose convenient 30-minute time slots that adjust dynamically based on doctor availability.
- **1-Click Video Calls:** Join scheduled video calls directly from the patient dashboard.
- **Digital Health Records:** View past prescriptions, diagnostic notes, and consultation history anytime.
- **Insurance & Payments:** Store insurance information, calculate co-pays, and track consultation payments.
- **Doctor Ratings & Reviews:** Rate doctors and leave feedback after completed appointments.
- **Waitlist Support:** Request alerts for dates when a doctor is currently fully booked.

### 👨‍⚕️ For Doctors
- **Doctor Dashboard:** Overview of today's schedule, upcoming appointments, and patient lists.
- **Availability Management:** Set weekly working hours or custom dates, with automated slot breakdown (e.g. 30-minute slots).
- **Integrated Video Consultation Room:** Start video appointments with patients in one click using secure WebRTC technology.
- **Digital Prescription Builder:** Write and attach medical prescriptions (medicine name, dosage, timing, and notes) directly to the patient's record during or after the call.
- **Patient History Access:** Review previous medical history and past visit notes before treating a patient.
- **Profile Customization:** Update bio, consultation fees, specialties, and qualifications.

### 🛡️ For Administrators
- **Doctor Verification:** Review doctor profiles and medical credentials before approving them on the platform.
- **User Management:** Oversee patient, doctor, and admin accounts.
- **Specialty Management:** Add or modify medical departments and specialties across the system.
- **Analytics & Platform Health:** Track total appointments, active doctors, and overall system usage.

---

## 🔄 How It Works (Step-by-Step Flow)

```
1. Search & Discover ──► 2. Pick a Slot ──► 3. Instant Confirmation ──► 4. Video Call ──► 5. Prescription & Review
```

1. **Discovery:** The patient visits the platform and searches for a specialist (e.g., Cardiologist).
2. **Slot Selection:** The system shows only the open slots for the selected date. The patient selects a time.
3. **Booking & Confirmation:** The appointment is confirmed, saved to the database, and added to both the patient's and doctor's dashboards.
4. **Consultation:** At the appointment time, both doctor and patient join the integrated video room.
5. **Follow-Up:** The doctor enters clinical notes and issues a digital prescription. The patient can download the prescription and leave a review.

---

## 📹 Real-Time Telemedicine & Video Calls

One of HealPoint's strongest features is its **built-in browser-to-browser video calling system**:
- **Powered by WebRTC & PeerJS:** Audio and video are streamed directly between the patient and doctor, ensuring low latency, smooth video quality, and high privacy.
- **Signaling via Socket.IO:** Coordinates when users join the call and handles connection handshakes behind the scenes.
- **Zero Installs Needed:** Works seamlessly on Google Chrome, Microsoft Edge, Firefox, and Safari on desktop and mobile browsers.
- **Complete In-Call Controls:** Easy buttons to mute microphone, toggle camera on/off, and end the call.

---

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **React 19:** Modern, component-based user interface for fast and interactive pages.
- **Vite:** Next-generation build tool providing fast reload and optimized bundles.
- **PeerJS & Socket.io-client:** Client libraries for managing WebRTC video streaming and real-time socket events.
- **Axios:** For smooth REST API communication with the backend.
- **Vanilla CSS:** Custom responsive styling designed for both desktop and mobile screens.

### Backend (Server-Side)
- **Node.js & Express.js:** Fast, asynchronous REST API server handling authentication, appointment logic, and data validation.
- **Socket.IO:** Real-time event communication for call signaling and live notifications.

### Database (Data Storage)
- **MySQL (`healpoint_db`):** Relational database ensuring strict data integrity, foreign key relations, and ACID compliance.

---

## 🗄️ Database Design & Structure

The database (`healpoint_db`) contains 11 structured tables designed to keep all records connected and organized:

| Table Name | Description / Purpose |
| :--- | :--- |
| **`users`** | Base login accounts with email, password hash, and role (`PATIENT`, `DOCTOR`, `ADMIN`). |
| **`patients`** | Detailed patient information (name, date of birth, phone number). |
| **`doctors`** | Doctor profiles (biography, location, consultation fee). |
| **`specialties`** | List of medical specialties (e.g., Cardiology, Neurology, Pediatrics). |
| **`doctor_specialties`** | Links doctors to one or more specialties. |
| **`doctor_availability`** | Stores doctor working hours and days to generate appointment slots dynamically. |
| **`appointments`** | Core booking records with date, time, status (`SCHEDULED`, `COMPLETED`, `CANCELLED`), and telemedicine room links. |
| **`waitlist`** | Tracks patients waiting for slots when a doctor is fully booked. |
| **`medical_records`** | Doctor clinical notes and diagnosis history for each visit. |
| **`prescriptions`** | Medication details, dosages, and instructions linked to medical records. |
| **`reviews`** | Patient star ratings (1 to 5) and feedback comments for completed visits. |
| **`payments`** | Records fee payments, co-pays, transaction statuses, and refunds. |
| **`notifications`** | System alerts for appointment reminders, cancellations, and waitlist updates. |

---

## 💻 Installation & Setup Guide

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- [MySQL](https://www.mysql.com/) (Version 8.0 or higher)
- Git

---

### Step 1: Database Setup
1. Start your MySQL service.
2. Open your MySQL client (Command Line, MySQL Workbench, or phpMyAdmin).
3. Import and execute the SQL file:
   ```sql
   SOURCE Healpoint_db.sql;
   ```
   *This will create the `healpoint_db` database and all necessary tables.*

---

### Step 2: Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd ExpressJs
   ```
2. Install required packages:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:3001`.*

---

### Step 3: Frontend Setup
1. Open another terminal and navigate to the frontend folder:
   ```bash
   cd React
   ```
2. Install required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

---

## 🔮 Future Enhancements

- 🤖 **AI Health Assistant:** Symptom analyzer to help patients choose the right medical specialty.
- 📱 **Mobile Application:** Dedicated Android and iOS apps using React Native.
- 💬 **WhatsApp & SMS Alerts:** Automatic reminder messages and prescription delivery via WhatsApp.
- 🏥 **Automated Insurance Verification:** Instant verification with health insurance provider APIs.
- ⌚ **Smart Health Device Sync:** Live sync with smartwatches for blood pressure and heart rate monitoring during video consultations.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
