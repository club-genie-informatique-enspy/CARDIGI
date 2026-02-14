/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  Member,
  CardMetadata,
  VerificationResult,
  MemberRegistration,
  MemberUpdate
} from '@/types/member';
import type { AuthResponse } from '@/types/auth';

// =========================================================================
// API CLIENT
// =========================================================================

class APIClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 60000, // Augmenté à 60s pour la génération de cartes
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.cache = new Map();

    // Intercepteur request: ajout du token JWT
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur response: gestion des erreurs
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          this.clearAuthToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        // Pour les autres erreurs, on propage l'erreur gérée
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Détermine si l'erreur est due à un problème réseau (indisponibilité)
   */
  private isNetworkError(error: AxiosError): boolean {
    // Erreur sans réponse (timeout, pas de connexion, DNS failure, etc.)
    return (
      !error.response && (
        error.code === 'ECONNABORTED' || // Timeout
        error.code === 'ECONNREFUSED' ||
        error.message === 'Network Error' ||
        error.request // La requête a été faite mais aucune réponse reçue
      )
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Erreur serveur (4xx, 5xx)
      let message = (error.response.data as any)?.detail || error.message;

      // Si detail est un objet (ex: erreurs de validation FastAPI), on le stringifie proprement
      if (typeof message === 'object' && message !== null) {
        message = JSON.stringify(message);
      }

      return new Error(message);
    } else if (this.isNetworkError(error)) {
      // Erreur réseau détectée (pas de réponse du serveur)
      return new Error('NETWORK_UNAVAILABLE');
    } else {
      // Autres erreurs (ex: configuration Axios)
      return new Error(error.message);
    }
  }

  // --- Cache methods (getCacheKey, getFromCache, setCache, invalidateCache) ---

  private getCacheKey(url: string, params?: any): string {
    return `${url}${params ? JSON.stringify(params) : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private invalidateCache(): void {
    this.cache.clear();
  }


  // ============================================
  // 1. AUTHENTIFICATION
  // ============================================

  async login(email: string, password: string): Promise<AuthResponse> {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await this.client.post('/api/v1/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data as AuthResponse;
  }

  async verifyToken(token: string): Promise<any> {
    const response = await this.client.get('/api/v1/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async register(data: MemberRegistration): Promise<AuthResponse> {
    const response = await this.client.post('/api/v1/auth/register', data);
    return response.data as AuthResponse;
  }

  // ============================================
  // 2. MEMBRES
  // ============================================

  async getMember(memberId: string, useCache = true): Promise<Member> {
    const cacheKey = this.getCacheKey(`/api/v1/members/${memberId}`);

    if (useCache) {
      const cached = this.getFromCache<Member>(cacheKey);
      if (cached) return cached;
    }

    const response = await this.client.get(`/api/v1/members/${memberId}`);
    this.setCache(cacheKey, response.data);
    return response.data;
  }

  async getMembers(params?: {
    limit?: number;
    offset?: number;
    filiere?: string;
    niveau?: string;
    statut?: string;
  }): Promise<{ total: number; members: Member[] }> {
    const response = await this.client.get('/api/v1/members/', { params });
    return response.data;
  }

  async updateProfile(data: MemberUpdate): Promise<Member> {
    const response = await this.client.put('/api/v1/members/me', data);
    return response.data as Member;
  }

  async uploadPhoto(file: File): Promise<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post('/api/v1/members/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // ============================================
  // 3. CARTES
  // ============================================

  async generateCard(memberId: string, regenerate = false): Promise<{
    success: boolean;
    card_id: string;
    recto_url: string;
    verso_url: string;
    qr_token: string;
  }> {
    const response = await this.client.post(
      `/api/v1/cards/generate/${memberId}`,
      {},
      { params: { regenerate } }
    );
    this.invalidateCache();
    return response.data;
  }

  async getCardMetadata(memberId: string): Promise<CardMetadata> {
    const response = await this.client.get(`/api/v1/cards/${memberId}`);
    return response.data;
  }

  async downloadCard(memberId: string, side: 'recto' | 'verso'): Promise<Blob> {
    const response = await this.client.get(
      `/api/v1/cards/download/${memberId}/${side}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async generateBulkCards(memberIds: string[]): Promise<{
    success: boolean;
    task_id: string;
    count: number;
  }> {
    const response = await this.client.post('/api/v1/cards/generate/bulk', {
      member_ids: memberIds
    });
    return response.data;
  }

  async getBulkGenerationStatus(taskId: string): Promise<{
    task_id: string;
    status: string;
    total_count: number;
    processed_count: number;
    success_count: number;
    error_count: number;
    progress_percent: number;
    zip_url: string | null;
    errors: any[];
  }> {
    const response = await this.client.get(`/api/v1/cards/bulk/${taskId}`);
    return response.data;
  }

  // ============================================
  // 4. VÉRIFICATION
  // ============================================

  async verifyQRCode(token: string): Promise<VerificationResult> {
    const response = await this.client.get(`/api/v1/verify/${token}`);
    return response.data;
  }

  async verifyByNumero(numeroMembre: string): Promise<VerificationResult> {
    const response = await this.client.post('/api/v1/verify/validate', {
      numero_membre: numeroMembre
    });
    return response.data;
  }

  // ============================================
  // 5. STATISTIQUES
  // ============================================

  async getOverviewStats(period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<any> {
    const response = await this.client.get('/api/v1/stats/overview', {
      params: { period }
    });
    return response.data;
  }

  async getCardStats(): Promise<any> {
    const response = await this.client.get('/api/v1/stats/cards');
    return response.data;
  }

  async getVerificationStats(): Promise<any> {
    const response = await this.client.get('/api/v1/stats/verifications');
    return response.data;
  }
}

export const apiClient = new APIClient();

// ============================================
// HELPER POUR TÉLÉCHARGEMENT
// ============================================

export async function downloadCardImage(memberId: string, side: 'recto' | 'verso'): Promise<void> {
  try {
    const blob = await apiClient.downloadCard(memberId, side);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carte_${side}_${memberId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}