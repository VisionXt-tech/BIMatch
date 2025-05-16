
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants";
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
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-120px)] w-full text-center px-4">
      {/* Contenuto principale senza card separata */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl 2xl:max-w-4xl py-12 md:py-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 tracking-tight leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
          Fai Match con {' '}
          <Button
            variant="ghost"
            className="inline-block align-baseline text-center
                       w-52 sm:w-60 md:w-64 lg:w-72 /* Larghezze fisse responsive per il contenitore */
                       h-auto /* Altezza automatica basata sul contenuto e padding */
                       px-4 /* Padding orizzontale */
                       py-0 /* Padding verticale gestito dall'altezza della linea del font */
                       text-2xl sm:text-3xl md:text-4xl lg:text-5xl /* Stessa dimensione del titolo */
                       font-bold /* Stesso peso del titolo */
                       tracking-tight /* Stesso tracking del titolo */
                       bg-transparent hover:bg-transparent /* Nessuno sfondo esplicito per il bottone */
                       rounded-lg
                       relative focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:ring-2"
            aria-live="polite"
            aria-atomic="true"
          >
            <span
              key={currentTalentWord}
              className="text-primary animate-fadeIn inline-block" // Testo dinamico ora blu
            >
              {currentTalentWord}
            </span>
          </Button>
          {' '}e Progetti BIM.
        </h1>

        <p className="text-md sm:text-lg md:text-xl text-primary opacity-80 mb-10 max-w-xl">
          La piattaforma N°1 in Italia per professionisti BIM e aziende. Trova opportunità o i migliori talenti.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 w-full">
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
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground
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
         <p className="mt-10 text-sm md:text-base text-primary opacity-70">
          Entra in BIMatch: dove le competenze incontrano le opportunità.
        </p>
      </div>
    </div>
  );
}
