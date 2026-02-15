# backend/scripts/create_admin.py

import sys
import os
from datetime import datetime, date
from pathlib import Path

# Ajouter le dossier parent au path pour pouvoir importer app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.local_member_service import local_member_service
from app.models.member import MemberInDB, Filiere, Niveau

def create_admin(email: str, password: str, nom: str = "Admin", prenom: str = "Root"):
    """Crée un compte administrateur manuellement dans la base locale."""
    
    admin_member = MemberInDB(
        id=f"admin-{int(datetime.now().timestamp())}",
        numero_membre="CGI-2026-000", # Numéro spécial admin
        nom=nom,
        prenom=prenom,
        email=email,
        telephone="+237600000000",
        filiere=Filiere.GENIE_INFORMATIQUE,
        niveau=Niveau.M2,
        date_adhesion=date.today(),
        date_expiration=date(2099, 12, 31),
        statut="actif",
        created_at=datetime.now(),
        updated_at=datetime.now(),
        role="admin",
        is_admin=True,
        permissions=["*"], # Accès total
        pending_sync=False # C'est un compte local maître
    )
    
    local_member_service.upsert_member(admin_member, password=password)
    print(f"✅ Administrateur '{email}' créé avec succès dans la base locale.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/create_admin.py <email> <password>")
        sys.exit(1)
        
    create_admin(sys.argv[1], sys.argv[2])
