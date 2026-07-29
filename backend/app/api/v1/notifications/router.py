from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.models.interaction import Notification
from app.schemas.interaction import NotificationResponse
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.core.exceptions import NotFoundException
from sqlalchemy import select

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationResponse])
def get_user_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve notifications generated for the logged in user."""
    query = select(Notification).where(
        Notification.user_id == current_user.id,
        Notification.is_deleted == False
    ).offset(skip).limit(limit)
    return list(db.execute(query).scalars().all())

@router.put("/{notif_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notif_id: UUID, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mark notification as read."""
    notif = db.get(Notification, notif_id)
    if not notif or notif.user_id != current_user.id:
        raise NotFoundException("Notification not found")
        
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
