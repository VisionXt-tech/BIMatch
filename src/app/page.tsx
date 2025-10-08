'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { ArrowRight, HelpCircle } from 'lucide-react';

const initialTalentWords = ["Talenti", "Professionisti", "Esperti", "Innovatori", "Specialisti", "Consulenti"];

export default function HomePage() {
  const [talentWords] = useState(initialTalentWords);
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
    <div className="relative flex flex-col items-center justify-center flex-grow text-center px-4 w-full">
      
      <div className="w-full max-w-6xl 2xl:max-w-7xl py-6 px-4 sm:px-6 bg-card/10 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight leading-tight">
          <span className="block sm:inline">Fai Match con{' '}</span>
          <Button
            variant="ghost"
            className="inline-block align-baseline text-center
                       w-40 xs:w-44 sm:w-52 md:w-60 lg:w-72
                       h-auto 
                       px-2 xs:px-3 py-1 xs:py-2 
                       text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight
                       border border-primary-foreground/50 rounded-lg 
                       relative
                       focus-visible:ring-1 focus-visible:ring-primary-foreground focus-visible:ring-offset-1
                       bg-transparent hover:bg-transparent text-white
                       "
          >
            <span
              key={currentTalentWord}
              className="animate-fadeIn inline-block bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent"
            >
              {currentTalentWord}
            </span>
          </Button>
          <span className="block sm:inline mt-1 sm:mt-0">{' '}e Progetti BIM.</span>
        </h1>

        <p className="text-md sm:text-lg md:text-xl text-primary-foreground/90 mb-5 max-w-2xl mx-auto">
          La piattaforma N°1 in Italia per professionisti BIM e aziende. Trova opportunità o i migliori talenti.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 w-full mb-4">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/80 text-primary-foreground hover:bg-primary-foreground/10 hover:text-white group text-base md:text-lg py-3 px-6 md:py-4 md:px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg w-full sm:w-auto"
          >
            <Link href={ROUTES.REGISTER_PROFESSIONAL}>
              <span className="flex items-center">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent font-semibold">
                  Sei un Professionista?
                </span>
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="default"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-base md:text-lg py-3 px-6 md:py-4 md:px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg w-full sm:w-auto group"
          >
            <Link href={ROUTES.REGISTER_COMPANY}>
              Sei un'Azienda?
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        
         <p className="mt-4 text-sm md:text-base text-primary-foreground opacity-80">
          Entra in BIMatch: dove le competenze incontrano le opportunità.
        </p>

        <Button
            asChild
            size="default"
            variant="link"
            className="mt-4 text-primary-foreground/80 hover:text-white group"
          >
            <Link href={ROUTES.HOW_IT_WORKS}>
              <HelpCircle className="mr-2 h-4 w-4" /> Come Funziona BIMatch?
            </Link>
        </Button>
      </div>
    </div>
  );
}
