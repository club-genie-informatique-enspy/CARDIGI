'use client';

import { useState, useEffect } from 'react';
import MemberTable from '@/components/admin/MemberTable';
import ExportDialog from '@/components/admin/ExportDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    PlusCircle,
    Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalMembers: 0,
        generatedCards: 0,
        activeVerifications: 0,
        pendingValidation: 0
    });

    useEffect(() => {
        // Simulate fetching stats
        const fetchStats = async () => {
            try {
                const memData = await apiClient.getMembers();
                const verifData = await apiClient.getVerificationStats();

                setStats({
                    totalMembers: memData.total,
                    generatedCards: 142, // Mocked
                    activeVerifications: verifData.total_scans,
                    pendingValidation: 5
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-poppins">
                        Console <span className="text-secondary text-transparent bg-clip-text gradient-secondary">Admin</span>
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-lg">Supervisez la communauté GI et gérez les adhésions digitales en temps réel.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button
                        onClick={() => router.push('/admin/generate')}
                        className="gradient-primary h-14 px-8 text-lg font-bold shadow-medium hover-lift rounded-2xl"
                    >
                        <CreditCard className="w-5 h-5 mr-3" />
                        Générer Cartes
                    </Button>
                    <Button
                        onClick={() => router.push('/admin/membres/new')}
                        variant="secondary"
                        className="h-14 px-8 text-lg font-bold bg-white text-gray-900 border-2 border-gray-100 shadow-soft hover-lift rounded-2xl transition-all"
                    >
                        <PlusCircle className="w-5 h-5 mr-3 text-primary" />
                        Nouveau Membre
                    </Button>
                    <Button
                        variant="outline"
                        className="h-14 w-14 p-0 border-2 border-gray-100 rounded-2xl hover:bg-white hover-lift transition-all"
                    >
                        <Settings className="w-6 h-6 text-gray-400" />
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="Total Membres"
                    value={stats.totalMembers}
                    icon={<Users className="w-6 h-6" />}
                    trend="+12% ce mois"
                    color="blue"
                />
                <StatCard
                    title="Cartes Générées"
                    value={stats.generatedCards}
                    icon={<CreditCard className="w-6 h-6" />}
                    trend="94% du total"
                    color="green"
                />
                <StatCard
                    title="Vérifications"
                    value={stats.activeVerifications}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    trend="Flux en direct"
                    color="purple"
                />
                <StatCard
                    title="En Attente"
                    value={stats.pendingValidation}
                    icon={<AlertCircle className="w-6 h-6" />}
                    trend="Validation requise"
                    color="orange"
                />
            </div>

            {/* Main Content Area */}
            <div className="space-y-8 pt-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-gray-900 font-poppins tracking-tight">Liste des Membres</h2>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-[0.2em]">Management & Rapports</p>
                    </div>
                    <ExportDialog />
                </div>

                <div className="bg-white/50 backdrop-blur-sm rounded-3xl shadow-medium border border-gray-100 p-2 overflow-hidden">
                    <MemberTable />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color }: {
    title: string, value: number | string, icon: React.ReactNode, trend: string, color: string
}) {
    const colorMap: any = {
        blue: "bg-primary/5 text-primary",
        green: "bg-success/5 text-success",
        purple: "bg-secondary/5 text-secondary",
        orange: "bg-accent/5 text-accent",
    };

    return (
        <Card className="border-none shadow-medium hover-lift overflow-hidden bg-white/70 group">
            <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {title}
                        </p>
                        <h3 className="text-4xl font-black font-poppins text-gray-900 tracking-tight">{value}</h3>
                    </div>
                    <div className={cn("p-4 rounded-2xl shadow-soft transition-all duration-300 group-hover:scale-110", colorMap[color] || "bg-gray-50")}>
                        {icon}
                    </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <TrendingUp className="w-3 h-3 mr-2 text-success" />
                        <span>{trend}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                </div>
            </CardContent>
        </Card>
    );
}
