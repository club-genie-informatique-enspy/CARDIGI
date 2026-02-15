# CARDIGI - Backend

API REST pour la gestion et la génération de cartes de membre numériques pour le Club GI - ENSPY.

## 🚀 Technologies

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Langage**: Python 3.10+
- **Stockage & Auth**: Firebase Admin SDK
- **Génération d'images**: Pillow / ReportLab
- **Serveur**: Uvicorn

## 🛠️ Installation et Démarrage

1.  **Installer les dépendances** :
    ```bash
    pip install -r requirements.txt
    ```
2.  **Configurer l'environnement** :
    Créez un fichier `.env` basé sur `.env.example`.
    
    > [!IMPORTANT]
    > Pour le développement local, renseignez `FIREBASE_CREDENTIALS_PATH`. 
    > Pour la production (Render), utilisez `FIREBASE_CREDENTIALS_JSON`.

3.  **Lancer l'API** :
    ```bash
    uvicorn app.main:app --reload
    ```
    L'API sera accessible sur `http://localhost:8000`.
    Documentation Swagger : `http://localhost:8000/docs`

## ⚙️ Configuration (Variables d'environnement)

| Variable | Description |
| :--- | :--- |
| `SECRET_KEY` | Clé secrète pour les JWT |
| `FIREBASE_PROJECT_ID` | ID du projet Firebase |
| `FIREBASE_STORAGE_BUCKET` | Bucket de stockage Firebase |
| `FIREBASE_CREDENTIALS_PATH` | Chemin vers le fichier JSON Firebase Admin |
| `FIREBASE_CREDENTIALS_JSON` | (Prod) Contenu JSON complet des identifiants Firebase |
| `ALLOWED_ORIGINS` | Liste des origines autorisées pour CORS |

## 🌐 Déploiement

Le backend est configuré pour un déploiement sur **Render** via le fichier `render.yaml`.
1.  Connectez votre repo à Render.
2.  Créez un nouveau "Blueprint Instance".
3.  Remplissez les variables d'environnement requises sur le dashboard Render.

## 📄 Licence
Propriété du Club GI - ENSPY.
