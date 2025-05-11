
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, Search, FileText, Handshake, BrainCircuit, UserCheck, SearchCheck, Building, ArrowRight, Star, Zap, Target, UserPlus, Award, Network, Lightbulb, Sparkles, Building2Icon, CheckCircle, Milestone, Quote, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const FeatureCard = ({ icon: Icon, title, description, className = "" }: { icon: React.ElementType, title: string, description: string, className?: string }) => (
  <Card className={`text-center shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col bg-card ${className}`}>
    <CardHeader className="pt-8">
      <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 ring-2 ring-primary/20">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <CardTitle className="text-xl font-semibold text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow">
      <CardDescription className="text-foreground/75">{description}</CardDescription>
    </CardContent>
  </Card>
);

const BenefitPill = ({ icon: Icon, text, color = "primary" }: { icon: React.ElementType, text: string, color?: "primary" | "secondary" }) => (
  <div className={`flex items-center p-3 rounded-lg shadow-md ${color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/20 text-secondary-foreground'}`}>
    <Icon className="h-6 w-6 mr-3 shrink-0" />
    <span className="font-medium">{text}</span>
  </div>
);


export default function HomePage() {
  return (
    <div className="space-y-20 md:space-y-32">
      {/* Hero Section */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 text-center bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <Zap className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-primary mb-6 tracking-tight">
            Il Tuo Prossimo Progetto BIM Inizia Qui.
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-12">
            BIMatch è la piattaforma innovativa che connette i migliori professionisti BIM con le aziende leader del settore edile in Italia. Semplice, Veloce, Efficace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-primary">
              <CardHeader>
                <UserCheck className="h-10 w-10 text-primary mx-auto mb-3" />
                <CardTitle className="text-2xl font-semibold text-primary">Sei un Professionista BIM?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-6">Trova incarichi, mostra competenze e fai crescere la tua carriera.</p>
                <Button size="lg" asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group">
                  <Link href={ROUTES.REGISTER_PROFESSIONAL}>
                    Scopri Opportunità <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-accent">
              <CardHeader>
                <Building className="h-10 w-10 text-accent mx-auto mb-3" />
                <CardTitle className="text-2xl font-semibold text-accent">Rappresenti un'Azienda?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/75 mb-6">Accedi a un network di talenti BIM specializzati per i tuoi progetti.</p>
                 <Button size="lg" asChild className="w-full bg-background text-primary border-primary hover:bg-primary/10 group">
                  <Link href={ROUTES.REGISTER_COMPANY}>
                    Trova Talenti <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why BIMatch Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Perché Scegliere <span className="text-primary">BIMatch</span>?</h2>
          <p className="text-center text-lg text-foreground/70 mb-12 max-w-2xl mx-auto">Siamo più di una semplice job board. Siamo il tuo partner strategico per il successo nel mondo BIM.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Target} 
              title="Connessioni Mirate" 
              description="Il nostro algoritmo intelligente analizza profili e requisiti per proporti solo abbinamenti di alta qualità, risparmiandoti tempo prezioso."
              className="border-primary/30"
            />
            <FeatureCard 
              icon={Network} 
              title="Network Esclusivo" 
              description="Entra in una community selezionata di professionisti BIM verificati e aziende innovative, leader nel panorama italiano."
              className="border-primary/30"
            />
            <FeatureCard 
              icon={Lightbulb} 
              title="Crescita e Innovazione" 
              description="Offriamo strumenti, risorse e opportunità per far evolvere la tua carriera o il tuo team, spingendo l'innovazione nel settore."
              className="border-primary/30"
            />
          </div>
        </div>
      </section>

      {/* For Professionals Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden shadow-2xl group order-last md:order-first">
            <Image 
              src="https://picsum.photos/seed/proHeroBIM/800/600" 
              alt="Professionista BIM che progetta con software avanzato" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="BIM architect designing"
              className="transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
             <div className="absolute bottom-0 left-0 p-6 md:p-8">
                <h3 className="text-2xl font-semibold text-white mb-2">Progetti su Misura per Te</h3>
                <p className="text-primary-foreground/90">Valorizza la tua expertise unica.</p>
            </div>
          </div>
          <div>
            <Sparkles className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Professionista <span className="text-primary">BIM</span>? La Tua Carriera Decolla Qui.</h2>
            <p className="text-lg text-foreground/80 mb-8">
              Sei un talento del Building Information Modeling? BIMatch è il trampolino di lancio per la tua crescita. Metti in mostra le tue capacità uniche, trova progetti stimolanti e collabora con aziende all&apos;avanguardia che cercano esattamente la tua expertise.
            </p>
            <div className="space-y-4 mb-10">
              <BenefitPill icon={FileText} text="Crea un profilo che brilla: portfolio, competenze, certificazioni." />
              <BenefitPill icon={SearchCheck} text="Accedi a progetti esclusivi, filtrati per le tue specializzazioni." />
              <BenefitPill icon={Zap} text="Ricevi notifiche smart per le opportunità che contano davvero per te." />
            </div>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}>
                Inizia la Tua Ricerca <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Award className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Azienda <span className="text-primary">Edile</span>? Trova i Talenti BIM che Fanno la Differenza.</h2>
            <p className="text-lg text-foreground/80 mb-8">
              Il successo dei tuoi progetti BIM più ambiziosi dipende dalle persone giuste. Con BIMatch, accedi a un database ricco e mirato di professionisti qualificati, pronti a integrare il tuo team e portare innovazione e competenza.
            </p>
            <div className="space-y-4 mb-10">
              <BenefitPill icon={UserPlus} text="Pubblica offerte di progetto dettagliate e raggiungi candidati ideali." color="secondary" />
              <BenefitPill icon={Users} text="Esplora profili verificati con portfolio e referenze concrete." color="secondary" />
              <BenefitPill icon={BrainCircuit} text="Utilizza filtri avanzati per trovare le competenze specifiche che ti servono." color="secondary" />
            </div>
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}>
                Pubblica un Progetto Ora <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          <div className="relative h-96 md:h-[500px] rounded-xl overflow-hidden shadow-2xl group">
            <Image 
              src="https://picsum.photos/seed/BIMconstruction/800/1000" 
              alt="Team di professionisti BIM in cantiere" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="BIM construction"
              className="transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
             <div className="absolute bottom-0 right-0 p-6 md:p-8 text-right">
                <h3 className="text-2xl font-semibold text-white mb-2">Il Team BIM Perfetto</h3>
                <p className="text-primary-foreground/90">Costruisci oggi il futuro della tua azienda.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Milestone className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">Inizia con <span className="text-primary">BIMatch</span>: È Semplice.</h2>
           <p className="text-center text-lg text-foreground/70 mb-12 max-w-2xl mx-auto">Tre passaggi per sbloccare un mondo di opportunità BIM.</p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={UserPlus} 
              title="1. Registrati e Illumina" 
              description="Professionisti: create un profilo che racconti la vostra storia e competenze. Aziende: presentate la vostra mission e i progetti che definiscono il futuro." 
            />
            <FeatureCard 
              icon={Search} 
              title="2. Esplora e Conquista" 
              description="Aziende: pubblicate i vostri progetti e attirate i migliori talenti. Professionisti: navigate tra le offerte e trovate la sfida che fa per voi." 
            />
            <FeatureCard 
              icon={Handshake} 
              title="3. Connettiti e Realizza" 
              description="Sfruttate la piattaforma per comunicare, candidarvi e avviare collaborazioni vincenti. Il futuro del BIM è a portata di click." 
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4">
          <Quote className="h-12 w-12 text-primary mx-auto mb-4 transform scale-x-[-1]" />
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">La Voce della Nostra <span className="text-primary">Community</span></h2>
          <p className="text-center text-lg text-foreground/70 mb-12 max-w-2xl mx-auto">Scopri cosa dicono professionisti e aziende che hanno scelto BIMatch.</p>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card flex flex-col">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="https://picsum.photos/seed/testimonial1/100/100" alt="Marco Bianchi" data-ai-hint="professional male" />
                    <AvatarFallback>MB</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold">Marco Bianchi</CardTitle>
                    <CardDescription>BIM Specialist, Milano</CardDescription>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, s_idx) => <Star key={s_idx} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <blockquote className="text-foreground/80 italic">
                  &quot;Grazie a BIMatch ho trovato un progetto incredibilmente stimolante che si allineava perfettamente con le mie competenze in Revit e Dynamo. Piattaforma intuitiva e team di supporto eccellente!&quot;
                </blockquote>
              </CardContent>
            </Card>
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card flex flex-col">
              <CardHeader>
                 <div className="flex items-center mb-2">
                  <Avatar className="h-12 w-12 mr-4">
                     <AvatarImage src="https://picsum.photos/seed/testimonial2/100/100" alt="Architetti Associati Srl" data-ai-hint="company building" />
                    <AvatarFallback>AA</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold">Architetti Associati Srl</CardTitle>
                    <CardDescription>Studio di Architettura, Roma</CardDescription>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, s_idx) => <Star key={s_idx} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <blockquote className="text-foreground/80 italic">
                  &quot;Trovare BIM Coordinator con esperienza specifica era una sfida. BIMatch ci ha permesso di connetterci rapidamente con professionisti qualificati, accelerando il nostro processo di selezione.&quot;
                </blockquote>
              </CardContent>
            </Card>
            <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card flex flex-col">
               <CardHeader>
                <div className="flex items-center mb-2">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="https://picsum.photos/seed/testimonial3/100/100" alt="Elena Rossi" data-ai-hint="professional female" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-semibold">Elena Rossi</CardTitle>
                    <CardDescription>Junior BIM Modeler, Napoli</CardDescription>
                  </div>
                </div>
                <div className="flex">
                  {[...Array(4)].map((_, s_idx) => <Star key={s_idx} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                  <Star className="h-5 w-5 text-yellow-400/50" />
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <blockquote className="text-foreground/80 italic">
                  &quot;Come neolaureata, temevo di non trovare opportunità. Su BIMatch ho creato un profilo dettagliato e ho subito ricevuto proposte per tirocini e posizioni junior. Consigliatissimo!&quot;
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Companies Placeholder Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 text-foreground/80">Collaboriamo con Aziende Leader e Studi Innovativi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center opacity-75">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-center" data-ai-hint="company logo generic">
                <Building2Icon className="h-16 w-auto text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Final CTA Section */}
      <section className="py-20 md:py-28 text-center bg-primary rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto a Trasformare il Tuo Futuro nel <span className="underline decoration-wavy decoration-accent">BIM</span>?
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-12">
            Unisciti oggi a BIMatch. Che tu stia cercando il tuo prossimo grande progetto o il talento ideale per rivoluzionare la tua azienda, la tua ricerca inizia e finisce qui.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row justify-center items-center">
            <Button size="lg" asChild className="bg-background text-primary hover:bg-background/90 w-full md:w-auto shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link href={ROUTES.REGISTER_PROFESSIONAL}> <User className="mr-2 h-5 w-5"/> Registrati come Professionista</Link>
            </Button>
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Link href={ROUTES.REGISTER_COMPANY}> <Building className="mr-2 h-5 w-5"/> Registra la Tua Azienda</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
