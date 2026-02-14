/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileDown, Image as ImageIcon } from 'lucide-react';
import { apiClient, downloadCardImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function DownloadsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (side: 'recto' | 'verso') => {
    if (!user?.id) return;
    
    setDownloading(true);
    try {
      await downloadCardImage(user.id, side);
      toast({
        title: "Téléchargement réussi",
        description: `Carte ${side} téléchargée`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la carte",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Téléchargements
        </h1>
        <p className="text-gray-600">
          Téléchargez votre carte d'adhérent en différents formats
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* PNG Recto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Recto (PNG)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Image haute qualité du recto de votre carte (300 DPI)
            </p>
            <Button
              onClick={() => handleDownload('recto')}
              disabled={downloading}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger Recto
            </Button>
          </CardContent>
        </Card>

        {/* PNG Verso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Verso (PNG)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Image haute qualité du verso avec QR code (300 DPI)
            </p>
            <Button
              onClick={() => handleDownload('verso')}
              disabled={downloading}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger Verso
            </Button>
          </CardContent>
        </Card>

        {/* PDF Complet */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5" />
              PDF Complet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Document PDF contenant le recto et le verso (2 pages)
            </p>
            <Button
              onClick={() => {
                if (user?.id) {
                  window.location.href = `/card/${user.id}/download`;
                }
              }}
              disabled={downloading}
              className="w-full"
              size="lg"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Télécharger PDF Complet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}