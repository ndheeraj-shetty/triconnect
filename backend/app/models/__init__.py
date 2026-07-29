from app.database.database import Base
from app.models.user import User, Role
from app.models.school import ClassGroup, Subject, Student, Teacher, Parent
from app.models.telemetry import Attendance, AttendanceSettings, AttendanceSession, AttendanceRecord, AttendanceLog, ViolationLog, SchoolLocation
from app.models.coursework import (
    Assignment, HomeworkSubmission, NoteResource, Certificate,
    QuestChapter, QuestLevel, StudentQuestProgress, StudentStreak, AchievementBadge, StudentWallet,
    LearningQuest, QuestLevels, QuestQuestions, QuestAttempts, QuestRewards,
    Homework, HomeworkAttachments, HomeworkSubmissionNew, SubmissionFiles,
    HomeworkReview, HomeworkGrades, HomeworkComments
)
from app.models.interaction import DirectMessage, Event, Notification, Settings, AcademicReport, AnalyticsSummary
from app.models.biometric import BiometricCredential, FaceEmbedding
from app.models.security import AuditLog, UserSession, UserDevice
from app.models.wellbeing import (
    MoodCheckIn, ChatHistory, WellBeingScore, RiskAssessment,
    CounsellingRequest, CounsellingSession, TeacherReminder, AIInsight, StudentRecommendation
)

# Export all models for Alembic autodiscovery
__all__ = [
    "Base",
    "User",
    "Role",
    "ClassGroup",
    "Subject",
    "Student",
    "Teacher",
    "Parent",
    "Attendance",
    "AttendanceSettings",
    "AttendanceSession",
    "AttendanceRecord",
    "AttendanceLog",
    "ViolationLog",
    "SchoolLocation",
    "Assignment",
    "HomeworkSubmission",
    "NoteResource",
    "Certificate",
    "QuestChapter",
    "QuestLevel",
    "StudentQuestProgress",
    "StudentStreak",
    "AchievementBadge",
    "StudentWallet",
    "MoodCheckIn",
    "ChatHistory",
    "WellBeingScore",
    "RiskAssessment",
    "CounsellingRequest",
    "CounsellingSession",
    "TeacherReminder",
    "AIInsight",
    "StudentRecommendation",
    "DirectMessage",
    "Event",
    "Notification",
    "Settings",
    "AcademicReport",
    "AnalyticsSummary",
    "BiometricCredential",
    "FaceEmbedding",
    "AuditLog",
    "UserSession",
    "UserDevice",
]
