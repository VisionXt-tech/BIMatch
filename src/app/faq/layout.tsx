
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'FAQ | BIMatch - Risposte alle Tue Domande',
  description: 'Trova risposte alle domande più frequenti su BIMatch. Scopri come funziona la registrazione, la ricerca di progetti, la candidatura e molto altro per professionisti e aziende.',
  openGraph: {
    title: 'FAQ | BIMatch - Domande Frequenti',
    description: 'Tutto quello che devi sapere su BIMatch: risposte chiare e dirette per professionisti e aziende del settore BIM.',
    // images: ['/og-faq.png'], // Assicurati di avere un'immagine OpenGraph per questa pagina
  }
};

export default function FaqLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
