/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Search } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import QRScanner to avoid SSR issues
const QRScanner = dynamic(() => import('@/components/QRScanner'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" />
});

export default function VerifyPage() {
  const router = useRouter();
  const [numeroMembre, setNumeroMembre] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleVerify = () => {
    if (numeroMembre.trim()) {
      router.push(`/verify/manual?numero=${numeroMembre}`);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    // Extract token from URL or use directly
    const token = decodedText.includes('/verify/')
      ? decodedText.split('/verify/').pop()
      : decodedText;

    if (token) {
      router.push(`/verify/${token}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vérifier une Carte
        </h1>
        <p className="text-gray-600">
          Scannez un QR code ou entrez un numéro de membre
        </p>
      </div>

      {/* Scanner QR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Scanner QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Utilisez l'appareil photo de votre appareil pour scanner le QR code
            au verso de la carte d'adhérent.
          </p>

          {!showScanner ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <Button onClick={() => setShowScanner(true)}>
                Activer la caméra
              </Button>
            </div>
          ) : (
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(error) => console.error('Scan error:', error)}
            />
          )}
        </CardContent>
      </Card>

      {/* Vérification manuelle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Vérification Manuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Numéro de Membre
            </label>
            <Input
              placeholder="CGI-2025-001"
              value={numeroMembre}
              onChange={(e) => setNumeroMembre(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
            />
          </div>
          <Button
            onClick={handleVerify}
            disabled={!numeroMembre.trim()}
            className="w-full"
          >
            Vérifier
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

