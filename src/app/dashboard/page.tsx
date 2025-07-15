'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ROUTES, ROLES } from '@/constants';

export default function DashboardRedirectPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile) {
      if (userProfile.role === ROLES.PROFESSIONAL) {
        router.replace(ROUTES.DASHBOARD_PROFESSIONAL);
      } else if (userProfile.role === ROLES.COMPANY) {
        router.replace(ROUTES.DASHBOARD_COMPANY);
      } else if (userProfile.role === ROLES.ADMIN) {
        router.replace(ROUTES.DASHBOARD_ADMIN);
      } else {
        // Fallback or for other roles
        router.replace(ROUTES.HOME);
      }
    } else if (!loading && !userProfile) {
      // If not loading and no profile (e.g. not logged in), redirect to login
      router.replace(ROUTES.LOGIN);
    }
  }, [userProfile, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <svg className="animate-spin h-12 w-12 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg text-muted-foreground">Reindirizzamento alla dashboard...</p>
      </div>
    </div>
  );
}
