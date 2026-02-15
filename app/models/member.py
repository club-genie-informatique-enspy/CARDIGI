# backend/app/models/member.py

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import date, datetime
from enum import Enum

class MemberStatus(str, Enum):
    """Statuts possibles d'un membre"""
    ACTIF = "actif"
    INACTIF = "inactif"
    SUSPENDU = "suspendu"

class Filiere(str, Enum):
    """Filières disponibles"""
    GENIE_INFORMATIQUE = "Génie Informatique"
    GENIE_CIVIL = "Génie Civil"
    GENIE_ELECTRIQUE = "Génie Électrique"
    GENIE_MECANIQUE = "Génie Mécanique"

class Niveau(str, Enum):
    """Niveaux d'études"""
    L1 = "L1"
    L2 = "L2"
    L3 = "L3"
    M1 = "M1"
    M2 = "M2"

class Cellule(str, Enum):
    """Cellules du club"""
    PROJET = "Projet"
    COMMUNICATION = "Communication"
    FORMATION = "Formation"
    EVENEMENTIEL = "Événementiel"
    FINANCE = "Finance"

class MemberBase(BaseModel):
    """Données de base d'un membre"""
    numero_membre: str = Field(..., pattern=r"^CGI-\d{4}-\d{3}$")
    nom: str = Field(..., min_length=2, max_length=50)
    prenom: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    telephone: str = Field(..., pattern=r"^\+?\d{9,15}$")
    filiere: Filiere
    niveau: Niveau
    cellule: Optional[Cellule] = None
    date_adhesion: date
    statut: MemberStatus = MemberStatus.ACTIF

class MemberCreate(MemberBase):
    """Création d'un nouveau membre (Admin)"""
    photo_url: Optional[str] = None

class MemberRegistration(BaseModel):
    """Inscription de l'étudiant lui-même"""
    nom: str = Field(..., min_length=2, max_length=50)
    prenom: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    telephone: str = Field(..., pattern=r"^\+?\d{9,15}$")
    filiere: Filiere
    niveau: Niveau
    password: str = Field(..., min_length=8)

class MemberUpdate(BaseModel):
    """Mise à jour du profil par le membre"""
    nom: Optional[str] = Field(None, min_length=2, max_length=50)
    prenom: Optional[str] = Field(None, min_length=2, max_length=50)
    telephone: Optional[str] = Field(None, pattern=r"^\+?\d{9,15}$")
    filiere: Optional[Filiere] = None
    photo_url: Optional[str] = None
    cellule: Optional[Cellule] = None
    niveau: Optional[Niveau] = None

class MemberResponse(MemberBase):
    """Réponse avec données membre"""
    id: str
    photo_url: Optional[str] = None
    date_expiration: date
    created_at: datetime
    updated_at: datetime
    role: Literal["member", "admin"] = "member"
    
    class Config:
        from_attributes = True

MemberOut = MemberResponse 

class MemberCard(BaseModel):
    """Données pour la carte"""
    id: str
    numero_membre: str
    nom: str
    prenom: str
    filiere: str
    niveau: str
    cellule: Optional[str]
    date_adhesion: date
    date_expiration: date
    statut: str
    photo_url: Optional[str] = None
    qr_code_url: Optional[str] = None

class MemberInDB(MemberResponse):
    """Schéma complet d'un membre"""
    is_admin: bool = Field(False, description="Droits d'administration CARDIGI")
    permissions: list[str] = Field(default_factory=list, description="Liste des permissions détaillées")
    pending_sync: bool = Field(False, description="En attente de synchronisation avec l'API externe")

    class Config:
        from_attributes = True

class Token(BaseModel):
    """Schéma pour le JWT Access Token."""
    access_token: str
    token_type: str = "bearer"
    user: MemberInDB
    
class TokenData(BaseModel):
    """Schéma pour les données encodées dans le token."""
    sub: Optional[str] = None