from sqlalchemy import Column, String, Float, Integer, ForeignKey, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin

class ClassGroup(Base, BaseModelMixin):
    """Classrooms/Grades grouping model."""
    __tablename__ = "classes"

    name = Column(String(100), nullable=False)
    grade = Column(String(50), nullable=False)
    
    advisor_id = Column(ForeignKey("teachers.id"), nullable=True)

    # Relationships
    advisor = relationship("Teacher", foreign_keys=[advisor_id], back_populates="advised_classes")
    students = relationship("Student", back_populates="classroom")
    attendance_records = relationship("Attendance", back_populates="classroom")


class Subject(Base, BaseModelMixin):
    """Academic subjects database table."""
    __tablename__ = "subjects"

    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)

    # Relationships
    teachers = relationship("Teacher", back_populates="specialty_subject")
    assignments = relationship("Assignment", back_populates="subject")
    notes = relationship("NoteResource", back_populates="subject")
    chapters = relationship("QuestChapter", back_populates="subject", cascade="all, delete-orphan")
    quests = relationship("LearningQuest", back_populates="subject", cascade="all, delete-orphan")
    homeworks = relationship("Homework", back_populates="subject", cascade="all, delete-orphan")


class Student(Base, BaseModelMixin):
    """Student Profiles mapping grades, XP scores, and levels."""
    __tablename__ = "students"

    user_id = Column(ForeignKey("users.id"), unique=True, nullable=False)
    student_identifier = Column(String(100), unique=True, index=True, nullable=True)
    class_id = Column(ForeignKey("classes.id"), nullable=True)
    parent_id = Column(ForeignKey("parents.id"), nullable=True)
    
    gpa = Column(Float, default=4.0, nullable=False)
    xp_score = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    wellbeing_index = Column(Float, default=100.0, nullable=False)
    
    # Onboarding details
    full_name = Column(String(255), nullable=True)
    roll_number = Column(String(100), nullable=True)
    class_name = Column(String(100), nullable=True)
    section = Column(String(50), nullable=True)
    parent_name = Column(String(255), nullable=True)
    parent_phone = Column(String(100), nullable=True)
    parent_email = Column(String(255), nullable=True)

    # Face Enrollment fields
    face_enrolled = Column(Boolean, default=False, nullable=False)
    face_embedding = Column(Text, nullable=True)
    face_image = Column(Text, nullable=True)
    enrolled_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    classroom = relationship("ClassGroup", foreign_keys=[class_id], back_populates="students")
    parent = relationship("Parent", back_populates="students")
    
    attendance = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    attendance_records_new = relationship("AttendanceRecord", back_populates="student", cascade="all, delete-orphan")
    attendance_logs = relationship("AttendanceLog", back_populates="student", cascade="all, delete-orphan")
    violation_logs = relationship("ViolationLog", back_populates="student", cascade="all, delete-orphan")
    
    submissions = relationship("HomeworkSubmission", back_populates="student", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="student", cascade="all, delete-orphan")
    academic_reports = relationship("AcademicReport", back_populates="student", cascade="all, delete-orphan")
    
    quest_progress = relationship("StudentQuestProgress", back_populates="student", cascade="all, delete-orphan")
    streak = relationship("StudentStreak", back_populates="student", uselist=False, cascade="all, delete-orphan")
    badges = relationship("AchievementBadge", back_populates="student", cascade="all, delete-orphan")
    wallet = relationship("StudentWallet", back_populates="student", uselist=False, cascade="all, delete-orphan")
    quest_attempts = relationship("QuestAttempts", back_populates="student", cascade="all, delete-orphan")
    quest_rewards = relationship("QuestRewards", back_populates="student", cascade="all, delete-orphan")
    homework_submissions = relationship("HomeworkSubmissionNew", back_populates="student", cascade="all, delete-orphan")

    # Well-being relationships
    mood_checkins = relationship("MoodCheckIn", back_populates="student", cascade="all, delete-orphan")
    chat_logs = relationship("ChatHistory", back_populates="student", cascade="all, delete-orphan")
    wellbeing_scores = relationship("WellBeingScore", back_populates="student", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="student", cascade="all, delete-orphan")
    counselling_requests = relationship("CounsellingRequest", back_populates="student", cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="student", cascade="all, delete-orphan")
    recommendations = relationship("StudentRecommendation", back_populates="student", cascade="all, delete-orphan")


class Teacher(Base, BaseModelMixin):
    """Teacher profile mapping divisions and burnout metrics."""
    __tablename__ = "teachers"

    user_id = Column(ForeignKey("users.id"), unique=True, nullable=False)
    subject_id = Column(ForeignKey("subjects.id"), nullable=True)
    
    division = Column(String(100), nullable=True)
    burnout_score = Column(Float, default=0.0, nullable=False)
    
    # Onboarding details
    full_name = Column(String(255), nullable=True)
    department = Column(String(100), nullable=True)
    subjects = Column(String(255), nullable=True)
    class_teacher_of = Column(String(100), nullable=True)
    phone = Column(String(100), nullable=True)

    # Relationships
    user = relationship("User", back_populates="teacher_profile")
    specialty_subject = relationship("Subject", back_populates="teachers")
    advised_classes = relationship("ClassGroup", foreign_keys="[ClassGroup.advisor_id]", back_populates="advisor")
    uploaded_notes = relationship("NoteResource", back_populates="teacher")


class Parent(Base, BaseModelMixin):
    """Parent Profile holding contact coordinates."""
    __tablename__ = "parents"

    user_id = Column(ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    
    # Onboarding details
    full_name = Column(String(255), nullable=True)
    relationship = Column(String(100), nullable=True)

    # Relationships
    from sqlalchemy.orm import relationship as sa_rel
    user = sa_rel("User", back_populates="parent_profile")
    students = sa_rel("Student", back_populates="parent")
