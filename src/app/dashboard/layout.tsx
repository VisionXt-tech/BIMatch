
'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import EmailVerificationBanner from '@/components/core/EmailVerificationBanner';

const NAVBAR_HEIGHT_CSS_VAR_VALUE = "4rem";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false} forceFullWidthContent={true}>
      <Sidebar disableDisplay={true}>
        {/* Sidebar content is fully removed as it's no longer used */}
      </Sidebar>
      <SidebarInset
        style={{ marginTop: `var(--main-content-area-margin-top, ${NAVBAR_HEIGHT_CSS_VAR_VALUE})` }}
        className="overflow-y-auto"
      >
        <div className="px-4 md:px-6 lg:px-8 pt-4 pb-6 min-h-full">
          <EmailVerificationBanner />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
