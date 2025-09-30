'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import CookieBanner from '@/components/core/CookieBanner';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <FirebaseProvider>
      <AuthProvider>
        <div className="relative flex flex-col min-h-screen">
          {isHomePage && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black -z-20"></div>
              <div className="absolute inset-0 bg-black/50 -z-10"></div>
            </>
          )}
          <Navbar />
          <main className="flex-1 relative flex flex-col">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <Toaster />
        </div>
      </AuthProvider>
    </FirebaseProvider>
  );
}