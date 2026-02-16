/* eslint-disable react/no-unescaped-entities */
'use client';

import React from 'react';
import Image from 'next/image';
import { Member } from '@/types/member';
import { cn } from '@/lib/utils';

interface CardRectoProps {
  member: Member;
  className?: string;
}

export const CardRecto: React.FC<CardRectoProps> = ({ member, className }) => {
  const resolvePhotoUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Fallback explicite pour le développement
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl.trim() === '') {
      apiUrl = 'http://localhost:8000';
    } else {
      apiUrl = apiUrl.trim();
    }

    // Éviter les doubles slashs si apiUrl termine par / et url commence par /
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    const path = url.startsWith('/') ? url : `/${url}`;

    const finalUrl = `${baseUrl}${path}`;
    // console.log('Resolved Photo URL:', finalUrl); // Pour debug client si besoin
    return finalUrl;
  };

  const photoUrl = resolvePhotoUrl(member.photo_url);

  return (
    <div
      className={cn(
        "relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl flex flex-col",
        "bg-gradient-to-br from-white via-blue-50 to-gray-100", // Light Theme
        "max-w-[856px] mx-auto", // Responsive max width
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: 'url(/images/circuit_bg.svg)',
            backgroundSize: '300px',
            backgroundRepeat: 'repeat',
            filter: 'invert(1)' // Invert pattern for light bg if needed, assumes white pattern originally
          }}
        />
      </div>

      {/* Decorative Glows - Adjusted for Light Theme */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-3 sm:px-8 pt-3 sm:pt-6 shrink-0">
        <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-16 sm:h-16 relative filter drop-shadow-sm">
          <Image
            src="/images/logo_enspy.png"
            alt="Logo ENSPY"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="text-center flex-1 mx-2 sm:mx-4 mt-1">
          <h1 className="text-[#001f3f] font-bold text-xs xs:text-sm sm:text-xl lg:text-2xl tracking-[0.1em] sm:tracking-[0.2em] font-serif whitespace-nowrap">
            CARTE D'ADHÉRENT
          </h1>
          <div className="h-0.5 w-1/3 mx-auto bg-gradient-to-r from-transparent via-orange-500/80 to-transparent my-0.5 sm:my-2" />
          <p className="text-orange-600/90 text-[7px] xs:text-[8px] sm:text-xs tracking-widest font-light uppercase">
            Année Académique {new Date().getFullYear()} - {new Date().getFullYear() + 1}
          </p>
        </div>

        <div className="w-24 h-12 xs:w-32 xs:h-16 sm:w-56 sm:h-28 relative filter drop-shadow-sm scale-125 origin-right">
          <Image
            src="/images/logo_gi.png"
            alt="Logo Club GI"
            fill
            className="object-contain object-right"
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-10 mt-1 sm:mt-6 flex items-center gap-3 sm:gap-8 flex-1">
        {/* Photo Frame */}
        <div className="flex-shrink-0 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-400 to-orange-200 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
          <div className="relative w-16 h-20 xs:w-20 xs:h-24 sm:w-32 sm:h-40 rounded-lg sm:rounded-xl overflow-hidden border-[2px] sm:border-[3px] border-white shadow-lg bg-gray-100">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={`${member.prenom} ${member.nom}`}
                width={128}
                height={160}
                className="object-cover w-full h-full"
                unoptimized
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={cn(
              "w-full h-full flex flex-col items-center justify-center bg-gray-200",
              photoUrl && "hidden"
            )}>
              <span className="text-gray-400 text-xl sm:text-4xl font-bold mb-1">
                {member.prenom[0]}{member.nom[0]}
              </span>
            </div>
          </div>
          {/* Status Badge Over Photo */}
          <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-max">
            <span className={cn(
              "px-1.5 sm:px-3 py-0.5 rounded-full text-[7px] xs:text-[8px] sm:text-[10px] font-bold uppercase tracking-wider shadow-md border border-white",
              member.statut === 'actif'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-600 text-white'
            )}>
              {member.statut}
            </span>
          </div>
        </div>

        {/* Member Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-center py-1 sm:py-2">
          {/* Name Section */}
          <div className="mb-1.5 sm:mb-5 border-b border-gray-200 pb-1.5 sm:pb-4">
            <h2 className="font-bold text-base xs:text-lg sm:text-3xl text-[#001f3f] tracking-wide truncate">
              {member.nom.toUpperCase()}
            </h2>
            <h3 className="text-xs xs:text-sm sm:text-xl text-blue-800 font-medium truncate mt-0.5 sm:mt-1">
              {member.prenom}
            </h3>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-2 sm:gap-x-8 gap-y-1 sm:gap-y-3 text-xs sm:text-sm">
            <div className="group">
              <p className="text-orange-600/90 text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mb-0.5">Matricule</p>
              <p className="text-gray-700 font-mono text-[10px] xs:text-xs sm:text-base tracking-wide font-medium">{member.numero_membre || "N/A"}</p>
            </div>

            <div className="group">
              <p className="text-orange-600/90 text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mb-0.5">Niveau</p>
              <p className="text-gray-700 font-medium text-[10px] xs:text-xs sm:text-base">{member.niveau}</p>
            </div>

            <div className="col-span-2 group">
              <p className="text-orange-600/90 text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-wider font-semibold mb-0.5">Filière</p>
              <p className="text-gray-700 font-medium truncate text-[10px] xs:text-xs sm:text-base">{member.filiere}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Validity - Utilisation de margins auto pour pousser vers le bas dans le flex container */}
      <div className="relative mt-auto px-4 sm:px-8 pb-3 sm:pb-6 flex justify-between items-end shrink-0">
        <div className="flex flex-col">
          <span className="text-gray-400 text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-widest mb-0.5">Délivrée le</span>
          <span className="text-blue-900 text-[10px] xs:text-xs sm:text-sm font-medium font-mono">
            {new Date(member.date_adhesion).toLocaleDateString('fr-FR')}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-orange-600/90 text-[7px] xs:text-[8px] sm:text-[10px] uppercase tracking-widest mb-0.5">Valide Jusqu'au</span>
          <span className="text-blue-900 text-[10px] xs:text-xs sm:text-sm font-bold font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shadow-sm">
            {new Date(member.date_expiration).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Decorative ID Watermark */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 text-[#001f3f]/[0.03] text-8xl font-black rotate-90 pointer-events-none select-none">
        ENSPY
      </div>
    </div>
  );
};
