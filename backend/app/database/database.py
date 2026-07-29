from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from typing import Generator
from app.core.config import settings

# Attempt to build postgres engine, falling back to SQLite if PostgreSQL port is closed/offline
try:
    if "postgresql" in settings.DATABASE_URL:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={"connect_timeout": 2}
        )
        # Connect to verify PostgreSQL server is actually up and running
        with engine.connect() as conn:
            pass
    else:
        raise ValueError("Not PostgreSQL")
except (OperationalError, ValueError, Exception):
    # Dynamic SQLite fallback for simplified local execution
    engine = create_engine(
        "sqlite:///./test.db",
        connect_args={"check_same_thread": False}
    )

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base
Base = declarative_base()

def get_db() -> Generator:
    """Dependency helper providing thread-local database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
