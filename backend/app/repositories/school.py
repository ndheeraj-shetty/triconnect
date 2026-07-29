from sqlalchemy.orm import Session
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.school import Student, Teacher, Parent, ClassGroup, Subject

class StudentRepository(BaseRepository[Student]):
    def get_by_user_id(self, db: Session, user_id: str) -> Student | None:
        """Fetch student profile linked to a auth user account."""
        query = select(Student).where(Student.user_id == user_id, Student.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

class TeacherRepository(BaseRepository[Teacher]):
    def get_by_user_id(self, db: Session, user_id: str) -> Teacher | None:
        """Fetch teacher profile linked to a user."""
        query = select(Teacher).where(Teacher.user_id == user_id, Teacher.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

class ParentRepository(BaseRepository[Parent]):
    def get_by_user_id(self, db: Session, user_id: str) -> Parent | None:
        """Fetch parent profile linked to a user."""
        query = select(Parent).where(Parent.user_id == user_id, Parent.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

class ClassGroupRepository(BaseRepository[ClassGroup]):
    pass

class SubjectRepository(BaseRepository[Subject]):
    def get_by_code(self, db: Session, code: str) -> Subject | None:
        """Fetch subject by code."""
        query = select(Subject).where(Subject.code == code, Subject.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

student_repo = StudentRepository(Student)
teacher_repo = TeacherRepository(Teacher)
parent_repo = ParentRepository(Parent)
class_repo = ClassGroupRepository(ClassGroup)
subject_repo = SubjectRepository(Subject)
