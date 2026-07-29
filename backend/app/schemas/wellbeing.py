from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime, date

class MoodCheckInBase(BaseModel):
    mood_score: int
    mood_text: str | None = None
    checkin_date: date

class MoodCheckInCreate(MoodCheckInBase):
    pass

class MoodCheckInResponse(MoodCheckInBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    created_at: datetime


class ChatHistoryBase(BaseModel):
    sender: str
    message: str
    sentiment: str | None = None
    detected_emotion: str | None = None

class ChatHistoryCreate(ChatHistoryBase):
    pass

class ChatHistoryResponse(ChatHistoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    created_at: datetime


class WellBeingScoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    academic_health_score: float
    attendance_score: float
    learning_progress_score: float
    motivation_score: float
    stress_indicator_score: float
    overall_wellbeing_score: float
    risk_level: str
    calculated_date: date
    created_at: datetime


class RiskAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    risk_level: str
    reason_explanation: str
    assessed_at: datetime


class CounsellingRequestCreate(BaseModel):
    preferred_date: date
    preferred_time: str
    reason: str

class CounsellingRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    preferred_date: date
    preferred_time: str
    reason: str
    ai_summary: str | None = None
    status: str
    counsellor_notes: str | None = None
    created_at: datetime


class CounsellingSessionBase(BaseModel):
    scheduled_time: datetime
    status: str

class CounsellingSessionResponse(CounsellingSessionBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    request_id: UUID
    teacher_reminded_at: datetime | None = None
    created_at: datetime


class TeacherReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    session_id: UUID
    reminder_type: str
    sent_at: datetime
    status: str


class AIInsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    insight_text: str
    trend_direction: str
    created_at: datetime


class StudentRecommendationBase(BaseModel):
    recommendation_type: str
    title: str
    description: str
    is_completed: bool = False

class StudentRecommendationResponse(StudentRecommendationBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    created_at: datetime


# Dashboard Aggregations
class StudentWellBeingDashboard(BaseModel):
    mood_score_today: int | None = None
    mood_text_today: str | None = None
    academic_health_score: float
    attendance_score: float
    learning_progress_score: float
    motivation_score: float
    stress_indicator_score: float
    overall_wellbeing_score: float
    risk_level: str
    ai_insights: list[str]
    recommendations: list[StudentRecommendationResponse]
