
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { ArrowRight, UserPlus, Search, Users, Briefcase, FileText, Building, Zap, Brain, MapPin, ChevronDown, Lightbulb, CheckCircle, MessageSquare, Link as LinkIcon, Sparkles as SparklesIcon, ChevronRight, FolderPlus, Send, ClipboardList, CalendarCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react"; // Import React

const StepCard = ({ icon: Icon, title, description, imageSrc, imageHint, index }: { icon: React.ElementType, title: string, description: string, imageSrc: string, imageHint: string, index: number }) => (
  <Card 
    className="shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full bg-card/80 backdrop-blur-sm border-2 border-transparent hover:border-primary/30 group transform hover:-translate-y-1 hover:scale-[1.02] rounded-xl overflow-hidden animate-fadeIn"
    style={{ animationDelay: `${index * 0.15}s` }}
  >
    <div className="relative aspect-[16/9] overflow-hidden">
      <Image src={imageSrc} alt={title} fill style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-500" data-ai-hint={imageHint}/>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
       <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
         <div className="flex items-center text-primary-foreground mb-1">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mr-3 shadow-md">
                <Icon className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg font-semibold drop-shadow-md">{title}</CardTitle>
         </div>
       </div>
    </div>
    <CardContent className="flex-grow px-5 pb-5 pt-4">
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const BenefitItem = ({ icon: Icon, title, description, index }: { icon: React.ElementType, title: string, description: string, index: number }) => (
  <div 
    className="flex flex-col items-start p-5 md:p-6 bg-card rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 border border-border/30 animate-fadeIn"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <div className="flex-shrink-0 mb-3.5 bg-primary/10 p-3.5 rounded-full">
      <Icon className="h-8 w-8 text-primary" />
    </div>
    <div>
      <h4 className="font-semibold text-lg text-foreground/90 mb-1.5">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);


export default function HowItWorksPage() {
  const professionalSteps = [
    {
      icon: UserPlus,
      title: "1. Registrati e Crea il Profilo",
      description: "Mostra le tue competenze, esperienze e software. Un profilo dettagliato è il tuo biglietto da visita per attrarre le migliori offerte.",
      imageSrc: "https://images.unsplash.com/photo-1556155092-490a1ba16284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxTaWdudXB8ZW58MHx8fHwxNzUwMDg4OTUyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      imageHint: "profile creation"
    },
    {
      icon: Search,
      title: "2. Esplora Progetti e Candidati",
      description: "Filtra le offerte per località, competenze e tipo di contratto. Invia la tua candidatura con un messaggio personalizzato e mirato.",
      imageSrc: "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxleHBsb3JlfGVufDB8fHx8MTc1MDE0OTYxNHww&ixlib=rb-4.1.0&q=80&w=1080",
      imageHint: "project search"
    },
    {
      icon: MessageSquare,
      title: "3. Interagisci e Collabora",
      description: "Ricevi proposte di colloquio, gestisci le comunicazioni e avvia nuove, stimolanti collaborazioni con aziende leader del settore.",
      imageSrc: "https://images.unsplash.com/photo-1496115965489-21be7e6e59a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjb2xsYWJvcmF0aW9ufGVufDB8fHx8MTc1MDE0OTc3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      imageHint: "collaboration handshake"
    }
  ];

  const companySteps = [
    {
      icon: Briefcase,
      title: "1. Pubblica i Tuoi Progetti BIM",
      description: "Descrivi le tue esigenze, le competenze richieste e i dettagli del contratto in pochi semplici passaggi. Raggiungi un pubblico mirato.",
      imageSrc: "https://images.unsplash.com/photo-1674738326708-f3802e531e7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8QklNJTIwUHJvamVjdHxlbnwwfHx8fDE3NTAwODkyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      imageHint: "project posting"
    },
    {
      icon: FileText,
      title: "2. Ricevi e Valuta Candidature",
      description: "Accedi a profili dettagliati, messaggi di presentazione personalizzati e gestisci l'intero processo di selezione in modo efficiente.",
      imageSrc: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxFdmFsdWF0ZXxlbnwwfHx8fDE3NTAwODkzMTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      imageHint: "candidate review"
    },
    {
      icon: Users,
      title: "3. Connettiti con i Talenti",
      description: "Proponi colloqui, gestisci le offerte e trova i professionisti BIM ideali per portare innovazione e competenza nel tuo team.",
      imageSrc: "https://images.unsplash.com/photo-1655993810480-c15dccf9b3a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxDb25uZWN0fGVufDB8fHx8MTc1MDA4OTM1MXww&ixlib=rb-4.1.0&q=80&w=1080",
      imageHint: "team building"
    }
  ];
  
  const benefits = [
    {
      icon: Brain,
      title: "Matching Intelligente e Mirato",
      description: "I nostri algoritmi (futuri) e filtri avanzati ti aiutano a trovare le connessioni più rilevanti, risparmiando tempo e fatica."
    },
    {
      icon: Zap,
      title: "Processo Semplice e Veloce",
      description: "Un'interfaccia utente intuitiva e pulita per professionisti e aziende, dalla registrazione alla gestione delle collaborazioni."
    },
    {
      icon: MapPin,
      title: "Focus Esclusivo sul BIM Italiano",
      description: "Una piattaforma verticalizzata sul Building Information Modeling nel contesto italiano, per opportunità e talenti locali."
    },
    {
      icon: Users,
      title: "Community Specializzata e in Crescita",
      description: "Entra in un network esclusivo di professionisti BIM e aziende all'avanguardia, pronti a condividere e innovare."
    },
    {
      icon: Lightbulb,
      title: "Innovazione e Supporto Continuo",
      description: "Siamo costantemente al lavoro per migliorare la piattaforma e introdurre nuove funzionalità, ascoltando i feedback della community."
    },
    {
      icon: CheckCircle,
      title: "Opportunità Reali e Verificate",
      description: "Colleghiamo domanda e offerta di lavoro qualificato nel mondo BIM, facilitando collaborazioni di valore e successo."
    }
  ];

  const flowSteps = [
    { icon: UserPlus, title: "1. Registrazione", description: "Professionisti e aziende si iscrivono e creano i loro account personalizzati." },
    { icon: FileText, title: "2. Profilo / Progetto", description: "I professionisti arricchiscono il profilo, le aziende pubblicano progetti chiari e dettagliati." },
    { icon: Search, title: "3. Ricerca Mirata", description: "Si cercano attivamente opportunità o talenti utilizzando filtri specifici e parole chiave." },
    { icon: Send, title: "4. Candidatura / Selezione", description: "I professionisti inviano candidature mirate, le aziende valutano i profili più idonei." },
    { icon: MessageSquare, title: "5. Colloquio", description: "Si organizzano e svolgono colloqui per approfondire la conoscenza reciproca." },
    { icon: SparklesIcon, title: "6. BIMatch!", description: "La collaborazione inizia: un nuovo successo per entrambe le parti!" }
  ];


  return (
    <div className="bg-gradient-to-br from-background via-sky-50 to-teal-50 min-h-screen animate-fadeIn">
      {/* Hero Section */}
      <section className="py-20 md:py-28 text-center bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 Sbg-grid-pattern"></div>
        <div className="container mx-auto px-4 relative z-10">
          
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-6 animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            BIMatch: <span className="bg-gradient-to-r from-teal-600 via-cyan-500 to-sky-600 bg-clip-text text-transparent animate-custom-pulse" style={{animationDuration: '3s'}}>Semplice, Veloce, Efficace.</span>
          </h1>
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fadeIn"
            style={{ animationDelay: '0.3s' }}
          >
            Scopri come la nostra piattaforma rivoluziona l'incontro tra i professionisti BIM più qualificati e le aziende leader del settore, creando opportunità e sinergie uniche per il futuro delle costruzioni.
          </p>
          <div 
            className="animate-fadeIn" 
            style={{ animationDelay: '0.4s' }}
          >
            <Button 
              size="lg" 
              asChild 
              className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transform hover:scale-105 transition-all duration-300 px-10 py-3.5 text-lg rounded-lg"
            >
              <Link href={ROUTES.REGISTER_PROFESSIONAL}>
                Inizia Ora la Tua Avventura BIM <ArrowRight className="ml-2.5 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </Button>
          </div>
           <div 
            className="mt-16 animate-bounce" 
            style={{ animationDelay: '0.8s' }}
           >
            <ChevronDown className="h-10 w-10 text-primary/40 mx-auto" />
          </div>
        </div>
      </section>

      {/* Diagramma di Flusso BIMatch */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="default" className="text-base py-2 px-6 mb-4 font-semibold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-primary-foreground border-none shadow-lg tracking-wide animate-fadeIn" style={{animationDelay: '0.1s'}}>
              Il Percorso per un BIMatch di Successo
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight animate-fadeIn" style={{animationDelay: '0.2s'}}>Dalla Registrazione alla Collaborazione</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto animate-fadeIn" style={{animationDelay: '0.3s'}}>
              Un viaggio intuitivo che connette professionisti e aziende, passo dopo passo, verso il successo condiviso nel mondo BIM.
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-start md:items-stretch gap-y-8 md:gap-x-4 lg:gap-x-0">
            {flowSteps.map((step, index) => (
              <React.Fragment key={step.title}>
                <div 
                    className="flex flex-col items-center text-center w-full md:w-1/2 lg:w-1/3 xl:w-auto lg:flex-1 px-2 animate-fadeIn" 
                    style={{ animationDelay: `${0.1 * (index + 1)}s` }}
                >
                  <div className={cn("flex flex-col items-center p-5 bg-card rounded-xl shadow-lg h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1", step.title.includes("BIMatch!") && "border-2 border-teal-500")}>
                    <div className={cn("p-4 rounded-full mb-4", step.title.includes("BIMatch!") ? "bg-gradient-to-br from-teal-400 to-sky-500 shadow-xl" : "bg-primary/10")}>
                      <step.icon className={cn("h-10 w-10", step.title.includes("BIMatch!") ? "text-white" : "text-primary")} />
                    </div>
                    <h4 className={cn("font-semibold text-lg mb-1.5", step.title.includes("BIMatch!") && "text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-sky-600")}>{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {index < flowSteps.length - 1 && (
                  <div className="flex items-center justify-center h-full px-0 md:px-1 lg:px-2 w-full md:w-auto animate-fadeIn" style={{animationDelay: `${0.1 * (index + 1) + 0.05}s`}}>
                    <ChevronRight className="h-9 w-9 text-primary/30 hidden lg:block rtl:rotate-180" />
                    <ChevronDown className="h-9 w-9 text-primary/30 lg:hidden my-2 md:my-0" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>


      {/* For Professionals Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge 
                variant="default" 
                className="text-base py-2 px-6 mb-4 font-semibold bg-gradient-to-r from-teal-500 to-sky-500 text-primary-foreground border-none shadow-lg tracking-wide animate-fadeIn"
                style={{ animationDelay: '0.1s' }}
            >
                Per i Professionisti BIM
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight animate-fadeIn" style={{animationDelay: '0.2s'}}>Trova il Progetto Perfetto <br className="hidden sm:block"/> e Fai Brillare le Tue Competenze</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto animate-fadeIn" style={{animationDelay: '0.3s'}}>Dai slancio alla tua carriera connettendoti con opportunità su misura, valorizzando la tua expertise nel mondo del Building Information Modeling.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {professionalSteps.map((step, index) => (
              <StepCard key={step.title} {...step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
             <Badge 
                variant="default" 
                className="text-base py-2 px-6 mb-4 font-semibold bg-gradient-to-r from-sky-500 to-indigo-500 text-primary-foreground border-none shadow-lg tracking-wide animate-fadeIn"
                style={{ animationDelay: '0.1s' }}
            >
                Per Aziende e Studi Tecnici
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight animate-fadeIn" style={{animationDelay: '0.2s'}}>Trova i Talenti BIM Ideali <br className="hidden sm:block"/> per i Tuoi Progetti</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto animate-fadeIn" style={{animationDelay: '0.3s'}}>Accedi a un network di professionisti altamente qualificati, pronti a contribuire al successo e all'innovazione delle tue iniziative BIM.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {companySteps.map((step, index) => (
              <StepCard key={step.title} {...step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
             <Badge 
                variant="default" 
                className="text-base py-2 px-6 mb-4 font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-primary-foreground border-none shadow-lg tracking-wide animate-fadeIn"
                style={{ animationDelay: '0.1s' }}
            >
                I Vantaggi Esclusivi di BIMatch
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight animate-fadeIn" style={{animationDelay: '0.2s'}}>Perché Scegliere la Nostra Piattaforma?</h2>
            <p className="text-md md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto animate-fadeIn" style={{animationDelay: '0.3s'}}>BIMatch è progettato per offrirti un'esperienza mirata, efficiente e ricca di opportunità, trasformando il modo in cui professionisti e aziende si connettono nel settore BIM.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((benefit, index) => (
                <BenefitItem key={benefit.title} {...benefit} index={index}/>
            ))}
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-20 md:py-28 bg-gradient-to-tr from-sky-100 via-teal-50 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 animate-fadeIn"
            style={{ animationDelay: '0.1s' }}
          >
            Pronto per Rivoluzionare il Tuo Mondo BIM?
          </h2>
          <p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            Che tu sia un professionista in cerca della prossima sfida o un'azienda alla ricerca di talenti eccezionali, BIMatch è il tuo partner strategico per il successo.
          </p>
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-fadeIn"
            style={{ animationDelay: '0.3s' }}
          >
            <Button 
                asChild 
                size="lg" 
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-3.5 text-lg rounded-lg group w-full sm:w-auto"
            >
              <Link href={ROUTES.REGISTER_PROFESSIONAL}>
                <UserPlus className="mr-2.5 h-5 w-5" /> Sono un Professionista
              </Link>
            </Button>
            <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/5 hover:text-primary shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-3.5 text-lg rounded-lg group w-full sm:w-auto"
            >
              <Link href={ROUTES.REGISTER_COMPANY}>
                <Building className="mr-2.5 h-5 w-5" /> Sono un'Azienda
              </Link>
            </Button>
          </div>
          <p className="mt-12 text-sm text-primary/70 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            Dubbi? <Link href={ROUTES.FAQ} className="font-semibold underline hover:text-primary">Consulta le FAQ</Link> o <Link href="/contact" className="font-semibold underline hover:text-primary">contattaci</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
