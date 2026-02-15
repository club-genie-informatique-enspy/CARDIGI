# backend/app/services/storage_service.py

import logging
import os
from typing import Optional
import firebase_admin
from firebase_admin import credentials, storage
from pathlib import Path

from ..core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    """
    Service pour gérer les opérations de stockage de fichiers sur Firebase Storage.
    C'est un singleton pour éviter de réinitialiser l'application Firebase.
    """
    _instance = None
    
    # Rendre cette classe un singleton
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StorageService, cls).__new__(cls)
            cls._instance._initialize_firebase()
        return cls._instance

    def _initialize_firebase(self):
        """Initialise l'application Firebase ou configure le mode Mock."""
        self.use_mock = settings.ENVIRONMENT == "development"
        self.mock_dir = Path("data/mock_storage")
        self.bucket = None

        if self.use_mock:
            logger.info("Mode Développement: Utilisation du stockage local (Mock).")
            self.mock_dir.mkdir(parents=True, exist_ok=True)
            return

        if not firebase_admin._apps:
            try:
                # 1. Vérifier les sources de credentials (JSON ou Chemin)
                cred = None
                
                # Priorité au JSON (utile pour Render/Vercel)
                if settings.FIREBASE_CREDENTIALS_JSON:
                    import json
                    cred_info = json.loads(settings.FIREBASE_CREDENTIALS_JSON)
                    cred = credentials.Certificate(cred_info)
                    logger.info("Credentials Firebase chargés depuis la variable JSON.")
                # Ensuite le chemin du fichier
                elif settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    logger.info(f"Credentials Firebase chargés depuis: {settings.FIREBASE_CREDENTIALS_PATH}")
                
                if not cred:
                    logger.warning(f"Aucun credentials Firebase trouvé. Basculement en mode Mock.")
                    self.use_mock = True
                    self.mock_dir.mkdir(parents=True, exist_ok=True)
                    return
                
                # 2. Initialisation
                firebase_admin.initialize_app(
                    cred, 
                    {
                        'storageBucket': settings.FIREBASE_STORAGE_BUCKET,
                        'projectId': settings.FIREBASE_PROJECT_ID
                    }
                )
                logger.info("Firebase Admin SDK initialisé avec succès.")
            except Exception as e:
                logger.error(f"Échec initialisation Firebase: {e}. Basculement en mode Mock.")
                self.use_mock = True
                self.mock_dir.mkdir(parents=True, exist_ok=True)
        
        # 3. Référence au bucket (si pas en mode mock)
        if not self.use_mock:
            try:
                self.bucket = storage.bucket()
                # Test d'accès basique au bucket si possible
                if not self.bucket.exists():
                    logger.error(f"Le bucket {settings.FIREBASE_STORAGE_BUCKET} n'existe pas. Mode Mock activé.")
                    self.use_mock = True
            except Exception as e:
                logger.error(f"Erreur accès bucket: {e}. Mode Mock activé.")
                self.use_mock = True

    async def upload_file(self, file_data: bytes, destination_path: str, content_type: str) -> Optional[str]:
        """Télécharge vers Firebase ou sauvegarde localement en mode Mock."""
        try:
            if self.use_mock:
                full_path = self.mock_dir / destination_path
                full_path.parent.mkdir(parents=True, exist_ok=True)
                with open(full_path, "wb") as f:
                    f.write(file_data)
                logger.info(f"Mock Upload: {destination_path}")
                return f"/api/v1/cards/download/{destination_path}"

            blob = self.bucket.blob(destination_path)
            from fastapi.concurrency import run_in_threadpool
            await run_in_threadpool(blob.upload_from_string, file_data, content_type=content_type)
            await run_in_threadpool(blob.make_public) 
            return blob.public_url

        except Exception as e:
            logger.error(f"Échec upload {destination_path}: {e}")
            return None

    async def card_exists(self, member_id: str) -> bool:
        """Vérifie si la carte existe (Mock ou Firebase)."""
        if self.use_mock:
            return (self.mock_dir / f"cards/{member_id}/recto.png").exists()

        from fastapi.concurrency import run_in_threadpool
        recto = self.bucket.blob(f"cards/{member_id}/recto.png")
        try:
            return await run_in_threadpool(recto.exists)
        except Exception:
            return False

    async def get_card_image(self, member_id: str, side: str):
        """Récupère le contenu de l'image (Mock ou Firebase)."""
        from io import BytesIO
        try:
            if self.use_mock:
                file_path = self.mock_dir / f"cards/{member_id}/{side}.png"
                if not file_path.exists():
                    logger.warning(f"Fichier mock non trouvé: {file_path}")
                    raise FileNotFoundError(f"Carte {side} non trouvée pour {member_id}")
                with open(file_path, "rb") as f:
                    return BytesIO(f.read())

            from fastapi.concurrency import run_in_threadpool
            blob = self.bucket.blob(f"cards/{member_id}/{side}.png")
            content = await run_in_threadpool(blob.download_as_bytes)
            return BytesIO(content)
        except Exception as e:
            logger.error(f"Erreur récupération image {member_id}/{side}: {e}")
            raise e

    async def upload_card(self, member_id: str, recto_data: bytes, verso_data: bytes):
        """Upload recto and verso images"""
        # On s'assure que les données sont lues si ce sont des BytesIO
        if hasattr(recto_data, 'getvalue'): recto_data = recto_data.getvalue()
        if hasattr(verso_data, 'getvalue'): verso_data = verso_data.getvalue()
        
        await self.upload_file(recto_data, f"cards/{member_id}/recto.png", "image/png")
        await self.upload_file(verso_data, f"cards/{member_id}/verso.png", "image/png")

    async def get_card_urls(self, member_id: str) -> dict:
        """Retourne les URLs des images."""
        if self.use_mock:
            return {
                "recto": f"{settings.API_PREFIX}/cards/download/{member_id}/recto",
                "verso": f"{settings.API_PREFIX}/cards/download/{member_id}/verso"
            }
            
        base_url = f"https://storage.googleapis.com/{settings.FIREBASE_STORAGE_BUCKET}/cards/{member_id}"
        return {
            "recto": f"{base_url}/recto.png",
            "verso": f"{base_url}/verso.png"
        }

    async def delete_file(self, file_path: str) -> bool:
        """Suppression de fichier (Mock ou Firebase)."""
        try:
            if self.use_mock:
                full_path = self.mock_dir / file_path
                if full_path.exists():
                    full_path.unlink()
                return True

            blob = self.bucket.blob(file_path)
            from fastapi.concurrency import run_in_threadpool
            if await run_in_threadpool(blob.exists):
                await run_in_threadpool(blob.delete)
            return True
        except Exception as e:
            logger.error(f"Échec suppression {file_path}: {e}")
            return False

    async def get_file(self, destination_path: str):
        """Récupère le contenu d'un fichier quelconque."""
        from io import BytesIO
        try:
            if self.use_mock:
                file_path = self.mock_dir / destination_path
                if not file_path.exists():
                    logger.warning(f"Fichier mock non trouvé: {file_path}")
                    raise FileNotFoundError(f"Fichier {destination_path} non trouvé")
                with open(file_path, "rb") as f:
                    return BytesIO(f.read())
            
            from fastapi.concurrency import run_in_threadpool
            blob = self.bucket.blob(destination_path)
            content = await run_in_threadpool(blob.download_as_bytes)
            return BytesIO(content)
        except Exception as e:
            logger.error(f"Erreur récupération fichier {destination_path}: {e}")
            raise e
