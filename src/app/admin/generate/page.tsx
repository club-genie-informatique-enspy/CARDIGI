'use client';

import BulkGenerator from '@/components/admin/BulkGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GenerateBatchPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Button
                            variant="link"
                            className="p-0 h-auto text-gray-500"
                            onClick={() => router.push('/admin')}
                        >
                            <LayoutDashboard className="w-4 h-4 mr-1" />
                            Tableau de bord
                        </Button>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Génération en masse</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Batch Processing</h1>
                    <p className="text-gray-600">Générer les cartes numériques pour l'ensemble des adhérents du club.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour
                </Button>
            </div>

            <div className="max-w-3xl">
                <BulkGenerator />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-2">Instructions</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-blue-800">
                        <li>Le processus peut prendre quelques minutes selon le nombre d'adhérents.</li>
                        <li>Ne fermez pas cette page pendant le traitement.</li>
                        <li>Une fois terminé, vous pourrez télécharger un fichier ZIP contenant toutes les cartes.</li>
                        <li>Les membres recevront leur carte automatiquement sur leur dashboard.</li>
                    </ul>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
                    <h3 className="font-bold text-amber-900 mb-2">Avertissement</h3>
                    <p className="text-sm text-amber-800">
                        La génération de cartes écrase les versions précédentes si elles existent.
                        Il est recommandé de faire un export des données avant de lancer une génération totale.
                    </p>
                </div>
            </div>
        </div>
    );
}
