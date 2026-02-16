/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirection si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Fonction de soumission du formulaire
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Appel de la fonction login du AuthContext
    const result = await login(email, password);

    if (result.success) {
      toast({
        title: 'Connexion réussie',
        description: 'Bienvenue sur CARDIGI !',
      });

      // La redirection est gérée par le AuthContext ou useEffect
      router.replace('/dashboard');
    } else {
      const errorMessage = result.error || 'Identifiants incorrects';
      setError(errorMessage);

      toast({
        title: 'Échec de la connexion',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  // Ne rien afficher si déjà authentifié
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-dramatic backdrop-blur-sm bg-white/95 border-white/20 animate-scale-in">
        <CardHeader className="space-y-4 text-center pb-6">
          {/* Logos avec effet de survol */}
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
            <div className="relative group">
              <Image
                src="/images/logo_gi.png"
                alt="Logo GI"
                width={160}
                height={60}
                className="object-contain transition-transform group-hover:scale-105 duration-300"
                priority
              />
            </div>
          </div>

          {/* Titre avec gradient */}
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              CARDIGI
            </CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground">
              Club Génie Informatique - ENSPY
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@enspy.cm"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11 transition-all duration-300 focus:shadow-medium"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 pr-10 transition-all duration-300 focus:shadow-medium"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  </span>
                </Button>
              </div>
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary-dark transition-colors duration-200 font-medium"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Bouton de soumission avec gradient */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-all duration-300 hover-lift shadow-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Séparateur visuel */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Besoin d'aide ?</span>
            </div>
          </div>

          {/* Information supplémentaire */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas de compte ?
            </p>
            <p className="text-sm font-semibold text-foreground">
              Rapprochez-vous du bureau du club
            </p>
            <p className="text-xs text-muted-foreground">
              ou{' '}
              <Link
                href="mailto:clubinfoenspy@gmail.com"
                className="text-primary hover:text-primary-dark transition-colors duration-200 font-medium"
              >
                contactez-nous
              </Link>
              {' '}pour plus d'informations
            </p>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center border-t border-border">
            <p className="text-xs text-muted-foreground">
              Développé avec ❤️ par le Club GI ENSPY
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;