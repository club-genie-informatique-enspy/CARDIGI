# backend/app/services/storage_service.py

import logging
import os
from typing import Optional
from pathlib import Path
from io import BytesIO
import cloudinary
import cloudinary.uploader
import cloudinary.api
from cloudinary.utils import cloudinary_url
import requests

from ..core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    """
    Service pour gérer les opérations de stockage de fichiers sur Cloudinary.
    Fallback en mode Mock si Cloudinary n'est pas configuré.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(StorageService, cls).__new__(cls)
            cls._instance._initialize_cloudinary()
        return cls._instance

    def _initialize_cloudinary(self):
        """Initialise Cloudinary ou configure le mode Mock."""
        self.use_mock = settings.ENVIRONMENT == "development"
        self.mock_dir = Path("data/mock_storage")
        self.cloudinary_configured = False

        if self.use_mock:
            logger.info("Mode Développement: Utilisation du stockage local (Mock).")
            self.mock_dir.mkdir(parents=True, exist_ok=True)
            return

        # Vérifier si Cloudinary est configuré
        if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
            logger.warning("Cloudinary non configuré. Basculement en mode Mock.")
            self.use_mock = True
            self.mock_dir.mkdir(parents=True, exist_ok=True)
            return

        try:
            # Nettoyer les credentials (supprimer espaces, quotes, etc.)
            cloud_name = str(settings.CLOUDINARY_CLOUD_NAME).strip().strip('"').strip("'")
            api_key = str(settings.CLOUDINARY_API_KEY).strip().strip('"').strip("'")
            api_secret = str(settings.CLOUDINARY_API_SECRET).strip().strip('"').strip("'")
            
            logger.info(f"Tentative de connexion à Cloudinary: {cloud_name}")
            
            # Configurer Cloudinary
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True
            )
            
            # Test de connexion
            cloudinary.api.ping()
            self.cloudinary_configured = True
            logger.info(f"✅ Cloudinary initialisé avec succès. Cloud: {cloud_name}")
            
        except Exception as e:
            logger.error(f"❌ Échec initialisation Cloudinary: {e}")
            logger.error(f"Cloud Name fourni: '{settings.CLOUDINARY_CLOUD_NAME}'")
            logger.error("Vérifiez vos credentials Cloudinary dans les variables d'environnement.")
            self.use_mock = True
            self.mock_dir.mkdir(parents=True, exist_ok=True)

    async def upload_file(self, file_data: bytes, destination_path: str, content_type: str) -> Optional[str]:
        """Télécharge vers Cloudinary ou sauvegarde localement en mode Mock."""
        try:
            if self.use_mock:
                full_path = self.mock_dir / destination_path
                full_path.parent.mkdir(parents=True, exist_ok=True)
                with open(full_path, "wb") as f:
                    f.write(file_data)
                logger.info(f"Mock Upload: {destination_path}")
                return f"/api/v1/members/photo/{destination_path}"

            # Upload vers Cloudinary
            from fastapi.concurrency import run_in_threadpool
            
            # Déterminer le resource_type basé sur le content_type
            resource_type = "image" if content_type.startswith("image/") else "raw"
            
            # Créer un public_id à partir du destination_path (sans extension)
            public_id = destination_path.rsplit('.', 1)[0] if '.' in destination_path else destination_path
            
            result = await run_in_threadpool(
                cloudinary.uploader.upload,
                file_data,
                public_id=public_id,
                resource_type=resource_type,
                overwrite=True,
                invalidate=True
            )
            
            return result.get('secure_url')

        except Exception as e:
            logger.error(f"Échec upload {destination_path}: {e}")
            return None

    async def card_exists(self, member_id: str) -> bool:
        """Vérifie si la carte existe (Mock ou Cloudinary)."""
        if self.use_mock:
            return (self.mock_dir / f"cards/{member_id}/recto.png").exists()

        try:
            from fastapi.concurrency import run_in_threadpool
            # Vérifier si le recto existe sur Cloudinary
            public_id = f"cards/{member_id}/recto"
            result = await run_in_threadpool(
                cloudinary.api.resource,
                public_id,
                resource_type="image"
            )
            return result is not None
        except cloudinary.exceptions.NotFound:
            return False
        except Exception as e:
            logger.error(f"Erreur vérification carte {member_id}: {e}")
            return False

    async def get_card_image(self, member_id: str, side: str):
        """Récupère le contenu de l'image (Mock ou Cloudinary)."""
        try:
            if self.use_mock:
                file_path = self.mock_dir / f"cards/{member_id}/{side}.png"
                if not file_path.exists():
                    logger.warning(f"Fichier mock non trouvé: {file_path}")
                    raise FileNotFoundError(f"Carte {side} non trouvée pour {member_id}")
                with open(file_path, "rb") as f:
                    return BytesIO(f.read())

            # Télécharger depuis Cloudinary
            from fastapi.concurrency import run_in_threadpool
            public_id = f"cards/{member_id}/{side}"
            
            # Obtenir l'URL de l'image
            url, _ = cloudinary_url(public_id, resource_type="image", format="png")
            
            # Télécharger l'image
            response = await run_in_threadpool(requests.get, url)
            response.raise_for_status()
            
            return BytesIO(response.content)
            
        except Exception as e:
            logger.error(f"Erreur récupération image {member_id}/{side}: {e}")
            raise e

    async def upload_card(self, member_id: str, recto_data: bytes, verso_data: bytes):
        """Upload recto and verso images"""
        # On s'assure que les données sont lues si ce sont des BytesIO
        if hasattr(recto_data, 'getvalue'): 
            recto_data = recto_data.getvalue()
        if hasattr(verso_data, 'getvalue'): 
            verso_data = verso_data.getvalue()
        
        await self.upload_file(recto_data, f"cards/{member_id}/recto.png", "image/png")
        await self.upload_file(verso_data, f"cards/{member_id}/verso.png", "image/png")

    async def get_card_urls(self, member_id: str) -> dict:
        """Retourne les URLs des images."""
        if self.use_mock:
            return {
                "recto": f"{settings.API_PREFIX}/cards/download/{member_id}/recto",
                "verso": f"{settings.API_PREFIX}/cards/download/{member_id}/verso"
            }
            
        # URLs Cloudinary
        recto_url, _ = cloudinary_url(f"cards/{member_id}/recto", resource_type="image", format="png", secure=True)
        verso_url, _ = cloudinary_url(f"cards/{member_id}/verso", resource_type="image", format="png", secure=True)
        
        return {
            "recto": recto_url,
            "verso": verso_url
        }

    async def delete_file(self, file_path: str) -> bool:
        """Suppression de fichier (Mock ou Cloudinary)."""
        try:
            if self.use_mock:
                full_path = self.mock_dir / file_path
                if full_path.exists():
                    full_path.unlink()
                return True

            # Supprimer de Cloudinary
            from fastapi.concurrency import run_in_threadpool
            public_id = file_path.rsplit('.', 1)[0] if '.' in file_path else file_path
            
            await run_in_threadpool(
                cloudinary.uploader.destroy,
                public_id,
                invalidate=True
            )
            return True
            
        except Exception as e:
            logger.error(f"Échec suppression {file_path}: {e}")
            return False

    async def get_file(self, destination_path: str):
        """Récupère le contenu d'un fichier quelconque."""
        try:
            if self.use_mock:
                file_path = self.mock_dir / destination_path
                if not file_path.exists():
                    logger.warning(f"Fichier mock non trouvé: {file_path}")
                    raise FileNotFoundError(f"Fichier {destination_path} non trouvé")
                with open(file_path, "rb") as f:
                    return BytesIO(f.read())
            
            # Télécharger depuis Cloudinary
            from fastapi.concurrency import run_in_threadpool
            public_id = destination_path.rsplit('.', 1)[0] if '.' in destination_path else destination_path
            
            # Obtenir l'URL
            url, _ = cloudinary_url(public_id, resource_type="image", secure=True)
            
            # Télécharger
            response = await run_in_threadpool(requests.get, url)
            response.raise_for_status()
            
            return BytesIO(response.content)
            
        except Exception as e:
            logger.error(f"Erreur récupération fichier {destination_path}: {e}")
            raise e
