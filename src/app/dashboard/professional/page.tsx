
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { User, Briefcase, Bell, Search } from 'lucide-react';
import Image from 'next/image';

export default function ProfessionalDashboardPage() {
  const { userProfile } = useAuth();

  // Placeholder data - replace with actual data fetching
  const projectMatchesCount = 5; // Example
  const newNotificationsCount = 2; // Example

  if (!userProfile || userProfile.role !== 'professional') {
    // This should ideally be handled by the layout, but as a fallback:
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }
  
  const isProfileComplete = userProfile.bio && userProfile.bimSkills && userProfile.bimSkills.length > 0;


  return (
    <div className="space-y-2">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md">
        <CardHeader className="pb-1 px-4 pt-3">
          <CardTitle className="text-xl font-bold text-primary">{userProfile.firstName ? `Ciao, ${userProfile.firstName}!` : `Ciao, ${userProfile.displayName}!`}</CardTitle>
          <CardDescription className="text-base">Benvenuto nella tua dashboard BIMatch. Qui puoi gestire il tuo profilo e trovare nuove opportunità.</CardDescription>
        </CardHeader>
        {!isProfileComplete && (
          <CardContent className="px-4 pt-0 pb-2"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert">
                <p className="font-bold">Completa il tuo profilo!</p>
                <p className="text-sm">Un profilo completo aumenta le tue possibilità di trovare il progetto giusto. <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-1">
            <CardTitle className="text-sm font-medium">Progetti Compatibili</CardTitle>
            <Search className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pt-0 pb-2"> 
            <div className="text-2xl font-bold">{projectMatchesCount}</div>
            <p className="text-xs text-muted-foreground">
              Progetti che corrispondono alle tue competenze.
            </p>
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-0 text-primary text-xs">
                <a>Visualizza Progetti</a>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-1">
            <CardTitle className="text-sm font-medium">Il Mio Profilo</CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pt-0 pb-2"> 
            <div className="text-2xl font-bold">{isProfileComplete ? "Completo" : "Incompleto"}</div>
            <p className="text-xs text-muted-foreground">
              Mantieni il tuo profilo aggiornato.
            </p>
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-0 text-primary text-xs">
                <a>Gestisci Profilo</a>
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-1">
            <CardTitle className="text-sm font-medium">Notifiche</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pt-0 pb-2">
            <div className="text-2xl font-bold">{newNotificationsCount}</div>
            <p className="text-xs text-muted-foreground">
              Nuovi messaggi o aggiornamenti.
            </p>
            <Link href="#" passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-0 text-primary text-xs">
                 <a>Visualizza Notifiche</a>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
