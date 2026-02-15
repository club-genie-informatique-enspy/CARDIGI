# backend/app/services/local_member_service.py

import json
import os
import logging
import random
from typing import List, Optional, Dict, Any
from pathlib import Path
from datetime import datetime, date

from ..models.member import MemberInDB, MemberRegistration, MemberUpdate
from ..core.security import get_password_hash, verify_password

logger = logging.getLogger(__name__)

class LocalMemberService:
    """
    Service pour gérer la persistance locale des membres dans un fichier JSON.
    Sert de fallback quand l'API externe est indisponible.
    """
    
    def __init__(self, file_path: str = "data/local_members.json"):
        self.file_path = Path(file_path)
        self._ensure_storage_exists()

    def _ensure_storage_exists(self):
        """Crée le dossier data et le fichier JSON si nécessaire."""
        self.file_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.file_path.exists():
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump({"members": []}, f)

    def _read_data(self) -> Dict[str, Any]:
        """Lit les données du fichier JSON."""
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {"members": []}

    def _write_data(self, data: Dict[str, Any]):
        """Écrit les données dans le fichier JSON."""
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)

    def get_member_by_email(self, email: str) -> Optional[MemberInDB]:
        """Récupère un membre par son email."""
        data = self._read_data()
        for m in data["members"]:
            if m.get("email", "").lower() == email.lower():
                # On s'assure que les dates sont converties si nécessaire (Pydantict s'en charge)
                return MemberInDB(**m)
        return None

    def get_member_by_id(self, member_id: str) -> Optional[MemberInDB]:
        """Récupère un membre par son ID."""
        data = self._read_data()
        for m in data["members"]:
            if m.get("id") == member_id:
                return MemberInDB(**m)
        return None

    def list_members(self) -> List[MemberInDB]:
        """Liste tous les membres stockés localement."""
        data = self._read_data()
        return [MemberInDB(**m) for m in data["members"]]

    def upsert_member(self, member: MemberInDB, password: Optional[str] = None):
        """
        Ajoute ou met à jour un membre localement.
        Si un mot de passe est fourni, on le hache et on le stocke pour le fallback offline.
        """
        data = self._read_data()
        member_dict = member.dict()
        
        # On injecte le mot de passe haché si présent (non présent dans MemberInDB par défaut)
        if password:
            member_dict["hashed_password"] = get_password_hash(password)
        
        updated = False
        for i, m in enumerate(data["members"]):
            if m.get("email").lower() == member.email.lower():
                # Préserver le mot de passe existant si on n'en fournit pas de nouveau
                if not password and "hashed_password" in m:
                    member_dict["hashed_password"] = m["hashed_password"]
                
                data["members"][i] = member_dict
                updated = True
                break
        
        if not updated:
            data["members"].append(member_dict)
            
        self._write_data(data)
        logger.info(f"Membre {member.email} synchronisé localement.")

    def update_member_local(self, member_id: str, update: MemberUpdate) -> Optional[MemberInDB]:
        """Met à jour partiellement un membre localement."""
        data = self._read_data()
        for i, m in enumerate(data["members"]):
            if m.get("id") == member_id:
                # Appliquer les changements (seulement ceux qui sont définis)
                current_member_data = m.copy()
                update_dict = update.dict(exclude_unset=True)
                
                # Conversion des enums en string si nécessaire pour le JSON
                for key, value in update_dict.items():
                    if hasattr(value, 'value'):
                        update_dict[key] = value.value
                
                current_member_data.update(update_dict)
                current_member_data["updated_at"] = datetime.now()
                
                data["members"][i] = current_member_data
                self._write_data(data)
                
                logger.info(f"Profil local de {m.get('email')} mis à jour.")
                return MemberInDB(**current_member_data)
        return None

    async def authenticate_local(self, email: str, password: str) -> Optional[MemberInDB]:
        """
        Authentifie un utilisateur contre la base locale.
        Utilisé uniquement en mode fallback.
        """
        data = self._read_data()
        for m in data["members"]:
            if m.get("email", "").lower() == email.lower():
                hashed_password = m.get("hashed_password")
                if hashed_password and verify_password(password, hashed_password):
                    return MemberInDB(**m)
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
        seq = random.randint(900, 999) # On utilise 9xx pour le offline
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
            pending_sync=True # Marqueur pour la future synchronisation
        )
        
        self.upsert_member(member_data, password=registration.password)
        return member_data

# Singleton
local_member_service = LocalMemberService()
