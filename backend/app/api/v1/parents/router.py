from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.repositories.school import parent_repo
from app.schemas.school import ParentResponse, StudentResponse
from app.dependencies.auth import RoleChecker
from app.ai.services import ai_service
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/parents", tags=["Parents"])
staff_check = RoleChecker(allowed_roles=["admin", "teacher"])

@router.get("/", response_model=List[ParentResponse])
def list_parents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_staff = Depends(staff_check)
):
    """Retrieve parents list (Admin & Teacher only)."""
    return parent_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}/students", response_model=List[StudentResponse])
def list_parent_students(id: UUID, db: Session = Depends(get_db)):
    """Fetch students linked to this parent."""
    parent = parent_repo.get(db, id)
    if not parent:
        raise NotFoundException("Parent profile not found")
        
    return parent.students

@router.get("/{id}/weekly-digest")
def get_parent_weekly_digest(id: UUID, db: Session = Depends(get_db)):
    """Retrieve AI-generated weekly progress report for children of the parent."""
    parent = parent_repo.get(db, id)
    if not parent:
        raise NotFoundException("Parent profile not found")
        
    digests = []
    for child in parent.students:
        child_user_name = child.user.email.split("@")[0] if child.user else "Student"
        active_quests = 3
        digest_text = ai_service.generate_parent_digest(child_user_name, 98.4, active_quests)
        digests.append({
            "student_id": child.id,
            "student_name": child_user_name,
            "digest": digest_text
        })
        
    return {"success": True, "weekly_digests": digests}
