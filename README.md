# CARDIGI - Frontend

Interface utilisateur pour l'application CARDIGI (Génération et gestion de cartes de membre numériques).

## 🚀 Technologies

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS / Radix UI
- **Gestion d'état**: Zustand
- **Client API**: Axios

## 🛠️ Installation et Démarrage

1.  **Cloner le repository**
2.  **Installer les dépendances** :
    ```bash
    npm install
    ```
3.  **Configurer les variables d'environnement** :
    Créez un fichier `.env.local` basé sur `.env.local.example` :
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    NEXT_PUBLIC_FORCE_MOCK_ON_ERROR=false
    ```
4.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:3000`.

## 📦 Build de Production

```bash
npm run build
npm start
```

## 🌐 Déploiement

Ce projet est prêt à être déployé sur **Vercel**.
- Connectez votre repo à Vercel.
- Définissez `cardigi-frontend` comme "Root Directory".
- Ajoutez la variable `NEXT_PUBLIC_API_URL` pointant vers votre backend.

## 📄 Licence
Propriété du Club GI - ENSPY.
