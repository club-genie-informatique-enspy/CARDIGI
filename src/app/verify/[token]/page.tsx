'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  CreditCard,
  User,
  Mail
} from 'lucide-react';
import type { VerificationResult } from '@/types/member';

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const manualNumero = searchParams.get('numero');

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyCard();
  }, [token]);

  const verifyCard = async () => {
    try {
      setLoading(true);
      setError(null);

      let verificationResult;
      if (token === 'manual' && manualNumero) {
        verificationResult = await apiClient.verifyByNumero(manualNumero);
      } else {
        verificationResult = await apiClient.verifyQRCode(token);
      }
      setResult(verificationResult);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              <p className="text-lg text-gray-600">Vérification en cours...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Impossible de vérifier le QR code'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Carte valide
  if (result.valid && result.member) {
    const { member, card } = result;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          {/* Status valide */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-900">
                  Carte Valide
                </h1>
                <p className="text-green-700">
                  Ce membre est actif et vérifié
                </p>
              </div>
            </div>
          </div>

          {/* Informations membre */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations du Membre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo et nom */}
              <div className="flex items-center gap-4">
                {member.photo_url ? (
                  <div className="w-20 h-20 relative rounded-full overflow-hidden border-2 border-blue-500">
                    <Image
                      src={member.photo_url}
                      alt={member.nom}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-blue-500">
                    <span className="text-white text-2xl font-bold">
                      {member.prenom[0]}{member.nom[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {member.prenom} {member.nom.toUpperCase()}
                  </h2>
                  <p className="text-gray-600">
                    {member.numero_membre}
                  </p>
                </div>
              </div>

              {/* Détails */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="font-semibold text-gray-900">{member.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Filière
                  </p>
                  <p className="font-semibold text-gray-900">{member.filiere}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Niveau</p>
                  <p className="font-semibold text-gray-900">{member.niveau}</p>
                </div>

                {member.cellule && (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Cellule</p>
                    <p className="font-semibold text-gray-900">{member.cellule}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Membre depuis
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(member.date_adhesion).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Statut</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {member.statut.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info carte */}
              {card && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Carte générée le:</strong>{' '}
                    {new Date(card.generated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-blue-900 mt-1">
                    <strong>QR Code valide jusqu'au:</strong>{' '}
                    {new Date(card.qr_expires_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamp vérification */}
          <p className="text-center text-sm text-gray-500">
            Vérifié le {new Date(result.verified_at).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>
    );
  }

  // Carte invalide
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Status invalide */}
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-red-900">
                Carte Invalide
              </h1>
              <p className="text-red-700">
                {result.message || 'Cette carte ne peut pas être vérifiée'}
              </p>
            </div>
          </div>
        </div>

        {/* Raison */}
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Raison: </strong>
                {result.reason === 'token_expired' && 'Le QR code a expiré (> 24h). Demandez au membre de régénérer sa carte.'}
                {result.reason === 'token_invalid' && 'Le QR code est invalide ou a été altéré.'}
                {result.reason === 'member_inactive' && 'Le membre n\'est plus actif.'}
                {result.reason === 'card_invalidated' && 'Cette carte a été invalidée par un administrateur.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Button
          onClick={() => window.location.href = '/'}
          className="w-full"
        >
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
