
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { ArrowRight } from 'lucide-react';

const talentWords = ["Talenti", "Professionisti", "Esperti", "Innovatori", "Specialisti"];

export default function HomePage() {
  const [currentTalentWord, setCurrentTalentWord] = useState(talentWords[0]);
  const [talentIndex, setTalentIndex] = useState(0);

  useEffect(() => {
    const talentInterval = setInterval(() => {
      setTalentIndex((prevIndex) => (prevIndex + 1) % talentWords.length);
    }, 2500);

    return () => {
      clearInterval(talentInterval);
    };
  }, []);

  useEffect(() => {
    setCurrentTalentWord(talentWords[talentIndex]);
  }, [talentIndex]);

  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center px-4 md:px-8 w-full">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-8 tracking-tight">
        Fai Match con{' '}
        <Button
          key={currentTalentWord}
          variant="ghost"
          className="inline-block align-baseline text-center w-56 sm:w-64 md:w-80 lg:w-96 h-auto px-3 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent animate-fadeIn text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
        >
          {currentTalentWord}
        </Button>
        {' '}e Progetti BIM.
      </h1>
      <p className="text-md sm:text-lg md:text-xl text-foreground/80 max-w-xl mx-auto mb-10">
        La piattaforma N°1 in Italia per professionisti BIM e aziende.
        Trova opportunità o i migliori talenti.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-md mb-10">
        <Button
          asChild
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground group text-md md:text-lg py-4 px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg"
        >
          <Link href={ROUTES.REGISTER_PROFESSIONAL}>
            Sei un Professionista?
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto bg-background text-accent border-2 border-accent hover:bg-accent/10 group text-md md:text-lg py-4 px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg"
        >
          <Link href={ROUTES.REGISTER_COMPANY}>
            Sei un'Azienda?
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      <p className="text-sm md:text-base text-foreground/60 max-w-lg mx-auto">
        Entra in BIMatch: dove le competenze incontrano le opportunità.
      </p>
    </div>
  );
}
