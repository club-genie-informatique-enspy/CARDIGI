/* eslint-disable react/no-unescaped-entities */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Globe, HelpCircle } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Aide & Support
        </h1>
        <p className="text-gray-600">
          Besoin d'aide ? Contactez-nous
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Envoyez-nous un email, nous répondons sous 24h
            </p>
            <Button className="w-full" variant="outline" asChild>
              <a href="mailto:clubinfoenspy@gmail.com">
                Envoyer un email
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Téléphone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Appelez-nous pour une assistance immédiate
            </p>
            <Button className="w-full" variant="outline" asChild>
              <a href="tel:+237694773472">
                +237 657450314
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Site Web
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Visitez notre site pour plus d'informations
            </p>
            <Button className="w-full" variant="outline" asChild>
              <a href="https://www.clubgi-enspy.org" target="_blank">
                Visiter le site
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              FAQ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Consultez notre base de connaissances
            </p>
            <Button className="w-full" variant="outline">
              Voir la FAQ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
