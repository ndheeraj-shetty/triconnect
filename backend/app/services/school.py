from sqlalchemy.orm import Session
from app.repositories.school import class_repo, subject_repo, student_repo, parent_repo
from app.models.school import ClassGroup, Subject, Student, Parent
from app.schemas.school import ClassGroupCreate, SubjectCreate
from app.core.exceptions import AppException
from uuid import UUID

class SchoolService:
    def create_class(self, db: Session, payload: ClassGroupCreate) -> ClassGroup:
        """Create new class division room."""
        # Optional advisor verification
        advisor_id = payload.advisor_id
        new_class = ClassGroup(
            name=payload.name,
            grade=payload.grade,
            advisor_id=advisor_id
        )
        return class_repo.create(db, new_class)

    def create_subject(self, db: Session, payload: SubjectCreate) -> Subject:
        """Create school course subject."""
        existing = subject_repo.get_by_code(db, payload.code)
        if existing:
            raise AppException(f"Subject with code '{payload.code}' already exists")
        new_subj = Subject(name=payload.name, code=payload.code)
        return subject_repo.create(db, new_subj)

    def link_parent_student(self, db: Session, parent_id: UUID, student_id: UUID) -> Student:
        """Connect student profiles to parental guardians."""
        parent = parent_repo.get(db, parent_id)
        student = student_repo.get(db, student_id)
        if not parent or not student:
            raise AppException("Parent or Student profile does not exist")
            
        student.parent_id = parent.id
        db.add(student)
        db.commit()
        db.refresh(student)
        return student

school_service = SchoolService()
