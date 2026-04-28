# backend/app/services/local_member_service.py

import logging
import random
from typing import List, Optional, Dict, Any
from datetime import datetime, date

from ..models.member import MemberInDB, MemberRegistration, MemberUpdate
from ..models.db_models import MemberDB
from ..core.security import get_password_hash, verify_password
from ..core.database import SessionLocal

logger = logging.getLogger(__name__)

class LocalMemberService:
    """
    Service pour gérer la persistance des membres dans PostgreSQL (ou SQLite local).
    Sert de fallback quand l'API externe est indisponible et pour le stockage permanent sur Render.
    """
    
    def __init__(self):
        pass

    def get_member_by_email(self, email: str) -> Optional[MemberInDB]:
        """Récupère un membre par son email."""
        with SessionLocal() as db:
            member = db.query(MemberDB).filter(MemberDB.email.ilike(email)).first()
            if member:
                return self._to_pydantic(member)
        return None

    def get_member_by_id(self, member_id: str) -> Optional[MemberInDB]:
        """Récupère un membre par son ID."""
        with SessionLocal() as db:
            member = db.query(MemberDB).filter(MemberDB.id == member_id).first()
            if member:
                return self._to_pydantic(member)
        return None

    def get_member_by_numero(self, numero: str) -> Optional[MemberInDB]:
        """Récupère un membre par son numéro de membre (CGI-XXXX-XXX)."""
        with SessionLocal() as db:
            member = db.query(MemberDB).filter(MemberDB.numero_membre == numero).first()
            if member:
                return self._to_pydantic(member)
        return None

    def list_members(self) -> List[MemberInDB]:
        """Liste tous les membres stockés."""
        with SessionLocal() as db:
            members = db.query(MemberDB).all()
            return [self._to_pydantic(m) for m in members]

    def upsert_member(self, member: MemberInDB, password: Optional[str] = None):
        """
        Ajoute ou met à jour un membre dans la DB.
        Si un mot de passe est fourni, on le hache.
        """
        with SessionLocal() as db:
            db_member = db.query(MemberDB).filter(MemberDB.email.ilike(member.email)).first()
            
            member_dict = member.dict()
            if password:
                member_dict["hashed_password"] = get_password_hash(password)
            
            if db_member:
                # Update
                for key, value in member_dict.items():
                    if key != "hashed_password" or password: # Don't overwrite password if not provided
                        setattr(db_member, key, value)
                db_member.updated_at = datetime.now()
            else:
                # Create
                db_member = MemberDB(**member_dict)
                db.add(db_member)
            
            db.commit()
            logger.info(f"Membre {member.email} synchronisé en base de données.")

    def update_member_local(self, member_id: str, update: MemberUpdate) -> Optional[MemberInDB]:
        """Met à jour partiellement un membre localement."""
        with SessionLocal() as db:
            db_member = db.query(MemberDB).filter(MemberDB.id == member_id).first()
            if not db_member:
                return None
            
            update_data = update.dict(exclude_unset=True)
            for key, value in update_data.items():
                # Conversion des enums en string si nécessaire
                if hasattr(value, 'value'):
                    value = value.value
                setattr(db_member, key, value)
            
            db_member.updated_at = datetime.now()
            db.commit()
            db.refresh(db_member)
            
            logger.info(f"Profil de {db_member.email} mis à jour en base de données.")
            return self._to_pydantic(db_member)

    async def authenticate_local(self, email: str, password: str) -> Optional[MemberInDB]:
        """
        Authentifie un utilisateur contre la base locale.
        Utilisé uniquement en mode fallback.
        """
        with SessionLocal() as db:
            db_member = db.query(MemberDB).filter(MemberDB.email.ilike(email)).first()
            if db_member and db_member.hashed_password:
                if verify_password(password, db_member.hashed_password):
                    return self._to_pydantic(db_member)
        return None

    def save_pending_registration(self, registration: MemberRegistration) -> MemberInDB:
        """
        Enregistre une inscription "offline".
        Génère un profil temporaire respectant le schéma attendu.
        """
        # Génération d'un ID temporaire
        temp_id = f"local-{int(datetime.now().timestamp())}"
        
        # Le numéro doit correspondre à ^CGI-\d{4}-\d{3}$
        year = datetime.now().year
        seq = random.randint(900, 999) 
        temp_numero = f"CGI-{year}-{seq}"
        
        member_data = MemberInDB(
            id=temp_id,
            **registration.dict(exclude={"password"}),
            numero_membre=temp_numero,
            date_adhesion=date.today(),
            date_expiration=date(date.today().year + 1, 12, 31),
            statut="actif",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            role="member",
            pending_sync=True 
        )
        
        self.upsert_member(member_data, password=registration.password)
        return member_data

    def _to_pydantic(self, db_member: MemberDB) -> MemberInDB:
        """Convertit un modèle SQLAlchemy en modèle Pydantic (compatible Pydantic v2)."""
        return MemberInDB.model_validate(db_member)

# Singleton
local_member_service = LocalMemberService()
