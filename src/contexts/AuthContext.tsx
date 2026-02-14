/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// IMPORTS CENTRALISÉS
// ============================================

import { User, AuthResponse } from '../types/auth';
import { apiClient } from '@/lib/api'; // Import du client API centralisé

// ============================================
// TYPES DE CONTEXTE
// ============================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

// ============================================
// CRÉATION DU CONTEXTE
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ============================================
  // UTILITAIRES
  // ============================================

  /** Gère le token dans localStorage */
  const saveToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  };

  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  const removeToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  };

  /**
   * Corrige le format Base64URL du JWT en Base64 standard pour atob().
   */
  const decodeBase64Url = (base64Url: string): string => {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return base64;
  };

  /**
   * Vérifie si le token JWT est expiré
   */
  const isTokenExpired = (token: string): boolean => {
    try {
      const payloadString = token.split('.')[1];
      if (!payloadString) return true;

      const correctedPayload = decodeBase64Url(payloadString);

      const payload = JSON.parse(atob(correctedPayload));
      const exp = payload.exp * 1000;

      // Marge de sécurité de 1 minute pour éviter les expirations imminentes
      return Date.now() >= (exp - 60000);
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  };

  /**
   * Décode le token JWT et extrait le payload
   */
  const decodeToken = (token: string): any => {
    try {
      const payloadString = token.split('.')[1];
      if (!payloadString) return null;

      const correctedPayload = decodeBase64Url(payloadString);

      const payload = JSON.parse(atob(correctedPayload));
      return payload;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // ============================================
  // FONCTIONS D'AUTHENTIFICATION
  // ============================================

  /** Déconnexion de l'utilisateur */
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    router.push('/login');
  }, [router]);

  /**
   * Vérifie et charge l'utilisateur depuis le token
   */
  const verifyAndLoadUser = useCallback(async (token: string) => {
    try {
      // Vérifier si le token est expiré localement
      if (isTokenExpired(token)) {
        console.warn('Token expired');
        removeToken();
        setUser(null);
        return;
      }

      // Appel API pour vérifier le token et récupérer les données utilisateur
      const userData: User = await apiClient.verifyToken(token);
      setUser(userData);

    } catch (error) {
      console.error('Error verifying token:', error);
      removeToken();
      setUser(null);
    }
  }, []);

  /**
   * Connexion de l'utilisateur
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const data: AuthResponse = await apiClient.login(email, password);

      // Vérifier si la réponse contient une erreur (cas spécifique mock pour éviter overlay)
      if ((data as any).error) {
        setLoading(false);
        return { success: false, error: (data as any).error };
      }

      // Sauvegarder le token
      saveToken(data.access_token);

      // Définir l'utilisateur
      setUser(data.user);

      return { success: true };

    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Erreur de connexion';

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /** Rafraîchir les données utilisateur */
  const refreshUser = async () => {
    const token = getToken();
    if (token) {
      await verifyAndLoadUser(token);
    }
  };

  /** Mettre à jour les données utilisateur localement */
  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      return { ...prevUser, ...userData };
    });
  };

  // ============================================
  // EFFETS
  // ============================================

  /** Initialisation : Charge l'utilisateur depuis le token au démarrage */
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();

      if (token) {
        await verifyAndLoadUser(token);
      }

      setLoading(false);
    };

    initAuth();
  }, [verifyAndLoadUser]);

  /** Auto-refresh du token avant expiration */
  useEffect(() => {
    const token = getToken();
    if (!token || !user) return;

    const payload = decodeToken(token);
    if (!payload) return;

    const exp = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = exp - now;

    // Rafraîchir le token 5 minutes avant expiration
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000;

    if (refreshTime > 0) {
      const timer = setTimeout(async () => {
        console.log('Auto-refreshing token...');
        await refreshUser();
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, [user]);

  /** Gestion de la visibilité de l'onglet */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const token = getToken();
        if (token && isTokenExpired(token)) {
          console.warn('Token expired while tab was hidden');
          logout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [logout]);

  // ============================================
  // VALEURS DU CONTEXTE
  // ============================================

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  // ============================================
  // RENDU
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK PERSONNALISÉ
// ============================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// ============================================
// HOC POUR ROUTES PROTÉGÉES
// ============================================

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading || !isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

export function withAdmin<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AdminOnlyComponent(props: P) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push('/login');
        } else if (!isAdmin) {
          router.push('/dashboard');
        }
      }
    }, [isAuthenticated, isAdmin, loading, router]);

    if (loading || !isAuthenticated || !isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}