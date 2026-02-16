# ========================================
# FICHIER: backend/app/api/v1/cards.py
# Routes API pour la génération de cartes
# ========================================

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List
import logging

from app.models.member import MemberCard, MemberResponse
from app.services.card_generator import CardGenerator
from app.services.storage_service import StorageService
from app.services import external_api
from app.api.deps import get_current_user
from app.core.database import SessionLocal
from app.models.db_models import MemberDB

router = APIRouter()
logger = logging.getLogger(__name__)
card_generator = CardGenerator()
storage_service = StorageService()

@router.post("/generate/{member_id}", response_model=dict)
async def generate_card(
    member_id: str,
    background_tasks: BackgroundTasks,
    regenerate: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Génère une carte pour un membre"""
    try:
        if not regenerate:
            exists = await storage_service.card_exists(member_id)
            if exists:
                return {
                    "success": True,
                    "member_id": member_id,
                    "message": "Carte déjà existante"
                }

        # Récupérer les données du membre depuis l'API externe
        member_data = await fetch_member_data(member_id)
        member_card = MemberCard(**member_data)
        
        # Générer la carte
        card_result = card_generator.generate_full_card(member_card)
        
        # Upload vers Firebase en arrière-plan
        background_tasks.add_task(
            storage_service.upload_card,
            member_id,
            card_result["recto"],
            card_result["verso"]
        )
        
        # Mettre à jour le statut dans la DB
        with SessionLocal() as db:
            db_member = db.query(MemberDB).filter(MemberDB.id == member_id).first()
            if db_member:
                db_member.card_generated = True
                db.commit()
        
        logger.info(f"Carte générée pour {member_card.numero_membre}")
        
        return {
            "success": True,
            "member_id": member_id,
            "numero_membre": member_card.numero_membre,
            "message": "Carte générée avec succès"
        }
        
    except Exception as e:
        logger.error(f"Erreur génération carte: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

import asyncio
generation_locks = {}

@router.get("/download/photos/{filename}")
async def download_photo_redirect(filename: str):
    """Redirection pour les anciens chemins de photos mal formés (fix 401)"""
    from fastapi.responses import RedirectResponse
    from app.core.config import settings
    return RedirectResponse(url=f"{settings.API_PREFIX}/members/photo/photos/{filename}")

@router.get("/download/{member_id}/{side}")
async def download_card(
    member_id: str,
    side: str,  # "recto" or "verso"
    current_user: dict = Depends(get_current_user)
):
    """Télécharge le recto ou verso d'une carte"""
    if side not in ["recto", "verso"]:
        raise HTTPException(status_code=400, detail="Side must be 'recto' or 'verso'")
    
    try:
        # Vérifier si la carte existe déjà (sans lock pour la perf)
        exists = await storage_service.card_exists(member_id)
        
        if not exists:
            # Créer ou récupérer le lock pour ce membre
            if member_id not in generation_locks:
                generation_locks[member_id] = asyncio.Lock()
            
            async with generation_locks[member_id]:
                # Re-vérifier après acquisition du lock (au cas où l'autre requête l'ait fait)
                if not await storage_service.card_exists(member_id):
                    logger.info(f"Génération automatique (lock) pour {member_id}")
                    member_data = await fetch_member_data(member_id)
                    from app.models.member import MemberCard
                    member_card = MemberCard(**member_data)
                    card_result = card_generator.generate_full_card(member_card)
                    
                    await storage_service.upload_card(
                        member_id,
                        card_result["recto"],
                        card_result["verso"]
                    )
        
        # Récupérer l'image depuis le stockage
        image_buffer = await storage_service.get_card_image(member_id, side)
        
        return StreamingResponse(
            image_buffer,
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=carte_{side}_{member_id}.png"
            }
        )
    except Exception as e:
        logger.error(f"Erreur lors de la récupération/génération de la carte pour {member_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=404, detail=f"Impossible de générer ou récupérer la carte: {str(e)}")
@router.get("/{member_id}", summary="Récupère les métadonnées de la carte d'un membre")
async def get_card_metadata(
    member_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Récupère les informations sur la carte générée"""
    # Vérifier si la carte existe dans le stockage
    exists = await storage_service.card_exists(member_id)
    
    if not exists:
        return {
            "exists": False,
            "member_id": member_id,
            "message": "Carte non encore générée"
        }
    
    # Récupérer les URLs (Firebase Storage)
    urls = await storage_service.get_card_urls(member_id)
    
    return {
        "exists": True,
        "member_id": member_id,
        "recto_url": urls["recto"],
        "verso_url": urls["verso"],
        "updated_at": urls.get("updated_at")
    }

@router.post("/generate/bulk", response_model=dict)
async def generate_bulk_cards(
    member_ids: List[str],
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Génère des cartes en masse"""
    if len(member_ids) > 100:
        raise HTTPException(
            status_code=400,
            detail="Maximum 100 cartes par requête"
        )
    
    background_tasks.add_task(process_bulk_generation, member_ids)
    
    return {
        "success": True,
        "message": f"Génération de {len(member_ids)} cartes en cours",
        "count": len(member_ids)
    }

async def fetch_member_data(member_id: str) -> dict:
    """Récupère les données depuis l'API externe"""
    member = await external_api.get_member_from_external_api(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    return member.dict()

async def process_bulk_generation(member_ids: List[str]):
    """Traite la génération en masse en arrière-plan"""
    for member_id in member_ids:
        try:
            member_data = await fetch_member_data(member_id)
            member_card = MemberCard(**member_data)
            card_result = card_generator.generate_full_card(member_card)
            await storage_service.upload_card(
                member_id,
                card_result["recto"],
                card_result["verso"]
            )
            logger.info(f"Bulk: Carte générée pour {member_id}")
        except Exception as e:
            logger.error(f"Erreur génération bulk {member_id}: {e}")
