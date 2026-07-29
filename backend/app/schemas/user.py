from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr | None = None
    is_active: bool = True
    is_verified: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    is_active: bool | None = None
    is_verified: bool | None = None

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    role_id: UUID
    first_login: bool
    created_at: datetime
    updated_at: datetime
