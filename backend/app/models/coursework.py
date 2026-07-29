from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Float, Text, Date, JSON
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin
from datetime import datetime, timezone

# --- Legacy Compatibility Classes (Do Not Break Existing Imports) ---
class Assignment(Base, BaseModelMixin):
    """Gamified assignment quests."""
    __tablename__ = "assignments"

    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    due_date = Column(DateTime, nullable=False)
    xp_reward = Column(Integer, default=100, nullable=False)
    difficulty = Column(String(50), default="Medium", nullable=False) # Easy, Medium, Hard
    
    subject_id = Column(ForeignKey("subjects.id"), nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="assignments")
    submissions = relationship("HomeworkSubmission", back_populates="assignment", cascade="all, delete-orphan")


class HomeworkSubmission(Base, BaseModelMixin):
    """Student submission of assignments."""
    __tablename__ = "homework_submissions"

    assignment_id = Column(ForeignKey("assignments.id"), nullable=False)
    student_id = Column(ForeignKey("students.id"), nullable=False)
    
    submission_file_path = Column(String(500), nullable=False)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), default="Waiting Review", nullable=False) # Waiting Review, Graded
    xp_awarded = Column(Integer, default=0, nullable=False)

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("Student", back_populates="submissions")


class NoteResource(Base, BaseModelMixin):
    """Lecture Study Notes and files uploaded by teachers."""
    __tablename__ = "notes_resources"

    title = Column(String(200), nullable=False)
    file_path = Column(String(500), nullable=False)
    downloads_count = Column(Integer, default=0, nullable=False)
    
    subject_id = Column(ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(ForeignKey("teachers.id"), nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="notes")
    teacher = relationship("Teacher", back_populates="uploaded_notes")


class Certificate(Base, BaseModelMixin):
    """Achievement certificates awarded to students."""
    __tablename__ = "certificates"

    title = Column(String(200), nullable=False)
    tagline = Column(String(200), nullable=True)
    criteria = Column(String(500), nullable=True)
    gold_seal_verified = Column(Boolean, default=False, nullable=False)
    
    student_id = Column(ForeignKey("students.id"), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="certificates")


# ==========================================================
# 🎮 GAMIFIED ASSIGNMENT SYSTEM (LEARNING QUESTS)
# ==========================================================

class QuestChapter(Base, BaseModelMixin):
    """An adventure chapter mapping specific subjects (e.g. Mathematics Kingdom Chapter 1)."""
    __tablename__ = "quest_chapters"

    subject_id = Column(ForeignKey("subjects.id"), nullable=False)
    chapter_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)

    # Relationships
    subject = relationship("Subject", back_populates="chapters")
    levels = relationship("QuestLevel", back_populates="chapter", cascade="all, delete-orphan")


class QuestLevel(Base, BaseModelMixin):
    """Individual circular level nodes on the game adventure map."""
    __tablename__ = "quest_levels"

    chapter_id = Column(ForeignKey("quest_chapters.id"), nullable=False)
    level_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    
    activity_type = Column(String(50), default="MCQ", nullable=False)  # MCQ, Coding, Puzzle, DragDrop, FillInBlanks, Boss
    difficulty = Column(String(50), default="Easy", nullable=False)     # Easy, Medium, Hard, Boss
    
    xp_reward = Column(Integer, default=100, nullable=False)
    coins_reward = Column(Integer, default=10, nullable=False)
    passing_percentage = Column(Float, default=60.0, nullable=False)
    
    hints_allowed = Column(Integer, default=2, nullable=False)
    ai_difficulty_adjust = Column(Boolean, default=True, nullable=False)
    
    quest_content = Column(Text, nullable=False) # JSON payload containing questions, answers, codes, etc.

    # Relationships
    chapter = relationship("QuestChapter", back_populates="levels")
    progress_records = relationship("StudentQuestProgress", back_populates="level", cascade="all, delete-orphan")


class StudentQuestProgress(Base, BaseModelMixin):
    """Verified student level-completion marks recording stats: accuracy, stars, time and hearts."""
    __tablename__ = "student_quest_progress"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    level_id = Column(ForeignKey("quest_levels.id"), nullable=False)
    
    stars_earned = Column(Integer, default=0, nullable=False)  # 0 to 3 Stars
    xp_earned = Column(Integer, default=0, nullable=False)
    coins_earned = Column(Integer, default=0, nullable=False)
    
    completion_time_sec = Column(Integer, default=0, nullable=False)
    accuracy_percentage = Column(Float, default=0.0, nullable=False)
    
    status = Column(String(50), default="COMPLETED", nullable=False) # COMPLETED, FAILED
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="quest_progress")
    level = relationship("QuestLevel", back_populates="progress_records")


class StudentStreak(Base, BaseModelMixin):
    """Tracks daily continuous study streaks to incentivize consistent learning."""
    __tablename__ = "student_streaks"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    current_streak = Column(Integer, default=0, nullable=False)
    last_activity_date = Column(Date, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="streak")


