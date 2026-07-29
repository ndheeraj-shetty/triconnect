from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

# DirectMessage
class DirectMessageCreate(BaseModel):
    recipient_id: UUID
    text: str

class DirectMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    sender_id: UUID
    recipient_id: UUID
    text: str
    timestamp: datetime
    is_read: bool

# Event
class EventBase(BaseModel):
    title: str
    type: str # holiday, exam, event, homework
    date: datetime
    time: str | None = None
    location: str | None = None
    description: str | None = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime

# Notification
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime

# Settings
class SettingsCreate(BaseModel):
    key: str
    value: str

class SettingsResponse(SettingsCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID

# AcademicReport
class AcademicReportCreate(BaseModel):
    student_id: UUID
    term: str
    grade_average: float
    ai_dean_comment: str | None = None

class AcademicReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    term: str
    grade_average: float
    transcript_file_path: str | None = None
    ai_dean_comment: str | None = None
    created_at: datetime

# AnalyticsSummary
class AnalyticsSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    metric_key: str
    metric_value: float
    category: str | None = None
    created_at: datetime
