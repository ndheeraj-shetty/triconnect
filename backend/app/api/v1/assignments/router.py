from fastapi import APIRouter, Depends, status, UploadFile, File, Form, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.models.coursework import Assignment, HomeworkSubmission, QuestChapter, QuestLevel, NoteResource
from app.models.user import User
from app.schemas.coursework import (
    AssignmentResponse, AssignmentCreate, HomeworkSubmissionResponse,
    QuestChapterCreate, QuestChapterResponse, QuestLevelCreate, QuestLevelResponse,
    QuestSubmitAttemptRequest, QuestSubmitAttemptResponse, StudentWalletResponse,
    StudentStreakResponse, AchievementBadgeResponse, LeaderboardEntry,
    NoteResourceResponse, NoteResourceCreate, QuestGenerateFromNoteRequest
)
from app.repositories.school import student_repo, teacher_repo
from app.services.coursework import quest_service
from app.dependencies.auth import get_current_active_user, RoleChecker
from app.utils.file_handler import save_uploaded_file
from app.core.exceptions import AppException, NotFoundException
from sqlalchemy import select
from datetime import datetime

router = APIRouter(prefix="/assignments", tags=["Assignments & Homework"])

# --- Legacy Compatibility Endpoints ---
@router.post("/", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_new_assignment(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Publish a new gamified coursework assignment quest (Admin & Teacher only)."""
    new_assign = Assignment(**payload.model_dump())
    db.add(new_assign)
    db.commit()
    db.refresh(new_assign)
    return new_assign

@router.get("/", response_model=List[AssignmentResponse])
def list_assignments(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve list of active assignment quests."""
    query = select(Assignment).where(Assignment.is_deleted == False).offset(skip).limit(limit)
    return list(db.execute(query).scalars().all())

@router.post("/{id}/submit", response_model=HomeworkSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_homework_quest(
    id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit a homework file for an assignment (Student only). Saves file to storage."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise AppException("Only Student accounts can submit homework quests.")
        
    assignment = db.get(Assignment, id)
    if not assignment:
        raise NotFoundException("Assignment not found")

    # Save physical file
    file_path = await save_uploaded_file(file, "submissions")
    
    submission = HomeworkSubmission(
        assignment_id=assignment.id,
        student_id=student.id,
        submission_file_path=file_path,
        status="Waiting Review"
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return submission

@router.put("/submissions/{sub_id}/grade", response_model=HomeworkSubmissionResponse)
def grade_homework_submission(
    sub_id: UUID,
    score: int = Query(..., ge=0, le=100),
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Grade a student homework submission and award XP points (Admin & Teacher only)."""
    sub = db.get(HomeworkSubmission, sub_id)
    if not sub:
        raise NotFoundException("Submission not found")
        
    sub.status = "Graded"
    if score >= 50:
        xp_earned = sub.assignment.xp_reward if sub.assignment else 100
        sub.xp_awarded = xp_earned
        sub.student.xp_score += xp_earned
        while sub.student.xp_score >= sub.student.level * 100:
            sub.student.xp_score -= sub.student.level * 100
            sub.student.level += 1
            
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


# ==========================================================
# 🎮 GAMIFIED LEARNING QUESTS ENDPOINTS
# ==========================================================

@router.get("/quests/map/{subject_id}")
def get_subject_adventure_map(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve adventure chapters and nodes level configurations for a subject map."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only student profiles can access adventure maps.")
    return quest_service.get_subject_quest_map(db, student.id, subject_id)


@router.post("/quests/attempt", response_model=QuestSubmitAttemptResponse)
def submit_quest_level_attempt(
    payload: QuestSubmitAttemptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Process learning activity completions: verifies score thresholds, handles hearts/streaks, and unlocks items."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only students can submit quest attempts.")
    return quest_service.record_quest_attempt(db, student.id, payload)


@router.get("/quests/wallet", response_model=StudentWalletResponse)
def get_student_game_wallet(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Fetch current inventory of coins and hearts for the logged-in student."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only students possess quest wallets.")
    return quest_service.get_or_create_wallet(db, student.id)


@router.post("/quests/wallet/refill", response_model=StudentWalletResponse)
def purchase_extra_hearts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deduct 50 coins to restore hearts to maximum level (5)."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only students can buy hearts.")
    return quest_service.purchase_hearts(db, student.id)


@router.get("/quests/leaderboard", response_model=List[LeaderboardEntry])
def get_school_quest_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve global weekly school leaderboard ranks."""
    return quest_service.get_weekly_leaderboard(db)


# --- Content Creation (Teacher / Admin Panel) ---

@router.post("/quests/chapters", response_model=QuestChapterResponse, status_code=status.HTTP_201_CREATED)
def create_quest_chapter(
    payload: QuestChapterCreate,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Create a new chapter adventure division (Teacher / Admin only)."""
    new_chapter = QuestChapter(**payload.model_dump())
    db.add(new_chapter)
    db.commit()
    db.refresh(new_chapter)
    return new_chapter


@router.post("/quests/levels", response_model=QuestLevelResponse, status_code=status.HTTP_201_CREATED)
def create_quest_level(
    payload: QuestLevelCreate,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Publish a new adventure node level containing interactive learning layouts (Teacher / Admin only)."""
    new_level = QuestLevel(**payload.model_dump())
    db.add(new_level)
    db.commit()
    db.refresh(new_level)
    return new_level


# --- Study Notes & Syllabus Generation Endpoints ---

@router.get("/notes", response_model=List[NoteResourceResponse])
def list_teacher_uploaded_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Fetch all study notes resources uploaded by teachers."""
    return list(db.query(NoteResource).all())


@router.post("/notes", response_model=NoteResourceResponse, status_code=status.HTTP_201_CREATED)
def upload_study_notes(
    payload: NoteResourceCreate,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Upload study notes and lecture resources (Admin & Teacher only)."""
    note = NoteResource(**payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/quests/generate-from-notes")
def generate_quest_from_notes(
    payload: QuestGenerateFromNoteRequest,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Parses a teacher study notes file and generates a syllabus-bound question configuration."""
    return quest_service.generate_quest_from_note(
        db=db,
        note_id=payload.note_id,
        activity_type=payload.activity_type,
        difficulty=payload.difficulty
    )
