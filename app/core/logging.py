# backend/app/core/logging.py

import logging
import os
from logging.handlers import RotatingFileHandler

from .config import settings

LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

def setup_logging():
    """
    Configure le système de logging de l'application.
    Les logs sont écrits dans la console (stdout) et dans un fichier (avec rotation).
    """
    # 1. Configuration du niveau de base
    try:
        log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    except AttributeError:
        log_level = logging.INFO
    
    # 2. Configuration du logger racine
    # Cela capture les logs de FastAPI, Uvicorn et vos propres loggers.
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Créer le dossier des logs si non existant
    log_dir = os.path.dirname(settings.LOG_FILE)
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # 3. Création des Handlers

    # Handler 3a: Console/Stream Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    root_logger.addHandler(console_handler)

    # Handler 3b: File Handler avec rotation
    # Max 5 fichiers de 10 Mo chacun
    file_handler = RotatingFileHandler(
        settings.LOG_FILE,
        maxBytes=10 * 1024 * 1024, # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT))
    root_logger.addHandler(file_handler)

    # Optionnel: Supprimer le handler par défaut d'uvicorn
    # pour éviter les doublons ou formattages incohérents
    if root_logger.handlers:
        for handler in root_logger.handlers:
            if isinstance(handler, logging.FileHandler):
                 # Uvicorn utilise le handler par défaut de Python, parfois il est bon de le désactiver
                 # pour les loggers spécifiques (comme 'uvicorn.access')
                pass
    
    # S'assurer que le niveau est appliqué
    root_logger.info(f"Logging initialisé. Niveau: {settings.LOG_LEVEL.upper()}. Fichier: {settings.LOG_FILE}")
