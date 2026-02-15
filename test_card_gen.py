
import sys
from io import BytesIO
from app.models.member import MemberCard, MemberStatus
from app.services.card_generator import CardGenerator
from datetime import date
import logging

logging.basicConfig(level=logging.INFO)

def test_generation():
    print("Starting generation test...")
    member = MemberCard(
        id="def-456-dev",
        numero_membre="CGI-2025-002",
        nom="MEMBER",
        prenom="Standard",
        filiere="Génie Civil",
        niveau="L2",
        cellule=None,
        date_adhesion=date(2024, 9, 15),
        date_expiration=date(2025, 9, 15),
        statut="actif",
        photo_url=None,
        qr_code_url=None
    )
    
    generator = CardGenerator()
    try:
        print("Attempting to generate full card...")
        result = generator.generate_full_card(member)
        print("Generation successful!")
        print(f"Recto size: {len(result['recto'].getvalue())} bytes")
        print(f"Verso size: {len(result['verso'].getvalue())} bytes")
    except Exception as e:
        print(f"Generation failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Add project root to sys.path
    import os
    sys.path.append(os.getcwd())
    test_generation()
