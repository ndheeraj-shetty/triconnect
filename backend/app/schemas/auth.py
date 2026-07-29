from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    """Payload for authentication."""
    username: str = Field(..., description="User ID or Email address")
    password: str

class Token(BaseModel):
    """Payload returning OAuth2 tokens."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    first_login: bool = True
    role: str = "student"

class TokenPayload(BaseModel):
    """Payload decoded from JWT tokens."""
    sub: str | None = None
    type: str | None = None

class ForgotPasswordRequest(BaseModel):
    """Payload to trigger forgot-password emails."""
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    """Payload to commit password reset tokens."""
    token: str
    new_password: str = Field(..., min_length=6)

class UserRegister(BaseModel):
    """Payload to register generic login accounts."""
    username: str = Field(..., description="Unique User ID / login code")
    password: str = Field(..., min_length=6)
    role_name: str = Field(..., description="Role to link: admin, teacher, student, parent")


class StudentRegistrationRequest(BaseModel):
    """Admin-only request to provision a complete student account."""
    student_name: str = Field(..., min_length=1, max_length=255)
    student_id: str = Field(..., min_length=1, max_length=100)
    roll_number: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    class_name: str = Field(..., min_length=1, max_length=100)
    section: str = Field(..., min_length=1, max_length=50)
    parent_name: str = Field(..., min_length=1, max_length=255)
    parent_phone: str = Field(..., min_length=1, max_length=100)
    temporary_password: str = Field(..., min_length=8)
    is_active: bool = True
