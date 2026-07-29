# 🎓 TriConnect – AI-Powered Smart School Management Platform

> **An AI-powered Smart School Management Platform that connects Students, Teachers, Parents, and Administrators through intelligent automation, analytics, and secure digital workflows.**

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📌 Project Overview

Educational institutions face significant operational fragmentation across administrative, academic, and communication channels:

* **Administrative Workload**: Manual attendance tracking, paper records, and repetitive operational overhead consume valuable teaching hours.
* **Communication Gaps**: Disconnected feedback loops between teachers, students, and parents lead to delayed interventions.
* **Attendance Inefficiencies**: Traditional roll-calls are prone to errors, proxy attendance, and lack real-time parent notifications.
* **Student Performance & Engagement**: Fragmented assessment data makes early academic risk detection difficult and reduces student engagement.

### 💡 How TriConnect Solves This

**TriConnect** bridges these gaps by serving as a unified digital ecosystem. Combining **real-time biometrics, AI-driven student risk analytics, gamified learning quests, and seamless parent-teacher communication**, TriConnect streamlines school operations and enhances student performance.

---

## ⭐ Key Features

| Category | Feature | Description |
| :--- | :--- | :--- |
| 🧑‍🎓 **Student Hub** | **Personalized Dashboard** | Real-time overview of attendance, assignments, timetable, XP scores, and notifications. |
| 🎮 **Gamified Learning** | **AI Learning Quest** | Earn XP points, unlock badges, level up, and view class leaderboards through course completion. |
| 📸 **Smart Attendance** | **Biometric & Camera Scan** | First-login face enrollment, live webcam capture, and side-by-side verification workflow. |
| 📍 **Geofence Security** | **GPS Proximity Guard** | Validates physical campus boundaries before enabling attendance verification. |
| 👩‍🏫 **Teacher Hub** | **Classroom Management** | Track student attendance records, publish assignments, issue notes, and view burnout analytics. |
| 👨‍👩‍👧 **Parent Portal** | **Real-Time Monitoring** | Direct check-in alerts, academic progress reports, and direct teacher communication. |
| 🛠️ **Admin Hub** | **Campus Operations** | Manage school settings, student onboarding, system audits, and global security policies. |
| 📊 **Analytics** | **Performance & Risk Engine** | AI-driven insights to detect student performance drops and attendance anomalies early. |

---

## 🧠 AI Features

* 🤖 **AI Learning Assistant**: Instant guidance and adaptive recommendations for homework and study modules.
* 📈 **Performance Analytics Engine**: Automated trend analysis evaluating attendance metrics against academic scores.
* ⚠️ **Predictive Risk Detection**: Identifies students showing patterns of academic decline or chronic absenteeism.
* 🎯 **Smart Study Recommendations**: Tailored resource suggestions based on individual quiz and assignment performance.
* 🔮 **Future LLM Integration**: Planned integration with local LLM pipelines for automated essay feedback and parent summary generation.

---

## 🏗️ System Architecture

```text
               +----------------------------------+
               |          User Browser            |
               | (Student / Teacher / Parent / Admin) |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |        Next.js Frontend          |
               |  (React 19, Tailwind, Framer)    |
               +----------------------------------+
                                |  REST APIs (HTTP/JWT)
                                v
               +----------------------------------+
               |         FastAPI Backend          |
               |  (Python, Uvicorn, Pydantic)     |
               +----------------------------------+
                 /              |               \
                /               |                \
               v                v                 v
     +-----------------+ +--------------+ +--------------------+
     | Authentication  | | Smart        | | AI & Analytics     |
     | (JWT, Passlib)  | | Attendance   | | (Risk Engine)      |
     +-----------------+ +--------------+ +--------------------+
                                |
                                v
               +----------------------------------+
               |  Database (SQLite / PostgreSQL)  |
               +----------------------------------+
```

---

## 🛠️ Tech Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & UI** | Vanilla CSS, Tailwind CSS v4, Framer Motion, Lucide React Icons |
| **Backend Framework** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | SQLite / PostgreSQL, SQLAlchemy v2.0, Alembic |
| **Security & Auth** | JWT (JSON Web Tokens), Bcrypt, Role-Based Access Control (RBAC) |
| **Data Processing** | NumPy, Custom Cosine Similarity Vector Engines |

---

## 📂 Project Structure

```text
triconnect/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/              # API Route Handlers (V1)
│   │   │   ├── v1/
│   │   │   │   ├── attendance/   # Smart Attendance Endpoints
│   │   │   │   ├── auth/         # Login & JWT Endpoints
│   │   │   │   ├── school/       # School Management Endpoints
│   │   │   │   └── user/         # User Profile Endpoints
│   │   ├── core/             # Security, JWT, Logging, Config
│   │   ├── database/         # DB Connection & Session Management
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── schemas/          # Pydantic Request/Response Models
│   │   ├── services/         # Business Logic & Telemetry Services
│   │   └── main.py           # FastAPI Application Entrypoint
│   └── requirements.txt      # Python Dependencies
│
├── src/                      # Next.js Frontend Application
│   ├── app/
│   │   ├── dashboard/        # Role-Based Dashboard Routes
│   │   │   ├── admin/        # Admin Management Views
│   │   │   ├── parent/       # Parent Portal Views
│   │   │   ├── student/      # Student Dashboard & Attendance
│   │   │   └── teacher/      # Teacher Management Views
│   │   ├── login/            # Authentication Views
│   │   └── page.tsx          # Landing Page
│   ├── components/           # Reusable UI Components
│   ├── context/              # React Auth Context & Global State
│   └── lib/                  # Utilities & API Client Helpers
│
├── package.json              # Frontend Node Dependencies
├── README.md                 # Project Documentation
└── tsconfig.json             # TypeScript Configuration
```

