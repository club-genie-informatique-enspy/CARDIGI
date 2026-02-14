'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Play,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Download,
    Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

export default function BulkGenerator() {
    const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<{
        total: number;
        success: number;
        errors: number;
    } | null>(null);
    const { toast } = useToast();

    const startGeneration = async () => {
        setStatus('processing');
        setProgress(0);

        try {
            // Simulate fetching member IDs
            const data = await apiClient.getMembers({ limit: 50 });
            const memberIds = data.members.map(m => m.id);

            if (memberIds.length === 0) {
                throw new Error("Aucun membre trouvé pour la génération.");
            }

            // Simulate step-by-step progress
            const steps = memberIds.length;
            for (let i = 1; i <= steps; i++) {
                await new Promise(r => setTimeout(r, 100)); // Simulate work
                setProgress(Math.round((i / steps) * 100));
            }

            setResults({
                total: steps,
                success: steps,
                errors: 0
            });
            setStatus('completed');

            toast({
                title: "Génération terminée",
                description: `${steps} cartes ont été générées avec succès.`,
            });
        } catch (error: any) {
            console.error('Bulk generation error:', error);
            setStatus('error');
            toast({
                title: "Erreur",
                description: error.message || "Une erreur est survenue lors de la génération.",
                variant: "destructive"
            });
        }
    };

    const reset = () => {
        setStatus('idle');
        setProgress(0);
        setResults(null);
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Générateur de Cartes en Masse
                </CardTitle>
                <CardDescription>
                    Générez automatiquement les cartes numériques pour tous les membres actifs.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {status === 'idle' && (
                    <div className="text-center py-8 space-y-4">
                        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Play className="w-8 h-8 text-blue-600 ml-1" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600">
                                Prêt à lancer la génération pour les membres sélectionnés.
                            </p>
                            <Button onClick={startGeneration} size="lg" className="w-full md:w-auto">
                                Lancer la génération
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                Génération en cours...
                            </span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-gray-500 text-center">
                            Traitement des données et création des images haute résolution.
                        </p>
                    </div>
                )}

                {status === 'completed' && results && (
                    <div className="space-y-6 py-4">
                        <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-900">Traitement terminé</p>
                                <p className="text-sm text-green-700">
                                    {results.success} cartes générées sur {results.total}.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xl font-bold">{results.total}</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-xl font-bold text-green-600">{results.success}</p>
                                <p className="text-xs text-green-600">Succès</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <p className="text-xl font-bold text-red-600">{results.errors}</p>
                                <p className="text-xs text-red-600">Erreurs</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" onClick={reset} className="flex-1">
                                Nouveau traitement
                            </Button>
                            <Button className="flex-1 gap-2">
                                <Download className="w-4 h-4" />
                                Télécharger ZIP
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center py-8 space-y-4">
                        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-gray-600 font-semibold">Une erreur est survenue.</p>
                            <p className="text-sm text-gray-500">
                                La connexion au service de génération a été interrompue.
                            </p>
                            <Button onClick={startGeneration} variant="destructive">
                                Réessayer
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
