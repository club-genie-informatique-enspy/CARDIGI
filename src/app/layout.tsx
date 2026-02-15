import type { Metadata, Viewport } from 'next'; // Importez 'Viewport' ici
import { Inter, Roboto } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { LoadingBar } from '@/components/LoadingBar';

const inter = Inter({ subsets: ['latin'] });
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto'
});

// ✅ 1. EXPORTATION DES MÉTA-DONNÉES (Metadata)
export const metadata: Metadata = {
  title: 'CARDIGI - Cartes Digitales GI ENSPY',
  description: 'Votre adhésion, numériquement vérifiée !',
  manifest: '/manifest.json',
  // themeColor et viewport ONT ÉTÉ SUPPRIMÉS ICI

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
};

// ✅ 2. NOUVELLE EXPORTATION POUR VIEWPORT (Viewport)
export const viewport: Viewport = {
  themeColor: '#0D47A1', // Déplacé de metadata
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.className} ${roboto.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <LoadingBar />
        <AuthProvider>
          <PWAInstallPrompt />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}