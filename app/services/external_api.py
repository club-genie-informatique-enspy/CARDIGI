# backend/app/services/external_api.py

import httpx
from fastapi import HTTPException, status
import logging
from typing import Optional, Any, Dict
from datetime import date, datetime

from ..core.config import settings
from ..models.member import MemberInDB, MemberOut, MemberRegistration, MemberUpdate
from ..models.member import MemberStatus, Filiere, Niveau, Cellule
from .local_member_service import local_member_service

logger = logging.getLogger(__name__)

# =======================================================
# Logique d'appel API réelle
# =======================================================

async def _make_external_request(method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
    """Fonction utilitaire pour effectuer des requêtes vers l'API Externe."""
    # Si l'URL de l'API externe est un placeholder ou invalide, on lève directement une exception
    # pour forcer le fallback local
    if not settings.EXTERNAL_API_URL or \
       "your-org.com" in settings.EXTERNAL_API_URL or \
       "localhost:8080" in settings.EXTERNAL_API_URL or \
       settings.EXTERNAL_API_URL == "http://localhost:8080/api":
        logger.info("Mode local-only activé (pas d'API externe configurée)")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="LOCAL_ONLY_MODE"
        )
    
    api_url = settings.EXTERNAL_API_URL.rstrip('/') + endpoint
    
    headers = {
        "Authorization": f"Bearer {settings.EXTERNAL_API_KEY}",
        "Content-Type": "application/json"
    }

    # Fusionner les headers fournis par l'appelant
    if 'headers' in kwargs:
        headers.update(kwargs.pop('headers'))

    try:
        async with httpx.AsyncClient(headers=headers, timeout=10.0) as client:
            response = await client.request(method, api_url, **kwargs)
            response.raise_for_status()

            if response.status_code == status.HTTP_204_NO_CONTENT:
                return {}
            
            return response.json()

    except httpx.HTTPStatusError as e:
        if e.response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]:
            return {"error": "Unauthorized or Forbidden", "status_code": e.response.status_code}
        elif e.response.status_code == status.HTTP_404_NOT_FOUND:
            return None
        else:
            logger.error(f"Erreur HTTP de l'API Externe: {e.response.text}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="SERVICE_UNAVAILABLE" # Marqueur plus simple pour le fallback
            )
            
    except (httpx.RequestError, httpx.TimeoutException) as e:
        logger.error(f"Erreur de connexion à l'API Externe: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CONNECTION_ERROR" # Marqueur plus simple pour le fallback
        )

# =======================================================
# Fonctions d'accès aux membres
# =======================================================

async def _get_member_data(identifier: str) -> Optional[Dict[str, Any]]:
    """Helper interne pour récupérer les données via l'API."""
    # NOTE: L'API réelle doit supporter la recherche par l'identifiant (email ou ID)
    if "@" in identifier:
        endpoint = f"/members/by_email/{identifier}"
    else:
        endpoint = f"/members/{identifier}"
        
    return await _make_external_request("GET", endpoint)


async def get_member_from_external_api(user_identifier: str) -> Optional[MemberInDB]:
    """
    Récupère les données d'un membre avec fallback local si l'API est offline.
    """
    try:
        result = await _get_member_data(user_identifier)
        
        if result is None:
            # Si non trouvé sur l'API externe, on cherche quand même en local 
            # (cas où l'utilisateur a été créé offline)
            return local_member_service.get_member_by_email(user_identifier) if "@" in user_identifier else local_member_service.get_member_by_id(user_identifier)

        data = result.copy()
        is_admin = data.get("is_admin", False)
        data["role"] = "admin" if is_admin else "member"
        
        member = MemberInDB(**data)
        
        # Synchronisation locale discrète
        local_member_service.upsert_member(member)
        
        return member

    except HTTPException as e:
        if e.detail in ["CONNECTION_ERROR", "SERVICE_UNAVAILABLE", "LOCAL_ONLY_MODE"]:
            logger.info(f"Fallback local pour la récupération de : {user_identifier}")
            return local_member_service.get_member_by_email(user_identifier) if "@" in user_identifier else local_member_service.get_member_by_id(user_identifier)
        raise e
    except Exception as e:
        logger.error(f"Erreur de validation Pydantic: {e}")
        return None


