'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiClient, downloadCardImage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Download, FileDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface DownloadButtonsProps {
  memberId: string;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({ memberId }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownloadPNG = async (side: 'recto' | 'verso') => {
    setDownloading(true);
    setDownloadType(side);

    try {
      await downloadCardImage(memberId, side);
      toast({
        title: "Téléchargement réussi",
        description: `Carte ${side} téléchargée avec succès`,
        variant: "default"
      });
    } catch (error: any) {
      console.error('Download error:', error);
      const isMissing = error.message?.includes('404') || error.message?.includes('non trouvée');
      toast({
        title: "Échec du téléchargement",
        description: isMissing
          ? "La carte n'est pas encore prête. Elle est en cours de génération automatique, réessayez dans quelques secondes ou contactez le club."
          : (error.message || "Une erreur est survenue lors du téléchargement."),
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
      setDownloadType(null);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    setDownloadType('pdf');

    try {
      // Télécharge recto + verso en parallèle
      const [rectoBlob, versoBlob] = await Promise.all([
        apiClient.downloadCard(memberId, 'recto'),
        apiClient.downloadCard(memberId, 'verso')
      ]);

      // Convertit blobs en base64
      const rectoBase64 = await blobToBase64(rectoBlob);
      const versoBase64 = await blobToBase64(versoBlob);

      // Crée PDF avec jsPDF (taille carte de crédit ISO)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98]
      });

      // Ajoute recto (page 1)
      pdf.addImage(rectoBase64, 'PNG', 0, 0, 85.6, 53.98);

      // Ajoute verso (page 2)
      pdf.addPage();
      pdf.addImage(versoBase64, 'PNG', 0, 0, 85.6, 53.98);

      // Télécharge le PDF
      pdf.save(`carte_complete_${memberId}.pdf`);

      toast({
        title: "PDF généré",
        description: "Carte complète téléchargée avec succès",
        variant: "default"
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      const isMissing = error.message?.includes('404') || error.message?.includes('non trouvée');
      toast({
        title: "Erreur de génération PDF",
        description: isMissing
          ? "Certaines parties de la carte ne sont pas prêtes. Nous les générons automatiquement, merci de réessayer dans quelques secondes."
          : (error.message || "Impossible de générer le PDF"),
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
      setDownloadType(null);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button
        onClick={() => handleDownloadPNG('recto')}
        disabled={downloading}
        variant="outline"
        size="lg"
        className="flex items-center gap-2"
      >
        {downloading && downloadType === 'recto' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        Télécharger Recto (PNG)
      </Button>

      <Button
        onClick={() => handleDownloadPNG('verso')}
        disabled={downloading}
        variant="outline"
        size="lg"
        className="flex items-center gap-2"
      >
        {downloading && downloadType === 'verso' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        Télécharger Verso (PNG)
      </Button>

      <Button
        onClick={handleDownloadPDF}
        disabled={downloading}
        size="lg"
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        {downloading && downloadType === 'pdf' ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <FileDown className="w-5 h-5" />
        )}
        Télécharger PDF Complet
      </Button>
    </div>
  );
};
