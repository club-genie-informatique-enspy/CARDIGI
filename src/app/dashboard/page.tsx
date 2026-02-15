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
} from 'lucide-react';
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue, {user.prenom} !
        </h1>
        <p className="text-gray-600 mt-1">
          Gérez votre carte d'adhérent et vos informations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="text-xl font-bold capitalize">{user.statut || 'Actif'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Numéro</p>
                <p className="text-xl font-bold">{user.numero_membre || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Filière</p>
                <p className="text-lg font-bold">{user.filiere || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Ma Carte d'Adhérent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-24" />
            ) : cardMetadata ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Carte générée</span>
                </div>
                <p className="text-sm text-gray-600">
                  Votre carte est prête et valide jusqu'au{' '}
                  {user.date_expiration ? new Date(user.date_expiration).toLocaleDateString('fr-FR') : 'Date inconnue'}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push(`/card/${user.id}`)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir ma carte
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/card/${user.id}`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Carte non générée</span>
                </div>
                <p className="text-sm text-gray-600">
                  Votre carte n'a pas encore été générée. Contactez un administrateur.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Mon Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Niveau</p>
              <p className="font-medium">{user.niveau || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cellule</p>
              <p className="font-medium">{user.cellule || 'Non définie'}</p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push('/dashboard/profile')}
            >
              Modifier mon profil
            </Button>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de Bord Admin
          </h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble de la gestion des membres
          </p>
        </div>
        <Button onClick={() => router.push('/admin')}>
          <Shield className="w-4 h-4 mr-2" />
          Panneau d'administration
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
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin')}>
          <CardHeader>
            <CardTitle className="text-lg">Gestion des Membres</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Voir, modifier et gérer tous les membres du club
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/generate')}>
          <CardHeader>
            <CardTitle className="text-lg">Générer des Cartes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Générer des cartes pour un ou plusieurs membres
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/verify')}>
          <CardHeader>
            <CardTitle className="text-lg">Scanner QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Vérifier l'authenticité des cartes d'adhérent
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
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
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              {title}
            </p>
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${colorMap[color] || 'bg-gray-50'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
