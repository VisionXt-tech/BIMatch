
'use client'; // Add this directive at the top

import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import FullScreenLoginLoader from '@/components/core/FullScreenLoginLoader'; // Import the new loader

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
});

// Note: 'export const metadata' is still respected for Server Components further up the tree
// or for the initial static export if this component were to be treated as such.
// However, with 'use client', this component and its children operate on the client-side.
// For dynamic metadata based on client-side state, you'd typically use `useEffect` and `document.title` etc.
// For this app, metadata is largely static or handled by dynamic segment layouts.
// export const metadata: Metadata = { // This will now generate a warning if `RootLayout` is a Client Component.
//   title: 'BIMatch - Connettiamo Talenti BIM e Aziende',
//   description: 'BIMatch: la piattaforma per professionisti BIM e aziende del settore edilizio in Italia.',
// };

// New intermediary component to consume AuthContext
function AuthConsumerForLayout({ children }: { children: React.ReactNode }) {
  const { isLoggingIn } = useAuth();

  if (isLoggingIn) {
    return <FullScreenLoginLoader />;
  }

  return (
    <main className="flex-grow relative flex flex-col">
      {children}
    </main>
  );
}

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
            <AuthConsumerForLayout>
              {children}
            </AuthConsumerForLayout>
            <Footer />
            <Toaster />
          </AuthProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
