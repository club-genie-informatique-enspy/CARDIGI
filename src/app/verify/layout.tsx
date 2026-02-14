'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function VerifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (!isAdmin) {
                // Redirect non-admin users to dashboard
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, isAdmin, loading, router]);

    if (loading || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-4 text-gray-600">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
