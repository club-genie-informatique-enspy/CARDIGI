'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
            <div className="max-w-md w-full text-center space-y-8 animate-scale-in">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <Image
                        src="/images/logo_enspy.png"
                        alt="ENSPY"
                        width={60}
                        height={60}
                        className="rounded-full shadow-medium"
                    />
                    <Image
                        src="/images/logo_gi.png"
                        alt="Club GI"
                        width={120}
                        height={50}
                        className="object-contain"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center animate-pulse">
                            <AlertCircle className="w-12 h-12 text-destructive" />
                        </div>
                    </div>

                    <h1 className="text-6xl font-extrabold text-foreground font-poppins tracking-tight">404</h1>
                    <h2 className="text-2xl font-bold text-foreground">Page introuvable</h2>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                    </p>
                </div>

                <div className="pt-6">
                    <Button asChild size="lg" className="gradient-primary hover-lift shadow-medium px-8 h-12 text-base font-semibold">
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="w-5 h-5" />
                            Retour à l'accueil
                        </Link>
                    </Button>
                </div>

                <div className="pt-12 text-xs text-muted-foreground border-t border-border/50">
                    <p>Club Génie Informatique ENSPY - CARDIGI</p>
                </div>
            </div>
        </div>
    );
}
