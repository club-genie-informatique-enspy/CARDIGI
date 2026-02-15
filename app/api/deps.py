# backend/app/api/deps.py

from typing import Generator, Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError

from ..core import security
from ..core.config import settings
from ..models.member import MemberInDB # Modèle à créer
from ..services.external_api import get_member_from_external_api # Service à créer

oauth2_scheme = security.reusable_oauth2 # Utilise l'objet créé dans security.py

# Type Hinting pour les utilisateurs authentifiés
AuthenticatedUser = Annotated[MemberInDB, Depends(oauth2_scheme)]

async def get_current_user(token: AuthenticatedUser) -> MemberInDB:
    """
    Dépendance FastAPI pour récupérer l'utilisateur actuellement authentifié.
    """
    try:
        # 1. Décoder le token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        # Le 'sub' (subject) est supposé être l'ID de l'utilisateur ou son email
        user_id_or_email: str = payload.get("sub")
        if user_id_or_email is None:
            raise JWTError()
        
    except (JWTError, ValidationError):
        # 2. Lever une exception si le token est invalide
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton d'authentification invalide",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Récupérer l'utilisateur (à adapter à votre logique BDD/API Externe)
    # Dans ce cas, nous faisons appel à l'API Externe pour obtenir les détails du membre
    user = await get_member_from_external_api(user_id_or_email)
    
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return user

async def get_current_admin(current_user: Annotated[MemberInDB, Depends(get_current_user)]) -> MemberInDB:
    """
    Dépendance pour vérifier si l'utilisateur authentifié est un administrateur.
    """
    # Logique de vérification du rôle (doit être définie dans le modèle MemberInDB)
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs."
        )
    return current_user