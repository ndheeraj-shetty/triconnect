from sqlalchemy.orm import Session
from sqlalchemy import select
from app.repositories.base import BaseRepository
from app.models.user import User, Role

class UserRepository(BaseRepository[User]):
    def get_by_email(self, db: Session, email: str) -> User | None:
        """Fetch user by email index."""
        query = select(User).where(User.email == email, User.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

    def get_by_username(self, db: Session, username: str) -> User | None:
        """Fetch user by unique username identifier."""
        query = select(User).where(User.username == username, User.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

class RoleRepository(BaseRepository[Role]):
    def get_by_name(self, db: Session, name: str) -> Role | None:
        """Fetch Role metadata by identifier."""
        query = select(Role).where(Role.name == name, Role.is_deleted == False)
        return db.execute(query).scalar_one_or_none()

user_repo = UserRepository(User)
role_repo = RoleRepository(Role)
