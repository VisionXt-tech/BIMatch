
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { User, Search, Bell } from 'lucide-react';
// Removed Briefcase and Image imports as the action card is removed

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
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md">
        <CardHeader className="pb-3 px-6 pt-6">
          <CardTitle className="text-2xl font-bold text-primary">{userProfile.firstName ? `Ciao, ${userProfile.firstName}!` : `Ciao, ${userProfile.displayName}!`}</CardTitle>
          <CardDescription className="text-md">Benvenuto nella tua dashboard BIMatch. Qui puoi gestire il tuo profilo e trovare nuove opportunità.</CardDescription>
        </CardHeader>
        {!isProfileComplete && (
          <CardContent className="px-6 pt-0 pb-4"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert">
                <p className="font-bold">Completa il tuo profilo!</p>
                <p className="text-sm">Un profilo completo aumenta le tue possibilità di trovare il progetto giusto. <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-md font-semibold">Progetti Compatibili</CardTitle>
            <Search className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0"> 
            <div className="text-3xl font-bold">{projectMatchesCount}</div>
            <p className="text-sm text-muted-foreground">
              Progetti che corrispondono alle tue competenze.
            </p>
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-1 text-primary text-sm hover:underline">
                <a>Visualizza Progetti</a>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-md font-semibold">Il Mio Profilo</CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0"> 
            <div className="text-3xl font-bold">{isProfileComplete ? "Completo" : "Incompleto"}</div>
            <p className="text-sm text-muted-foreground">
              Mantieni il tuo profilo aggiornato.
            </p>
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-1 text-primary text-sm hover:underline">
                <a>Gestisci Profilo</a>
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
            <CardTitle className="text-md font-semibold">Notifiche</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-bold">{newNotificationsCount}</div>
            <p className="text-sm text-muted-foreground">
              Nuovi messaggi o aggiornamenti.
            </p>
            <Link href="#" passHref legacyBehavior> 
              <Button variant="link" asChild className="px-0 pt-1 text-primary text-sm hover:underline">
                 <a>Visualizza Notifiche</a>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
