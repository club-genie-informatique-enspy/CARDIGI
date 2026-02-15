/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { CardFlip } from '@/components/cards/CardFlip';
import { DownloadButtons } from '@/components/cards/DownloadButons';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import type { Member } from '@/types/member';
import { useAuth } from '@/contexts/AuthContext';

export default function CardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // NOTE: Utilisez le nom exact du dossier dynamique de votre route (ex: [id] ou [memberId])
  const memberId = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction de chargement mise en useCallback pour la dépendance de l'effet
  const loadCard = useCallback(async () => {
    // S'assurer que memberId existe avant l'appel API
    if (!memberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading card for member ID:', memberId);
      const memberData = await apiClient.getMember(memberId);
      setMember(memberData);
    } catch (err: any) {
      console.error('Error loading card:', err);
      // Gérer l'erreur 404 plus spécifiquement pour un meilleur feedback
      const errorMessage = err.message === 'Membre non trouvé (Mock: 404)'
        ? "Ce membre n'existe pas ou la carte a été retirée."
        : (err.message || 'Impossible de charger la carte');

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [memberId]); // Dépendance à memberId

  useEffect(() => {
    loadCard();
  }, [loadCard]); // Dépendance à loadCard (qui dépend de memberId)


  // Fonction utilitaire pour le formatage sécurisé des dates
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }
      return date.toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };


  // Gestion intelligente du bouton "Retour"
  const handleBack = () => {
    // Si on vient d'une autre page de notre app, router.back() est bien
    // Mais si on est arrivé direct par URL, on veut une fallback sûre
    if (window.history.length > 2) {
      router.back();
    } else {
      // Fallback: Dashboard pour les membres, Admin pour les admins
      router.push(member?.id === user?.id ? '/dashboard' : '/admin');
    }
  };

  // ==================== RENDERING ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="flex justify-center">
            <Skeleton className="h-[250px] w-full max-w-sm rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de Chargement</AlertTitle>
            <AlertDescription>
              {error || 'Une erreur inconnue est survenue.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // NOTE: Le qrData ne doit pas utiliser l'ID du membre mais le QR_TOKEN de la CARTE pour la vérification !
  // Si vous n'avez que l'ID ici, le système de vérification de l'API doit être capable de gérer l'ID.
  // Si l'API attend un token, vous devrez faire un appel supplémentaire à apiClient.getCardMetadata()
  // pour récupérer le qr_token et l'intégrer ici.
  const qrData = `${process.env.NEXT_PUBLIC_API_URL}/verify/${memberId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-6 sm:py-12 px-2 sm:px-4">
      <div className="container mx-auto max-w-4xl space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Titre */}
        <div className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
            Carte d'Adhérent
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            {member.prenom} {member.nom}
          </p>
          <p className="text-sm sm:text-base text-gray-500">
            N° {member.numero_membre} - Statut : <span className={`font-semibold ${member.statut === 'actif' ? 'text-green-600' : 'text-red-600'}`}>{member.statut.toUpperCase()}</span>
          </p>
        </div>

        {/* Carte avec animation flip */}
        <CardFlip
          member={member}
          qrData={qrData}
        />

        {/* Boutons de téléchargement */}
        <DownloadButtons memberId={member.id} />

        {/* Instructions PWA */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            Installer l'application
          </h2>
          <p className="text-gray-600">
            Installez **CARDIGI** sur votre téléphone pour accéder à votre carte
            hors ligne et recevoir des notifications.
          </p>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              // Trigger PWA install
              const event = new CustomEvent('pwa-install-requested');
              window.dispatchEvent(event);
            }}
          >
            Installer maintenant
          </Button>
        </div>

        {/* Informations complémentaires */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            ℹ️ Informations
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Votre carte est valide jusqu'au **{formatDate(member.date_expiration)}**</li>
            <li>✓ Le QR code se renouvelle automatiquement toutes les 24h pour plus de sécurité</li>
            <li>✓ Vous pouvez télécharger votre carte en PNG ou PDF</li>
            <li>✓ La carte fonctionne hors ligne une fois téléchargée</li>
          </ul>
        </div>
      </div>
    </div>
  );
}