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
                    activeVerifications: verifData.total_verifications,
                    pendingValidation: 5
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tableau de Bord Admin</h1>
                    <p className="text-gray-600 mt-1">Gérez les membres et supervisez la génération des cartes.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => router.push('/admin/generate')} className="gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Générer Cartes
                    </Button>
                    <Button onClick={() => router.push('/admin/membres/new')} variant="secondary" className="gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200">
                        <PlusCircle className="w-4 h-4" />
                        Nouveau Membre
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Membres"
                    value={stats.totalMembers}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    trend="+12% ce mois"
                    color="blue"
                />
                <StatCard
                    title="Cartes Générées"
                    value={stats.generatedCards}
                    icon={<CreditCard className="w-6 h-6 text-green-600" />}
                    trend="94% du total"
                    color="green"
                />
                <StatCard
                    title="Vérifications"
                    value={stats.activeVerifications}
                    icon={<CheckCircle2 className="w-6 h-6 text-purple-600" />}
                    trend="En direct"
                    color="purple"
                />
                <StatCard
                    title="En Attente"
                    value={stats.pendingValidation}
                    icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
                    trend="Nouveaux inscrits"
                    color="orange"
                />
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Gestion des Membres</h2>
                    <ExportDialog />
                </div>

                <MemberTable />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color }: {
    title: string, value: number | string, icon: React.ReactNode, trend: string, color: string
}) {
    const colorMap: any = {
        blue: "bg-blue-50 border-blue-100",
        green: "bg-green-50 border-green-100",
        purple: "bg-purple-50 border-purple-100",
        orange: "bg-orange-50 border-orange-100",
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                        <h3 className="text-3xl font-bold">{value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${colorMap[color] || "bg-gray-50"}`}>
                        {icon}
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                    <span>{trend}</span>
                </div>
            </CardContent>
        </Card>
    );
}
