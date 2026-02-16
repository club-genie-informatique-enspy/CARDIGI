'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-dramatic backdrop-blur-sm bg-white/95 border-white/20 animate-scale-in">
                <CardHeader className="space-y-4 text-center pb-6">
                    <div className="flex justify-center items-center gap-6 mb-2">
                        <div className="relative group">
                            <Image
                                src="/images/logo_enspy.png"
                                alt="Logo ENSPY"
                                width={70}
                                height={70}
                                className="rounded-full shadow-medium transition-transform group-hover:scale-110 duration-300"
                                priority
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Récupération
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-muted-foreground">
                            Mot de passe oublié ?
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-semibold mb-1">Fonctionnalité automatique indisponible</p>
                            <p>Pour des raisons de sécurité, la réinitialisation automatique est temporairement désactivée.</p>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Pour récupérer l'accès à votre compte CARDIGI, veuillez vous présenter physiquement au :
                        </p>
                        <div className="p-4 bg-muted rounded-lg border border-border">
                            <p className="font-bold text-foreground font-poppins">Bureau du Club Génie Informatique</p>
                            <p className="text-xs text-muted-foreground mt-1">ENSPY - Bâtiment Génie Informatique</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button asChild variant="outline" className="w-full h-11">
                            <Link href="mailto:clubinfoenspy@gmail.com" className="flex items-center justify-center gap-2">
                                <Mail className="h-4 w-4" />
                                Contacter le bureau par email
                            </Link>
                        </Button>

                        <Button asChild variant="ghost" className="w-full h-11">
                            <Link href="/login" className="flex items-center justify-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Retour à la connexion
                            </Link>
                        </Button>
                    </div>

                    <div className="pt-4 text-center border-t border-border">
                        <p className="text-xs text-muted-foreground">
                            Développé avec ❤️ par le Club GI ENSPY
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