async def authenticate_member_external(email: str, password: str) -> Optional[MemberInDB]:
    """
    Authentifie l'utilisateur via l'API externe avec fallback local.
    """
    endpoint = "/auth/login"
    login_data = {"email": email, "password": password}
    
    try:
        result = await _make_external_request("POST", endpoint, json=login_data)

        if result is None or "error" in result:
            # On tente quand même le local si les identifiants échouent sur l'API externe 
            # (cas où l'utilisateur n'existe qu'en local car créé offline)
            return await local_member_service.authenticate_local(email, password)

        data = result.copy()
        data["role"] = "admin" if data.get("is_admin") else "member"
        member_data = MemberInDB(**data)
        
        if member_data.email.lower() != email.lower():
             logger.warning(f"Email mismatch: {member_data.email} vs {email}")
             return None
        
        # Synchronisation locale (on stocke le mot de passe pour le fallback futur)
        local_member_service.upsert_member(member_data, password=password)
             
        return member_data

    except HTTPException as e:
        if e.detail in ["CONNECTION_ERROR", "SERVICE_UNAVAILABLE", "LOCAL_ONLY_MODE"]:
            logger.warning(f"API Externe indisponible ou désactivée. Tentative d'authentification Locale pour {email}")
            return await local_member_service.authenticate_local(email, password)
        raise e
    except Exception as e:
        logger.error(f"Erreur lors de l'authentification: {e}")
        return None

async def register_member(member_data: MemberRegistration) -> Optional[MemberInDB]:
    """Inscrit un nouveau membre avec fallback local si offline."""
    endpoint = "/members/register"
    try:
        result = await _make_external_request("POST", endpoint, json=member_data.dict())
        if result:
            data = result.copy()
            data["role"] = "admin" if data.get("is_admin") else "member"
            member = MemberInDB(**data)
            
            # Sync local
            local_member_service.upsert_member(member, password=member_data.password)
            return member
            
    except HTTPException as e:
        if e.detail in ["CONNECTION_ERROR", "SERVICE_UNAVAILABLE", "LOCAL_ONLY_MODE"]:
            logger.warning(f"API Externe indisponible ou désactivée pour l'inscription. Enregistrement local 'pending' pour {member_data.email}")
            return local_member_service.save_pending_registration(member_data)
        raise e
    except Exception as e:
        logger.error(f"Erreur lors de l'inscription externe: {e}")
    
    return None

async def update_member(member_id: str, update_data: MemberUpdate) -> Optional[MemberInDB]:
    """Met à jour les informations d'un membre via l'API externe avec backup local."""
    endpoint = f"/members/{member_id}"
    try:
        result = await _make_external_request("PUT", endpoint, json=update_data.dict(exclude_unset=True))
        if result:
            data = result.copy()
            data["role"] = "admin" if data.get("is_admin") else "member"
            member = MemberInDB(**data)
            local_member_service.upsert_member(member)
            return member
            
    except HTTPException as e:
        if e.detail in ["CONNECTION_ERROR", "SERVICE_UNAVAILABLE", "LOCAL_ONLY_MODE"]:
            logger.warning("Modification via stockage local (API externe indisponible ou désactivée).")
            return local_member_service.update_member_local(member_id, update_data)
        raise e
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour externe: {e}")
        
    return None
async def get_all_members() -> Dict[str, Any]:
    """Récupère tous les membres avec fallback local."""
    endpoint = "/members/"
    try:
        result = await _make_external_request("GET", endpoint)
        if result and "members" in result:
            return result
            
    except HTTPException as e:
        if e.detail in ["CONNECTION_ERROR", "SERVICE_UNAVAILABLE", "LOCAL_ONLY_MODE"]:
            logger.info("Récupération de la liste des membres via le stockage local.")
            local_list = local_member_service.list_members()
            return {
                "total": len(local_list),
                "members": [m.dict() for m in local_list]
            }
        raise e
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la liste: {e}")
        
    local_list = local_member_service.list_members()
    return {
        "total": len(local_list),
        "members": [m.dict() for m in local_list]
    }
