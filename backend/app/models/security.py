from sqlalchemy import Column, String, ForeignKey, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin

class AuditLog(Base, BaseModelMixin):
    """Activity and authentication logs for security compliance audits."""
    __tablename__ = "audit_logs"

    user_id = Column(ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., LOGIN_ATTEMPT, PASSWORD_RESET, LOCKOUT
    status = Column(String(50), nullable=False)   # SUCCESS, FAILED
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="audit_logs")


class UserSession(Base, BaseModelMixin):
    """User login sessions containing token expirations and blacklists."""
    __tablename__ = "user_sessions"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    refresh_token = Column(String(512), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")


class UserDevice(Base, BaseModelMixin):
    """Registered devices for biometric check-ins and passkey logins."""
    __tablename__ = "user_devices"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    device_fingerprint = Column(String(255), nullable=False)
    device_type = Column(String(100), nullable=False)  # e.g., mobile, desktop, tablet
    last_used_at = Column(DateTime, nullable=False)

    # Relationships
    user = relationship("User", back_populates="devices")
