'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard,
    CreditCard,
    QrCode,
    History,
    Settings,
    HelpCircle,
    LogOut,
    Menu,
    Bell,
    ChevronDown,
    User,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

// ============================================
// TYPES
// ============================================

export interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    adminOnly?: boolean;
}

// ============================================
// CONFIGURATION DE NAVIGATION PAR DÉFAUT
// ============================================

const defaultNavItems: NavItem[] = [
    {
        title: 'Tableau de bord',
        href: '/dashboard',
        icon: LayoutDashboard
    },
    {
        title: 'Ma Carte',
        href: '/card',
        icon: CreditCard
    },
    {
        title: 'Historique',
        href: '/dashboard/history',
        icon: History
    },
    {
        title: 'Scanner QR',
        href: '/verify',
        icon: QrCode,
        badge: 'Admin',
        adminOnly: true
    },
    {
        title: 'Administration',
        href: '/admin',
        icon: Shield,
        badge: 'Admin',
        adminOnly: true
    },
    {
        title: 'Site Vitrine',
        href: 'https://gi-enspy.vercel.app',
        icon: QrCode,
    },
];

const defaultSettingsItems: NavItem[] = [
    {
        title: 'Paramètres',
        href: '/dashboard/settings',
        icon: Settings
    },
    {
        title: 'Aide & Support',
        href: '/dashboard/support',
        icon: HelpCircle
    }
];

// ============================================
// COMPOSANT LAYOUT PRINCIPAL
// ============================================

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState(3);

    // Redirection si non authentifié
    useEffect(() => {
        // Note: La redirection est souvent gérée par le middleware ou layout parent,
        // mais une vérification ici ne fait pas de mal.
        if (!isAuthenticated && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
            // router.push('/login'); // Commenté car géré par AuthContext/route protection
        }
    }, [isAuthenticated, router, pathname]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Filtre les items selon le rôle
    const visibleNavItems = defaultNavItems.filter(
        item => !item.adminOnly || (item.adminOnly && isAdmin)
    );

    // ============================================
    // FONCTION POUR OBTENIR LE TITRE DE LA PAGE
    // ============================================
    const getPageTitle = () => {
        // Logique simple pour déterminer le titre courant
        // On peut aussi utiliser un mapping plus complet ou extraire du path
        if (pathname === '/dashboard') return 'Tableau de bord';
        if (pathname.startsWith('/dashboard/card') || pathname.startsWith('/card')) return 'Ma Carte';
        if (pathname.startsWith('/dashboard/history')) return 'Historique';
        if (pathname.startsWith('/verify') || pathname.startsWith('/dashboard/verify')) return 'Scanner QR';
        if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin')) return 'Administration';
        if (pathname.startsWith('/dashboard/settings')) return 'Paramètres';
        if (pathname.startsWith('/dashboard/support')) return 'Aide & Support';
        if (pathname.startsWith('/dashboard/profile')) return 'Mon Profil';

        return 'CARDIGI';
    };

    // Sidebar content
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/images/logo_gi.png"
                            alt="CARDIGI"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">CARDIGI</h1>
                        <p className="text-xs text-gray-500">Club GI - ENSPY</p>
                    </div>
                </Link>
            </div>

            {/* User info (mobile only) */}
            <div className="p-4 border-b border-gray-200 lg:hidden">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.photo_url} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user?.prenom?.[0]}{user?.nom?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                            {user?.prenom} {user?.nom}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Navigation principale */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-1">
                    {visibleNavItems.map((item) => {
                        const Icon = item.icon;
                        // Active state logic improved
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    'hover:bg-gray-100',
                                    isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.title}</span>
                                {item.badge && (
                                    <Badge variant="secondary" className="ml-auto">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="my-4 border-t border-gray-200" />

                <div className="space-y-1">
                    {defaultSettingsItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                    'hover:bg-gray-100',
                                    isActive && 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer avec logout (mobile) */}
            <div className="p-4 border-t border-gray-200 lg:hidden">
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full justify-start"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Déconnexion
                </Button>
            </div>

            {/* App info */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    <p>CARDIGI v1.0.0</p>
                    <p>© 2025 Club GI ENSPY</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
                    <SidebarContent />
                </div>
            </aside>

            {/* Sidebar Mobile */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-72">
                    <div className="sr-only">
                        <SheetTitle>Menu de Navigation</SheetTitle>
                        <SheetDescription>
                            Accédez aux différentes sections de votre tableau de bord CARDIGI.
                        </SheetDescription>
                    </div>
                    <SidebarContent />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="lg:pl-72 flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        {/* Left: Menu burger + titre */}
                        <div className="flex items-center gap-4">
                            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="lg:hidden"
                                    >
                                        <Menu className="w-6 h-6" />
                                    </Button>
                                </SheetTrigger>
                            </Sheet>

                            <div className="hidden sm:block">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {getPageTitle()}
                                </h2>
                            </div>
                        </div>

                        {/* Right: Notifications & User menu */}
                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="w-5 h-5" />
                                        {notifications > 0 && (
                                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80">
                                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {notifications > 0 ? (
                                        <>
                                            <div className="p-3 hover:bg-gray-50 cursor-pointer">
                                                <p className="text-sm font-medium">Carte générée avec succès</p>
                                                <p className="text-xs text-gray-500">Il y a 2 heures</p>
                                            </div>
                                            <div className="p-3 hover:bg-gray-50 cursor-pointer">
                                                <p className="text-sm font-medium">Votre QR code expire bientôt</p>
                                                <p className="text-xs text-gray-500">Il y a 1 jour</p>
                                            </div>
                                            <div className="p-3 hover:bg-gray-50 cursor-pointer">
                                                <p className="text-sm font-medium">Nouvelle fonctionnalité</p>
                                                <p className="text-xs text-gray-500">Il y a 3 jours</p>
                                            </div>
                                            <DropdownMenuSeparator />
                                            <div className="p-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => setNotifications(0)}
                                                >
                                                    Tout marquer comme lu
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            Aucune notification
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="hidden lg:flex gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user?.photo_url} />
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {user?.prenom?.[0]}{user?.nom?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium">
                                                {user?.prenom} {user?.nom}
                                            </span>
                                            {isAdmin && (
                                                <Badge variant="secondary" className="text-xs">Admin</Badge>
                                            )}
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div>
                                            <p className="font-medium">{user?.prenom} {user?.nom}</p>
                                            <p className="text-xs text-gray-500 font-normal">{user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/profile" className="cursor-pointer">
                                            <User className="w-4 h-4 mr-2" />
                                            Mon Profil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings" className="cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Paramètres
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/admin" className="cursor-pointer">
                                                <Shield className="w-4 h-4 mr-2" />
                                                Administration
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/support" className="cursor-pointer">
                                            <HelpCircle className="w-4 h-4 mr-2" />
                                            Aide & Support
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Déconnexion
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    <div className="py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/images/logo_gi.png"
                                    alt="Club GI"
                                    width={24}
                                    height={24}
                                />
                                <p className="text-sm text-gray-600">
                                    © 2025 Club Génie Informatique ENSPY
                                </p>
                            </div>
                            <div className="flex gap-6 text-sm">
                                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                                    À propos
                                </Link>
                                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                                    Confidentialité
                                </Link>
                                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                                    Conditions
                                </Link>
                                <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                                    Contact
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
