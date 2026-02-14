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
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-100">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <Image
              src="/images/logo_enspy.png"
              alt="Logo ENSPY"
              width={60}
              height={60}
              className="rounded-full"
              priority
            />
            <Image
              src="/images/logo_gi.png"
              alt="Logo GI"
              width={180}
              height={180}
              className="rounded-full object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold">Connexion CARDIGI</CardTitle>
          <CardDescription>
            Club Génie Informatique - ENSPY
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Affichage des erreurs - Supprimé au profit des toasts */}

            {/* Champ Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@enspy.cm"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  </span>
                </Button>
              </div>
              <div className="text-right text-sm">
                <Link
                  href="/forgot-password"
                  className="text-blue-600 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Bouton de soumission */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Information supplémentaire */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ? <br />
              <span className="font-semibold text-blue-800">
                Rapprochez-vous du bureau du club.
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Ou <Link href="mailto:clubinfoenspy@gmail.com" className="hover:underline">contactez-nous</Link> pour plus d&#39;infos
            </p>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Développé par le Club GI ENSPY</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;