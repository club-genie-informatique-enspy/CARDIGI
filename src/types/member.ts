// types/member.ts

/**
 * Statut d'un membre au sein de l'organisation.
 */
export enum MemberStatus {
  ACTIF = 'actif',
  INACTIF = 'inactif',
  SUSPENDU = 'suspendu'
}

/**
 * Filières d'études disponibles.
 */
export enum Filiere {
  GENIE_INFORMATIQUE = 'Génie Informatique',
  GENIE_CIVIL = 'Génie Civil',
  GENIE_ELECTRIQUE = 'Génie Électrique',
  GENIE_MECANIQUE = 'Génie Mécanique',
  MSP = 'MSP',
  AN = 'Arts Numérique',
  HN = 'Humanités Numériques',
  IFA = 'Finances et Actuariats',
  GENIE_TELECOM = 'Génie des Télécommunications'
}

/**
 * Niveaux d'études (Licence et Master).
 */
export enum Niveau {
  L1 = 'L1',
  MSP1 = 'MSP1',
  L2 = 'L2',
  MSP2 = 'MSP2',
  L3 = 'L3',
  M1 = 'M1',
  M2 = 'M2'
}

/**
 * Cellules (ou départements) internes de l'organisation.
 */
export enum Cellule {
  PROJET = 'Projet',
  COMMUNICATION = 'Communication',
  FORMATION = 'Formation',
  EVENEMENTIEL = 'Événementiel',
  FINANCE = 'Finance',
  COMPETITION = 'Compétition',
  RELATION_EXTERNE = 'Relation Externe'

}

/**
 * Interface représentant les données complètes d'un membre.
 */
export interface Member {
  id: string;
  numero_membre: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  // Utilisation de l'énumération ou d'une chaîne pour la flexibilité (si l'API utilise des chaînes)
  filiere: Filiere | string;
  niveau: Niveau | string;
  cellule?: Cellule | string; // Optionnel
  date_adhesion: string; // Format ISO 8601 (e.g., "YYYY-MM-DD")
  date_expiration: string; // Format ISO 8601
  statut: MemberStatus | string;
  photo_url?: string; // Optionnel
  created_at: string; // Horodatage de création
  updated_at: string; // Horodatage de dernière mise à jour
}

/**
 * Interface représentant les métadonnées d'une carte de membre (physique ou numérique).
 */
export interface CardMetadata {
  id: string;
  member_id: string;
  recto_url: string;
  verso_url: string;
  qr_token: string;
  qr_expires_at: string; // Date d'expiration du token QR
  generated_at: string;
  download_count: number;
  last_downloaded_at?: string; // Optionnel
  verification_count: number;
  last_verified_at?: string; // Optionnel
  is_active: boolean;
}

/**
 * Interface représentant le résultat d'une vérification de carte (via QR code ou numéro).
 */
export interface VerificationResult {
  valid: boolean; // État global de la vérification
  member?: Member; // Données du membre si la vérification est réussie
  card?: { // Métadonnées de la carte pertinente
    generated_at: string;
    qr_expires_at: string;
  };
  verified_at: string; // Horodatage de la vérification
  reason?: string; // Raison de l'échec (si 'valid' est false)
  message?: string; // Message utilisateur/API supplémentaire
}

/**
 * Données requises pour l'inscription d'un nouveau membre.
 */
export interface MemberRegistration {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  filiere: Filiere | string;
  niveau: Niveau | string;
  password: string;
}

/**
 * Données autorisées pour la mise à jour du profil par le membre lui-même.
 */
export interface MemberUpdate {
  nom?: string;
  prenom?: string;
  telephone?: string;
  photo_url?: string;
  filiere?: Filiere | string;
  cellule?: Cellule | string;
  niveau?: Niveau | string;
}