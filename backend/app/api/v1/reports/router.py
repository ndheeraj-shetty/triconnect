from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.models.interaction import AcademicReport
from app.schemas.interaction import AcademicReportResponse, AcademicReportCreate
from app.repositories.school import student_repo
from app.dependencies.auth import RoleChecker
from app.ai.services import ai_service
from app.core.exceptions import NotFoundException
from sqlalchemy import select

router = APIRouter(prefix="/reports", tags=["Academic Reports"])

@router.post("/", response_model=AcademicReportResponse, status_code=status.HTTP_201_CREATED)
def create_report_with_dean_remarks(
    payload: AcademicReportCreate,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Generate academic reports and seed comments utilizing dean AI insights (Admin & Teacher only)."""
    student = student_repo.get(db, payload.student_id)
    if not student:
        raise NotFoundException("Student not found")
        
    # Generate automated AI dean remarks if not explicitly provided
    comment = payload.ai_dean_comment
    if not comment:
        classroom_name = student.classroom.name if student.classroom else "General Class"
        student_name = student.user.username.split("@")[0] if student.user else "Student"
        comment = ai_service.generate_dean_remarks(student_name, student.level, classroom_name)
        
    db_report = AcademicReport(
        student_id=payload.student_id,
        term=payload.term,
        grade_average=payload.grade_average,
        ai_dean_comment=comment
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.post("/student/{student_id}/generate", response_model=AcademicReportResponse, status_code=status.HTTP_201_CREATED)
def generate_student_report(
    student_id: UUID,
    term: str = Query(..., description="Academic term (e.g. Term 4)"),
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Automatically synthesize academic grades and generate reports using AI dean remarks (Admin & Teacher only)."""
    student = student_repo.get(db, student_id)
    if not student:
        raise NotFoundException("Student not found")
        
    classroom_name = student.classroom.name if student.classroom else "General Class"
    student_name = student.user.username.split("@")[0] if student.user else "Student"
    
    # Call generate_dean_remarks containing class name
    comment = ai_service.generate_dean_remarks(student_name, student.level, classroom_name)
    
    db_report = AcademicReport(
        student_id=student.id,
        term=term,
        grade_average=student.gpa * 25.0,  # Map 4.0 scale GPA to percentage
        ai_dean_comment=comment
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("/student/{student_id}", response_model=List[AcademicReportResponse])
def get_student_academic_reports(
    student_id: UUID, 
    db: Session = Depends(get_db)
):
    """Retrieve all reports generated for a student."""
    query = select(AcademicReport).where(AcademicReport.student_id == student_id, AcademicReport.is_deleted == False)
    return list(db.execute(query).scalars().all())
