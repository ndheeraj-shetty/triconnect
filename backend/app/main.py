from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.middlewares.rate_limit import RateLimitingMiddleware
from app.core.logging import logger

# Import API routers
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.students import router as students_router
from app.api.v1.teachers import router as teachers_router
from app.api.v1.parents import router as parents_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.assignments import router as assignments_router
from app.api.v1.reports import router as reports_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.events import router as events_router
from app.api.v1.messages import router as messages_router
from app.api.v1.webauthn import router as webauthn_router
from app.api.v1.wellbeing.router import router as wellbeing_router

# Initialize App
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready FastAPI backend for TriConnect/triconnect platform.",
    version="1.0.0",
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Rate Limiter and Security Headers
app.add_middleware(RateLimitingMiddleware)

# Custom Global Exception Formatters
register_exception_handlers(app)

# Include v1 routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(students_router, prefix=settings.API_V1_STR)
app.include_router(teachers_router, prefix=settings.API_V1_STR)
app.include_router(parents_router, prefix=settings.API_V1_STR)
app.include_router(attendance_router, prefix=settings.API_V1_STR)
app.include_router(assignments_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(events_router, prefix=settings.API_V1_STR)
app.include_router(messages_router, prefix=settings.API_V1_STR)
app.include_router(webauthn_router, prefix=settings.API_V1_STR + "/webauthn")
app.include_router(wellbeing_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "success": True,
        "message": "Welcome to triconnect School Intelligence API",
        "docs_url": "/docs"
    }

# Database seeding hook on startup
@app.on_event("startup")
def seed_database():
    """Verify tables exist and seed default roles, subjects, and mock sandbox accounts."""
    import os
    if os.getenv("TESTING") == "True":
        logger.info("Testing environment detected. Skipping database seeder.")
        return

    from app.database.database import engine, SessionLocal
    from app.database.database import Base
    from app.models.user import User, Role
    from app.models.school import Subject, Teacher, Student, Parent, ClassGroup
    from app.core.security import get_password_hash
    
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    
    # Auto-migration: Ensure face enrollment columns exist in SQLite database
    from sqlalchemy import text
    with engine.connect() as conn:
        for col_stmt in [
            "ALTER TABLE students ADD COLUMN face_enrolled BOOLEAN DEFAULT 0 NOT NULL;",
            "ALTER TABLE students ADD COLUMN face_embedding TEXT;",
            "ALTER TABLE students ADD COLUMN face_image TEXT;",
            "ALTER TABLE students ADD COLUMN enrolled_at DATETIME;"
        ]:
            try:
                conn.execute(text(col_stmt))
                conn.commit()
            except Exception:
                pass  # Column already exists
    
    db = SessionLocal()
    try:
        # Check if roles are already seeded
        role_count = db.query(Role).count()
        if role_count == 0:
            logger.info("Seeding system roles...")
            admin_role = Role(name="admin", description="Full system administration privileges")
            teacher_role = Role(name="teacher", description="Manage classrooms and grade assignments")
            student_role = Role(name="student", description="Attend courses and level up XP quests")
            parent_role = Role(name="parent", description="Track children progress alerts")
            
            db.add_all([admin_role, teacher_role, student_role, parent_role])
            db.commit()
            
            # Fetch fresh roles IDs
            admin_id = admin_role.id
            teacher_id = teacher_role.id
            student_id = student_role.id
            parent_id = parent_role.id
            
            logger.info("Seeding subjects...")
            chem = Subject(name="Chemistry Lab Demonstration", code="CHEM-10B")
            calc = Subject(name="AP Calculus BC Workgroups", code="CALC-10A")
            phys = Subject(name="Physics Mechanics", code="PHYS-11A")
            db.add_all([chem, calc, phys])
            db.commit()
            
            logger.info("Seeding initial demo accounts (admin, teacher, parent)...")
            # Admin demo account — used by the Admin Portal (demo mode, no login required).
            admin_user = User(
                username="admin@triconnect.com",
                email="admin@triconnect.com",
                hashed_password=get_password_hash("admin123"),
                role_id=admin_id,
                is_verified=True,
                first_login=False
            )
            # Teacher demo account — used by the Teacher Portal (demo mode).
            teacher_user = User(
                username="teacher@triconnect.com",
                email="teacher@triconnect.com",
                hashed_password=get_password_hash("teacher123"),
                role_id=teacher_id,
                is_verified=True,
                first_login=False
            )
            # Parent demo account — used by the Parent Portal (demo mode).
            parent_user = User(
                username="parent@triconnect.com",
                email="parent@triconnect.com",
                hashed_password=get_password_hash("parent123"),
                role_id=parent_id,
                is_verified=True,
                first_login=False
            )
            # NOTE: No student demo account is seeded.
            # Students MUST be registered by a School Administrator via the
            # Admin Portal → Register Student page (POST /api/v1/auth/register-student).
            # Any student without an admin-provisioned record cannot log in.
            db.add_all([admin_user, teacher_user, parent_user])
            db.commit()

            # Profiles for teacher and parent
            teacher_profile = Teacher(user_id=teacher_user.id, specialty_subject=calc, division="Mathematics Division")
            parent_profile = Parent(user_id=parent_user.id, phone="+1-555-0199")
            db.add_all([teacher_profile, parent_profile])
            db.commit()

            class_group = ClassGroup(name="Mathematics Calculus 10A", grade="Grade 10", advisor=teacher_profile)
            db.add(class_group)
            db.commit()

            logger.info("Database seeder completed. No student accounts seeded — admin must register students.")
    except Exception as e:
        logger.error(f"Database seeder failed: {str(e)}", exc_info=True)
        db.rollback()
    finally:
        db.close()
