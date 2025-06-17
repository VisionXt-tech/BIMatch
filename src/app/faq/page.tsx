
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight, HelpCircle, Users, Building, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";

const faqData = [
  {
    category: "Generali",
    icon: HelpCircle,
    questions: [
      {
        q: "Cos'è BIMatch?",
        a: "BIMatch è una piattaforma online progettata per connettere professionisti del Building Information Modeling (BIM) con aziende e studi tecnici in Italia. Facilitiamo l'incontro tra domanda e offerta di competenze specializzate nel settore BIM.",
      },
      {
        q: "Come mi registro su BIMatch?",
        a: "Puoi registrarti gratuitamente cliccando sul pulsante 'Registrati' nella homepage o nella barra di navigazione. Scegli se registrarti come 'Professionista' o come 'Azienda' e segui le istruzioni per creare il tuo account.",
      },
      {
        q: "BIMatch è un servizio gratuito?",
        a: "La registrazione e la creazione del profilo sono gratuite sia per i professionisti che per le aziende. Anche la pubblicazione di progetti e la candidatura sono attualmente gratuite. Potremmo introdurre funzionalità premium in futuro.",
      },
      {
        q: "Come posso contattare il supporto di BIMatch?",
        a: "Se hai bisogno di assistenza, puoi contattarci tramite la pagina 'Contatti' del nostro sito web. Cercheremo di risponderti il prima possibile.",
      },
    ],
  },
  {
    category: "Per Professionisti BIM",
    icon: Users,
    questions: [
      {
        q: "Come posso creare un profilo efficace?",
        a: "Per creare un profilo che attiri le aziende, assicurati di compilare tutte le sezioni: informazioni personali, bio dettagliata, competenze BIM specifiche, software che conosci, livello di esperienza, disponibilità e, se possibile, link a portfolio, CV e profilo LinkedIn. Un profilo completo e curato aumenta significativamente le tue possibilità.",
      },
      {
        q: "Come mi candido per un progetto?",
        a: "Una volta trovato un progetto di tuo interesse, clicca sul pulsante 'Candidati'. Ti verrà chiesto di scrivere un messaggio di presentazione personalizzato per l'azienda, in cui puoi evidenziare perché sei la persona giusta per quel progetto. Puoi anche specificare competenze chiave e note sulla disponibilità.",
      },
      {
        q: "Posso vedere quali aziende hanno visualizzato il mio profilo?",
        a: "Attualmente questa funzionalità non è disponibile, ma stiamo valutando di implementarla in futuro per fornire maggiori insight ai professionisti.",
      },
      {
        q: "Come gestisco le proposte di colloquio?",
        a: "Riceverai una notifica per ogni proposta di colloquio. Dalla tua area notifiche, potrai accettare, rifiutare o proporre una data alternativa all'azienda.",
      },
    ],
  },
  {
    category: "Per Aziende e Studi Tecnici",
    icon: Building,
    questions: [
      {
        q: "Come posso pubblicare un'offerta di progetto?",
        a: "Dopo aver effettuato l'accesso come azienda, vai alla tua dashboard e cerca l'opzione 'Pubblica Nuovo Progetto'. Compila il modulo con tutti i dettagli richiesti: titolo, descrizione, competenze BIM, software, tipo di contratto, località, ecc.",
      },
      {
        q: "Come trovo i candidati giusti per i miei progetti?",
        a: "Una volta pubblicato un progetto, riceverai le candidature direttamente sulla piattaforma. Potrai visualizzare i profili dei professionisti che si sono candidati, i loro messaggi di presentazione e le competenze evidenziate. Attualmente, la ricerca attiva di professionisti è possibile tramite il Marketplace Professionisti.",
      },
      {
        q: "Posso contattare direttamente i professionisti?",
        a: "Al momento, l'interazione principale avviene tramite il sistema di candidature. Una volta che un professionista si candida, potrai comunicare con lui gestendo la sua candidatura (es. proponendo un colloquio). Funzionalità di messaggistica diretta potrebbero essere implementate in futuro.",
      },
      {
        q: "Come gestisco le candidature ricevute per un progetto?",
        a: "Dalla tua dashboard aziendale, nella sezione 'I Miei Progetti', puoi accedere alla lista dei candidati per ciascun progetto. Da lì potrai visualizzare i dettagli di ogni candidatura, preselezionare i candidati, proporre colloqui o rifiutare le candidature non idonee, inviando sempre una notifica al professionista.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="bg-gradient-to-br from-background via-sky-50 to-teal-50 min-h-screen py-12 md:py-20 animate-fadeIn">
      <div className="container mx-auto px-4">
        <Card className="shadow-xl bg-card/90 backdrop-blur-sm border-border/20">
          <CardHeader className="text-center border-b pb-6">
            <div className="inline-block p-4 bg-primary/10 rounded-full mx-auto mb-4">
                <HelpCircle className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary">
              Domande Frequenti (FAQ)
            </CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto mt-2">
              Trova qui le risposte alle domande più comuni su BIMatch. Se non trovi quello che cerchi, non esitare a <Link href={ROUTES.HOME} className="text-primary hover:underline font-medium">contattarci</Link>.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            {faqData.map((categoryItem) => (
              <div key={categoryItem.category} className="mb-10 last:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center">
                  <categoryItem.icon className="h-7 w-7 mr-3 text-primary" />
                  {categoryItem.category}
                </h2>
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {categoryItem.questions.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${categoryItem.category}-${index}`} className="bg-muted/40 hover:bg-muted/60 rounded-lg border border-border/50 transition-colors shadow-sm">
                      <AccordionTrigger className="px-5 py-4 text-left text-md md:text-lg font-semibold text-foreground/90 hover:no-underline">
                        <span className="flex-1">{faq.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-5 pb-5 pt-1 text-sm md:text-base text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
             <div className="mt-16 text-center">
                <p className="text-lg text-muted-foreground mb-4">Non hai trovato la risposta che cercavi?</p>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-all">
                    <Link href={ROUTES.HOME}> {/* Idealmente, ROUTES.CONTACT se esistesse */}
                        <MessageSquare className="mr-2 h-5 w-5"/> Contatta il Supporto
                    </Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
