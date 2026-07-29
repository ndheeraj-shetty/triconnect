from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime

# ClassGroup
class ClassGroupBase(BaseModel):
    name: str
    grade: str

class ClassGroupCreate(ClassGroupBase):
    advisor_id: UUID | None = None

class ClassGroupResponse(ClassGroupBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    advisor_id: UUID | None = None
    created_at: datetime

# Subject
class SubjectBase(BaseModel):
    name: str
    code: str

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    created_at: datetime

# Student
class StudentBase(BaseModel):
    gpa: float = 4.0
    xp_score: int = 0
    level: int = 1
    wellbeing_index: float = 100.0

class StudentCreate(StudentBase):
    user_id: UUID
    class_id: UUID | None = None
    parent_id: UUID | None = None

class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    class_id: UUID | None = None
    parent_id: UUID | None = None
    created_at: datetime

# Teacher
class TeacherBase(BaseModel):
    division: str
    burnout_score: float = 0.0

class TeacherCreate(TeacherBase):
    user_id: UUID
    subject_id: UUID | None = None

class TeacherResponse(TeacherBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    subject_id: UUID | None = None
    created_at: datetime

# Parent
class ParentBase(BaseModel):
    phone: str | None = None

class ParentCreate(ParentBase):
    user_id: UUID

class ParentResponse(ParentBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    created_at: datetime
