
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Search, FileSearch, Handshake, BrainCircuit, UserCheck, SearchCheck, Building, ArrowRight, Star, Zap, Target, UserPlus, CircleCheckBig, Building2Icon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <CardHeader>
      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <CardTitle className="text-xl font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

const BenefitItem = ({ icon: Icon, text }: { icon: React.ElementType, text: string }) => (
  <li className="flex items-start">
    <Icon className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
    <span>{text}</span>
  </li>
);


export default function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-secondary/10 rounded-lg shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-6">
            Connetti Talenti e Progetti BIM
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-10">
            BIMatch è la piattaforma leader in Italia che unisce professionisti BIM qualificati con le aziende più innovative del settore edilizio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-card p-6 rounded-lg shadow-lg border border-primary/20">
              <h2 className="text-2xl font-semibold text-primary mb-3">Per Professionisti BIM</h2>
              <p className="text-foreground/70 mb-4">Trova incarichi, mostra le tue competenze e fai crescere la tua carriera.</p>
              <Button size="lg" asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={ROUTES.REGISTER_PROFESSIONAL}>Inizia la Tua Ricerca <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-lg border border-primary/20">
              <h2 className="text-2xl font-semibold text-primary mb-3">Per Aziende Edilizie</h2>
              <p className="text-foreground/70 mb-4">Accedi a un network di talenti BIM specializzati e trova le risorse perfette per i tuoi progetti.</p>
              <Button size="lg" variant="outline" asChild className="w-full border-primary text-primary hover:bg-primary/10">
                <Link href={ROUTES.REGISTER_COMPANY}>Pubblica un Progetto <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl order-last md:order-first">
            <Image 
              src="https://picsum.photos/seed/proHero/600/400" 
              alt="Professionista BIM al lavoro su un progetto complesso" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="BIM professional architect" 
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Potenzia la Tua Carriera <span className="text-primary">BIM</span></h2>
            <p className="text-lg text-foreground/80 mb-6">
              BIMatch ti apre le porte a un mondo di opportunità. Che tu sia un modellatore, un coordinator o un manager BIM, la nostra piattaforma è progettata per te.
            </p>
            <ul className="space-y-4 text-foreground/90 mb-8">
              <BenefitItem icon={Target} text="Accedi a progetti BIM esclusivi da aziende leader in Italia." />
              <BenefitItem icon={UserCheck} text="Crea un profilo dettagliato che valorizzi le tue competenze e la tua esperienza." />
              <BenefitItem icon={Zap} text="Ricevi notifiche per opportunità in linea con il tuo profilo e le tue aspirazioni." />
              <BenefitItem icon={Briefcase} text="Semplifica il processo di candidatura e gestisci le tue proposte in un unico posto." />
            </ul>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}>Esplora i Progetti <Search className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-12 bg-muted/50 rounded-lg">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Trova i Migliori Talenti <span className="text-primary">BIM</span></h2>
            <p className="text-lg text-foreground/80 mb-6">
              Il successo dei tuoi progetti BIM dipende dalle persone giuste. BIMatch ti connette con professionisti qualificati e pronti a fare la differenza.
            </p>
            <ul className="space-y-4 text-foreground/90 mb-8">
              <BenefitItem icon={FileSearch} text="Pubblica offerte di progetto dettagliate e raggiungi un pubblico mirato." />
              <BenefitItem icon={Users} text="Sfoglia profili di professionisti BIM con competenze verificate e portfolio." />
              <BenefitItem icon={SearchCheck} text="Utilizza filtri avanzati per trovare candidati con specifiche esperienze e software." />
              <BenefitItem icon={Building} text="Semplifica il tuo processo di recruiting e costruisci team BIM di eccellenza." />
            </ul>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}>Pubblica un Progetto <UserPlus className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
          <div className="relative h-80 md:h-96 rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://picsum.photos/seed/companyHero/600/400" 
              alt="Team di professionisti BIM che collaborano in ufficio" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="office team collaboration" 
            />
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Funzionalità <span className="text-primary">Chiave</span> di BIMatch</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={BrainCircuit} 
              title="Matching Intelligente" 
              description="Il nostro algoritmo avanzato analizza competenze, esperienza e requisiti di progetto per suggerire i migliori abbinamenti." 
            />
            <FeatureCard 
              icon={UserCheck} 
              title="Profili Dettagliati" 
              description="Professionisti e aziende possono creare profili completi per presentarsi al meglio e facilitare la scelta." 
            />
            <FeatureCard 
              icon={SearchCheck} 
              title="Ricerca Avanzata" 
              description="Filtri potenti per localizzazione, software, competenze e tipo di contratto, per trovare esattamente ciò che cerchi." 
            />
            <FeatureCard 
              icon={Briefcase} 
              title="Gestione Semplificata" 
              description="Dashboard intuitive per professionisti e aziende per gestire progetti, candidature e comunicazioni." 
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 bg-gradient-to-br from-secondary/10 via-background to-primary/10 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Come Funziona <span className="text-primary">BIMatch</span> in 3 Semplici Passi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={UserPlus} 
              title="1. Registrati e Crea" 
              description="Professionisti: valorizzate le vostre competenze. Aziende: presentate la vostra vision e i vostri progetti." 
            />
            <FeatureCard 
              icon={FileSearch} 
              title="2. Esplora e Pubblica" 
              description="Aziende: pubblicate i dettagli dei vostri progetti. Professionisti: cercate le opportunità più adatte a voi." 
            />
            <FeatureCard 
              icon={Handshake} 
              title="3. Connettiti e Collabora" 
              description="Utilizzate la piattaforma per comunicare, candidarvi e avviare collaborazioni di successo nel mondo BIM." 
            />
          </div>
        </div>
      </section>

      {/* Construction Sector Focus Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-6">
            <Building2Icon className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Al Servizio del Settore <span className="text-primary">Edile</span>
          </h2>
          <p className="text-lg text-foreground/80 max-w-3xl mx-auto mb-10">
            BIMatch è dedicato a supportare l'innovazione e la crescita nel settore delle costruzioni in Italia, facilitando l'incontro tra domanda e offerta di competenze BIM specializzate. Siamo il ponte tra i professionisti del futuro e le aziende che costruiscono il domani.
          </p>
          <div className="relative h-80 md:h-96 lg:h-[500px] max-w-5xl mx-auto rounded-lg overflow-hidden shadow-xl border-4 border-primary/20">
            <Image
              src="https://picsum.photos/seed/constructionSite/1200/800"
              alt="Immagine rappresentativa di un cantiere edile moderno con tecnologia BIM"
              layout="fill"
              objectFit="cover"
              data-ai-hint="modern construction site"
              className="transform hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
             <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 shadow-text">Innovazione nell'Edilizia</h3>
              <p className="text-md md:text-lg text-primary-foreground/90 max-w-xl shadow-text">Colleghiamo professionisti e aziende per progetti BIM all'avanguardia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (Placeholder) */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">Dicono di <span className="text-primary">Noi</span></h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                <CardContent className="pt-6">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, s_idx) => <Star key={s_idx} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <blockquote className="text-foreground/80 italic mb-4">
                    &quot;BIMatch ha rivoluzionato il modo in cui troviamo collaboratori BIM. Altamente raccomandato! (Testimonianza Placeholder)&quot;
                  </blockquote>
                  <p className="font-semibold text-primary">Nome Azienda/Professionista {i}</p>
                  <p className="text-sm text-muted-foreground">Ruolo/Settore (Placeholder)</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 text-center bg-primary rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto per Entrare nel Futuro del Lavoro BIM?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
            Unisciti oggi a BIMatch. Che tu stia cercando il tuo prossimo progetto o il talento ideale, la tua ricerca inizia qui.
          </p>
          <div className="space-x-0 md:space-x-4 space-y-4 md:space-y-0 flex flex-col md:flex-row justify-center items-center">
            <Button size="lg" asChild className="bg-background text-primary hover:bg-muted/90 w-full md:w-auto">
              <Link href={ROUTES.REGISTER_PROFESSIONAL}>Sono un Professionista</Link>
            </Button>
            <Button size="lg" asChild className="bg-background text-primary hover:bg-muted/90 w-full md:w-auto border-primary-foreground">
              <Link href={ROUTES.REGISTER_COMPANY}>Sono un'Azienda</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
