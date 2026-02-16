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
        <Card className="border-none shadow-dramatic bg-white/95 backdrop-blur-md overflow-hidden animate-scale-in">
            <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                <CardTitle className="flex items-center gap-4 text-3xl font-black font-poppins text-gray-901 tracking-tight">
                    <div className="p-3 bg-white shadow-soft rounded-2xl">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    Générateur Digital
                </CardTitle>
                <CardDescription className="text-gray-500 font-medium">
                    Déclenchez la génération massive des identifiants visuels pour tous les membres actifs du club.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {status === 'idle' && (
                    <div className="text-center py-12 space-y-8">
                        <div className="gradient-primary w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-strong animate-pulse-slow">
                            <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                        <div className="space-y-6">
                            <p className="text-xl font-bold text-gray-900">
                                Prêt pour l'exécution groupée
                            </p>
                            <Button onClick={startGeneration} className="gradient-primary h-14 px-12 text-lg font-bold shadow-medium hover-lift rounded-2xl transition-all">
                                Lancer la procédure
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'processing' && (
                    <div className="space-y-8 py-8 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/5 rounded-xl">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                                <span className="text-xl font-black font-poppins text-gray-900">Traitement en cours</span>
                            </div>
                            <span className="text-2xl font-black text-primary font-poppins">{progress}%</span>
                        </div>
                        <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-50">
                            <div
                                className="absolute top-0 left-0 h-full gradient-primary transition-all duration-300 shadow-strong"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-500 font-medium text-center italic">
                            Encodage des données et compilation des assets graphiques optimisés...
                        </p>
                    </div>
                )}

                {status === 'completed' && results && (
                    <div className="space-y-10 py-6 animate-slide-up">
                        <div className="bg-success/5 border-2 border-success/10 rounded-3xl p-8 flex items-center gap-6 shadow-soft">
                            <div className="p-4 bg-white rounded-2xl shadow-strong">
                                <CheckCircle2 className="w-8 h-8 text-success" />
                            </div>
                            <div>
                                <p className="text-2xl font-black font-poppins text-gray-900">Génération Validée</p>
                                <p className="text-lg font-medium text-success/80">
                                    {results.success} cartes prêtes à l'emploi.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <ResultStat label="Total" value={results.total} color="gray" />
                            <ResultStat label="Succès" value={results.success} color="green" />
                            <ResultStat label="Erreurs" value={results.errors} color="red" />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 pt-4">
                            <Button
                                variant="outline"
                                onClick={reset}
                                className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-gray-100 hover:bg-gray-50 transition-all"
                            >
                                Recommencer
                            </Button>
                            <Button className="flex-1 h-14 gradient-secondary rounded-2xl font-bold text-lg shadow-medium hover-lift transition-all gap-3">
                                <Download className="w-5 h-5" />
                                Télécharger le pack ZIP
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center py-12 space-y-8 animate-shake">
                        <div className="bg-error/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-soft">
                            <AlertCircle className="w-10 h-10 text-error" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-2xl font-black font-poppins text-gray-900">Oups ! Une interruption.</p>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                La connexion au service de génération a été compromise. Veuillez vérifier les logs serveur.
                            </p>
                            <Button onClick={startGeneration} variant="destructive" className="h-14 px-12 rounded-2xl font-bold text-lg hover-lift shadow-medium">
                                Rententer le process
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ResultStat({ label, value, color }: { label: string, value: number, color: 'gray' | 'green' | 'red' }) {
    const colorStyles = {
        gray: "bg-gray-50 text-gray-900",
        green: "bg-success/5 text-success",
        red: "bg-error/5 text-error"
    };

    return (
        <div className={`p-6 rounded-3xl shadow-soft flex flex-col items-center justify-center space-y-2 border border-gray-50 ${colorStyles[color]}`}>
            <p className="text-3xl font-black font-poppins tracking-tighter">{value}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
        </div>
    );
}
