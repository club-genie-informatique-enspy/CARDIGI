/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';
import Image from 'next/image';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Détecte iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

      const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('PWA installed');
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_installed', {
          event_category: 'engagement',
          event_label: 'PWA Installation'
        });
      }
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

    // Écoute l'événement beforeinstallprompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Vérifie si l'utilisateur n'a pas déjà refusé
      const dismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Détecte si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowPrompt(false);
    }

    // Écoute l'événement custom pour installation manuelle
    const installHandler = () => {
      if (deferredPrompt) {
        handleInstall();
      }
    };
    window.addEventListener('pwa-install-requested', installHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-install-requested', installHandler);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === 'accepted') {
      console.log('PWA installed');
      // Analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'pwa_installed', {
          event_category: 'engagement',
          event_label: 'PWA Installation'
        });
      }
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    // Réaffiche après 7 jours
    setTimeout(() => {
      localStorage.removeItem('pwa_prompt_dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  // Instructions iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl p-4 z-50 border-2 border-blue-500">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Installer CARDIGI
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Pour installer l&#39;application sur iOS :
            </p>
            <ol className="text-xs text-gray-600 space-y-1 mb-3">
              <li>1. Appuyez sur le bouton <strong>Partager</strong> (en bas)</li>
              <li>2. Sélectionnez <strong>&#34;Sur l&#39;écran d&#39;accueil&#34;</strong></li>
              <li>3. Appuyez sur <strong>Ajouter</strong></li>
            </ol>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="w-full"
            >
              J&#39;ai compris
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prompt Android/Desktop
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl p-4 z-50 border-2 border-blue-500 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 relative flex-shrink-0">
          <Image
            src="/icons/icon-192.png"
            alt="CARDIGI"
            fill
            className="rounded-lg"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Installer CARDIGI
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Accédez à votre carte même hors ligne et recevez des notifications.
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Installer
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};