---

## ⚡ Installation & Setup

Follow these steps to run TriConnect locally:

### 1. Prerequisites
* **Node.js** (v18.0 or higher)
* **Python** (v3.10 or higher)
* **Git**

### 2. Clone Repository
```bash
git clone https://github.com/your-username/triconnect.git
cd triconnect
```

### 3. Frontend Setup
```bash
# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
The frontend will be available at `http://localhost:3000`.

### 4. Backend Setup
Open a new terminal window:
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI development server
python -m uvicorn app.main:app --reload --port 8000
```
The backend API documentation will be available at `http://localhost:8000/docs`.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory (and `/backend/.env`):

```env
# Frontend Config (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Backend Config (backend/.env)
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./triconnect.db
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🔄 Attendance Workflow

```text
Student Logs In
      │
      ▼
First-time Student? ──YES──► Redirect to /enroll-face ──► Capture Face & Save Profile
      │ NO                                                      │
      ▼                                                         │
Click "Mark Attendance" ◄───────────────────────────────────────┘
      │
      ▼
Launch Live Camera (Webcam Stream)
      │
      ▼
Capture Live Face Photo
      │
      ▼
Side-by-Side Face Verification Display
[ Left: Enrolled Photo  |  Right: Live Capture ]
      │
      ▼
Show "Face Verification Completed Successfully"
      │
      ▼
Click "Confirm & Mark Attendance"
      │
      ▼
Attendance Saved in Database (Date, Time, Status: Present)
```

---

## 👥 User Roles & Permissions

| Role | Access Permissions |
| :--- | :--- |
| 🧑‍🎓 **Student** | Mark attendance, view personal attendance logs, complete AI learning quests, view assignments & timetable. |
| 👩‍🏫 **Teacher** | Track class attendance, assign homework, publish notices, monitor student burnout risk scores. |
| 👨‍👩‍👧 **Parent** | Receive student check-in alerts, view academic progress reports, communicate with teachers. |
| 🛠️ **Admin** | Register students/teachers, configure school parameters, audit security logs, manage campus data. |

---

## 🖼️ Screenshots

*(Add screenshot previews of your application screens below)*

| View | Screenshot Preview |
| :--- | :--- |
| **Landing Page** | `![Landing Page](docs/screenshots/landing.png)` |
| **Student Dashboard** | `![Student Dashboard](docs/screenshots/student_dashboard.png)` |
| **Face Enrollment** | `![Face Enrollment](docs/screenshots/enrollment.png)` |
| **Side-by-Side Attendance** | `![Attendance Verification](docs/screenshots/attendance.png)` |
| **Teacher Dashboard** | `![Teacher Dashboard](docs/screenshots/teacher_dashboard.png)` |
| **Admin Panel** | `![Admin Panel](docs/screenshots/admin.png)` |

---

## 🚀 Future Enhancements

* 🤖 **Production-Grade Neural Face Recognition**: Integration with InsightFace / PyTorch models for automated facial verification.
* 💬 **AI Assistant Chatbot**: Natural language query resolution for students and parents.
* 📱 **Native Mobile Application**: Cross-platform React Native app with push notifications.
* 🚌 **Smart School Bus Transport Tracking**: Real-time GPS tracking of school buses for parents.
* 🪪 **Digital Smart NFC/QR Badges**: NFC-enabled tap-to-enter campus security gates.
* 🎙️ **Voice Assistant Integration**: Voice-command actions for teachers taking rapid classroom notes.

---

## 🛡️ Security & Privacy

* 🔑 **JWT Authentication**: Secure stateless token authentication for all private API routes.
* 🛡️ **Role-Based Access Control (RBAC)**: Strict permission boundaries ensuring users only access authorized data.
* 🔒 **Encrypted Password Hashing**: Passwords stored using industry-standard bcrypt/Argon2 hashing algorithms.
* 📋 **Audit Trails**: Real-time logging of all attendance checks and administrative actions.

---

## 👥 Team & Contributors

* **Team Lead / Full-Stack Developer** – *Project Architecture & Full-Stack Implementation*
* **AI & Backend Developer** – *FastAPI Endpoints, Database Schemas & Telemetry Engine*
* **UI/UX Designer** – *Responsive Components, Motion Animations & System Theme*

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## ✉️ Contact & Support

* **Project Repository**: [GitHub Repository](https://github.com/your-username/triconnect)
* **Email**: support@triconnect.edu
* **LinkedIn**: [TriConnect Project](https://linkedin.com/company/triconnect)

---

<p align="center">
  Built with ❤️ for the Hackathon
</p>