class AchievementBadge(Base, BaseModelMixin):
    """Unlocked badges and trophies awarded for chapters completion and streak milestones."""
    __tablename__ = "achievement_badges"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    badge_name = Column(String(255), nullable=False)
    badge_type = Column(String(100), nullable=False)  # e.g., CHAPTER_COMPLETION, STREAK_5_DAYS
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="badges")


class StudentWallet(Base, BaseModelMixin):
    """Coin registers and extra hearts inventory allocated for question retries."""
    __tablename__ = "student_wallets"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    coins = Column(Integer, default=50, nullable=False)
    hearts = Column(Integer, default=5, nullable=False)   # Duolingo-style hearts (max 5)
    hearts_disabled = Column(Boolean, default=False, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="wallet")


# ==========================================================
# 🎮 MODULE 1: LEARNING QUESTS (GAMIFIED ASSIGNMENTS)
# ==========================================================

class LearningQuest(Base, BaseModelMixin):
    """Gamified syllabus chapters mapping interactive level nodes."""
    __tablename__ = "learning_quests"

    subject_id = Column(ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(ForeignKey("teachers.id"), nullable=True)
    title = Column(String(255), nullable=False)
    chapter = Column(String(255), nullable=False)
    class_name = Column(String(255), nullable=False)
    notes_ref = Column(String(500), nullable=True)  # Note reference
    learning_objectives = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Medium", nullable=False)
    passing_percentage = Column(Float, default=60.0, nullable=False)
    unlock_rules = Column(String(255), default="sequential", nullable=False)
    number_of_levels = Column(Integer, default=4, nullable=False)
    status = Column(String(24), default="draft", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="quests")
    levels = relationship("QuestLevels", back_populates="quest", cascade="all, delete-orphan")


class QuestLevels(Base, BaseModelMixin):
    """Circular path adventure nodes divided by AI syllabus scanners."""
    __tablename__ = "learning_quest_levels"

    quest_id = Column(ForeignKey("learning_quests.id"), nullable=False)
    level_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="Easy", nullable=False)
    xp_reward = Column(Integer, default=100, nullable=False)
    coins_reward = Column(Integer, default=10, nullable=False)

    # Relationships
    quest = relationship("LearningQuest", back_populates="levels")
    questions = relationship("QuestQuestions", back_populates="level", cascade="all, delete-orphan")
    attempts = relationship("QuestAttempts", back_populates="level", cascade="all, delete-orphan")


class QuestQuestions(Base, BaseModelMixin):
    """AI generated syllabus-bound exercises (MCQs, coding, etc.)."""
    __tablename__ = "learning_quest_questions"

    level_id = Column(ForeignKey("learning_quest_levels.id"), nullable=False)
    question_type = Column(String(100), nullable=False)  # MCQ, FillInBlanks, MatchFollowing, Coding, dragdrop
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=False)
    hints = Column(String(500), nullable=True)
    explanation = Column(Text, nullable=True)
    source_reference = Column(Text, nullable=False, default="")
    source_confidence = Column(Float, nullable=True)

    # Relationships
    level = relationship("QuestLevels", back_populates="questions")


class QuestAttempts(Base, BaseModelMixin):
    """Tracks student stars, accuracy, and completions."""
    __tablename__ = "learning_quest_attempts"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    level_id = Column(ForeignKey("learning_quest_levels.id"), nullable=False)
    stars_earned = Column(Integer, default=0, nullable=False)  # 0 to 3
    xp_earned = Column(Integer, default=0, nullable=False)
    coins_earned = Column(Integer, default=0, nullable=False)
    accuracy_percentage = Column(Float, default=0.0, nullable=False)
    completion_time_sec = Column(Integer, default=0, nullable=False)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="quest_attempts")
    level = relationship("QuestLevels", back_populates="attempts")


class QuestRewards(Base, BaseModelMixin):
    """XP, coin balances, and achievements progress."""
    __tablename__ = "learning_quest_rewards"

    student_id = Column(ForeignKey("students.id"), nullable=False)
    reward_type = Column(String(100), nullable=False)  # XP, COINS, BADGES, ACHIEVEMENTS
    value = Column(Integer, default=0, nullable=False)
    badge_name = Column(String(255), nullable=True)
    unlocked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="quest_rewards")


# ==========================================================
# 📝 MODULE 2: HOMEWORK MANAGEMENT (PROFESSIONAL TASKS)
# ==========================================================

