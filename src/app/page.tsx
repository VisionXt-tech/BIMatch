
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { ArrowRight } from 'lucide-react';

// Adjusted word lists if necessary
const initialTalentWords = ["Talenti", "Professionisti", "Esperti", "Innovatori", "Specialisti", "Consulenti"];

export default function HomePage() {
  const [talentWords, setTalentWords] = useState(initialTalentWords);
  const [currentTalentWord, setCurrentTalentWord] = useState(talentWords[0]);
  const [talentIndex, setTalentIndex] = useState(0);

  useEffect(() => {
    const talentInterval = setInterval(() => {
      setTalentIndex((prevIndex) => (prevIndex + 1) % talentWords.length);
    }, 2500); // Change word every 2.5 seconds

    return () => {
      clearInterval(talentInterval);
    };
  }, [talentWords.length]);

  useEffect(() => {
    setCurrentTalentWord(talentWords[talentIndex]);
  }, [talentIndex, talentWords]);

  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center px-4 w-full">
      <div className="w-full max-w-4xl 2xl:max-w-5xl py-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-8 tracking-tight leading-tight">
          Fai Match con{' '}
          <Button
            variant="ghost"
            className="inline-block align-baseline text-center
                       w-48 sm:w-52 md:w-60 lg:w-72
                       h-auto 
                       px-3 py-0 
                       text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight
                       border border-primary rounded-lg 
                       relative
                       focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-1"
          >
            <span
              key={currentTalentWord}
              className="text-primary animate-fadeIn inline-block"
            >
              {currentTalentWord}
            </span>
          </Button>
          {' '}e Progetti BIM.
        </h1>

        <p className="text-md sm:text-lg md:text-xl text-foreground/90 mb-10 max-w-xl mx-auto">
          La piattaforma N°1 in Italia per professionisti BIM e aziende. Trova opportunità o i migliori talenti.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 w-full">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground group text-base md:text-lg 
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
                       group text-base md:text-lg 
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
