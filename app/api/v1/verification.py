# backend/app/api/v1/verification.py

from fastapi import APIRouter, HTTPException, status
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

from jose import jwt, JWTError
from ...core.config import settings
from ...services import external_api
from ...models.member import MemberResponse

# ----------------------------------------------------------------------
# Route de Vérification de Carte (pour le scan de QR Code)
# ----------------------------------------------------------------------

@router.get("/{token}", response_model=dict, summary="Vérifie la validité d'une carte via un token QR code")
async def verify_card_token(token: str):
    """
    Endpoint appelé par le scanner de QR code.
    Il valide le token et retourne les données du membre si la carte est active.
    """
    try:
        # 1. Décoder le token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        member_id = payload.get("member_id")
        if not member_id:
            raise HTTPException(status_code=400, detail="Token invalide: ID membre manquant")
            
        # 2. Récupérer le membre
        member = await external_api.get_member_from_external_api(member_id)
        if not member:
            raise HTTPException(status_code=404, detail="Membre non trouvé")
            
        # 3. Vérifier le statut
        is_valid = member.statut == "actif"
        
        return {
            "is_valid": is_valid,
            "member": member,
            "verified_at": settings.datetime.utcnow() if hasattr(settings, 'datetime') else None,
            "message": "Membre actif" if is_valid else f"Adhésion {member.statut}"
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Le jeton de la carte est invalide ou a expiré."
        )
    except Exception as e:
        logger.error(f"Erreur vérification: {e}")
        raise HTTPException(status_code=500, detail="Erreur interne de vérification")

@router.post("/validate", response_model=dict, summary="Vérifie par numéro de membre")
async def verify_by_numero(data: dict):
    """
    Vérifie manuellement par numéro de membre.
    """
    numero = data.get("numero_membre")
    if not numero:
        raise HTTPException(status_code=400, detail="Numéro de membre requis")
        
    member = await external_api.get_member_from_external_api(numero)
    if not member:
         raise HTTPException(status_code=404, detail="Membre non trouvé")
         
    return {
        "is_valid": member.statut == "actif",
        "member": member
    }
