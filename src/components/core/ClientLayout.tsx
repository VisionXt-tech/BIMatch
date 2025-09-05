'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext'; 
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/core/Navbar';
import Footer from '@/components/core/Footer';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import Image from 'next/image';
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
        <div className="relative min-h-screen flex flex-col">
          {isHomePage && (
            <>
              <Image
                src="https://images.unsplash.com/photo-1635776062360-af423602aff3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxHUkFESUVOVHxlbnwwfHx8fDE3NTI4NDczMTl8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Abstract BIM model background"
                fill
                className="object-cover -z-20"
                priority
                data-ai-hint="collaboration handshake"
              />
              <div className="absolute inset-0 bg-black/50 -z-10"></div>
            </>
          )}
          <Navbar />
          <main className="flex-1 relative flex flex-col">
            {children}
          </main>
          <Footer />
          <Toaster />
        </div>
      </AuthProvider>
    </FirebaseProvider>
  );
}