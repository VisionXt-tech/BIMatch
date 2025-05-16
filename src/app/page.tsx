'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants";
// Image import is no longer needed as the background image is removed
import { ArrowRight } from 'lucide-react';

const initialTalentWords = ["Talenti", "Professionisti", "Esperti", "Innovatori", "Specialisti", "Consulenti"];

export default function HomePage() {
  const [talentWords, setTalentWords] = useState(initialTalentWords);
  const [currentTalentWord, setCurrentTalentWord] = useState(talentWords[0]);
  const [talentIndex, setTalentIndex] = useState(0);

  useEffect(() => {
    const talentInterval = setInterval(() => {
      setTalentIndex((prevIndex) => (prevIndex + 1) % talentWords.length);
    }, 2500); 

    return () => {
      clearInterval(talentInterval);
    };
  }, [talentWords.length]); 

  useEffect(() => {
    setCurrentTalentWord(talentWords[talentIndex]);
  }, [talentIndex, talentWords]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full">
      {/* Background Image and Overlay Removed */}

      {/* Contenuto Card Sfocata */}
      <div className="relative z-20 flex flex-col items-start justify-center w-full max-w-xl 2xl:max-w-2xl p-6 sm:p-8 md:p-10 lg:p-12
                      bg-black/60 dark:bg-neutral-900/75 backdrop-blur-lg 
                      rounded-2xl ring-1 ring-white/20 shadow-2xl">
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
          Fai Match con {' '}
          <Button
            variant="ghost"
            className="inline-block align-baseline text-center h-auto font-bold tracking-tight
                       w-52 sm:w-60 md:w-64 lg:w-72 /* Larghezze fisse responsive per il contenitore */
                       px-4 /* Padding orizzontale */
                       py-0 /* Padding verticale gestito dall'altezza della linea del font */
                       text-2xl sm:text-3xl md:text-4xl lg:text-5xl /* Stessa dimensione del titolo */
                       bg-white/10 hover:bg-white/15 /* Sfondo leggero e statico per il pulsante */
                       rounded-lg border border-white/30 /* Bordo esplicito e più visibile */
                       relative focus-visible:ring-accent focus-visible:ring-offset-0 focus-visible:ring-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              key={currentTalentWord}
              className="text-accent animate-fadeIn inline-block"
            >
              {currentTalentWord}
            </span>
          </Button>
          {' '}e Progetti BIM.
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-neutral-200/90 mb-10 max-w-lg text-left">
          La piattaforma N°1 in Italia per professionisti BIM e aziende. Trova opportunità o i migliori talenti.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 md:gap-5 w-full">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground group text-md md:text-lg 
                       py-3 px-6 md:py-4 md:px-8 
                       transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg w-full sm:w-auto"
          >
            <Link href={ROUTES.REGISTER_PROFESSIONAL}>
              Sei un Professionista?
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white/90 hover:bg-white text-primary border-2 border-primary/50 hover:border-primary
                       group text-md md:text-lg 
                       py-3 px-6 md:py-4 md:px-8 
                       transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg w-full sm:w-auto"
          >
            <Link href={ROUTES.REGISTER_COMPANY}>
              Sei un'Azienda?
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
         <p className="mt-10 text-sm text-neutral-300/70 text-left">
          Entra in BIMatch: dove le competenze incontrano le opportunità.
        </p>
      </div>
    </div>
  );
}
