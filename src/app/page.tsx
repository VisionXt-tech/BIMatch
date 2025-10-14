'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { ArrowRight, HelpCircle } from 'lucide-react';
import AnimatedContent from "@/components/AnimatedContent";

const initialTalentWords = ["Talenti", "Esperti", "Innovatori", "Specialisti", "Consulenti"];

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
      <AnimatedContent
        distance={60}
        direction="vertical"
        duration={4.5}
        ease="power3.out"
        scale={0.65}
      >
        <div className="relative z-10 w-full max-w-5xl py-10 px-6 sm:px-10 bg-card/10 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
            <span className="inline">Connetti{' '}</span>
          <Button
            variant="ghost"
            className="inline-block align-baseline text-center
                       min-w-[170px] sm:min-w-[200px] md:min-w-[230px] lg:min-w-[260px]
                       h-auto
                       px-4 py-2.5
                       text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight
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
          <span className="inline">{' '}e Progetti BIM</span>
        </h1>

        <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Il marketplace italiano che unisce competenze BIM certificate con opportunità professionali concrete.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-6">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-primary-foreground/80 text-primary-foreground hover:bg-primary-foreground/10 hover:text-white group text-lg py-5 px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg w-full sm:w-auto"
          >
            <Link href={ROUTES.REGISTER_PROFESSIONAL}>
              <span className="flex items-center">
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent font-semibold">
                  Professionista BIM
                </span>
                <ArrowRight className="ml-2 h-5 w-5 text-teal-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
              </span>
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="default"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg py-5 px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg w-full sm:w-auto group"
          >
            <Link href={ROUTES.REGISTER_COMPANY}>
              Azienda o Studio
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <Button
            asChild
            size="default"
            variant="link"
            className="mt-5 text-base text-primary-foreground/80 hover:text-white group"
          >
            <Link href={ROUTES.HOW_IT_WORKS}>
              <HelpCircle className="mr-2 h-5 w-5" /> Come Funziona
            </Link>
        </Button>
        </div>
      </AnimatedContent>
    </div>
  );
}
