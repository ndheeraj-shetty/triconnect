from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

# Assignment
class AssignmentBase(BaseModel):
    title: str
    description: str | None = None
    due_date: datetime
    xp_reward: int = 100
    difficulty: str = "Medium" # Easy, Medium, Hard

class AssignmentCreate(AssignmentBase):
    subject_id: UUID

class AssignmentResponse(AssignmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    subject_id: UUID
    created_at: datetime

# HomeworkSubmission
class HomeworkSubmissionBase(BaseModel):
    submission_file_path: str
    status: str = "Waiting Review" # Waiting Review, Graded
    xp_awarded: int = 0

class HomeworkSubmissionCreate(HomeworkSubmissionBase):
    assignment_id: UUID
    student_id: UUID

class HomeworkSubmissionResponse(HomeworkSubmissionBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    assignment_id: UUID
    student_id: UUID
    submitted_at: datetime

# NoteResource
class NoteResourceBase(BaseModel):
    title: str
    file_path: str
    downloads_count: int = 0

class NoteResourceCreate(NoteResourceBase):
    subject_id: UUID
    teacher_id: UUID

class NoteResourceResponse(NoteResourceBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    subject_id: UUID
    teacher_id: UUID
    created_at: datetime

# Certificate
class CertificateBase(BaseModel):
    title: str
    tagline: str | None = None
    criteria: str | None = None
    gold_seal_verified: bool = False

class CertificateCreate(CertificateBase):
    student_id: UUID

class CertificateResponse(CertificateBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    created_at: datetime


# ==========================================================
# 🎮 GAMIFIED ASSIGNMENT SCHEMAS (LEARNING QUESTS)
# ==========================================================

class QuestChapterBase(BaseModel):
    subject_id: UUID
    chapter_number: int
    title: str
    description: str | None = None

class QuestChapterCreate(QuestChapterBase):
    pass

class QuestChapterResponse(QuestChapterBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID


class QuestLevelBase(BaseModel):
    chapter_id: UUID
    level_number: int
    title: str
    activity_type: str  # MCQ, Coding, Puzzle, DragDrop, FillInBlanks, Boss
    difficulty: str     # Easy, Medium, Hard, Boss
    xp_reward: int = 100
    coins_reward: int = 10
    passing_percentage: float = 60.0
    hints_allowed: int = 2
    ai_difficulty_adjust: bool = True
    quest_content: str  # JSON payload representing the interactive questions

class QuestLevelCreate(QuestLevelBase):
    pass

class QuestLevelResponse(QuestLevelBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID


class QuestSubmitAttemptRequest(BaseModel):
    level_id: UUID
    completion_time_sec: int
    accuracy_percentage: float
    hearts_left: int
    answers_payload: str | None = None  # optional tracking of student inputs

class QuestSubmitAttemptResponse(BaseModel):
    stars_earned: int
    xp_earned: int
    coins_earned: int
    streak_count: int
    badge_unlocked: str | None = None
    level_unlocked: UUID | None = None
    status: str  # COMPLETED, FAILED


class StudentWalletResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    coins: int
    hearts: int
    hearts_disabled: bool


class StudentStreakResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    current_streak: int
    last_activity_date: str


class AchievementBadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    badge_name: str
    badge_type: str
    unlocked_at: datetime


class LeaderboardEntry(BaseModel):
    student_name: str
    roll_number: str
    xp: int
    streak: int
    rank: int


class QuestGenerateFromNoteRequest(BaseModel):
    note_id: UUID
    activity_type: str
    difficulty: str

