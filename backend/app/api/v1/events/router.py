from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from app.database.database import get_db
from app.models.interaction import Event
from app.schemas.interaction import EventResponse, EventCreate
from app.dependencies.auth import RoleChecker
from sqlalchemy import select

router = APIRouter(prefix="/events", tags=["Academic Calendar Events"])

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_calendar_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_staff = Depends(RoleChecker(allowed_roles=["admin", "teacher"]))
):
    """Register a new academic deadline, holiday, or exam event (Admin & Teacher only)."""
    db_obj = Event(**payload.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[EventResponse])
def get_calendar_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieve lists of school events, class tests, and parent-teacher assemblies."""
    query = select(Event).where(Event.is_deleted == False).offset(skip).limit(limit)
    return list(db.execute(query).scalars().all())
