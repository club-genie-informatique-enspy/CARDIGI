import json
import os
import sys
from pathlib import Path
from datetime import datetime, date

# Ajouter le chemin du projet au sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal, init_db
from app.models.db_models import MemberDB
from sqlalchemy.exc import IntegrityError

def migrate():
    json_path = Path("data/local_members.json")
    if not json_path.exists():
        print("Aucun fichier JSON trouvé à migrer.")
        return

    print(f"Migration des données depuis {json_path}...")
    
    # S'assurer que les tables existent
    init_db()

    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Erreur lors de la lecture du JSON : {e}")
        return

    members = data.get("members", [])
    if not members:
        print("Aucun membre trouvé dans le fichier JSON.")
        return

    db = SessionLocal()
    count = 0
    errors = 0

    for m_data in members:
        # Nettoyage et conversion des données
        try:
            # Conversion des dates
            if isinstance(m_data.get("date_adhesion"), str):
                m_data["date_adhesion"] = date.fromisoformat(m_data["date_adhesion"].split('T')[0])
            if isinstance(m_data.get("date_expiration"), str):
                m_data["date_expiration"] = date.fromisoformat(m_data["date_expiration"].split('T')[0])
            
            # Conversion des datetimes
            for dt_field in ["created_at", "updated_at"]:
                if isinstance(m_data.get(dt_field), str):
                    m_data[dt_field] = datetime.fromisoformat(m_data[dt_field].replace('Z', '+00:00'))

            # Créer l'objet DB
            member = MemberDB(**m_data)
            db.add(member)
            db.commit()
            count += 1
            print(f"Migré : {member.email}")
        except IntegrityError:
            db.rollback()
            print(f"Déjà présent : {m_data.get('email')}")
        except Exception as e:
            db.rollback()
            print(f"Erreur pour {m_data.get('email')} : {e}")
            errors += 1

    db.close()
    print(f"\nMigration terminée : {count} membres migrés, {errors} erreurs.")
    
    # Renommer le fichier pour éviter de re-migrer
    if count > 0 and errors == 0:
        backup_path = json_path.with_suffix(".json.bak")
        json_path.rename(backup_path)
        print(f"Fichier JSON sauvegardé sous {backup_path}")

if __name__ == "__main__":
    migrate()
