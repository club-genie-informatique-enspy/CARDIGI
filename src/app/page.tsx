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
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url(/images/circuit_bg.svg)',
            backgroundSize: 'cover'
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            {/* Left content */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src="/images/logo_enspy.png"
                  alt="ENSPY"
                  width={60}
                  height={60}
                />
                <Image
                  src="/images/logo_gi.png"
                  alt="Club GI"
                  width={250}
                  height={250}
                  className="object-contain"
                />
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                CARDIGI
              </h1>
              <p className="text-2xl text-blue-200">
                Cartes Digitales Génie Informatique
              </p>
              <p className="text-xl text-blue-100 italic">
                "Votre adhésion, numériquement vérifiée !"
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg"
                >
                  Se connecter
                  <CreditCard className="ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-blue-500 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  En savoir plus
                </Button>
              </div>
            </div>

            {/* Right content - Card preview */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-pink-500 blur-3xl opacity-30 rounded-full"></div>
                <Image
                  src="/images/card-preview.png"
                  alt="Aperçu carte"
                  width={400}
                  height={250}
                  className="relative rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
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
