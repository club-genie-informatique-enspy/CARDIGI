'use client';

import React, { useState, useEffect } from 'react';
import { CardRecto } from './CardRecto';
import { CardVerso } from './CardVerso';
import { Member } from '@/types/member';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

interface CardFlipProps {
  member: Member;
  qrData: string;
  initialSide?: 'recto' | 'verso';
  className?: string;
}

export const CardFlip: React.FC<CardFlipProps> = ({
  member,
  qrData,
  initialSide = 'recto',
  className
}) => {
  const [isFlipped, setIsFlipped] = useState(initialSide === 'verso');

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Support clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped]);

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      {/* Bouton pour retourner la carte */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleFlip}
          aria-label={isFlipped ? "Voir le recto" : "Voir le verso"}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg 
                     transition-all duration-200 flex items-center gap-2 shadow-lg
                     hover:shadow-xl transform hover:scale-105"
        >
          <RotateCw className={cn(
            "w-5 h-5 transition-transform duration-500",
            isFlipped && "rotate-180"
          )} />
          Retourner la carte
        </Button>
      </div>

      {/* Container avec effet 3D */}
      <div className="perspective-1000">
        <div
          className={cn(
            "relative w-full transition-all duration-700 ease-in-out",
            "transform-style-3d",
            isFlipped && "rotate-y-180"
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Recto */}
          <div
            className={cn(
              "w-full backface-hidden",
              isFlipped && "invisible"
            )}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <CardRecto member={member} />
          </div>

          {/* Verso */}
          <div
            className={cn(
              "absolute top-0 left-0 w-full backface-hidden",
              !isFlipped && "invisible"
            )}
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <CardVerso member={member} qrData={qrData} />
          </div>
        </div>
      </div>

      {/* Indicateur de côté */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full transition-colors",
            !isFlipped ? "bg-blue-600" : "bg-gray-300"
          )} />
          <span className="font-medium">
            {isFlipped ? 'Verso de la carte' : 'Recto de la carte'}
          </span>
          <span className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isFlipped ? "bg-blue-600" : "bg-gray-300"
          )} />
        </p>
      </div>
    </div>
  );
};

