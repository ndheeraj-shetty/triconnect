from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.database.database import get_db
from app.repositories.school import student_repo
from app.dependencies.auth import RoleChecker
from app.ai.services import ai_service
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/analytics", tags=["AI Analytics"])
staff_check = RoleChecker(allowed_roles=["admin", "teacher"])

@router.get("/student/{student_id}")
def get_student_predictive_wellbeing(student_id: UUID, db: Session = Depends(get_db), current_staff = Depends(staff_check)):
    """Evaluate student stress triggers and forecast overall classroom burnout index (Admin & Teacher only)."""
    student = student_repo.get(db, student_id)
    if not student:
        raise NotFoundException("Student not found")
        
    gpa = 85.0
    absences = 2
    mood_score = 4 # scale 1-5
    
    wellbeing = ai_service.analyze_wellbeing(mood_score, absences, gpa)
    return {
        "student_id": student.id,
        "wellbeing_evaluation": wellbeing
    }
