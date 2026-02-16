'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-poppins">
          Mon <span className="text-primary">Historique</span>
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Retrouvez ici vos vérifications de carte et vos activités récentes au sein du club.
        </p>
      </div>

      <Card className="border-none shadow-dramatic bg-white/95 backdrop-blur-md overflow-hidden animate-scale-in">
        <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
          <CardTitle className="flex items-center gap-4 text-2xl font-black font-poppins text-gray-900">
            <div className="p-3 bg-white rounded-2xl shadow-soft">
                <History className="w-6 h-6 text-primary" />
            </div>
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-12">
          <div className="text-center py-20 space-y-6">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto shadow-inner border border-gray-100">
                <History className="w-12 h-12 text-gray-200" />
            </div>
            <div className="space-y-2">
                <p className="text-xl font-bold text-gray-900">
                  Aucune activité pour le moment
                </p>
                <p className="text-gray-500 max-w-xs mx-auto font-medium">
                    Dès que votre carte sera scannée ou que vous participerez à un événement, l'historique s'affichera ici.
                </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}