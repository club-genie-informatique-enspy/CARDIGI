/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Member, CardMetadata } from '@/types/member';
import type { User } from '@/types/auth';

export default function DashboardPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  // Render different dashboards based on role
  return isAdmin ? <AdminDashboard /> : <MemberDashboard user={user} />;
}

// ============================================
// DASHBOARD MEMBRE
// ============================================
function MemberDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [cardMetadata, setCardMetadata] = useState<CardMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCardData();
  }, [user.id]);

  const loadCardData = async () => {
    try {
      const data = await apiClient.getCardMetadata(user.id);
      setCardMetadata(data);
    } catch (err) {
      console.error('Error loading card:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="animate-fade-in mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-poppins">
          Bienvenue, <span className="text-primary">{user.prenom}</span> !
        </h1>
        <p className="text-lg text-gray-500 mt-2 font-medium">
          Gérez votre adhésion digitale en toute simplicité.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <Card className="border-none shadow-medium hover-lift bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Statut</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{user.statut || 'Actif'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-medium hover-lift bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-success/10 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Numéro</p>
                <p className="text-2xl font-bold text-gray-900">{user.numero_membre || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-medium hover-lift bg-white/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-secondary/10 rounded-2xl">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Filière</p>
                <p className="text-xl font-bold text-gray-900">{user.filiere || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        {/* Card Status */}
        <Card className="border-none shadow-dramatic bg-white/95 overflow-hidden group">
          <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
            <CardTitle className="flex items-center gap-3 text-2xl font-black font-poppins text-gray-900">
              <CreditCard className="w-6 h-6 text-primary" />
              Ma Carte Digitale
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {loading ? (
              <Skeleton className="h-40 rounded-2xl" />
            ) : cardMetadata ? (
              <>
                <div className="flex items-center gap-3 text-success p-4 bg-success/5 rounded-2xl">
                  <div className="p-2 bg-success/20 rounded-full">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-lg font-bold">Adhésion à jour</span>
                    <p className="text-xs opacity-80 uppercase font-bold tracking-wider">Validée par le club</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 font-medium">
                    Date d'expiration :
                    <span className="block text-lg font-bold text-gray-900 mt-1">
                      {user.date_expiration ? new Date(user.date_expiration).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Non définie'}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button
                    onClick={() => router.push(`/card/${user.id}`)}
                    className="flex-1 gradient-primary h-14 text-lg font-bold shadow-medium hover-lift rounded-2xl"
                  >
                    <Eye className="w-5 h-5 mr-3" />
                    Utiliser ma carte
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/card/${user.id}`)}
                    className="h-14 px-8 border-2 border-gray-100 hover:border-primary hover:text-primary font-bold rounded-2xl transition-all"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-10 h-10 text-orange-500" />
                </div>
                <div className="space-y-2">
                  <span className="text-xl font-bold text-gray-900 block">Carte indisponible</span>
                  <p className="text-gray-500 max-w-xs mx-auto">
                    Votre carte n'a pas encore été validée. Contactez le bureau du Club GI pour finaliser votre adhésion.
                  </p>
                </div>
                <Button variant="outline" className="mt-4 rounded-xl border-2">En savoir plus</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile */}
        <Card className="border-none shadow-medium bg-white/70 backdrop-blur-sm">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="text-2xl font-black font-poppins text-gray-900">Mon Profil</CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email</p>
                <p className="font-bold text-gray-900 truncate">{user.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Niveau</p>
                <p className="font-bold text-gray-900">{user.niveau || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Cellule</p>
                <p className="font-bold text-gray-900">{user.cellule || 'Standard'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Membre depuis</p>
                <p className="font-bold text-gray-900">2024</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-bold border-2 hover:bg-gray-50"
                onClick={() => router.push('/dashboard/profile')}
              >
                Modifier mes informations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Besoin d'aide ? Consultez la section{' '}
          <button
            onClick={() => router.push('/dashboard/support')}
            className="font-medium underline"
          >
            Aide & Support
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// ============================================
// DASHBOARD ADMIN
// ============================================
function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    generatedCards: 0,
    verifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const membersData = await apiClient.getMembers();
      const verifData = await apiClient.getVerificationStats();

      setStats({
        totalMembers: membersData.total,
        activeMembers: membersData.members.filter((m: any) => m.statut === 'actif').length,
        generatedCards: membersData.total, // Mock
        verifications: verifData.total_verifications,
      });
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-poppins">
            Console <span className="text-secondary">Admin</span>
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Gérez la communauté et supervisez les adhésions.
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin')}
          className="gradient-primary h-14 px-8 text-lg font-bold shadow-medium hover-lift rounded-2xl"
        >
          <Shield className="w-6 h-6 mr-3" />
          Ouvrir le panneau
        </Button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title="Total Membres"
            value={stats.totalMembers}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="blue"
          />
          <StatCard
            title="Membres Actifs"
            value={stats.activeMembers}
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            color="green"
          />
          <StatCard
            title="Cartes Générées"
            value={stats.generatedCards}
            icon={<CreditCard className="w-6 h-6 text-purple-600" />}
            color="purple"
          />
          <StatCard
            title="Vérifications"
            value={stats.verifications}
            icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
            color="orange"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <ActionCard
          title="Membres"
          desc="Gérez la liste complète des membres et leurs statuts."
          icon={<Users className="w-8 h-8 text-primary" />}
          onClick={() => router.push('/admin')}
        />
        <ActionCard
          title="Production"
          desc="Générez et validez les cartes d'adhérent numériques."
          icon={<CreditCard className="w-8 h-8 text-secondary" />}
          onClick={() => router.push('/admin/generate')}
        />
        <ActionCard
          title="Scanner"
          desc="Vérifiez l'authenticité des cartes via QR code."
          icon={<QrCode className="w-8 h-8 text-accent" />}
          onClick={() => router.push('/verify')}
        />
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick }: { title: string, desc: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <Card className="border-none shadow-medium hover-lift cursor-pointer group bg-white/50 backdrop-blur-sm p-8" onClick={onClick}>
      <div className="space-y-6 text-center md:text-left">
        <div className="w-16 h-16 bg-white shadow-soft rounded-2xl flex items-center justify-center group-hover:bg-primary/5 transition-colors mx-auto md:mx-0">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black font-poppins text-gray-900">{title}</h3>
          <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
        </div>
      </div>
    </Card>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorMap: any = {
    blue: 'bg-primary/5 text-primary',
    green: 'bg-success/5 text-success',
    purple: 'bg-secondary/5 text-secondary',
    orange: 'bg-accent/5 text-accent',
  };

  return (
    <Card className="border-none shadow-medium hover-lift overflow-hidden bg-white/70">
      <CardContent className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              {title}
            </p>
            <h3 className="text-4xl font-black font-poppins text-gray-900">{value}</h3>
          </div>
          <div className={cn("p-4 rounded-2xl shadow-soft", colorMap[color] || 'bg-gray-50')}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
