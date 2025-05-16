
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, Building, UserCheck, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] py-12 px-4 text-center">
      {/* Hero Section Unificata */}
      <Zap className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-6 tracking-tight">
        BIMatch: Connettiamo Talenti e Progetti BIM.
      </h1>
      <p className="text-lg md:text-xl text-foreground/75 max-w-3xl mx-auto mb-12">
        La piattaforma N°1 in Italia per professionisti BIM e aziende del settore AEC.
        Trova opportunità qualificate o i migliori talenti per i tuoi progetti.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
        <Card className="bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-primary rounded-xl flex flex-col">
          <CardHeader className="pt-8 items-center">
            <UserCheck className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-2xl font-semibold text-primary">
              Sei un Professionista BIM?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-foreground/70 mb-6">
              Valorizza le tue competenze, trova progetti stimolanti e fai crescere la tua carriera.
            </p>
          </CardContent>
          <CardContent>
            <Button size="lg" asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group text-lg py-7">
              <Link href={ROUTES.REGISTER_PROFESSIONAL}>
                Scopri Opportunità <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-xl hover:shadow-2xl transition-shadow duration-300 border-t-4 border-accent rounded-xl flex flex-col">
          <CardHeader className="pt-8 items-center">
            <Building className="h-12 w-12 text-accent mb-4" />
            <CardTitle className="text-2xl font-semibold text-accent">
              Rappresenti un'Azienda?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-foreground/70 mb-6">
              Pubblica i tuoi progetti e accedi a un network di professionisti BIM qualificati.
            </p>
          </CardContent>
          <CardContent>
            <Button size="lg" asChild className="w-full bg-background text-accent border-2 border-accent hover:bg-accent/10 group text-lg py-7">
              <Link href={ROUTES.REGISTER_COMPANY}>
                Trova Talenti <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <p className="text-md text-foreground/60">
          Entra in BIMatch: dove le competenze incontrano le opportunità, e i progetti prendono forma.
        </p>
      </div>
    </div>
  );
}
