from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.repositories.user import user_repo
from app.schemas.user import UserResponse, UserUpdate
from app.dependencies.auth import RoleChecker

router = APIRouter(prefix="/users", tags=["Users Management"])
admin_check = RoleChecker(allowed_roles=["admin"])

@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin = Depends(admin_check)
):
    """Retrieve list of users (Admin only). Supports pagination."""
    return user_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=UserResponse)
def get_user_by_id(
    id: UUID, 
    db: Session = Depends(get_db),
    current_admin = Depends(admin_check)
):
    """Retrieve a single user profile (Admin only)."""
    user = user_repo.get(db, id)
    if not user:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("User not found")
    return user

@router.put("/{id}", response_model=UserResponse)
def update_user_profile(
    id: UUID, 
    payload: UserUpdate, 
    db: Session = Depends(get_db),
    current_admin = Depends(admin_check)
):
    """Update a user's status, email, or credentials (Admin only)."""
    db_obj = user_repo.get(db, id)
    if not db_obj:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("User not found")
    return user_repo.update(db, db_obj=db_obj, obj_in=payload)

@router.delete("/{id}", response_model=UserResponse)
def delete_user(
    id: UUID, 
    db: Session = Depends(get_db),
    current_admin = Depends(admin_check)
):
    """Perform soft-delete on a user account (Admin only)."""
    user = user_repo.get(db, id)
    if not user:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("User not found")
    return user_repo.soft_delete(db, id)
