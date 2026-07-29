from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin

class Role(Base, BaseModelMixin):
    """Roles table holding Admin, Teacher, Student, Parent records."""
    __tablename__ = "roles"

    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200), nullable=True)

    # Relationships
    users = relationship("User", back_populates="role")


class User(Base, BaseModelMixin):
    """Core Authentication User Account."""
    __tablename__ = "users"

    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    role_id = Column(ForeignKey("roles.id"), nullable=False)
    created_by_id = Column(ForeignKey("users.id"), nullable=True)
    
    # Onboarding & security flags
    first_login = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    lockout_until = Column(DateTime, nullable=True)

    # Relationships
    role = relationship("Role", back_populates="users")
    
    # Secondary profiles (linked conditionally)
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete-orphan")
    parent_profile = relationship("Parent", back_populates="user", uselist=False, cascade="all, delete-orphan")

    # Message logs
    sent_messages = relationship("DirectMessage", foreign_keys="[DirectMessage.sender_id]", back_populates="sender")
    received_messages = relationship("DirectMessage", foreign_keys="[DirectMessage.recipient_id]", back_populates="recipient")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    
    # Biometrics & Session logs
    biometric_credentials = relationship("BiometricCredential", back_populates="user", cascade="all, delete-orphan")
    face_embeddings = relationship("FaceEmbedding", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("UserDevice", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
