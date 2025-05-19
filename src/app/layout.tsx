
import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';
import { FirebaseProvider } from '@/contexts/FirebaseContext';

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
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
      <body className={`${raleway.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <FirebaseProvider>
          <AuthProvider>
            <Navbar />
            {/* Main content area now allows children to define their own height and background */}
            <main className="flex-grow relative flex flex-col">
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
