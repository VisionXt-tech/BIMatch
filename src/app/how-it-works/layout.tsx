
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Come Funziona BIMatch | Piattaforma per Professionisti e Aziende BIM',
  description: 'Scopri come BIMatch facilita l incontro tra professionisti BIM qualificati e aziende in cerca di talento. Registrati, cerca progetti o candidati, e inizia a collaborare.',
  openGraph: {
    title: 'Come Funziona BIMatch | Piattaforma per Professionisti e Aziende BIM',
    description: 'Scopri il funzionamento di BIMatch: la tua guida per connetterti con il mondo del Building Information Modeling in Italia.',
    images: [
        {
          url: '/og-how-it-works.png', // Assicurati di avere un immagine OpenGraph per questa pagina in /public
          width: 1200,
          height: 630,
          alt: 'BIMatch - Come Funziona la Piattaforma',
        },
      ],
  }
};

export default function HowItWorksLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
