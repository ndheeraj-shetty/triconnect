# triconnect API — FastAPI School Intelligence Backend

Production-ready backend for the **triconnect / TriConnect** School Intelligence platform, built with FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, and Pydantic V2.

## 🚀 One-Command Startup (Docker)

To build and spin up the complete backend service along with a PostgreSQL database, run:
```bash
docker-compose up --build
```
This runs the API on `http://localhost:8000` and seeds the database automatically.

## 🔑 Sandbox Test Accounts (Pre-Seeded)

The database seeder automatically creates sandbox profiles on startup:

| Role | Email | Password | Linked Data |
|---|---|---|---|
| **Admin** | `admin@triconnect.com` | `admin123` | Full access controls |
| **Teacher** | `teacher@triconnect.com` | `teacher123` | Class advisor for Calculus 10A |
| **Student** | `student@triconnect.com` | `student123` | Level 3 student in Calculus 10A |
| **Parent** | `parent@triconnect.com` | `parent123` | Guardian of `student@triconnect.com` |

## 📖 Swagger Documentation

Once running, you can explore the fully interactive Swagger API docs at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🧪 Running the Unit Tests

We use `pytest` with a mock SQLite database override to verify all routes. Run:
```bash
cd backend
pip install -r requirements.txt
pytest
```
This tests logins, registrations, geofenced attendance logs, assignment submission pipelines, and AI transcript comments.

## 🛠️ Folder Structure

- `app/api/v1/`: API Route controllers.
- `app/models/`: SQLAlchemy 2.0 database tables.
- `app/schemas/`: Pydantic V2 input/output validators.
- `app/repositories/`: Generic CRUD database query classes.
- `app/services/`: Core school operations and attendance rules.
- `app/ai/`: Student wellbeing prediction and weekly digest stubs.
- `app/dependencies/`: JWT authentication decoding and Role-Based Access Checks (RBAC).
