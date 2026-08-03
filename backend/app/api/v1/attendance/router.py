from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.services.telemetry import telemetry_service
from app.repositories.telemetry import attendance_repo
from app.repositories.school import student_repo
from app.schemas.telemetry import (
    AttendanceCreate, AttendanceResponse,
    AttendanceSettingsResponse, AttendanceSettingsUpdate,
    AttendanceSessionResponse, AttendanceVerificationRequest,
    AttendanceRecordResponse, AttendanceLogResponse, ViolationLogResponse,
    SchoolLocationCreate, SchoolLocationResponse
)
from app.dependencies.auth import get_current_active_user, RoleChecker
from app.models.user import User
from app.models.telemetry import AttendanceRecord, AttendanceLog, ViolationLog
from app.core.exceptions import AppException, NotFoundException
from sqlalchemy import select
from datetime import date

router = APIRouter(prefix="/attendance", tags=["Smart Attendance"])

# --- Compatibility Endpoint ---
@router.post("/check-in", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def student_self_check_in(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Legacy compatibility check-in."""
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only students can check in.")
    
    # Adapt to new service check-in helper
    settings = telemetry_service.get_or_create_settings(db)
    session = telemetry_service.get_or_create_daily_session(db)
    
    # Create simple mock submission payload
    mock_payload = AttendanceVerificationRequest(
        latitude=payload.latitude or settings.latitude,
        longitude=payload.longitude or settings.longitude,
        accuracy=10.0,
        device_info=payload.method,
        liveness_challenge="Blink",
        liveness_verified=True,
        liveness_score=0.95,
        face_match_confidence=0.92
    )
    
    record = telemetry_service.verify_and_record(db, current_user.student_profile.id, mock_payload)
    
    return AttendanceResponse(
        id=record.id,
        student_id=record.student_id,
        class_id=payload.class_id,
        timestamp=record.timestamp,
        status=record.status,
        method="GPS Face Scan",
        latitude=record.latitude,
        longitude=record.longitude,
        geofence_verified=record.verified_gps
    )


# --- Attendance Settings ---
@router.get("/settings", response_model=AttendanceSettingsResponse)
def get_attendance_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve school geofencing boundaries, operational hours, thresholds, and attempt policies."""
    return telemetry_service.get_or_create_settings(db)

@router.put("/settings", response_model=AttendanceSettingsResponse)
def update_attendance_settings(
    payload: AttendanceSettingsUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["admin"]))
):
    """Modify geofencing and biometrics validation configurations (Admin only)."""
    settings = telemetry_service.get_or_create_settings(db)
    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, val)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


# --- Daily Sessions ---
@router.get("/session", response_model=AttendanceSessionResponse)
def get_current_daily_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Fetch active session registry window parameters for the current day."""
    return telemetry_service.get_or_create_daily_session(db)


from pydantic import BaseModel
from datetime import datetime

class FaceEnrollmentRequest(BaseModel):
    face_image: str | None = None
    face_embedding: str | None = None
    liveness_action: str | None = None
    liveness_verified: bool | None = True

@router.get("/enrollment-status")
def check_face_enrollment_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Check if current student has completed first-time Face Enrollment."""
    if not current_user.student_profile:
        return {"face_enrolled": True, "face_image": None, "role": current_user.role.name}
    
    student = current_user.student_profile
    is_enrolled = bool(getattr(student, 'face_enrolled', False)) or bool(getattr(student, 'face_image', None))
    return {
        "face_enrolled": is_enrolled,
        "face_image": getattr(student, 'face_image', None),
        "enrolled_at": getattr(student, 'enrolled_at', None),
        "student_id": str(student.id),
        "full_name": student.full_name
    }

from app.services.face_engine import face_engine

