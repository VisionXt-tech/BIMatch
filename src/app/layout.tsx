import type { Metadata } from 'next';
import { Raleway } from 'next/font/google'; // Importato Raleway
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';
import { FirebaseProvider } from '@/contexts/FirebaseContext';

// Configurazione del font Raleway
const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway', // Definisce una variabile CSS per Raleway
});

export const metadata: Metadata = {
  title: 'BIMatch - Connettiamo Talenti BIM e Aziende',
  description: 'BIMatch: la piattaforma per professionisti BIM e aziende del settore edilizio in Italia.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      {/* Applica la classe del font Raleway al body */}
      <body className={`${raleway.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <FirebaseProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
