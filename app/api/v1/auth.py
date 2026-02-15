# backend/app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from ...core import security
from ...core.config import settings
from ...services import external_api
from ...models.member import Token, MemberInDB, MemberRegistration
from ...api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token, summary="Authentification et émission du JWT")
async def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    """
    Permet à un utilisateur de se connecter. 
    Compatible avec Swagger UI (OAuth2) et le frontend.
    """
    user = await external_api.authenticate_member_external(
        email=form_data.username,
        password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects (email ou mot de passe)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.statut != "actif":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Votre statut d'adhésion est {user.statut.upper()}."
        )

    access_token_expires = security.timedelta(minutes=settings.JWT_EXPIRATION_HOURS * 60)
    
    return {
        "access_token": security.create_access_token(
            subject=user.email,
            expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user
    }

@router.get("/verify", response_model=MemberInDB, summary="Vérifie le token et retourne l'utilisateur")
async def verify_token(
    current_user: Annotated[MemberInDB, Depends(get_current_user)]
):
    """
    Vérifie si le token JWT envoyé est valide et retourne les infos du membre.
    """
    return current_user
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Inscription d'un nouveau membre")
async def register_member(
    member_data: MemberRegistration
):
    """
    Inscrit un nouvel étudiant au club et retourne son token de connexion.
    """
    # Vérifier si l'utilisateur existe déjà
    existing_user = await external_api.get_member_from_external_api(member_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà."
        )
    
    # Inscription via service externe
    user = await external_api.register_member(member_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de l'inscription."
        )
    
    # Générer le token pour l'utilisateur fraîchement inscrit
    access_token_expires = security.timedelta(minutes=settings.JWT_EXPIRATION_HOURS * 60)
    
    return {
        "access_token": security.create_access_token(
            subject=user.email,
            expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user
    }
