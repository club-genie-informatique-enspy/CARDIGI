
import sys
from weasyprint import HTML, CSS
from pathlib import Path
import logging

# Configure WeasyPrint logger
logger = logging.getLogger('weasyprint')
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler(sys.stdout)
logger.addHandler(handler)

def reproduce():
    html_file = Path("debug_recto_def-456-dev.html")
    if not html_file.exists():
        print("Debug HTML file not found!")
        return

    print(f"Rendering {html_file}...")
    
    # CSS necessary for the card dimensions
    css = """
        @page {
            size: 85.6mm 53.98mm;
            margin: 0;
        }
        body {
            font-family: 'Roboto', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
        }
    """
    
    try:
        # Base URL for images
        base_url = Path("app/static").absolute()
        
        # Write PDF
        HTML(filename=str(html_file), base_url=str(base_url)).write_pdf(
            "debug_output.pdf",
            stylesheets=[CSS(string=css)]
        )
        print("Success! debug_output.pdf generated.")
        
    except Exception as e:
        print(f"Error rendering PDF: {e}")

if __name__ == "__main__":
    reproduce()
