
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-10 px-4 md:px-8 text-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-gray-900 dark:via-primary-950/20 dark:to-gray-850/10 rounded-2xl shadow-lg">
      <Zap className="h-16 w-16 text-primary mx-auto mb-8 animate-pulse" />
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-8 tracking-tight">
        BIMatch: Connettiamo Talenti e Progetti BIM.
      </h1>
      <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto mb-12">
        La piattaforma N°1 in Italia per professionisti BIM e aziende del settore AEC.
        Trova opportunità qualificate o i migliori talenti per i tuoi progetti.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <Button
          size="lg"
          asChild
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group text-lg py-7 transform hover:scale-[1.03] transition-transform duration-300"
        >
          <Link href={ROUTES.REGISTER_PROFESSIONAL}>
            Sei un Professionista?
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>

        <Button
          size="lg"
          asChild
          className="w-full bg-background text-accent border-2 border-accent hover:bg-accent/10 group text-lg py-7 transform hover:scale-[1.03] transition-transform duration-300"
        >
          <Link href={ROUTES.REGISTER_COMPANY}>
            Rappresenti un'Azienda?
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      <p className="mt-16 text-md text-foreground/60 max-w-xl mx-auto">
        Entra in BIMatch: dove le competenze incontrano le opportunità, e i progetti prendono forma.
      </p>
    </div>
  );
}
