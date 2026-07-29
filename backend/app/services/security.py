from datetime import datetime, timedelta, timezone
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User
from app.models.security import AuditLog
from app.core.exceptions import AuthException
import logging

logger = logging.getLogger("triconnect.security")

class SecurityService:
    """Enterprise Audit logger and account lockout lock coordinator."""

    def log_audit(
        self,
        db: Session,
        action: str,
        status: str,
        user_id: Any | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        details: str | None = None
    ) -> AuditLog:
        """Create an audit trail log record."""
        try:
            log_entry = AuditLog(
                user_id=user_id,
                action=action,
                status=status,
                ip_address=ip_address,
                user_agent=user_agent,
                details=details
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return log_entry
        except Exception as e:
            logger.error(f"Failed to record audit trail log: {str(e)}", exc_info=True)
            db.rollback()

    def check_lockout(self, db: Session, username: str) -> User | None:
        """Verify if a user is currently locked out of their account."""
        query = select(User).where(User.username == username, User.is_deleted == False)
        user = db.execute(query).scalar_one_or_none()
        if not user:
            return None

        if user.lockout_until:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            if now < user.lockout_until:
                remaining_mins = int((user.lockout_until - now).total_seconds() / 60) + 1
                raise AuthException(
                    f"Account locked out due to multiple failed login attempts. "
                    f"Please try again in {remaining_mins} minutes."
                )
            else:
                # Lockout time has expired, reset attempts
                user.lockout_until = None
                user.failed_login_attempts = 0
                db.add(user)
                db.commit()
        
        return user

    def record_login_failure(self, db: Session, username: str, ip: str = None, ua: str = None):
        """Track user authentication failures and trigger lockout timers."""
        query = select(User).where(User.username == username, User.is_deleted == False)
        user = db.execute(query).scalar_one_or_none()
        if not user:
            # Log audit for unrecognized User ID
            self.log_audit(
                db, 
                action="LOGIN_FAILURE", 
                status="FAILED", 
                ip_address=ip, 
                user_agent=ua, 
                details=f"Unrecognized username login attempt: {username}"
            )
            return

        user.failed_login_attempts += 1
        details_msg = f"Failed attempt #{user.failed_login_attempts}"

        if user.failed_login_attempts >= 5:
            lockout_time = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=15)
            user.lockout_until = lockout_time
            details_msg += f" - Account locked out until {lockout_time.isoformat()}"
            self.log_audit(
                db,
                user_id=user.id,
                action="ACCOUNT_LOCKOUT",
                status="FAILED",
                ip_address=ip,
                user_agent=ua,
                details=details_msg
            )
        else:
            self.log_audit(
                db,
                user_id=user.id,
                action="LOGIN_FAILURE",
                status="FAILED",
                ip_address=ip,
                user_agent=ua,
                details=details_msg
            )

        db.add(user)
        db.commit()

    def reset_login_failures(self, db: Session, user: User):
        """Clear lockout metrics on successful user login."""
        if user.failed_login_attempts > 0 or user.lockout_until:
            user.failed_login_attempts = 0
            user.lockout_until = None
            db.add(user)
            db.commit()

security_service = SecurityService()
