from sqlalchemy.orm import Session
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.telemetry import Attendance
from uuid import UUID

class AttendanceRepository(BaseRepository[Attendance]):
    def get_by_student_id(self, db: Session, student_id: UUID) -> list[Attendance]:
        """Fetch all attendance records for a student."""
        query = select(Attendance).where(
            Attendance.student_id == student_id,
            Attendance.is_deleted == False
        ).order_by(Attendance.timestamp.desc())
        return list(db.execute(query).scalars().all())

    def get_by_class_id(self, db: Session, class_id: UUID) -> list[Attendance]:
        """Fetch all attendance logs for a classroom."""
        query = select(Attendance).where(
            Attendance.class_id == class_id,
            Attendance.is_deleted == False
        ).order_by(Attendance.timestamp.desc())
        return list(db.execute(query).scalars().all())

attendance_repo = AttendanceRepository(Attendance)
