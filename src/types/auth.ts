// types/auth.ts

/**
 * Interface représentant les données de l'utilisateur authentifié.
 */
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  numero_membre?: string; // Optionnel
  photo_url?: string;     // Optionnel
  role: 'member' | 'admin'; // Le rôle est essentiel pour la gestion des accès
  filiere?: string;
  niveau?: string;
  telephone?: string;
  cellule?: string;
  date_adhesion?: string;
  date_expiration?: string;
  statut?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface représentant la réponse de l'API lors d'une connexion réussie (login).
 */
export interface AuthResponse {
  access_token: string;
  token_type: string; // Devrait généralement être "bearer"
  user: User;
}

