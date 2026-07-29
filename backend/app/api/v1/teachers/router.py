from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.repositories.school import teacher_repo
from app.schemas.school import TeacherResponse
from app.dependencies.auth import RoleChecker
from app.core.exceptions import NotFoundException

router = APIRouter(prefix="/teachers", tags=["Teachers"])
admin_check = RoleChecker(allowed_roles=["admin"])

@router.get("/", response_model=List[TeacherResponse])
def list_teachers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin = Depends(admin_check)
):
    """Retrieve list of teachers (Admin only)."""
    return teacher_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=TeacherResponse)
def get_teacher_by_id(id: UUID, db: Session = Depends(get_db)):
    """Fetch details of a single teacher profile."""
    teacher = teacher_repo.get(db, id)
    if not teacher:
        raise NotFoundException("Teacher not found")
    return teacher
