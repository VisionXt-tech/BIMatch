import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-r from-primary/10 via-background to-primary/10 rounded-lg shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">
            Benvenuto in BIMatch
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-8">
            La piattaforma leader in Italia per connettere professionisti BIM qualificati con le migliori aziende del settore edilizio. Trova il talento giusto o il progetto perfetto.
          </p>
          <div className="space-x-4">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={ROUTES.REGISTER_PROFESSIONAL}>Sono un Professionista</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10">
              <Link href={ROUTES.REGISTER_COMPANY}>Sono un'Azienda</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">Come Funziona BIMatch</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Registrati e Crea il Tuo Profilo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Professionisti: mettete in mostra competenze, software e disponibilità. Aziende: presentate la vostra attività e cultura.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Search className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Cerca e Pubblica Progetti</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Aziende: pubblicate i vostri progetti BIM specificando i requisiti. Professionisti: esplorate le opportunità disponibili.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Connettiti e Collabora</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Il nostro algoritmo avanzato facilita il match perfetto. Ricevi notifiche e inizia a collaborare ai progetti più innovativi.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-muted/50 rounded-lg">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-foreground">Perché Scegliere BIMatch?</h2>
            <ul className="space-y-4 text-foreground/90">
              <li className="flex items-start">
                <Briefcase className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
                <span>Accesso a un network specializzato di talenti e aziende BIM in Italia.</span>
              </li>
              <li className="flex items-start">
                <Users className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
                <span>Matching intelligente basato su competenze, software, localizzazione e disponibilità.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" />
                <span>Processo di candidatura semplificato e gestione intuitiva dei progetti.</span>
              </li>
            </ul>
            <Button size="lg" asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={ROUTES.LOGIN}>Inizia Ora</Link>
            </Button>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://picsum.photos/600/400?random=1" 
              alt="Professionisti BIM al lavoro" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="construction professionals" 
            />
          </div>
        </div>
      </section>
    </div>
  );
}
