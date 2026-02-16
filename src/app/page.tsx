'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import {
  CreditCard,
  QrCode,
  Download,
  Smartphone,
  CheckCircle,
  Shield
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-primary-dark to-blue-900 text-white min-h-[90vh] flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            {/* Left content */}
            <div className="flex-1 space-y-8 animate-slide-up">
              <div className="flex items-center gap-10 mb-8 flex-wrap">
                <Image
                  src="/images/logo_enspy.png"
                  alt="ENSPY"
                  width={70}
                  height={70}
                  className="rounded-lg hover:scale-110 transition-transform duration-300"
                />
                <Image
                  src="/images/logo_gi.png"
                  alt="Club GI"
                  width={180}
                  height={60}
                  className="object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-extrabold leading-tight tracking-tight font-poppins">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                    CARDIGI
                  </span>
                </h1>
                <p className="text-2xl md:text-3xl font-medium text-blue-200 max-w-xl">
                  Cartes Digitales Génie Informatique
                </p>
                <p className="text-xl text-blue-100/80 italic font-light">
                  "Votre adhésion, numériquement vérifiée !"
                </p>
              </div>

              <div className="flex flex-wrap gap-5 mt-10">
                <Button
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="gradient-primary hover:opacity-90 text-white px-10 py-7 text-lg font-bold shadow-intense hover-lift rounded-xl"
                >
                  Se connecter
                  <CreditCard className="ml-2 w-6 h-6" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 px-10 py-7 text-lg font-semibold backdrop-blur-sm rounded-xl transition-all hover:border-white/50"
                >
                  Découvrir
                </Button>
              </div>
            </div>

            {/* Right content - Card preview */}
            <div className="flex-1 flex justify-center md:justify-end animate-fade-in sm:mt-12 md:mt-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary via-accent to-secondary blur-2xl opacity-30 rounded-full animate-pulse"></div>
                <div className="relative group">
                  <Image
                    src="/images/card-preview.png"
                    alt="Aperçu carte"
                    width={450}
                    height={280}
                    className="relative rounded-[2rem] shadow-dramatic border border-white/10 transition-all duration-500 group-hover:rotate-2 group-hover:scale-105"
                  />
                  {/* Floating badge */}
                  <div className="absolute -top-6 -right-6 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold shadow-strong rotate-12 animate-bounce">
                    Nouveau !
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution moderne et complète pour gérer vos cartes d'adhérent
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Carte Numérique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Générez votre carte d'adhérent numérique en quelques secondes avec QR code de vérification sécurisé.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Application Mobile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Installez CARDIGI comme application mobile (PWA) et accédez à votre carte même hors ligne.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Téléchargement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Téléchargez votre carte en PNG ou PDF haute qualité pour l'imprimer ou la sauvegarder.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Vérification Rapide</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Scannez le QR code pour vérifier instantanément l'authenticité d'une carte et le statut du membre.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Sécurité Maximale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  QR codes sécurisés avec JWT, expiration 24h, protection anti-contrefaçon et chiffrement HTTPS.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Toujours à Jour</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Synchronisation automatique avec le système de gestion. Vos informations sont toujours à jour.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">150+</div>
              <div className="text-blue-200">Membres Actifs</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">94%</div>
              <div className="text-blue-200">Taux d'Adoption</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">&lt;2s</div>
              <div className="text-blue-200">Temps de Génération</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.5%</div>
              <div className="text-blue-200">Disponibilité</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Prêt à obtenir votre carte ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connectez-vous maintenant et générez votre carte d'adhérent numérique en quelques clics.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg"
          >
            Commencer maintenant
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CARDIGI</h3>
              <p className="text-gray-400">
                Solution de cartes digitales pour le Club Génie Informatique de l'ENSPY.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <p>📧 clubinfoenspy@gmail.com</p>
                <p>📞 +237 694773472</p>
                <p>🌐 www.clubgi-enspy.org</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">ENSPY</h3>
              <p className="text-gray-400">
                École Nationale Supérieure Polytechnique<br />
                BP 8390, Yaoundé, Cameroun
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Club Génie Informatique ENSPY. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
