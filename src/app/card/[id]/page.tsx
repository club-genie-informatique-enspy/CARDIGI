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
    <div className="min-h-screen gradient-mesh py-6 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full -ml-64 -mb-64" />

      <div className="container mx-auto max-w-4xl space-y-12 sm:space-y-16 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="hover:bg-white/20 transition-all rounded-xl font-bold group"
          >
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Button>
        </div>

        {/* Titre */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight font-poppins">
            ID <span className="text-secondary text-transparent bg-clip-text gradient-secondary">Digitale</span>
          </h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xl sm:text-2xl font-bold text-gray-700">
              {member.prenom} {member.nom}
            </p>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-lg shadow-soft text-xs font-black text-gray-500 uppercase tracking-widest border border-gray-100 italic">
                N° {member.numero_membre}
              </span>
              <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest shadow-soft ${member.statut === 'actif' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {member.statut}
              </span>
            </div>
          </div>
        </div>

        {/* Carte avec animation flip */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-[4rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <CardFlip
            member={member}
            qrData={qrData}
          />
        </div>

        {/* Boutons de téléchargement */}
        <div className="bg-white/30 backdrop-blur-md rounded-3xl p-2 border border-white/50 shadow-strong animate-slide-up">
          <DownloadButtons memberId={member.id} />
        </div>

        {/* Grid Info & Install */}
        <div className="grid md:grid-cols-2 gap-8 animate-slide-up">
          {/* Instructions PWA */}
          <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-dramatic p-10 space-y-6 border border-white/50 group hover-lift overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-soft group-hover:bg-primary/20 transition-all">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h2 className="text-2xl font-black font-poppins text-gray-900">
                Mode Off-line
              </h2>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed">
              Installez l'application **CARDIGI** pour accéder à votre identifiant même sans connexion internet.
            </p>
            <Button
              className="w-full h-14 gradient-primary rounded-2xl font-bold text-lg shadow-medium hover-lift transition-all"
              onClick={() => {
                // Trigger PWA install
                const event = new CustomEvent('pwa-install-requested');
                window.dispatchEvent(event);
              }}
            >
              Installer l'App
            </Button>
          </div>

          {/* Informations complémentaires */}
          <div className="gradient-primary rounded-[2.5rem] p-10 shadow-dramatic text-white space-y-6 relative overflow-hidden group hover-lift">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-2xl font-black font-poppins text-white flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-accent" />
              Consignes
            </h3>
            <ul className="space-y-4">
              <InfoItem icon="✓" text={`Valide jusqu'au ${formatDate(member.date_expiration)}`} />
              <InfoItem icon="✓" text="QR Code actualisé dynamiquement" />
              <InfoItem icon="✓" text="Format PNG & PDF disponibles" />
              <InfoItem icon="✓" text="Accès membre 24/7 garanti" />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, text }: { icon: string, text: string }) {
  return (
    <li className="flex items-start gap-3 group/item">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs group-hover/item:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-sm font-bold text-white/90 leading-tight pt-0.5">
        {text}
      </span>
    </li>
  );
}