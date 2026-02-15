# backend/app/api/v1/stats.py

from fastapi import APIRouter, Depends
from typing import Annotated
import logging

from ...models.member import MemberInDB
from ...api.deps import get_current_admin
from ...services import external_api

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/overview", summary="Statistiques globales pour le dashboard admin")
async def get_overview_stats(
    current_admin: Annotated[MemberInDB, Depends(get_current_admin)],
    period: str = "week"
):
    """
    Récupère des statistiques globales (nombre de membres, nouvelles adhésions, etc.)
    """
    result = await external_api.get_all_members()
    all_members = result.get("members", [])
    
    total_members = len(all_members)
    active_members = len([m for m in all_members if m.get("statut") == "actif"])
    
    return {
        "total_members": total_members,
        "active_members": active_members,
        "new_members_this_period": 0, 
        "cards_generated": total_members,
        "verifications_count": 0,
        "growth_rate": 0,
        "period": period
    }

@router.get("/cards", summary="Statistiques sur les cartes générées")
async def get_card_stats(
    current_admin: Annotated[MemberInDB, Depends(get_current_admin)]
):
    """Statistiques par filière et niveau"""
    result = await external_api.get_all_members()
    all_members = result.get("members", [])
    
    filiere_stats = {}
    for m in all_members:
        f = m.get("filiere")
        if f:
            filiere_stats[f] = filiere_stats.get(f, 0) + 1
        
    return {
        "by_filiere": filiere_stats,
        "total_generated": len(all_members)
    }

@router.get("/verifications", summary="Statistiques de scan de QR codes")
async def get_verification_stats(
    current_admin: Annotated[MemberInDB, Depends(get_current_admin)]
):
    """Historique des scans (Mock)"""
    return {
        "daily_scans": [
            {"date": "2024-03-01", "count": 5},
            {"date": "2024-03-02", "count": 8},
            {"date": "2024-03-03", "count": 12},
            {"date": "2024-03-04", "count": 7},
            {"date": "2024-03-05", "count": 15},
        ],
        "total_scans": 47
    }
