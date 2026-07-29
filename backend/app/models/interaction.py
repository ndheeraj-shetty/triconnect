from sqlalchemy import Column, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin
from datetime import datetime, timezone

class DirectMessage(Base, BaseModelMixin):
    """Direct chat messages for parent-teacher communication."""
    __tablename__ = "direct_messages"

    sender_id = Column(ForeignKey("users.id"), nullable=False)
    recipient_id = Column(ForeignKey("users.id"), nullable=False)
    text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")


class Event(Base, BaseModelMixin):
    """Calendar Events schedule table."""
    __tablename__ = "events"

    title = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False) # holiday, exam, event, homework
    date = Column(DateTime, nullable=False)
    time = Column(String(50), nullable=True)
    location = Column(String(200), nullable=True)
    description = Column(String(500), nullable=True)


class Notification(Base, BaseModelMixin):
    """User notifications log."""
    __tablename__ = "notifications"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")


class Settings(Base, BaseModelMixin):
    """Global system config settings."""
    __tablename__ = "settings"

    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(String(500), nullable=False)


class AcademicReport(Base, BaseModelMixin):
    """Student Grade Transcripts and dean remarks."""
    __tablename__ = "academic_reports"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    term = Column(String(50), nullable=False) # Term 1, Term 2, etc.
    grade_average = Column(Float, default=0.0, nullable=False)
    transcript_file_path = Column(String(500), nullable=True)
    ai_dean_comment = Column(Text, nullable=True)

    # Relationships
    student = relationship("Student", back_populates="academic_reports")


class AnalyticsSummary(Base, BaseModelMixin):
    """Analytics snapshots cache."""
    __tablename__ = "analytics_summaries"

    metric_key = Column(String(100), index=True, nullable=False)
    metric_value = Column(Float, nullable=False)
    category = Column(String(100), nullable=True)
