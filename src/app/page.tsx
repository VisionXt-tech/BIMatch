
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-grow text-center px-4 md:px-8">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8 tracking-tight">
        Fai Match con Talenti e Progetti BIM
      </h1>
      <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-12">
        La piattaforma N°1 in Italia per professionisti BIM e aziende.
        Trova opportunità o i migliori talenti.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-md mb-12">
        <Button
          size="lg"
          asChild
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground group text-base py-7 px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg"
        >
          <Link href={ROUTES.REGISTER_PROFESSIONAL}>
            Sei un Professionista?
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>

        <Button
          size="lg"
          asChild
          variant="outline"
          className="w-full sm:w-auto bg-background text-primary border-2 border-primary hover:bg-primary/5 group text-base py-7 px-8 transform hover:scale-[1.03] transition-transform duration-300 shadow-md rounded-lg"
        >
          <Link href={ROUTES.REGISTER_COMPANY}>
            Sei un'Azienda?
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      <p className="text-base text-foreground/60 max-w-xl mx-auto">
        Entra in BIMatch: dove le competenze incontrano le opportunità.
      </p>
    </div>
  );
}
