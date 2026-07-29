from sqlalchemy import Column, String, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.database.base import BaseModelMixin

class BiometricCredential(Base, BaseModelMixin):
    """FIDO2 / WebAuthn biometric credentials for user passkeys."""
    __tablename__ = "biometric_credentials"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    credential_id = Column(String(512), unique=True, index=True, nullable=False)
    public_key = Column(Text, nullable=False)  # Encoded public key bytes
    sign_count = Column(Integer, default=0, nullable=False)
    device_name = Column(String(200), nullable=True)

    # Relationships
    user = relationship("User", back_populates="biometric_credentials")


class FaceEmbedding(Base, BaseModelMixin):
    """Encrypted face mesh vectors for biometric verification."""
    __tablename__ = "face_embeddings"

    user_id = Column(ForeignKey("users.id"), nullable=False)
    embedding = Column(Text, nullable=False)  # Encrypted face landmark array representation
    captured_angles = Column(Integer, default=1, nullable=False)

    # Relationships
    user = relationship("User", back_populates="face_embeddings")
