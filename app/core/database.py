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
    """Initialise la base de données (création des tables et migration simple)."""
    Base.metadata.create_all(bind=engine)
    
    # Migration simple pour ajouter les colonnes manquantes
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            # PostgreSQL syntax for adding column if not exists
            if "postgres" in str(engine.url):
                conn.execute(text("ALTER TABLE members ADD COLUMN IF NOT EXISTS card_generated BOOLEAN DEFAULT FALSE"))
            else:
                # SQLite doesn't support IF NOT EXISTS in ALTER TABLE
                # We check if column exists first
                cursor = conn.execute(text("PRAGMA table_info(members)"))
                columns = [row[1] for row in cursor.fetchall()]
                if "card_generated" not in columns:
                    conn.execute(text("ALTER TABLE members ADD COLUMN card_generated BOOLEAN DEFAULT FALSE"))
            
            conn.commit()
        except Exception as e:
            # On ignore les erreurs si la colonne existe déjà (cas du fallback SQLite sans commit)
            print(f"Note: Tentative d'ajout de colonne skipée ou échouée: {e}")