class Homework(Base, BaseModelMixin):
    """Traditional non-gamified homework parameters with rubrics and deadlocks."""
    __tablename__ = "homeworks"

    subject_id = Column(ForeignKey("subjects.id"), nullable=False)
    teacher_id = Column(ForeignKey("teachers.id"), nullable=True)
    title = Column(String(255), nullable=False)
    class_name = Column(String(255), nullable=False)
    section = Column(String(50), nullable=True)
    chapter = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    instructions = Column(Text, nullable=True)
    homework_objective = Column(String(500), nullable=True)
    estimated_completion_time = Column(Integer, default=60, nullable=False)  # Minutes
    assigned_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    submission_deadline = Column(DateTime, nullable=False)
    late_submission_allowed = Column(Boolean, default=True, nullable=False)
    late_penalty_percentage = Column(Float, default=10.0, nullable=False)
    maximum_marks = Column(Float, default=100.0, nullable=False)
    rubric_description = Column(Text, nullable=True)
    allowed_submission_types = Column(JSON, default=lambda: ["PDF"], nullable=False)
    max_file_size_bytes = Column(Integer, default=26214400, nullable=False)
    max_file_count = Column(Integer, default=3, nullable=False)
    allow_multiple_files = Column(Boolean, default=True, nullable=False)
    allow_resubmission = Column(Boolean, default=True, nullable=False)

    # Relationships
    subject = relationship("Subject", back_populates="homeworks")
    attachments = relationship("HomeworkAttachments", back_populates="homework", cascade="all, delete-orphan")
    submissions = relationship("HomeworkSubmissionNew", back_populates="homework", cascade="all, delete-orphan")


class HomeworkAttachments(Base, BaseModelMixin):
    """File notes, reference materials, slides and references."""
    __tablename__ = "homework_attachments"

    homework_id = Column(ForeignKey("homeworks.id"), nullable=False)
    file_path = Column(String(500), nullable=False)
    attachment_type = Column(String(100), nullable=False)  # PDF, NOTE, IMAGE, VIDEO, LINK

    # Relationships
    homework = relationship("Homework", back_populates="attachments")


class HomeworkSubmissionNew(Base, BaseModelMixin):
    """Student homework uploads, status markers and comment lists."""
    __tablename__ = "homework_submissions_new"

    homework_id = Column(ForeignKey("homeworks.id"), nullable=False)
    student_id = Column(ForeignKey("students.id"), nullable=False)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(50), default="Pending", nullable=False)  # Pending, Submitted, Under Review, Reviewed, Graded, Needs Resubmission, Late
    student_notes = Column(Text, nullable=True)

    # Relationships
    homework = relationship("Homework", back_populates="submissions")
    student = relationship("Student", back_populates="homework_submissions")
    files = relationship("SubmissionFiles", back_populates="submission", cascade="all, delete-orphan")
    reviews = relationship("HomeworkReview", back_populates="submission", cascade="all, delete-orphan")
    grades = relationship("HomeworkGrades", back_populates="submission", cascade="all, delete-orphan")
    comments = relationship("HomeworkComments", back_populates="submission", cascade="all, delete-orphan")


class SubmissionFiles(Base, BaseModelMixin):
    """Physical documents or cloud repository links uploaded by students."""
    __tablename__ = "submission_files"

    submission_id = Column(ForeignKey("homework_submissions_new.id"), nullable=False)
    file_path = Column(String(500), nullable=True)
    github_link = Column(String(500), nullable=True)
    drive_link = Column(String(500), nullable=True)
    original_filename = Column(String(512), nullable=True)
    mime_type = Column(String(128), nullable=True)
    size_bytes = Column(Integer, nullable=True)
    storage_key = Column(String(1024), nullable=True)

    # Relationships
    submission = relationship("HomeworkSubmissionNew", back_populates="files")


class HomeworkReview(Base, BaseModelMixin):
    """Remarks, mistakes annotations, resubmission flags."""
    __tablename__ = "homework_reviews"

    submission_id = Column(ForeignKey("homework_submissions_new.id"), nullable=False)
    feedback_notes = Column(Text, nullable=True)
    mistakes_highlighted = Column(Text, nullable=True)
    needs_resubmission = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=True, nullable=False)
    reviewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    submission = relationship("HomeworkSubmissionNew", back_populates="reviews")


class HomeworkGrades(Base, BaseModelMixin):
    """Marks and grade sheets registered on reviews approval."""
    __tablename__ = "homework_grades"

    submission_id = Column(ForeignKey("homework_submissions_new.id"), nullable=False)
    marks_assigned = Column(Float, nullable=True)
    grade_letter = Column(String(20), nullable=True)  # A+, A, B, Pass/Fail, Completed
    is_completed_only = Column(Boolean, default=False, nullable=False)
    graded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    submission = relationship("HomeworkSubmissionNew", back_populates="grades")


class HomeworkComments(Base, BaseModelMixin):
    """Review discussions remarks exchanged on homework submissions."""
    __tablename__ = "homework_comments"

    submission_id = Column(ForeignKey("homework_submissions_new.id"), nullable=False)
    author_role = Column(String(50), nullable=False)  # TEACHER, STUDENT
    comment_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    submission = relationship("HomeworkSubmissionNew", back_populates="comments")
