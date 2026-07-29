from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin
from datetime import datetime, timezone

class MoodCheckIn(Base, BaseModelMixin):
    """Daily mood tracking registrations."""
    __tablename__ = "mood_checkins"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    mood_score = Column(Integer, nullable=False)  # 1 to 5: 5 (Great), 4 (Good), 3 (Okay), 2 (Stressed), 1 (Sad)
    mood_text = Column(String(500), nullable=True)
    checkin_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="mood_checkins")


class ChatHistory(Base, BaseModelMixin):
    """AI companion confidential chat records (hidden from parents/teachers to protect privacy)."""
    __tablename__ = "chat_histories"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    sender = Column(String(50), nullable=False)  # STUDENT, AI
    message = Column(Text, nullable=False)
    sentiment = Column(String(50), nullable=True)  # POSITIVE, NEUTRAL, NEGATIVE
    detected_emotion = Column(String(50), nullable=True)  # JOY, SADNESS, STRESS, ANXIETY, LONELINESS, BURNOUT, BULLYING_INDICATOR
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="chat_logs")


class WellBeingScore(Base, BaseModelMixin):
    """Calculated metrics for student psychological and academic wellness indices."""
    __tablename__ = "wellbeing_scores"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    academic_health_score = Column(Float, default=100.0, nullable=False)
    attendance_score = Column(Float, default=100.0, nullable=False)
    learning_progress_score = Column(Float, default=100.0, nullable=False)
    motivation_score = Column(Float, default=100.0, nullable=False)
    stress_indicator_score = Column(Float, default=0.0, nullable=False)
    overall_wellbeing_score = Column(Float, default=100.0, nullable=False)
    risk_level = Column(String(50), default="Green", nullable=False)  # Green, Yellow, Orange, Red
    calculated_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="wellbeing_scores")


class RiskAssessment(Base, BaseModelMixin):
    """Explainable AI (XAI) logs documenting diagnostics conclusion rationale."""
    __tablename__ = "risk_assessments"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    risk_level = Column(String(50), nullable=False)  # Green, Yellow, Orange, Red
    reason_explanation = Column(Text, nullable=False)  # Explainable reason log
    assessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="risk_assessments")


class CounsellingRequest(Base, BaseModelMixin):
    """Teacher or student initiated school counselling session requests."""
    __tablename__ = "counselling_requests"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    preferred_date = Column(Date, nullable=False)
    preferred_time = Column(String(50), nullable=False)
    reason = Column(String(255), nullable=False)
    ai_summary = Column(Text, nullable=True)  # AI summary generated from signals
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, SCHEDULED, COMPLETED, CANCELLED
    counsellor_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="counselling_requests")
    sessions = relationship("CounsellingSession", back_populates="request", cascade="all, delete-orphan")


class CounsellingSession(Base, BaseModelMixin):
    """Counselling slot mappings linked to school reminders pipeline."""
    __tablename__ = "counselling_sessions"

    request_id = Column(ForeignKey("counselling_requests.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="Scheduled", nullable=False)  # Scheduled, Completed, Cancelled, Rescheduled
    teacher_reminded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    request = relationship("CounsellingRequest", back_populates="sessions")
    reminders = relationship("TeacherReminder", back_populates="session", cascade="all, delete-orphan")


class TeacherReminder(Base, BaseModelMixin):
    """Automated notifications sent to assigned teachers ahead of wellbeing counselling sessions."""
    __tablename__ = "teacher_reminders"

    session_id = Column(ForeignKey("counselling_sessions.id"), nullable=False)
    reminder_type = Column(String(50), nullable=False)  # 24_HOURS_BEFORE, 1_HOUR_BEFORE, 15_MINUTES_BEFORE, SESSION_MISSED
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), default="SENT", nullable=False)  # SENT, PENDING

    # Relationships
    session = relationship("CounsellingSession", back_populates="reminders")


class AIInsight(Base, BaseModelMixin):
    """Early anomaly warning triggers generated by aggregating attendance, homework, and chats."""
    __tablename__ = "ai_insights"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    insight_text = Column(Text, nullable=False)
    trend_direction = Column(String(50), nullable=False)  # IMPROVING, DECLINING, STABLE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="ai_insights")


class StudentRecommendation(Base, BaseModelMixin):
    """Self-help activities recommended to students (breathing, micro-breaks, study planning)."""
    __tablename__ = "student_recommendations"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    recommendation_type = Column(String(100), nullable=False)  # STUDY_PLAN, BREATHING_EXERCISE, TIME_MANAGEMENT
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="recommendations")
