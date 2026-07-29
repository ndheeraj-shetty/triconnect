from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.models.user import User
from app.schemas.wellbeing import (
    MoodCheckInCreate, MoodCheckInResponse, ChatHistoryCreate, ChatHistoryResponse,
    CounsellingRequestCreate, CounsellingRequestResponse, StudentWellBeingDashboard
)
from app.repositories.school import student_repo
from app.services.wellbeing import wellbeing_service
from app.dependencies.auth import get_current_active_user, RoleChecker

router = APIRouter(prefix="/wellbeing", tags=["Student Well-Being Companion"])

@router.post("/mood", response_model=MoodCheckInResponse, status_code=status.HTTP_201_CREATED)
def record_daily_mood_checkin(
    payload: MoodCheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Log the student's daily emoji mood check-in score (Student only)."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only students can log mood check-ins.")
    return wellbeing_service.record_mood(db, student.id, payload)


@router.post("/chat")
def chat_with_wellbeing_companion(
    payload: ChatHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Dialogue endpoint to chat with the AI supportive mentor chatbot companion."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only students can chat with the wellness companion.")
    return wellbeing_service.chat_with_companion(db, student.id, payload)


@router.get("/dashboard", response_model=StudentWellBeingDashboard)
def get_student_wellbeing_companion_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve full mood tracker history, motivation health scores, and AI recommendations."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only students can access the wellness dashboard.")
    return wellbeing_service.get_student_dashboard(db, student.id)


@router.post("/counselling/book", response_model=CounsellingRequestResponse, status_code=status.HTTP_201_CREATED)
def schedule_counselling_session(
    payload: CounsellingRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Initiate booking slot for school counselor meeting, generating AI summary details."""
    student = student_repo.get_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=400, detail="Only students can schedule counselling sessions.")
    return wellbeing_service.create_counselling_booking(db, student.id, payload)


# --- Teacher Dashboard Endpoints ---

@router.get("/teacher/dashboard")
def get_teacher_wellness_dashboard(
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Retrieve aggregated school wellness diagnostics and pending counseling requests."""
    return wellbeing_service.get_teacher_wellbeing_dashboard(db)


@router.post("/teacher/requests/{req_id}/status")
def update_counselling_request_status(
    req_id: UUID,
    status_val: str,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Update status of student counselling requests (Scheduled, Completed, Cancelled)."""
    from app.models.wellbeing import CounsellingRequest
    req = db.query(CounsellingRequest).filter(CounsellingRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req.status = status_val
    db.add(req)
    db.commit()
    return {"message": "Status updated successfully", "status": status_val}
