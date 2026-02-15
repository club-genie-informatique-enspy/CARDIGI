

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
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

class QRCodeGenerator:
    """Générateur de QR codes sécurisés"""
    
    def __init__(self):
        self.base_url = "https://cardigi.enspy.club/verify"
    
    def generate_verification_token(self, member_id: str, numero_membre: str) -> str:
        """Génère un token JWT pour la vérification"""
        expiration = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
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
        border: int = 2
    ) -> BytesIO:
        """Génère un QR code stylisé"""
        
        # Créer le token de vérification
        token = self.generate_verification_token(member_id, numero_membre)
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

