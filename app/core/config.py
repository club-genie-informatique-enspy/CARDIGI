
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
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # Database
    DATABASE_URL: Optional[str] = None
    
    # Mail
    MAIL_USERNAME: Optional[str] = None
    MAIL_PASSWORD: Optional[str] = None
    MAIL_FROM: Optional[str] = None
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "CARDIGI - Club GI"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    
    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    ADMIN_CREATION_SECRET: str = "CHANGE_ME_IN_PRODUCTION"
    
    # External API
    EXTERNAL_API_URL: str
    EXTERNAL_API_KEY: str

    # Frontend / Public URLs (pour QR codes, liens publics, etc.)
    # Exemples:
    # - FRONTEND_BASE_URL=https://cardigi.enspy.club
    # - FRONTEND_BASE_URL=http://localhost:3000
    FRONTEND_BASE_URL: str = "https://cardigi.enspy.club"
    
    # Cloudinary Storage
    CLOUDINARY_CLOUD_NAME: Optional[str] = None
    CLOUDINARY_API_KEY: Optional[str] = None
    CLOUDINARY_API_SECRET: Optional[str] = None

    # Firebase Storage (legacy — conservé pour compatibilité, non utilisé en production)
    FIREBASE_STORAGE_BUCKET: Optional[str] = None
    
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
        extra = "ignore"

settings = Settings()
