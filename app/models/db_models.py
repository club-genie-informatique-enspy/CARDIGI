from sqlalchemy import Column, String, Boolean, DateTime, Date, JSON
from sqlalchemy.sql import func
from ..core.database import Base

class MemberDB(Base):
    """Modèle SQLAlchemy pour le stockage des membres."""
    __tablename__ = "members"

    id = Column(String, primary_key=True, index=True)
    numero_membre = Column(String, unique=True, index=True, nullable=False)
    nom = Column(String, nullable=False)
    prenom = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telephone = Column(String, nullable=False)
    filiere = Column(String, nullable=False)
    niveau = Column(String, nullable=False)
    cellule = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    statut = Column(String, default="actif")
    role = Column(String, default="member")
    
    # Auth & Security
    hashed_password = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    permissions = Column(JSON, default=list)
    
    # Sync & Meta
    pending_sync = Column(Boolean, default=False)
    date_adhesion = Column(Date, nullable=False)
    date_expiration = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
