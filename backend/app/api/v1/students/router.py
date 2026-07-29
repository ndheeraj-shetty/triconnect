from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.repositories.school import student_repo
from app.schemas.school import StudentResponse
from app.dependencies.auth import RoleChecker
from app.ai.services import ai_service
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/students", tags=["Students"])
faculty_check = RoleChecker(allowed_roles=["admin", "teacher"])

@router.get("/", response_model=List[StudentResponse])
def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_staff = Depends(faculty_check)
):
    """List student profiles (Admin & Teacher only)."""
    return student_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=StudentResponse)
def get_student_by_id(id: UUID, db: Session = Depends(get_db)):
    """Fetch details of a single student."""
    student = student_repo.get(db, id)
    if not student:
        raise NotFoundException("Student not found")
    return student

@router.get("/{id}/analytics")
def get_student_ai_analytics(id: UUID, db: Session = Depends(get_db), current_staff = Depends(faculty_check)):
    """Trigger AI Student Analytics based on academic metrics (Admin & Teacher only)."""
    student = student_repo.get(db, id)
    if not student:
        raise NotFoundException("Student not found")
    
    # Calculate mock grade history
    attendance_rate = 96.5
    grades = [88.5, 92.0, 78.5, 95.0]
    return ai_service.generate_student_analytics(attendance_rate, grades)

@router.get("/{id}/performance-prediction")
def get_student_performance_prediction(id: UUID, db: Session = Depends(get_db), current_staff = Depends(faculty_check)):
    """Predict future student academic trajectory and identify burnout hazards (Admin & Teacher only)."""
    student = student_repo.get(db, id)
    if not student:
        raise NotFoundException("Student not found")
        
    grades_history = [74.0, 78.5, 82.0, 86.0, 88.5]
    return ai_service.predict_performance(grades_history)
