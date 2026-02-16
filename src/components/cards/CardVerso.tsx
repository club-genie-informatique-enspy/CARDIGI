'use client';

import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Member } from '@/types/member';
import { cn } from '@/lib/utils';
import { Mail, Phone, Globe } from 'lucide-react';

interface CardVersoProps {
  member: Member;
  qrData: string;
  className?: string;
}

export const CardVerso: React.FC<CardVersoProps> = ({
  member,
  qrData,
  className
}) => {
  const clubInfo = {
    nom: "CLUB GÉNIE INFORMATIQUE",
    ecole: "École Nationale Supérieure Polytechnique",
    adresse: "BP 8390, Yaoundé, Cameroun",
    email: "clubinfoenspy@gmail.com",
    telephone: "+237 694773472",
    siteWeb: "https://gi-enspy.vercel.app"
  };

  return (
    <div
      className={cn(
        "relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl",
        "bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col",
        "max-w-[856px] mx-auto", // Responsive max width
        className
      )}
    >
      {/* Bande supérieure */}
      <div className="relative bg-gradient-to-r from-[#001f3f] to-[#003366] px-2 sm:px-6 py-1.5 sm:py-3 border-b-2 border-orange-500 shrink-0">
        <h2 className="text-white font-bold text-[10px] xs:text-xs sm:text-lg text-center tracking-wide leading-tight">
          {clubInfo.nom}
        </h2>
        <p className="text-blue-100 text-[8px] xs:text-[9px] sm:text-xs text-center mt-0.5 opacity-80 leading-tight">
          {clubInfo.ecole}
        </p>
      </div>

      {/* Contenu principal */}
      <div className="relative flex-1 px-3 sm:px-6 py-2 sm:py-4 flex flex-col justify-between overflow-hidden">

        {/* Section Haute: QR + Info */}
        <div className="flex items-center gap-2 sm:gap-4 grow-0">
          {/* QR Code Container */}
          <div className="flex-shrink-0 bg-white p-1.5 sm:p-3 rounded-lg shadow-md border border-blue-200">
            <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-[130px] sm:h-[130px]">
              <QRCodeSVG
                value={qrData}
                width="100%"
                height="100%"
                level="H"
                includeMargin={false}
                fgColor="#001f3f"
                bgColor="#FFFFFF"
              />
            </div>
          </div>

          {/* Description Text */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-gray-700 font-semibold mb-0.5 sm:mb-1 text-[10px] xs:text-xs sm:text-sm">
              Code de vérification
            </p>
            <p className="text-gray-600 text-[8px] xs:text-[9px] sm:text-xs leading-tight sm:leading-relaxed line-clamp-4">
              Scannez ce QR code pour vérifier l'authenticité de cette carte
              et accéder au profil du membre.
            </p>
          </div>
        </div>

        {/* Section Milieu: Contacts */}
        <div className="bg-blue-50 rounded-lg p-1.5 sm:p-3 my-1 sm:my-2 grow-0">
          <h3 className="text-blue-900 font-semibold text-[10px] xs:text-xs sm:text-sm mb-1 sm:mb-2 flex items-center gap-1.5">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
            Contactez-nous
          </h3>

          <div className="space-y-0.5 sm:space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-700 text-[9px] xs:text-[10px] sm:text-xs">
              <Mail className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate max-w-full">{clubInfo.email}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-700 text-[9px] xs:text-[10px] sm:text-xs">
              <Phone className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600 flex-shrink-0" />
              <span>{clubInfo.telephone}</span>
            </div>
          </div>
        </div>

        {/* Section Basse: Signatures */}
        <div className="border-t border-dashed border-gray-300 pt-1 sm:pt-3 flex justify-between items-end grow-0">
          <div className="text-center">
            <p className="text-gray-600 text-[8px] sm:text-xs mb-0.5 sm:mb-2">Signature du Président</p>
            <div className="relative h-6 w-16 xs:h-8 xs:w-20 sm:h-10 sm:w-28 mx-auto">
              <Image
                src="/images/signature_president.png"
                alt="Signature"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-700 text-[8px] sm:text-xs font-semibold mt-0.5">
              ELA FOE FRÉDÉRIC THÉOPHILE
            </p>
          </div>

          <div className="relative w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16">
            <Image
              src="/images/cachet_club.png"
              alt="Cachet officiel"
              fill
              className="object-contain opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Footer Adresse */}
      <div className="pb-1 sm:pb-2 px-4 text-center shrink-0">
        <p className="text-gray-500 text-[7px] xs:text-[8px] sm:text-xs truncate">
          {clubInfo.adresse} | {clubInfo.siteWeb}
        </p>
      </div>
    </div>
  );
};

