
# ========================================
# FICHIER: backend/app/services/card_generator.py
# Service de génération de cartes
# ========================================

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML, CSS
from pathlib import Path
from io import BytesIO
from PIL import Image
import os

from app.models.member import MemberCard
from app.services.qr_generator import QRCodeGenerator

class CardGenerator:
    """Générateur de cartes d'adhérent recto/verso"""
    
    def __init__(self):
        self.templates_dir = Path(__file__).parent.parent / "templates"
        self.static_dir = Path(__file__).parent.parent / "static"
        self.env = Environment(loader=FileSystemLoader(str(self.templates_dir)))
        self.qr_generator = QRCodeGenerator()
    
    def _render_template(self, template_name: str, context: dict) -> str:
        """Rend un template Jinja2"""
        template = self.env.get_template(template_name)
        return template.render(**context)
    
    def generate_card_recto(self, member: MemberCard) -> BytesIO:
        """Génère le recto de la carte"""
        
        # Résolution de la photo pour WeasyPrint (chemin local si possible)
        photo_url = member.photo_url
        if photo_url and ("/api/v1/members/photo/" in photo_url or "localhost" in photo_url):
            try:
                # Tentative de récupération du chemin local via StorageService
                from app.services.storage_service import StorageService
                storage = StorageService()
                if storage.use_mock:
                    mock_photos_dir = storage.mock_dir / "photos"
                    if mock_photos_dir.exists():
                        for f in mock_photos_dir.iterdir():
                            if f.stem == member.id:
                                # On passe le chemin absolu local pour weasyprint
                                photo_url = f"file://{f.absolute()}"
                                break
            except Exception as e:
                # En cas d'erreur, on garde l'URL d'origine
                pass
        
        # Préparer le contexte
        context = {
            "member": member,
            "photo_url_resolved": photo_url,
            "logo_enspy_path": f"{self.static_dir}/images/logo_enspy.png",
            "logo_gi_path": f"{self.static_dir}/images/logo_gi.png",
            "circuit_bg_path": f"{self.static_dir}/images/circuit_bg.svg",
            "code_icon_path": f"{self.static_dir}/images/code_icon.svg",
            "current_year": member.date_adhesion.year
        }
        
        # Rendre le template
        html_content = self._render_template("card_recto.html", context)
        
        # DEBUG: Save HTML to file
        with open(f"debug_recto_{member.id}.html", "w") as f:
            f.write(html_content)
        
        # Générer PDF
        pdf_buffer = BytesIO()
        HTML(string=html_content, base_url=str(self.static_dir)).write_pdf(
            pdf_buffer,
            stylesheets=[CSS(string=self._get_card_css())]
        )
        pdf_buffer.seek(0)
        
        # Convertir PDF en PNG haute qualité
        png_buffer = self._pdf_to_png(pdf_buffer)
        return png_buffer
    
    def generate_card_verso(self, member: MemberCard) -> BytesIO:
        """Génère le verso de la carte avec QR code"""
        
        # Générer le QR code
        qr_buffer = self.qr_generator.generate_qr_code(
            member.id,
            member.numero_membre,
            size=250
        )
        qr_base64 = self.qr_generator.qr_to_base64(qr_buffer)
        
        # Préparer le contexte
        context = {
            "member": member,
            "qr_code": qr_base64,
            "club_info": {
                "nom": "CLUB GÉNIE INFORMATIQUE",
                "ecole": "École Nationale Supérieure Polytechnique de Yaoundé",
                "adresse": "BP 8390, Yaoundé, Cameroun",
                "email": "clubinfoenspy@gmail.com",
                "telephone": "+237 657450314",
                "site_web": "https://gi-enspy.vercel.app"
            },
            "president": {
                "nom": "ELA FOE FRÉDÉRIC THÉOPHILE",
                "signature_path": f"{self.static_dir}/images/signature_president.png"
            },
            "cachet_path": f"{self.static_dir}/images/cachet_club.png"
        }
        
        # Rendre le template
        html_content = self._render_template("card_verso.html", context)
        
        # Générer PDF puis PNG
        pdf_buffer = BytesIO()
        HTML(string=html_content, base_url=str(self.static_dir)).write_pdf(
            pdf_buffer,
            stylesheets=[CSS(string=self._get_card_css())]
        )
        pdf_buffer.seek(0)
        
        png_buffer = self._pdf_to_png(pdf_buffer)
        return png_buffer
    
    def generate_full_card(self, member: MemberCard) -> dict:
        """Génère la carte complète (recto + verso)"""
        recto_buffer = self.generate_card_recto(member)
        verso_buffer = self.generate_card_verso(member)
        
        return {
            "recto": recto_buffer,
            "verso": verso_buffer,
            "member_id": member.id,
            "numero_membre": member.numero_membre
        }
    
    def _pdf_to_png(self, pdf_buffer: BytesIO, dpi: int = 300) -> BytesIO:
        """Convertit PDF en PNG haute qualité"""
        from pdf2image import convert_from_bytes
        
        images = convert_from_bytes(pdf_buffer.read(), dpi=dpi)
        png_buffer = BytesIO()
        images[0].save(png_buffer, format="PNG", optimize=True)
        png_buffer.seek(0)
        return png_buffer
    
    def _get_card_css(self) -> str:
        """CSS pour le styling des cartes"""
        return """
        @page {
            size: 85.6mm 53.98mm; /* Taille carte de crédit ISO/IEC 7810 */
            margin: 0;
        }
        body {
            font-family: 'Roboto', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
        }
        .card {
            width: 85.6mm;
            height: 53.98mm;
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #ffffff 0%, #eff6ff 50%, #f3f4f6 100%);
        }
        """

