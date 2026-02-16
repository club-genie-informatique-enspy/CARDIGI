from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from .config import settings

# On utilise DATABASE_URL des settings, avec un fallback SQLite local pour le dev
DATABASE_URL = settings.DATABASE_URL
if not DATABASE_URL:
    # Ensure data directory exists for local sqlite
    os.makedirs("data", exist_ok=True)
    DATABASE_URL = "sqlite:///./data/cardigi_v2.db"

# Configuration de SQLAlchemy
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dépendance pour obtenir une session de base de données."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialise la base de données (création des tables)."""
    Base.metadata.create_all(bind=engine)
