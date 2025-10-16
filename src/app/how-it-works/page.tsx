'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { ArrowRight, UserPlus, Search, MessageSquare, Briefcase, FileText, Users, Brain, Zap, MapPin, CheckCircle, Building, ChevronDown } from "lucide-react";
import Link from "next/link";
import ScrollFloat from "@/components/ScrollFloat";
import React, { useEffect } from "react";
import { motion } from "framer-motion";

const StepCard = ({ icon: Icon, title, description, imageSrc, index }: { icon: React.ElementType, title: string, description: string, imageSrc: string, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{
      duration: 0.6,
      delay: index * 0.15,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
    whileHover={{
      y: -10,
      transition: { duration: 0.3, ease: "easeOut" }
    }}
  >
    <Card className="shadow-md hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full bg-black border border-white group overflow-hidden rounded-xl">
      <motion.div
        className="relative aspect-[16/9] overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.4 }}
      >
        <motion.img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 2xl:p-6">
          <div className="flex items-center text-white">
            <motion.div
              className="bg-white/20 backdrop-blur-sm p-2 sm:p-2.5 2xl:p-3 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 2xl:h-6 2xl:w-6 text-white" />
            </motion.div>
            <h3 className="text-sm sm:text-base lg:text-lg font-bold leading-tight hyphens-manual break-normal max-w-[90%]">{title}</h3>
          </div>
        </div>
      </motion.div>
      <CardContent className="flex-grow p-4 sm:p-5 md:p-6 2xl:p-7">
        <p className="text-sm sm:text-base 2xl:text-lg text-white leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const BenefitItem = ({ icon: Icon, title, description, index }: { icon: React.ElementType, title: string, description: string, index: number }) => (
  <motion.div
    className="flex flex-col items-center text-center p-5 sm:p-6 2xl:p-8 bg-black rounded-xl border border-white h-full group cursor-pointer"
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{
      duration: 0.5,
      delay: index * 0.1,
      ease: "easeOut"
    }}
    whileHover={{
      scale: 1.05,
      borderColor: "rgba(255, 255, 255, 1)",
      boxShadow: "0 0 30px rgba(255, 255, 255, 0.3)",
      transition: { duration: 0.3 }
    }}
  >
    <motion.div
      className="flex-shrink-0 mb-3 sm:mb-4 2xl:mb-5 bg-white/10 p-3 sm:p-4 2xl:p-5 rounded-full"
      whileHover={{
        scale: 1.2,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        rotate: [0, -10, 10, -10, 0],
        transition: { duration: 0.5 }
      }}
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7 2xl:h-8 2xl:w-8 text-white" />
    </motion.div>
    <h4 className="font-bold text-base lg:text-lg text-white mb-2 2xl:mb-3 leading-tight">
      {title}
    </h4>
    <p className="text-sm sm:text-base 2xl:text-lg text-white leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const ProcessStep = ({ icon: Icon, number, title, description }: { icon: React.ElementType, number: number, title: string, description: string }) => (
  <motion.div
    className="sticky top-24 bg-black rounded-xl md:rounded-2xl border border-white shadow-lg p-6 sm:p-8 md:p-10 lg:p-12 2xl:p-14 mb-6 md:mb-8 2xl:mb-10"
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5, delay: number * 0.1 }}
    whileHover={{ scale: 1.02, boxShadow: "0 20px 60px rgba(255, 255, 255, 0.1)" }}
  >
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 2xl:gap-8">
      <div className="flex-shrink-0">
        <div className="relative">
          <motion.div
            className="bg-white/10 p-4 sm:p-5 md:p-6 2xl:p-7 rounded-xl md:rounded-2xl"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 2xl:h-14 2xl:w-14 text-white" />
          </motion.div>
          <div className="absolute -top-2 -right-2 bg-white text-black w-7 h-7 sm:w-8 sm:h-8 2xl:w-9 2xl:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm 2xl:text-base font-bold">
            {number}
          </div>
        </div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 md:mb-3 2xl:mb-4 leading-tight hyphens-manual break-normal">{title}</h3>
        <p className="text-base sm:text-lg 2xl:text-xl text-white leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default function HowItWorksPage() {
  useEffect(() => {
    // Aggiungi stili CSS per invertire i colori di Navbar e Footer solo in questa pagina
    const style = document.createElement('style');
    style.id = 'how-it-works-inverted-colors';
    style.innerHTML = `
      /* Inverti colori Navbar */
      nav, header {
        background-color: black !important;
        border-color: white !important;
      }

      nav *, header * {
        color: white !important;
      }

      nav a, header a, nav button, header button {
        color: white !important;
      }

      nav a:hover, header a:hover, nav button:hover, header button:hover {
        color: rgba(255, 255, 255, 0.8) !important;
      }

      nav svg, header svg {
        color: white !important;
      }

      /* Inverti colori Footer */
      footer {
        background-color: black !important;
        border-color: white !important;
      }

      footer * {
        color: white !important;
      }

      footer a {
        color: white !important;
      }

      footer a:hover {
        color: rgba(255, 255, 255, 0.8) !important;
      }

      footer svg {
        color: white !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup: rimuovi gli stili quando si esce dalla pagina
    return () => {
      const styleElement = document.getElementById('how-it-works-inverted-colors');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  const professionalSteps = [
    {
      icon: UserPlus,
      title: "Crea il Tuo Profilo",
      description: "Registrati in pochi minuti e mostra le tue competenze BIM, certificazioni e portfolio. Il tuo profilo è la chiave per attrarre le migliori opportunità.",
      imageSrc: "https://images.unsplash.com/photo-1556155092-490a1ba16284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxTaWdudXB8ZW58MHx8fHwxNzUwMDg4OTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      icon: Search,
      title: "Trova Progetti",
      description: "Esplora progetti BIM filtrati per competenze, località e tipo di contratto. Candidati con un messaggio personalizzato che mette in evidenza il tuo valore.",
      imageSrc: "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxleHBsb3JlfGVufDB8fHx8MTc1MDE0OTYxNHww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      icon: MessageSquare,
      title: "Avvia Collaborazioni",
      description: "Ricevi proposte di colloquio, gestisci le comunicazioni direttamente in piattaforma e inizia nuove collaborazioni con aziende leader del settore.",
      imageSrc: "https://images.unsplash.com/photo-1496115965489-21be7e6e59a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjb2xsYWJvcmF0aW9ufGVufDB8fHx8MTc1MDE0OTc3N3ww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const companySteps = [
    {
      icon: Briefcase,
      title: "Pubblica Progetti",
      description: "Crea annunci dettagliati specificando competenze richieste, budget e tempistiche. Raggiungi professionisti BIM qualificati in tutta Italia.",
      imageSrc: "https://images.unsplash.com/photo-1674738326708-f3802e531e7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8QklNJTIwUHJvamVjdHxlbnwwfHx8fDE3NTAwODkyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      icon: FileText,
      title: "Valuta Candidature",
      description: "Accedi a profili completi con competenze, certificazioni e portfolio. Filtra e seleziona i candidati più adatti per il tuo progetto in modo efficiente.",
      imageSrc: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxFdmFsdWF0ZXxlbnwwfHx8fDE3NTAwODkzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      icon: Users,
      title: "Costruisci il Team",
      description: "Proponi colloqui, gestisci le offerte e completa il tuo team con professionisti BIM che portano innovazione e competenza ai tuoi progetti.",
      imageSrc: "https://images.unsplash.com/photo-1655993810480-c15dccf9b3a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxDb25uZWN0fGVufDB8fHx8MTc1MDA4OTM1MXww&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "Matching Intelligente",
      description: "Algoritmi avanzati che connettono professionisti e aziende in base a competenze, esperienza e requisiti specifici."
    },
    {
      icon: Zap,
      title: "Processo Veloce",
      description: "Interfaccia intuitiva che semplifica ogni fase: dalla registrazione alla gestione delle collaborazioni."
    },
    {
      icon: MapPin,
      title: "Focus BIM Italia",
      description: "Piattaforma specializzata nel settore BIM italiano, con opportunità e talenti locali pronti a collaborare."
    },
    {
      icon: CheckCircle,
      title: "Opportunità Verificate",
      description: "Progetti e profili autentici verificati per garantire connessioni di qualità e collaborazioni di successo."
    }
  ];

  const processSteps = [
    {
      icon: UserPlus,
      title: "Registrazione",
      description: "Crea il tuo account professionale o aziendale in pochi minuti. Inserisci le informazioni di base e verifica la tua email per iniziare."
    },
    {
      icon: FileText,
      title: "Completa il Profilo",
      description: "Aggiungi competenze BIM, certificazioni, portfolio e CV per i professionisti. Le aziende inseriscono informazioni aziendali e requisiti di progetto."
    },
    {
      icon: Search,
      title: "Cerca Opportunità",
      description: "Esplora progetti BIM per professionisti o trova talenti qualificati per le aziende. Filtra per competenze, località e tipo di collaborazione."
    },
    {
      icon: MessageSquare,
      title: "Candidati e Connettiti",
      description: "Invia candidature personalizzate o valuta profili dei candidati. Gestisci le comunicazioni direttamente sulla piattaforma."
    },
    {
      icon: CheckCircle,
      title: "Colloquio e Selezione",
      description: "Programma colloqui, proponi e accetta date. Valuta le competenze e trova il match perfetto per il tuo progetto o carriera."
    },
    {
      icon: Zap,
      title: "Avvia la Collaborazione",
      description: "Finalizza l'accordo e inizia a collaborare. BIMatch ti supporta in ogni fase per garantire il successo del progetto."
    }
  ];

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="max-w-5xl 2xl:max-w-6xl mx-auto">
            <ScrollFloat
              containerClassName="mb-6 2xl:mb-8"
              textClassName="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight"
              animationDuration={1}
              ease="power2.out"
              scrollStart="top bottom"
              scrollEnd="center center"
              stagger={0.02}
            >
              Come Funziona BIMatch
            </ScrollFloat>

            <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl text-white max-w-3xl 2xl:max-w-4xl mx-auto mb-16 md:mb-20 2xl:mb-24 px-4">
              La piattaforma che connette i migliori professionisti BIM con le aziende leader del settore
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-10 h-14 border-[3px] border-white rounded-full flex items-start justify-center pt-2 shadow-2xl shadow-white/20">
                  <div className="w-2 h-3 bg-white rounded-full animate-scroll-dot"></div>
                </div>
              </div>
              <span className="text-sm sm:text-base font-medium text-white animate-bounce-slow">Scorri per scoprire</span>
            </div>
          </div>
        </div>
      </section>

      {/* Process Stack Section */}
      <section id="process-section" className="py-16 sm:py-20 lg:py-24 2xl:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="text-center mb-12 md:mb-16 2xl:mb-20 max-w-4xl 2xl:max-w-5xl mx-auto">
            <ScrollFloat
              containerClassName="mb-4 2xl:mb-6"
              textClassName="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug hyphens-none break-words"
              animationDuration={1}
              ease="power2.out"
              scrollStart="top bottom"
              scrollEnd="center center"
              stagger={0.02}
            >
              Il Processo in 6 Passi
            </ScrollFloat>
            <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl text-white px-4">Dal primo accesso alla collaborazione di successo</p>
          </div>

          <div className="max-w-5xl 2xl:max-w-6xl mx-auto">
            {processSteps.map((step, index) => (
              <ProcessStep
                key={step.title}
                number={index + 1}
                {...step}
              />
            ))}
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-16 sm:py-20 lg:py-24 2xl:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="text-center mb-12 md:mb-16 2xl:mb-20 max-w-4xl 2xl:max-w-5xl mx-auto">
            <ScrollFloat
              containerClassName="mb-4 2xl:mb-6"
              textClassName="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug hyphens-none break-words"
              animationDuration={1}
              ease="power2.out"
              scrollStart="top bottom"
              scrollEnd="center center"
              stagger={0.02}
            >
              Per Professionisti BIM
            </ScrollFloat>
            <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl text-white px-4">Trova progetti che valorizzano le tue competenze</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 2xl:gap-10 max-w-7xl 2xl:max-w-[1600px] mx-auto">
            {professionalSteps.map((step, index) => (
              <StepCard key={step.title} {...step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-16 sm:py-20 lg:py-24 2xl:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="text-center mb-12 md:mb-16 2xl:mb-20 max-w-4xl 2xl:max-w-5xl mx-auto">
            <ScrollFloat
              containerClassName="mb-4 2xl:mb-6"
              textClassName="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug hyphens-none break-words"
              animationDuration={1}
              ease="power2.out"
              scrollStart="top bottom"
              scrollEnd="center center"
              stagger={0.02}
            >
              Per Aziende e Studi
            </ScrollFloat>
            <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl text-white px-4">Accedi ai migliori talenti BIM in Italia</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 2xl:gap-10 max-w-7xl 2xl:max-w-[1600px] mx-auto">
            {companySteps.map((step, index) => (
              <StepCard key={step.title} {...step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24 2xl:py-32 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16">
          <div className="text-center mb-12 md:mb-16 2xl:mb-20 max-w-4xl 2xl:max-w-5xl mx-auto">
            <ScrollFloat
              containerClassName="mb-4 2xl:mb-6"
              textClassName="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-snug hyphens-none break-words"
              animationDuration={1}
              ease="power2.out"
              scrollStart="top bottom"
              scrollEnd="center center"
              stagger={0.02}
            >
              Vantaggi
            </ScrollFloat>
            <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl text-white px-4">La piattaforma pensata per il settore BIM italiano</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 2xl:gap-8 max-w-7xl 2xl:max-w-[1600px] mx-auto">
            {benefits.map((benefit, index) => (
              <BenefitItem key={benefit.title} {...benefit} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 sm:py-20 md:py-28 2xl:py-36 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 2xl:px-16 text-center">
          <div className="max-w-4xl 2xl:max-w-5xl mx-auto">
            <ScrollFloat
              containerClassName="mb-6 2xl:mb-8"
              textClassName="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-snug hyphens-none break-words"
              animationDuration={1}
              ease="power2.out"
              scrollStart="top bottom"
              scrollEnd="center center"
              stagger={0.02}
            >
              Inizia Oggi, Free
            </ScrollFloat>

            <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl text-white mb-3 max-w-3xl 2xl:max-w-4xl mx-auto px-4">
              Unisciti a centinaia di professionisti e aziende che stanno già collaborando
            </p>

            <p className="text-sm sm:text-base text-white/60 mb-10 md:mb-12 px-4">
              ✓ Registrazione gratuita  ✓ Nessuna carta richiesta  ✓ Attivazione immediata
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 2xl:gap-6 px-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="bg-white text-black hover:bg-[#008080] hover:text-white shadow-lg hover:shadow-[0_0_40px_rgba(0,128,128,0.4)] w-full sm:w-auto min-w-[200px] 2xl:min-w-[240px] 2xl:text-lg 2xl:px-8 2xl:py-6 transition-all duration-300 font-semibold">
                  <Link href={ROUTES.REGISTER_PROFESSIONAL} className="flex items-center justify-center">
                    <UserPlus className="mr-2 h-5 w-5 2xl:h-6 2xl:w-6" /> Sono un Professionista
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="bg-transparent border-2 border-white text-white hover:!bg-white hover:!text-black shadow-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] w-full sm:w-auto min-w-[200px] 2xl:min-w-[240px] 2xl:text-lg 2xl:px-8 2xl:py-6 transition-all duration-300 font-semibold">
                  <Link href={ROUTES.REGISTER_COMPANY} className="flex items-center justify-center">
                    <Building className="mr-2 h-5 w-5 2xl:h-6 2xl:w-6" /> Cerco Talenti
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
