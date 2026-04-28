# backend/app/api/v1/verification.py

from fastapi import APIRouter, HTTPException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

from jose import jwt, JWTError
from ...core.config import settings
from ...services import external_api
from ...models.db_models import VerificationDB
from ...core.database import SessionLocal
from datetime import datetime

# ----------------------------------------------------------------------
# Route de Vérification de Carte (pour le scan de QR Code)
# ----------------------------------------------------------------------

@router.get("/{token}", response_model=dict, summary="Vérifie la validité d'une carte via un token QR code")
async def verify_card_token(token: str):
    """
    Endpoint appelé par le scanner de QR code.
    Il valide le token et retourne les données du membre si la carte est active.
    """
    now = datetime.utcnow()

    def log_scan(member_id: str, status_str: str, metadata: dict | None = None) -> None:
        with SessionLocal() as db:
            scan = VerificationDB(
                member_id=member_id,
                status=status_str,
                scanned_at=now,
            )
            if metadata is not None:
                scan.metadata_json = metadata
            db.add(scan)
            db.commit()

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        member_id = payload.get("member_id")
        if not member_id:
            # Format token OK mais payload incomplet
            return {
                "valid": False,
                "verified_at": now.isoformat(),
                "reason": "token_invalid",
                "message": "Token invalide: ID membre manquant",
            }

        # Récupérer le membre (via API externe)
        member = await external_api.get_member_from_external_api(member_id)
        if not member:
            # On évite 404 (UI attend un résultat), on renvoie un échec explicite.
            return {
                "valid": False,
                "verified_at": now.isoformat(),
                "reason": "token_invalid",
                "message": "Membre non trouvé",
            }

        is_valid = member.statut == "actif"
        reason = None if is_valid else "member_inactive"
        status_str = "success" if is_valid else "invalid"

        # Log en DB (scan QR)
        log_scan(member.id, status_str, metadata={"method": "qr"})

        # On expose des infos utiles au frontend (alignées avec VerificationResult)
        iat = payload.get("iat")
        exp = payload.get("exp")
        card_block = None
        try:
            card_block = {
                "generated_at": datetime.fromtimestamp(iat).isoformat() if isinstance(iat, (int, float)) else now.isoformat(),
                "qr_expires_at": datetime.fromtimestamp(exp).isoformat() if isinstance(exp, (int, float)) else now.isoformat(),
            }
        except Exception:
            card_block = None

        return {
            "valid": is_valid,
            "member": member,
            "card": card_block,
            "verified_at": now.isoformat(),
            "reason": reason,
            "message": "Membre actif" if is_valid else f"Adhésion {member.statut}",
        }

    except JWTError as e:
        # IMPORTANT: on renvoie un 200 avec valid=false pour que l'UI affiche "Carte invalide"
        msg = str(e) or "JWT error"
        reason = "token_expired" if "expired" in msg.lower() else "token_invalid"
        # Token invalide: on ne connaît pas le member_id => on ne log pas (ou log générique si besoin)
        return {
            "valid": False,
            "verified_at": now.isoformat(),
            "reason": reason,
            "message": "Le jeton de la carte est invalide ou a expiré.",
        }
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
         
    is_valid = member.statut == "actif"
    reason = None if is_valid else "member_inactive"
    
    # Enregistrer la vérification manuelle
    with SessionLocal() as db:
        scan = VerificationDB(
            member_id=member.id,
            status="success" if is_valid else "invalid",
            scanned_at=datetime.utcnow()
        )
        # Assigner séparément la colonne JSON pour garantir la compatibilité SQLAlchemy
        scan.metadata_json = {"method": "manual", "numero_membre": numero}
        db.add(scan)
        db.commit()
    
    return {
        "valid": is_valid,
        "member": member,
        "verified_at": datetime.utcnow().isoformat(),
        "reason": reason,
        "message": "Membre actif" if is_valid else f"Adhésion {member.statut}"
    }
