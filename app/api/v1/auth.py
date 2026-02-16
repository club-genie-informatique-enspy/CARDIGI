# backend/app/api/v1/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from ...core import security
from ...core.config import settings
from ...services import external_api
from ...services.email_service import email_service
from ...models.member import Token, MemberInDB, MemberRegistration, AdminCreation
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
    
    # Envoyer l'email de bienvenue (en arrière-plan pour ne pas bloquer la réponse)
    from fastapi import BackgroundTasks
    # On l'injecte via Depends dans l'endpoint pour de meilleures pratiques, 
    # mais ici on va le faire directement pour rester simple
    async def send_email_wrapper():
        await email_service.send_welcome_email(user.email, user.prenom, member_data.password)
    
    import asyncio
    asyncio.create_task(send_email_wrapper())
    
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

@router.post("/create-admin", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Création d'un compte administrateur")
async def create_admin(
    admin_data: AdminCreation
):
    """
    Crée un compte administrateur. Protégé par un secret.
    
    **IMPORTANT**: Ce endpoint est protégé par ADMIN_CREATION_SECRET.
    Utilisez-le uniquement pour créer le premier admin ou des admins supplémentaires.
    """
    # Vérifier le secret admin
    if admin_data.admin_secret != settings.ADMIN_CREATION_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Secret administrateur invalide."
        )
    
    # Vérifier si l'utilisateur existe déjà
    existing_user = await external_api.get_member_from_external_api(admin_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un utilisateur avec cet email existe déjà."
        )
    
    # Créer un membre avec des données admin
    from datetime import date
    from ...models.member import MemberRegistration, Filiere, Niveau
    
    # Créer un objet MemberRegistration pour l'admin
    admin_registration = MemberRegistration(
        nom=admin_data.nom,
        prenom=admin_data.prenom,
        email=admin_data.email,
        telephone="+237600000000",  # Téléphone par défaut
        filiere=Filiere.GENIE_INFORMATIQUE,
        niveau=Niveau.M2,
        password=admin_data.password
    )
    
    # Inscription via service externe
    user = await external_api.register_member(admin_registration)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la création de l'admin."
        )
    
    # Mettre à jour le rôle en admin (via l'API externe si possible)
    # Note: Vous devrez peut-être ajouter une fonction dans external_api pour ça
    user.role = "admin"
    user.is_admin = True
    user.permissions = ["*"]
    
    # Sauvegarder les modifications de rôle localement (important pour le fallback offline)
    from ...services.local_member_service import local_member_service
    local_member_service.upsert_member(user)
    
    # Envoyer l'email de bienvenue pour l'admin
    async def send_admin_email():
        await email_service.send_welcome_email(user.email, user.prenom, admin_data.password)
    
    import asyncio
    asyncio.create_task(send_admin_email())
    
    # Générer le token pour l'admin
    access_token_expires = security.timedelta(minutes=settings.JWT_EXPIRATION_HOURS * 60)
    
    return {
        "access_token": security.create_access_token(
            subject=user.email,
            expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user
    }
