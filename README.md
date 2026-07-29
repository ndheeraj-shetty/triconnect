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

## 📌 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [AI Features](#-ai-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Installation Guide](#-installation-guide)
- [Environment Variables](#-environment-variables)
- [Database Setup & Migrations](#-database-setup--migrations)
- [API Documentation](#-api-documentation)
- [Attendance Workflow](#-attendance-workflow)
- [User Roles & Permissions](#-user-roles--permissions)
- [Screenshots](#-screenshots)
- [Known Limitations](#-known-limitations)
- [Future Scope](#-future-scope)
- [License & Contact](#-license--contact)

---

## 📌 Project Overview

Educational institutions face significant operational fragmentation across administrative, academic, and communication channels:

* **Administrative Overhead**: Manual attendance tracking, paper records, and repetitive operational tasks consume valuable teaching hours.
* **Communication Gaps**: Disconnected feedback loops between teachers, students, and parents lead to delayed academic interventions.
* **Attendance Inefficiencies**: Traditional roll-calls are prone to errors, proxy attendance, and lack real-time parent notifications.
* **Student Performance & Engagement**: Fragmented assessment data makes early academic risk detection difficult and reduces student motivation.

### 💡 How TriConnect Solves This

**TriConnect** bridges these gaps by serving as a unified digital ecosystem. Combining **real-time biometrics, AI-driven student risk analytics, gamified learning quests, and seamless parent-teacher communication**, TriConnect streamlines school operations and enhances student performance.

---

## ⭐ Key Features

| Feature Module | Key Functionality | Description |
| :--- | :--- | :--- |
| 🧑‍🎓 **Student Hub** | Personalized Dashboard | Real-time overview of attendance, assignments, timetable, XP scores, and notifications. |
| 🎮 **Gamified Learning** | AI Learning Quest | Earn XP points, unlock badges, level up, and view class leaderboards through course completion. |
| 📸 **Smart Attendance** | Biometric & Camera Verification | First-login face enrollment, live webcam capture, and side-by-side verification workflow. |
| 👩‍🏫 **Teacher Hub** | Classroom Management | Track student attendance records, publish assignments, issue notes, and view burnout analytics. |
| 👨‍👩‍👧 **Parent Portal** | Real-Time Monitoring | Direct check-in alerts, academic progress reports, and direct teacher communication. |
| 🛠️ **Admin Hub** | Campus Operations | Manage school settings, student onboarding, system audits, and global security policies. |
| 📊 **Analytics** | Performance Insights | AI-driven analytics to detect student performance drops and attendance anomalies early. |

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

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & UI** | Vanilla CSS, Tailwind CSS v4, Framer Motion, Lucide React Icons |
| **Backend Framework** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | SQLite / PostgreSQL, SQLAlchemy v2.0, Alembic |
| **Security & Auth** | JWT (JSON Web Tokens), Bcrypt, Role-Based Access Control (RBAC) |
| **Biometric Processing** | NumPy, Custom Cosine Similarity Vector Engine (`face_engine.py`) |

---

## 📂 Folder Structure

```text
triconnect/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/              # API Route Handlers (V1)
│   │   │   └── v1/
│   │   │       ├── attendance/   # Smart Attendance Endpoints
│   │   │       ├── auth/         # Login & JWT Endpoints
│   │   │       ├── school/       # School Management Endpoints
│   │   │       └── user/         # User Profile Endpoints
│   │   ├── core/             # Security, JWT, Logging, Config
│   │   ├── database/         # DB Connection & Session Management
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── schemas/          # Pydantic Request/Response Models
│   │   ├── services/         # Business Logic, Telemetry & Biometrics
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── .env.example          # Backend Environment Template
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
├── docs/                     # Documentation & Screenshots
│   └── screenshots/          # Image Placeholders for README
├── .env.example              # Project-wide Environment Template
├── .gitignore                # Git Exclusions
├── LICENSE                   # MIT License
├── package.json              # Frontend Dependencies
└── README.md                 # Documentation
```

---

## ⚡ Installation Guide

Follow these step-by-step instructions to clone and run TriConnect on your local environment:

### 1. Prerequisites
- **Node.js** (v18.0 or higher)
- **Python** (v3.10 or higher)
- **Git**

### 2. Clone Repository
```bash
git clone https://github.com/your-username/triconnect.git
cd triconnect
```

### 3. Setup Frontend
```bash
# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
The frontend will start at `http://localhost:3000`.

### 4. Setup Backend
Open a new terminal window:
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server
python -m uvicorn app.main:app --reload --port 8000
```
The backend API service will run at `http://localhost:8000`, and interactive Swagger API documentation will be available at `http://localhost:8000/docs`.

---

## 🔑 Environment Variables

Copy `.env.example` to create your local `.env` files:

```bash
# Root / Frontend Config (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Backend Config (backend/.env)
DATABASE_URL=sqlite:///./triconnect.db
JWT_SECRET=your_super_secret_jwt_key_here
SECRET_KEY=your_super_secret_app_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENAI_API_KEY=your_openai_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🗄️ Database Setup & Migrations

TriConnect uses **SQLAlchemy ORM** with **SQLite** by default for lightweight local development, with support for **PostgreSQL** in production.

### Auto Database Initialization
Upon launching the backend server (`python -m uvicorn app.main:app --reload`), SQLite tables and seed data are automatically initialized if no database exists.

### PostgreSQL Migration (Optional)
To switch to PostgreSQL, update `DATABASE_URL` in `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/triconnect_db
```
Then run Alembic migrations:
```bash
cd backend
alembic upgrade head
```

---

## 📡 API Documentation Summary

The FastAPI backend exposes structured RESTful endpoints documented interactively at `http://localhost:8000/docs`:

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user and issue JWT access token. |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch currently authenticated user profile. |
| **Attendance** | `GET` | `/api/v1/attendance/enrollment-status` | Check if student face enrollment is completed. |
| **Attendance** | `POST` | `/api/v1/attendance/enroll-face` | Store student face enrollment image & feature vector. |
| **Attendance** | `POST` | `/api/v1/attendance/verify` | Process live attendance photo verification and record check-in. |
| **Attendance** | `GET` | `/api/v1/attendance/settings` | Retrieve active attendance session settings & hours. |
| **Admin** | `POST` | `/api/v1/admin/register-student` | Register new student record and generate login credentials. |

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

| Role | Permissions & Access Level |
| :--- | :--- |
| 🧑‍🎓 **Student** | Perform first-login face enrollment, mark daily attendance via live webcam, complete AI learning quests, view timetable and grade reports. |
| 👩‍🏫 **Teacher** | Access class rosters, inspect daily attendance logs, assign homework, publish notices, and view student burnout risk indicators. |
| 👨‍👩‍👧 **Parent** | Receive real-time student check-in alerts, review academic progress analytics, and communicate with teachers. |
| 🛠️ **Admin** | Onboard students & teachers, configure campus settings, audit verification logs, and manage system security policies. |

---

## 🖼️ Screenshots

*(Add screenshot previews of your application screens below)*

| Screen View | Reference Path |
| :--- | :--- |
| **Landing Page** | `docs/screenshots/landing-page.png` |
| **Student Dashboard** | `docs/screenshots/student-dashboard.png` |
| **Teacher Dashboard** | `docs/screenshots/teacher-dashboard.png` |
| **Parent Dashboard** | `docs/screenshots/parent-dashboard.png` |
| **Admin Operations** | `docs/screenshots/admin-dashboard.png` |
| **Smart Attendance** | `docs/screenshots/attendance.png` |
| **Learning Quest** | `docs/screenshots/learning-quest.png` |
| **Analytics Overview** | `docs/screenshots/analytics.png` |

---

## ⚠️ Known Limitations

In accordance with transparent open-source practices, the current Hackathon MVP implementation includes the following known scope boundaries:

1. **Local Database Scope**: The default setup uses SQLite (`triconnect.db`) for zero-configuration local deployment.
2. **Camera Hardware Permission**: Web-based camera verification requires browser permissions (`navigator.mediaDevices.getUserMedia`).
3. **Web Biometric Pipeline**: Face verification uses client-assisted L2 vector embedding matching optimized for demo reliability and low-latency response.

---

## 🚀 Future Scope

- 🤖 **Production-Grade Deep Learning Models**: Integration with InsightFace / PyTorch models for heavy server-side neural inference.
- 💬 **AI Assistant Chatbot**: Natural language query resolution for students and parents.
- 📱 **Native Mobile Application**: Cross-platform React Native app with push notifications.
- 🚌 **Smart Bus Tracking**: Real-time GPS tracking of school buses for parents.
- 🪪 **Digital Smart NFC/QR Badges**: NFC-enabled tap-to-enter campus security gates.

---

## 📜 License & Contributors

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

### Contributors & Team
- **Full-Stack Architecture & Lead** – *Project Lead*
- **Backend & AI Telemetry Service** – *Core Backend Developer*
- **Frontend & UI/UX Design** – *Frontend Developer*

---

<p align="center">
  Built with ❤️ for the Hackathon
</p>
