from pydantic import BaseModel, EmailStr, Field

class StudentOnboard(BaseModel):
    """Data payload submitted by Students during first login onboarding."""
    full_name: str = Field(..., min_length=2, max_length=100)
    roll_number: str = Field(..., min_length=1, max_length=50)
    class_name: str = Field(..., min_length=1, max_length=100)
    section: str = Field(..., min_length=1, max_length=50)
    parent_name: str = Field(..., min_length=2, max_length=100)
    parent_phone: str = Field(..., min_length=5, max_length=50)
    student_email: EmailStr
    parent_email: EmailStr
    new_password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    
    # Biometric face meshes (simulated cryptographic hashes)
    face_embedding: str = Field(..., description="Encrypted string representing face scan data")
    captured_angles: int = Field(3, description="Number of face scan angles uploaded")


class TeacherOnboard(BaseModel):
    """Data payload submitted by Teachers during first login onboarding."""
    full_name: str = Field(..., min_length=2, max_length=100)
    department: str = Field(..., min_length=2, max_length=100)
    subjects: str = Field(..., min_length=2, max_length=255)
    class_teacher_of: str | None = Field(None, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=5, max_length=50)
    new_password: str = Field(..., min_length=6)
    
    # Biometric face meshes
    face_embedding: str | None = Field(None, description="Encrypted face mesh landmarks string")


class ParentOnboard(BaseModel):
    """Data payload submitted by Parents during first login onboarding."""
    full_name: str = Field(..., min_length=2, max_length=100)
    relationship: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=5, max_length=50)
    email: EmailStr
    new_password: str = Field(..., min_length=6)
