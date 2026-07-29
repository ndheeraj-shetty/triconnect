from typing import Any, Generic, List, Type, TypeVar, Union
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database.database import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    """Generic repository implementing core CRUD operations."""
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> ModelType | None:
        """Fetch a single record by primary key UUID."""
        import uuid
        if isinstance(id, str):
            try:
                id = uuid.UUID(id)
            except ValueError:
                return None
        query = select(self.model).where(self.model.id == id, self.model.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Fetch multiple records with offsets/limits."""
        query = select(self.model).where(self.model.is_deleted == False).offset(skip).limit(limit)
        return list(db.execute(query).scalars().all())

    def create(self, db: Session, obj_in: Any) -> ModelType:
        """Commit a new database record."""
        db_obj = self.model(**obj_in) if isinstance(obj_in, dict) else obj_in
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: ModelType, obj_in: Any) -> ModelType:
        """Update fields on a database object."""
        if hasattr(obj_in, "model_dump"):
            update_data = obj_in.model_dump(exclude_unset=True)
        elif isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.__dict__
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, id: Any) -> ModelType | None:
        """Hard-delete a record by ID."""
        import uuid
        if isinstance(id, str):
            try:
                id = uuid.UUID(id)
            except ValueError:
                return None
        db_obj = self.get(db, id)
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

    def soft_delete(self, db: Session, id: Any) -> ModelType | None:
        """Toggle soft-delete flag on a record."""
        import uuid
        if isinstance(id, str):
            try:
                id = uuid.UUID(id)
            except ValueError:
                return None
        db_obj = self.get(db, id)
        if db_obj:
            db_obj.is_deleted = True
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj
