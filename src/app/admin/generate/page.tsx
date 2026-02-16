'use client';

import BulkGenerator from '@/components/admin/BulkGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GenerateBatchPage() {
    const router = useRouter();

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center font-black uppercase tracking-widest text-[10px] text-gray-400 hover:text-primary transition-colors group"
                            onClick={() => router.push('/admin')}
                        >
                            <LayoutDashboard className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform" />
                            Console
                        </button>
                        <span className="text-gray-200">/</span>
                        <span className="font-black uppercase tracking-widest text-[10px] text-primary">Génération en masse</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-poppins">
                        Batch <span className="text-secondary">Processing</span>
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">Gérez le déploiement massif des identités numériques GI.</p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="hover:bg-white/20 transition-all rounded-xl font-bold group"
                >
                    <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                    Retour
                </Button>
            </div>

            <div className="max-w-3xl">
                <BulkGenerator />
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12 animate-slide-up">
                <div className="bg-primary/5 border-2 border-primary/10 rounded-3xl p-8 space-y-4 shadow-soft">
                    <h3 className="text-xl font-black font-poppins text-primary">Consignes de sécurité</h3>
                    <ul className="space-y-4 text-sm font-medium text-primary/80">
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                            <span>Durée de traitement estimée à ~5 mins pour 100 membres.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                            <span>Maintenez cette fenêtre active pour garantir l'intégrité du flux.</span>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                            <span>Accès immédiat pour les membres sur leur interface privée.</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-accent/5 border-2 border-accent/10 rounded-3xl p-8 space-y-4 shadow-soft">
                    <h3 className="text-xl font-black font-poppins text-accent">Attention</h3>
                    <p className="text-sm font-medium text-accent/80 leading-relaxed italic">
                        "L'écrasement des données est irréversible. Toutes les versions graphiques précédentes seront remplacées par les nouveaux templates configurés."
                    </p>
                    <p className="text-xs font-black uppercase tracking-widest text-accent/60 opacity-60">
                         ⚠️ Vérifiez la configuration avant l'export
                    </p>
                </div>
            </div>
        </div>
    );
}
