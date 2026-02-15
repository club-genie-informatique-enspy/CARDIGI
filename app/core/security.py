# backend/app/core/security.py

from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from .config import settings

# Configuration du contexte de hachage pour les mots de passe
# On utilise pbkdf2_sha256 car bcrypt v5 présente des incompatibilités avec passlib
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

# Schéma d'authentification pour FastAPI
# 'tokenUrl' pointe vers l'endpoint qui va générer le token (ex: /api/v1/auth/login)
# Vous devrez créer l'endpoint /login dans vos routes 'members.py' ou un nouveau fichier 'auth.py'
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX}/auth/login"
)

# Fonctions de hachage et de vérification des mots de passe
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe clair correspond au mot de passe haché."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Retourne le hachage d'un mot de passe."""
    return pwd_context.hash(password)

# Fonctions de gestion des JWT
def create_access_token(
    subject: Union[str, Any], expires_delta: Union[timedelta, None] = None
) -> str:
    """Crée un jeton d'accès (Access Token) JWT."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Utilise la valeur par défaut du fichier de configuration (24 heures)
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)

    # Payload du token
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # Encodage du token
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

