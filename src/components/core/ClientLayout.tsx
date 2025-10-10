'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import CookieBanner from '@/components/core/CookieBanner';
import { usePathname } from 'next/navigation';
import LiquidEther from '@/components/LiquidEther';

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
              {/* Black background layer */}
              <div className="fixed inset-0 w-full h-full bg-black -z-10"></div>
              {/* Liquid Ether effect */}
              <div className="fixed inset-0 w-full h-full z-0">
                <LiquidEther
                  colors={['#000000', '#FFFFFF', '#008080']}
                  mouseForce={20}
                  cursorSize={100}
                  isViscous={false}
                  viscous={20}
                  iterationsViscous={32}
                  iterationsPoisson={32}
                  resolution={0.5}
                  isBounce={false}
                  autoDemo={true}
                  autoSpeed={0.3}
                  autoIntensity={2.0}
                  takeoverDuration={0.25}
                  autoResumeDelay={3000}
                  autoRampDuration={0.6}
                />
              </div>
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