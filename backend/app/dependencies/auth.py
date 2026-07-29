from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.config import settings
from app.core.security import decode_token
from app.repositories.user import user_repo
from app.models.user import User
from app.core.exceptions import AuthException, ForbiddenException

# Reusable OAuth2 token scheme
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Dependency checking for valid JWT token and retrieving current User model."""
    payload = decode_token(token)
    user_id = payload.get("sub")
    token_type = payload.get("type")
    
    if not user_id or token_type != "access":
        raise AuthException("Could not validate credentials")
        
    user = user_repo.get(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Validate that the logged user account is active."""
    if not current_user.is_active:
        raise AuthException("User is inactive")
    return current_user

class RoleChecker:
    """RBAC checker ensuring user matches permitted role tags."""
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        user_role = current_user.role.name if current_user.role else ""
        if user_role not in self.allowed_roles:
            raise ForbiddenException(
                f"Role '{user_role}' does not have sufficient permissions. Required roles: {self.allowed_roles}"
            )
        return current_user
