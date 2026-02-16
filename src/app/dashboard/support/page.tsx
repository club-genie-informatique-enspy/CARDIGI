/* eslint-disable react/no-unescaped-entities */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Globe, HelpCircle } from 'lucide-react';
import React from 'react'; // Added React import for React.ReactNode

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight font-poppins">
          Aide & <span className="text-primary">Support</span>
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Une question ? Un problème technique ? Notre équipe est là pour vous accompagner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
        <SupportCard
          title="Email"
          desc="Envoyez-nous un message, réponse sous 24h."
          icon={<Mail className="w-6 h-6 text-primary" />}
          link="mailto:clubinfoenspy@gmail.com"
          label="clubinfoenspy@gmail.com"
        />

        <SupportCard
          title="Téléphone"
          desc="Assistance directe via appel ou WhatsApp."
          icon={<Phone className="w-6 h-6 text-success" />}
          link="tel:+237657450314"
          label="+237 657 450 314"
        />

        <SupportCard
          title="Site Web"
          desc="Découvrez nos projets et nos événements."
          icon={<Globe className="w-6 h-6 text-secondary" />}
          link="https://www.clubgi-enspy.org"
          label="clubgi-enspy.org"
          isExternal
        />

        <SupportCard
          title="FAQ"
          desc="Consultez les questions les plus fréquentes."
          icon={<HelpCircle className="w-6 h-6 text-accent" />}
          label="Consulter la base"
        />
      </div>
    </div>
  );
}

function SupportCard({ title, desc, icon, link, label, isExternal }: {
  title: string, desc: string, icon: React.ReactNode, link?: string, label: string, isExternal?: boolean
}) {
  return (
    <Card className="border-none shadow-medium bg-white/70 backdrop-blur-sm group hover-lift overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="flex items-center gap-4 text-2xl font-black font-poppins text-gray-900">
          <div className="p-3 bg-white shadow-soft rounded-2xl group-hover:bg-primary/5 transition-all">
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-6">
        <p className="text-gray-500 font-medium leading-relaxed">
          {desc}
        </p>
        {link ? (
          <Button className="w-full h-12 rounded-xl font-bold bg-white text-gray-900 border-2 border-gray-100 hover:border-primary hover:text-primary transition-all shadow-soft" asChild>
            <a href={link} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
              {label}
            </a>
          </Button>
        ) : (
          <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2 border-gray-100 hover:bg-gray-50">
            {label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
