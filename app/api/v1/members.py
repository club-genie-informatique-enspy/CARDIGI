from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from typing import Annotated
import logging

from ...core import security
from ...core.config import settings
from ...services import external_api
from ...services.storage_service import StorageService
from ...models.member import Token, MemberOut, MemberInDB, MemberUpdate
from ...api.deps import get_current_admin, get_current_user

router = APIRouter()
storage_service = StorageService()

# ----------------------------------------------------------------------
# 1. Gestion des membres (Admin)
# ----------------------------------------------------------------------

@router.get("/", response_model=dict, summary="Liste tous les membres")
async def read_members(
    current_admin: Annotated[MemberInDB, Depends(get_current_admin)],
    limit: int = 100,
    offset: int = 0,
    filiere: str = None,
    niveau: str = None,
    statut: str = None
):
    """
    Récupère la liste des membres avec filtrage. Accessible uniquement aux admins.
    """
    result = await external_api.get_all_members()
    all_members = result.get("members", [])
    
    # Filtrage
    filtered = all_members
    if filiere:
        filtered = [m for m in filtered if m.get("filiere") == filiere]
    if niveau:
        filtered = [m for m in filtered if m.get("niveau") == niveau]
    if statut:
        filtered = [m for m in filtered if m.get("statut") == statut]
        
    return {
        "total": len(filtered),
        "members": filtered[offset : offset + limit]
    }

@router.get("/{member_id}", response_model=MemberOut, summary="Récupère un membre par son ID")
async def read_member(
    member_id: str,
    current_user: Annotated[MemberInDB, Depends(get_current_user)]
):
    """
    Récupère les détails d'un membre spécifique.
    """
    member = await external_api.get_member_from_external_api(member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Membre non trouvé")
    return member

# ----------------------------------------------------------------------
# 2. Route pour récupérer l'utilisateur actuel (Profil)
# ----------------------------------------------------------------------

@router.get("/me", response_model=MemberOut, summary="Récupère le profil de l'utilisateur actuel")
async def read_users_me(
    current_user: Annotated[MemberInDB, Depends(get_current_user)]
):
    """
    Récupère les informations du membre actuellement connecté.
    Nécessite un token JWT valide dans l'en-tête 'Authorization'.
    """
    return current_user 

@router.put("/me", response_model=MemberOut, summary="Met à jour le profil de l'utilisateur actuel")
async def update_users_me(
    update_data: MemberUpdate,
    current_user: Annotated[MemberInDB, Depends(get_current_user)]
):
    """
    Met à jour les informations du membre actuellement connecté.
    Permet de modifier le téléphone, le niveau, la cellule ou l'URL de la photo.
    """
    updated_user = await external_api.update_member(current_user.id, update_data)
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Une erreur est survenue lors de la mise à jour du profil."
        )
        
    return updated_user

# ----------------------------------------------------------------------
# 3. Exemple de route protégée (Admin)
# ----------------------------------------------------------------------

@router.get("/admin/test", summary="Test d'accès Admin", status_code=status.HTTP_200_OK)
async def test_admin_access(
    current_admin: Annotated[MemberInDB, Depends(get_current_admin)]
):
    """
    Test pour vérifier si l'utilisateur est bien connecté et est administrateur.
    """
    return {"message": f"Accès Admin accordé. Bienvenue, {current_admin.prenom}."}

# ----------------------------------------------------------------------
# 4. Photos de profil
# ----------------------------------------------------------------------

@router.post("/me/photo", response_model=MemberOut, summary="Upload la photo de profil")
async def upload_photo(
    current_user: Annotated[MemberInDB, Depends(get_current_user)],
    file: UploadFile = File(...)
):
    """
    Upload une photo de profil pour l'utilisateur actuel.
    L'image est stockée sur Firebase (ou localement en dév) et le profil est mis à jour.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")
        
    try:
        content = await file.read()
        
        # Définir le chemin de destination
        extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        destination = f"photos/{current_user.id}.{extension}"
        
        # Upload via StorageService
        photo_url = await storage_service.upload_file(
            content, 
            destination, 
            file.content_type
        )
        
        if not photo_url:
            raise HTTPException(status_code=500, detail="Échec de l'upload de l'image")
            
        # Si on est en mock, on force l'URL vers notre route dédiée pour que ça s'affiche
        if settings.ENVIRONMENT == "development":
            photo_url = f"{settings.API_PREFIX}/members/photo/{current_user.id}"

        # Mettre à jour le profil du membre
        update_data = MemberUpdate(photo_url=photo_url)
        updated_user = await external_api.update_member(current_user.id, update_data)
        
        return updated_user
        
    except Exception as e:
        logging.error(f"Erreur lors de l'upload de la photo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/photo/{path:path}")
async def get_photo(path: str):
    """
    Récupère la photo de profil d'un membre.
    Utilisé pour servir les fichiers locaux en développement ou rediriger vers Firebase.
    """
    try:
        if settings.ENVIRONMENT == "development":
            # Si le chemin commence par 'photos/', on l'utilise directement
            file_path = path
            if not file_path.startswith("photos/"):
                # Sinon on cherche dans le dossier photos
                mock_photos_dir = storage_service.mock_dir / "photos"
                if mock_photos_dir.exists():
                    for f in mock_photos_dir.iterdir():
                        if f.stem == path:
                            file_path = f"photos/{f.name}"
                            break
            
            image_buffer = await storage_service.get_file(file_path)
            mime = "image/png" if file_path.lower().endswith(".png") else "image/jpeg"
            return StreamingResponse(image_buffer, media_type=mime)
            
        else:
            # En production, on essaie de rediriger vers l'URL publique
            # Si c'est déjà un chemin complet, on redirige vers le bucket
            if path.startswith("photos/"):
                public_url = f"https://storage.googleapis.com/{settings.FIREBASE_STORAGE_BUCKET}/{path}"
                from fastapi.responses import RedirectResponse
                return RedirectResponse(url=public_url)
                
            # Sinon on cherche le membre
            member = await external_api.get_member_from_external_api(path)
            if not member or not member.photo_url:
                raise HTTPException(status_code=404, detail="Photo non trouvée")
            
            from fastapi.responses import RedirectResponse
            return RedirectResponse(url=member.photo_url)
            
    except Exception as e:
        logger.error(f"Erreur get_photo: {e}")
        raise HTTPException(status_code=404, detail="Image non trouvée")