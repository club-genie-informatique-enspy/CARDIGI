
# ========================================
# FICHIER: backend/app/core/config.py
# Configuration de l'application
# ========================================

from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    """Configuration globale de l'application"""
    
    # API
    API_VERSION: str = "v1"
    API_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "production"
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    ADMIN_CREATION_SECRET: str = "CHANGE_ME_IN_PRODUCTION"
    
    # External API
    EXTERNAL_API_URL: str
    EXTERNAL_API_KEY: str
    
    # Firebase
    FIREBASE_PROJECT_ID: str
    FIREBASE_STORAGE_BUCKET: str
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "https://cardigi-orcin.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002"
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/cardigi.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
