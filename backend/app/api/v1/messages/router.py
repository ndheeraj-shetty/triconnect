from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.models.interaction import DirectMessage
from app.schemas.interaction import DirectMessageResponse, DirectMessageCreate
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from sqlalchemy import select, or_, and_

router = APIRouter(prefix="/messages", tags=["Direct Messages"])

@router.post("/", response_model=DirectMessageResponse, status_code=status.HTTP_201_CREATED)
def send_direct_message(
    payload: DirectMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deliver direct messages to users (e.g. parent to teacher)."""
    db_obj = DirectMessage(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        content=payload.content
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/chat/{other_user_id}", response_model=List[DirectMessageResponse])
def get_chat_conversation(
    other_user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Retrieve chat history logs between the active user and another user."""
    query = select(DirectMessage).where(
        and_(
            or_(
                and_(DirectMessage.sender_id == current_user.id, DirectMessage.receiver_id == other_user_id),
                and_(DirectMessage.sender_id == other_user_id, DirectMessage.receiver_id == current_user.id)
            ),
            DirectMessage.is_deleted == False
        )
    ).order_by(DirectMessage.created_at.asc())
    
    return list(db.execute(query).scalars().all())