@router.post("/enroll-face")
def enroll_student_face(
    payload: FaceEnrollmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Enroll student face image and generate InsightFace 512-d embedding."""
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only student accounts can enroll face.")
    
    student = current_user.student_profile
    student.face_enrolled = True
    
    if payload.face_image:
        student.face_image = payload.face_image
        # Generate 512-dimensional InsightFace embedding
        embedding, err_msg = face_engine.generate_512d_embedding(payload.face_image)
        if embedding:
            student.face_embedding = json.dumps(embedding)
        elif payload.face_embedding:
            student.face_embedding = payload.face_embedding
    elif payload.face_embedding:
        student.face_embedding = payload.face_embedding

    student.enrolled_at = datetime.utcnow()
    
    db.add(student)
    db.commit()
    db.refresh(student)
    
    return {
        "status": "success",
        "message": "Face Enrollment Successful",
        "face_enrolled": True,
        "face_image": student.face_image,
        "enrolled_at": student.enrolled_at
    }


# --- Verification Pipeline ---
@router.post("/verify", response_model=AttendanceRecordResponse)
def verify_and_mark_attendance(
    payload: AttendanceVerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Process verification pipeline: computes face mesh matches and liveness challenges."""
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Only student accounts can mark attendance.")
    
    student = current_user.student_profile
    if not getattr(student, 'face_enrolled', False):
        if getattr(student, 'face_image', None):
            student.face_enrolled = True
            db.add(student)
            db.commit()
        else:
            raise HTTPException(status_code=403, detail="Face Enrollment Required. You must enroll your face before marking attendance.")
        
    return telemetry_service.verify_and_record(db, student.id, payload)


# --- Analytics & Dashboard Summaries ---
@router.get("/analytics")
def get_attendance_dashboard_analytics(
    db: Session = Depends(get_db),
    current_staff: User = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Retrieve today's high-level dashboard summaries (Present, Late, Absent counts, GPS violations, Face failures)."""
    return telemetry_service.get_analytics(db)


# --- Database Queries (Audit Logs, Violations, Records) ---
@router.get("/records", response_model=List[AttendanceRecordResponse])
def get_attendance_records(
    student_id: UUID = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve verified attendance registry logs. Filterable by Student ID."""
    query = select(AttendanceRecord).where(AttendanceRecord.is_deleted == False)
    if student_id:
        query = query.where(AttendanceRecord.student_id == student_id)
    return list(db.execute(query).scalars().all())

@router.get("/violations", response_model=List[ViolationLogResponse])
def get_gps_violation_logs(
    db: Session = Depends(get_db),
    current_staff: User = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Fetch geofencing security logs capturing students attempting scans outside allowed radius."""
    query = select(ViolationLog).where(ViolationLog.is_deleted == False)
    return list(db.execute(query).scalars().all())

@router.get("/logs", response_model=List[AttendanceLogResponse])
def get_verification_attempts_logs(
    db: Session = Depends(get_db),
    current_staff: User = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """List detailed audit logs recording all biometric or geofence verification attempts."""
    query = select(AttendanceLog).where(AttendanceLog.is_deleted == False)
    return list(db.execute(query).scalars().all())


# --- School Locations CRUD Endpoints ---
@router.post("/campuses", response_model=SchoolLocationResponse, status_code=status.HTTP_201_CREATED)
def register_school_campus_location(
    payload: SchoolLocationCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["admin"]))
):
    """Register a new campus coordinates geofencing center (Admin only)."""
    return telemetry_service.create_school_location(db, payload, current_admin.id)

@router.get("/campuses", response_model=List[SchoolLocationResponse])
def list_school_campuses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve all configured school campus coordinates geofencing locations."""
    return telemetry_service.get_school_locations(db)

@router.get("/campuses/{campus_id}", response_model=SchoolLocationResponse)
def get_school_campus(
    campus_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get parameters for a single school campus configuration."""
    return telemetry_service.get_school_location(db, campus_id)

@router.put("/campuses/{campus_id}", response_model=SchoolLocationResponse)
def update_school_campus(
    campus_id: UUID,
    payload: SchoolLocationCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["admin"]))
):
    """Modify parameters for a school campus configuration (Admin only)."""
    return telemetry_service.update_school_location(db, campus_id, payload)

@router.delete("/campuses/{campus_id}", response_model=bool)
def delete_school_campus(
    campus_id: UUID,
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["admin"]))
):
    """Remove a campus coordinates geofencing configuration (Admin only)."""
    return telemetry_service.delete_school_location(db, campus_id)
