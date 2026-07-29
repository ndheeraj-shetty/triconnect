from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Integer, Date
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin
from datetime import datetime, timezone

class AttendanceSettings(Base, BaseModelMixin):
    """Admin configuration settings for Smart Attendance geofencing & biometrics."""
    __tablename__ = "attendance_settings"

    school_name = Column(String(255), default="Westside Academy High", nullable=False)
    campus_name = Column(String(255), default="Main Campus", nullable=False)
    latitude = Column(Float, default=37.7749, nullable=False)  # Example: San Francisco latitude
    longitude = Column(Float, default=-122.4194, nullable=False)
    radius = Column(Float, default=100.0, nullable=False)       # Radius in meters
    
    start_time = Column(String(50), default="08:15 AM", nullable=False)
    end_time = Column(String(50), default="09:00 AM", nullable=False)
    late_threshold = Column(String(50), default="08:30 AM", nullable=False)
    
    face_match_threshold = Column(Float, default=0.80, nullable=False)
    max_face_attempts = Column(Integer, default=3, nullable=False)
    liveness_sensitivity = Column(Float, default=0.70, nullable=False)


class AttendanceSession(Base, BaseModelMixin):
    """Daily system-wide attendance window generated dynamically."""
    __tablename__ = "attendance_sessions"

    date = Column(Date, unique=True, index=True, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    # Relationships
    records = relationship("AttendanceRecord", back_populates="session")


class AttendanceRecord(Base, BaseModelMixin):
    """Verified student attendance record matching geofencing, face matching and liveness checkpoints."""
    __tablename__ = "attendance_records"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    session_id = Column(ForeignKey("attendance_sessions.id"), nullable=False)
    
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    
    face_match_confidence = Column(Float, nullable=True)
    liveness_score = Column(Float, nullable=True)
    status = Column(String(50), nullable=False)  # Present, Late, Absent, Excused
    device_info = Column(String(255), nullable=True)
    
    verified_gps = Column(Boolean, default=False, nullable=False)
    verified_liveness = Column(Boolean, default=False, nullable=False)
    verified_face = Column(Boolean, default=False, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="attendance_records_new")
    session = relationship("AttendanceSession", back_populates="records")


class AttendanceLog(Base, BaseModelMixin):
    """Audit trials of all attendance verification attempts (Success / Fail reasons)."""
    __tablename__ = "attendance_logs"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), nullable=False)  # SUCCESS, FAILED
    reason = Column(String(255), nullable=True)
    details = Column(String(500), nullable=True)

    # Relationships
    student = relationship("Student", back_populates="attendance_logs")


class ViolationLog(Base, BaseModelMixin):
    """Security violations tracking GPS coordinates outliers outside allowed radius."""
    __tablename__ = "violation_logs"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    distance = Column(Float, nullable=False)
    allowed_radius = Column(Float, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="violation_logs")


class SchoolLocation(Base, BaseModelMixin):
    """School location and geofencing configuration for student attendance verification (supports multiple campuses)."""
    __tablename__ = "school_locations"

    school_id = Column(String(255), nullable=True)  # supports multi-school SaaS
    campus_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    formatted_address = Column(String(500), nullable=True)
    attendance_radius = Column(Float, default=100.0, nullable=False)
    
    created_by = Column(ForeignKey("users.id"), nullable=True)

    # Relationships
    creator = relationship("User")


# --- Compatibility Stub ---
class Attendance(Base, BaseModelMixin):
    """Smart Attendance registry (Legacy Stub to support legacy routes)."""
    __tablename__ = "attendance"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    class_id = Column(ForeignKey("classes.id"), nullable=False)
    
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), nullable=False)  # Present, Late, Absent
    method = Column(String(100), nullable=False) # GPS Face Scan, Bus Check-in, Manual
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    geofence_verified = Column(Boolean, default=False, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="attendance")
    classroom = relationship("ClassGroup", back_populates="attendance_records")
