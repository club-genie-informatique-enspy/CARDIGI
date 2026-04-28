

# ========================================
# FICHIER: backend/app/services/qr_generator.py
# Service de génération de QR codes
# ========================================

import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import SolidFillColorMask
from io import BytesIO
from PIL import Image
import base64
from datetime import datetime, timedelta, date
from typing import Optional
from jose import jwt
from app.core.config import settings

class QRCodeGenerator:
    """Générateur de QR codes sécurisés"""
    
    def __init__(self):
        base = (getattr(settings, "FRONTEND_BASE_URL", "") or "").rstrip("/")
        # Le QR doit pointer vers le frontend (page /verify), pas vers le backend.
        self.base_url = f"{base}/verify" if base else "https://cardigi-orcin.vercel.app/verify"
    
    def generate_verification_token(
        self,
        member_id: str,
        numero_membre: str,
        date_expiration: Optional[date] = None
    ) -> str:
        """Génère un token JWT pour la vérification de carte.
        
        L'expiration est alignée sur la date d'expiration de l'adhésion du membre.
        Si non fournie, le token expire dans 1 an par défaut.
        """
        if date_expiration:
            # Aligner l'expiration du QR sur la date d'expiration du membre
            expiration = datetime.combine(date_expiration, datetime.max.time())
        else:
            # Fallback : 1 an à partir d'aujourd'hui
            expiration = datetime.utcnow() + timedelta(days=365)
        
        payload = {
            "member_id": member_id,
            "numero_membre": numero_membre,
            "exp": expiration,
            "iat": datetime.utcnow()
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return token
    
    def generate_qr_code(
        self,
        member_id: str,
        numero_membre: str,
        size: int = 300,
        border: int = 2,
        date_expiration: Optional[date] = None
    ) -> BytesIO:
        """Génère un QR code stylisé dont la validité est liée à l'adhésion du membre."""
        
        # Créer le token de vérification (expiration = date_expiration du membre)
        token = self.generate_verification_token(member_id, numero_membre, date_expiration)
        verification_url = f"{self.base_url}/{token}"
        
        # Configurer le QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=border,
        )
        qr.add_data(verification_url)
        qr.make(fit=True)
        
        # Créer l'image avec style
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
            color_mask=SolidFillColorMask(
                back_color=(255, 255, 255),
                front_color=(13, 71, 161)  # Bleu ENSPY
            )
        )
        
        # Redimensionner
        img = img.resize((size, size), Image.LANCZOS)
        
        # Convertir en BytesIO
        buffer = BytesIO()
        img.save(buffer, format="PNG", optimize=True)
        buffer.seek(0)
        
        return buffer
    
    def qr_to_base64(self, qr_buffer: BytesIO) -> str:
        """Convertit le QR code en base64 pour embedding"""
        qr_buffer.seek(0)
        img_base64 = base64.b64encode(qr_buffer.read()).decode()
        return f"data:image/png;base64,{img_base64}"

