
'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ROUTES, ROLES } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!userProfile || userProfile.role !== ROLES.ADMIN)) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== ROLES.ADMIN) {
    return (
        <div className="flex items-center justify-center h-full p-4">
            <Card className="max-w-md w-full text-center bg-destructive/10 border-destructive">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                        <ShieldAlert className="h-6 w-6"/> Accesso Negato
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Non disponi dei permessi necessari per visualizzare questa pagina. Verrai reindirizzato alla tua dashboard.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="w-full">
      <div className="p-4 space-y-6">
        {children}
      </div>
    </div>
  );
}
