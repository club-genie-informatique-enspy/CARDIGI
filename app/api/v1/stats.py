# backend/app/api/v1/stats.py

from fastapi import APIRouter, Depends
from typing import Annotated
import logging

from ...models.member import MemberInDB
from ...api.deps import get_current_admin
from ...services import external_api
from ...core.database import SessionLocal
from ...models.db_models import MemberDB, VerificationDB
from sqlalchemy import func
from datetime import datetime, timedelta

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
    with SessionLocal() as db:
        total_members = db.query(MemberDB).count()
        active_members = db.query(MemberDB).filter(MemberDB.statut == "actif").count()
        cards_generated = db.query(MemberDB).filter(MemberDB.card_generated == True).count()
        verifications_count = db.query(VerificationDB).count()
        
        # Nouvelles adhésions sur la période
        since_date = datetime.utcnow()
        if period == "week":
            since_date -= timedelta(days=7)
        elif period == "month":
            since_date -= timedelta(days=30)
        else:
            since_date -= timedelta(days=1)
            
        new_members = db.query(MemberDB).filter(MemberDB.created_at >= since_date).count()
        
        # Taux de croissance (simplifié)
        prev_period_members = db.query(MemberDB).filter(MemberDB.created_at < since_date).count()
        growth_rate = 0
        if prev_period_members > 0:
            growth_rate = (new_members / prev_period_members) * 100

    return {
        "total_members": total_members,
        "active_members": active_members,
        "new_members_this_period": new_members,
        "cards_generated": cards_generated,
        "verifications_count": verifications_count,
        "growth_rate": round(growth_rate, 1),
        "period": period
    }

@router.get("/cards", summary="Statistiques sur les cartes générées")
async def get_card_stats(
    current_admin: Annotated[MemberInDB, Depends(get_current_admin)]
):
    """Statistiques par filière et niveau"""
    with SessionLocal() as db:
        # Group by filière
        filiere_stats_raw = db.query(MemberDB.filiere, func.count(MemberDB.id)).group_by(MemberDB.filiere).all()
        filiere_stats = {f: count for f, count in filiere_stats_raw}
        
        # Group by niveau
        niveau_stats_raw = db.query(MemberDB.niveau, func.count(MemberDB.id)).group_by(MemberDB.niveau).all()
        niveau_stats = {n: count for n, count in niveau_stats_raw}
        
        total_generated = db.query(MemberDB).filter(MemberDB.card_generated == True).count()

    return {
        "by_filiere": filiere_stats,
        "by_niveau": niveau_stats,
        "total_generated": total_generated
    }

@router.get("/verifications", summary="Statistiques de scan de QR codes")
async def get_verification_stats(
    current_admin: Annotated[MemberInDB, Depends(get_current_admin)]
):
    """Historique des scans (Réel)"""
    with SessionLocal() as db:
        # Récupérer les scans des 7 derniers jours
        today = datetime.utcnow().date()
        daily_scans = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            count = db.query(VerificationDB).filter(
                func.date(VerificationDB.scanned_at) == day
            ).count()
            daily_scans.append({
                "date": day.isoformat(),
                "count": count
            })
            
        total_scans = db.query(VerificationDB).count()

    return {
        "daily_scans": daily_scans,
        "total_scans": total_scans
    }
