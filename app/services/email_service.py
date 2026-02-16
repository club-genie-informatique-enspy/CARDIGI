import logging
import os
from pathlib import Path
from typing import List, Dict, Any
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from ..core.config import settings
from datetime import datetime

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Configuration de fastapi-mail
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.MAIL_USERNAME,
            MAIL_PASSWORD=settings.MAIL_PASSWORD,
            MAIL_FROM=settings.MAIL_FROM,
            MAIL_PORT=settings.MAIL_PORT,
            MAIL_SERVER=settings.MAIL_SERVER,
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_STARTTLS=settings.MAIL_STARTTLS,
            MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
            USE_CREDENTIALS=settings.USE_CREDENTIALS,
            VALIDATE_CERTS=settings.VALIDATE_CERTS,
            TEMPLATE_FOLDER=Path(__file__).parent.parent / "templates" / "email"
        )
        self.fastmail = FastMail(self.conf)

    async def send_welcome_email(self, email: str, prenom: str, password: str):
        """Envoie un email de bienvenue à un nouveau membre."""
        # Si le mode local-only ou dév sans SMTP est actif, on logge simplement
        if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
            logger.warning(f"SMTP non configuré. Email de bienvenue pour {email} non envoyé.")
            logger.info(f"Détails du mail (MOCK) : {{'prenom': {prenom}, 'email': {email}, 'password': {password}}}")
            return

        template_body = {
            "prenom": prenom,
            "email": email,
            "password": password,
            "current_year": datetime.now().year
        }

        message = MessageSchema(
            subject="Bienvenue chez CARDIGI - Vos identifiants",
            recipients=[email],
            template_body=template_body,
            subtype=MessageType.html
        )

        try:
            await self.fastmail.send_message(message, template_name="welcome.html")
            logger.info(f"Email de bienvenue envoyé avec succès à {email}")
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de l'email à {email} : {e}")

# Singleton
email_service = EmailService()
