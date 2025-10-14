
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/core/ClientLayout';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'BIMatch - La Piattaforma N°1 per Professionisti BIM e Aziende in Italia',
  description: 'Trova i migliori talenti BIM o le opportunità di lavoro più interessanti. BIMatch connette professionisti specializzati in Building Information Modeling con aziende e studi di progettazione in tutta Italia.',
  keywords: [
    'BIM', 'Building Information Modeling', 'lavoro BIM Italia', 'professionisti BIM', 
    'Revit', 'ArchiCAD', 'Navisworks', 'ingegneri BIM', 'architetti BIM', 
    'BIM Coordinator', 'BIM Manager', 'progettazione 3D', 'costruzioni digitali'
  ],
  authors: [{ name: 'BIMatch Team' }],
  creator: 'BIMatch',
  publisher: 'BIMatch',
  metadataBase: new URL('https://bimatch.it'),
  icons: {
    icon: '/BIM.png',
    apple: '/BIM.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BIMatch - Connetti Talenti BIM con Opportunità',
    description: 'La piattaforma italiana specializzata per professionisti BIM e aziende del settore edile.',
    url: 'https://bimatch.it',
    siteName: 'BIMatch',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'BIMatch - Piattaforma BIM Italia',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BIMatch - La Piattaforma N°1 per BIM in Italia',
    description: 'Connetti i migliori talenti BIM con le opportunità più interessanti in Italia.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'technology',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${figtree.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <ClientLayout>
          {children}
        </ClientLayout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
