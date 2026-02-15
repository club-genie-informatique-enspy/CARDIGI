# ========================================
# FICHIER: backend/app/main.py
# Point d'entrée principal de l'API FastAPI
# ========================================

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1 import cards, members, verification, auth, stats

# Configuration du logging
setup_logging()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    logger.info("🚀 Démarrage de CARDIGI API")
    # Initialisation Firebase, connexions DB, etc.
    yield
    logger.info("🛑 Arrêt de CARDIGI API")

# Initialisation FastAPI
app = FastAPI(
    title="CARDIGI API",
    description="API de génération de cartes numériques - Club GI ENSPY",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Middleware pour les hôtes de confiance
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*.cardigi.enspy.club", "cardigi.enspy.club", "*.onrender.com", "localhost", "127.0.0.1", "0.0.0.0"]
)

# Middleware pour logger les requêtes
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {duration:.3f}s"
    )
    return response

# Routes principales
@app.get("/")
async def root():
    """Page d'accueil de l'API"""
    return {
        "message": "Bienvenue sur CARDIGI API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """Endpoint de santé pour monitoring"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "environment": settings.ENVIRONMENT
    }

# Inclusion des routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_PREFIX}/auth",
    tags=["auth"]
)
app.include_router(
    cards.router,
    prefix=f"{settings.API_PREFIX}/cards",
    tags=["cards"]
)
app.include_router(
    members.router,
    prefix=f"{settings.API_PREFIX}/members",
    tags=["members"]
)
app.include_router(
    stats.router,
    prefix=f"{settings.API_PREFIX}/stats",
    tags=["stats"]
)
app.include_router(
    verification.router,
    prefix=f"{settings.API_PREFIX}/verify",
    tags=["verification"]
)

# Gestionnaire d'erreurs global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erreur non gérée: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Erreur interne du serveur"}
    )
