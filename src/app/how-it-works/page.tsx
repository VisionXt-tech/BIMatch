
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTES } from "@/constants";
import { ArrowRight, UserPlus, Search, Users, Briefcase, FileText, Building, Zap, Brain, MapPin, ChevronDown, Lightbulb } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const StepCard = ({ icon: Icon, title, description, imageSrc, imageHint }: { icon: React.ElementType, title: string, description: string, imageSrc: string, imageHint: string }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full bg-card/80 backdrop-blur-sm border-border/50">
    <CardHeader className="pb-3 pt-4 px-4">
      <div className="flex items-center text-primary mb-2">
        <Icon className="h-7 w-7 mr-3" />
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex-grow px-4 pb-4">
      <div className="aspect-[16/9] rounded-md overflow-hidden mb-3 border border-muted">
        <Image src={imageSrc} alt={title} width={400} height={225} className="object-cover w-full h-full" data-ai-hint={imageHint}/>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const BenefitItem = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg shadow-sm hover:bg-muted/50 transition-colors">
    <div className="flex-shrink-0 mt-1">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <h4 className="font-semibold text-md text-foreground/90">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);


export default function HowItWorksPage() {
  return (
    <div className="bg-gradient-to-b from-background via-secondary/20 to-background min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center bg-transparent">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 animate-fadeIn">
            BIMatch: <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 bg-clip-text text-transparent">Semplice, Veloce, Efficace.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Scopri come la nostra piattaforma connette i professionisti BIM con le aziende leader del settore, creando opportunità e sinergie uniche.
          </p>
          <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Button size="lg" asChild className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform">
              <Link href={ROUTES.REGISTER_PROFESSIONAL}>
                Inizia Ora la Tua Avventura BIM <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
           <div className="mt-12 animate-bounce" style={{ animationDelay: '0.8s' }}>
            <ChevronDown className="h-8 w-8 text-primary/50 mx-auto" />
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="text-sm py-1 px-3 mb-3 border-primary/30 text-primary bg-primary/5">Per i Professionisti BIM</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Trova il Progetto Perfetto per Te</h2>
            <p className="text-md text-muted-foreground mt-3 max-w-xl mx-auto">Dai slancio alla tua carriera connettendoti con opportunità su misura per le tue competenze.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <StepCard
              icon={UserPlus}
              title="1. Registrati e Crea il Profilo"
              description="Mostra le tue competenze, esperienze e software. Un profilo dettagliato è il tuo biglietto da visita per attrarre le migliori offerte."
              imageSrc="https://images.unsplash.com/photo-1556155092-490a1ba16284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxTaWdudXB8ZW58MHx8fHwxNzUwMDg4OTUyfDA&ixlib=rb-4.1.0&q=80&w=1080"
              imageHint="profile creation"
            />
            <StepCard
              icon={Search}
              title="2. Esplora Progetti e Candidati"
              description="Filtra le offerte per località, competenze e tipo di contratto. Invia la tua candidatura con un messaggio personalizzato e mirato."
              imageSrc="https://placehold.co/600x400.png"
              imageHint="project search"
            />
            <StepCard
              icon={Users}
              title="3. Fatti Notare e Collabora"
              description="Ricevi proposte di colloquio, gestisci le comunicazioni e avvia nuove, stimolanti collaborazioni con aziende leader del settore."
              imageSrc="https://placehold.co/600x400.png"
              imageHint="collaboration handshake"
            />
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-12 md:py-20 bg-muted/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <Badge variant="outline" className="text-sm py-1 px-3 mb-3 border-primary/30 text-primary bg-primary/5">Per Aziende e Studi Tecnici</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Trova i Talenti BIM che Cerchi</h2>
            <p className="text-md text-muted-foreground mt-3 max-w-xl mx-auto">Accedi a un network di professionisti qualificati pronti a contribuire al successo dei tuoi progetti.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <StepCard
              icon={Briefcase}
              title="1. Pubblica i Tuoi Progetti BIM"
              description="Descrivi le tue esigenze, le competenze richieste e i dettagli del contratto in pochi semplici passaggi. Raggiungi un pubblico mirato."
              imageSrc="https://images.unsplash.com/photo-1674738326708-f3802e531e7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxNXx8QklNJTIwUHJvamVjdHxlbnwwfHx8fDE3NTAwODkyNjd8MA&ixlib=rb-4.1.0&q=80&w=1080"
              imageHint="project posting"
            />
            <StepCard
              icon={FileText}
              title="2. Ricevi e Valuta Candidature"
              description="Accedi a profili dettagliati, messaggi di presentazione personalizzati e gestisci l'intero processo di selezione in modo efficiente."
              imageSrc="https://placehold.co/600x400.png"
              imageHint="candidate review"
            />
            <StepCard
              icon={Building}
              title="3. Connettiti con i Migliori"
              description="Proponi colloqui, gestisci le offerte e trova i professionisti BIM ideali per portare innovazione e competenza nel tuo team."
              imageSrc="https://placehold.co/600x400.png"
              imageHint="team building"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
             <Badge variant="outline" className="text-sm py-1 px-3 mb-3 border-accent/50 text-accent bg-accent/10">I Vantaggi di BIMatch</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Perché Scegliere la Nostra Piattaforma?</h2>
            <p className="text-md text-muted-foreground mt-3 max-w-xl mx-auto">BIMatch è progettato per offrirti un'esperienza mirata ed efficiente.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <BenefitItem
              icon={Brain}
              title="Matching Intelligente"
              description="I nostri algoritmi ti aiutano a trovare le connessioni più rilevanti in base a competenze, esperienza e requisiti specifici."
            />
            <BenefitItem
              icon={Zap}
              title="Processo Semplificato"
              description="Un'interfaccia utente intuitiva per professionisti e aziende, dalla registrazione alla gestione delle collaborazioni."
            />
            <BenefitItem
              icon={MapPin}
              title="Focus sul Mercato Italiano"
              description="Una piattaforma dedicata al contesto BIM italiano, per opportunità e talenti locali."
            />
            <BenefitItem
              icon={Users}
              title="Community Specializzata"
              description="Entra in un network esclusivo di professionisti BIM e aziende all'avanguardia del settore."
            />
             <BenefitItem
              icon={Lightbulb}
              title="Innovazione Continua"
              description="Siamo costantemente al lavoro per migliorare la piattaforma e introdurre nuove funzionalità utili per te."
            />
             <BenefitItem
              icon={Briefcase}
              title="Opportunità Reali"
              description="Colleghiamo domanda e offerta di lavoro qualificato nel mondo BIM, facilitando collaborazioni di valore."
            />
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-secondary/20 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Pronto per Rivoluzionare il Tuo Mondo BIM?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Che tu sia un professionista in cerca della prossima sfida o un'azienda alla ricerca di talenti, BIMatch è il tuo partner ideale.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6">
            <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg transform hover:scale-105 transition-transform">
              <Link href={ROUTES.REGISTER_PROFESSIONAL}>
                <UserPlus className="mr-2 h-5 w-5" /> Sono un Professionista
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/5 hover:text-primary shadow-lg transform hover:scale-105 transition-transform">
              <Link href={ROUTES.REGISTER_COMPANY}>
                <Building className="mr-2 h-5 w-5" /> Sono un'Azienda
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

