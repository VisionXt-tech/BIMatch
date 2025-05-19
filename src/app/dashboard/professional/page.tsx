
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { User, Search, Edit2, ListChecks, Bell } from 'lucide-react';

export default function ProfessionalDashboardPage() {
  const { userProfile } = useAuth();

  // Placeholder data - replace with actual data fetching
  const projectMatchesCount = 5; 
  const applicationsCount = 2; 
  const newNotificationsCount = 3;

  if (!userProfile || userProfile.role !== 'professional') {
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }
  
  const isProfileComplete = userProfile.bio && userProfile.bimSkills && userProfile.bimSkills.length > 0;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-3xl font-bold text-primary">{userProfile.firstName ? `Ciao, ${userProfile.firstName}!` : `Ciao, ${userProfile.displayName}!`}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">La tua dashboard per esplorare opportunità e gestire la tua carriera BIM.</CardDescription>
        </CardHeader>
        {!isProfileComplete && (
          <CardContent className="px-6 pt-0 pb-4"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-4 rounded-md" role="alert">
                <p className="font-bold text-md">Completa il tuo profilo!</p>
                <p className="text-sm">Un profilo completo aumenta le tue possibilità di trovare il progetto giusto. <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold">Le Tue Attività</CardTitle>
            <CardDescription>Monitora le tue interazioni e scopri nuove possibilità.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS} passHref legacyBehavior>
                <Button asChild size="lg" className="w-full">
                    <a className="flex flex-col items-center justify-center h-32 p-4 text-center">
                        <Search className="h-8 w-8 mb-2 text-primary-foreground" />
                        <span className="font-semibold">Cerca Nuovi Progetti</span>
                        <span className="text-xs text-primary-foreground/80 mt-1">{projectMatchesCount} compatibili</span>
                    </a>
                </Button>
            </Link>
            {/* Placeholder for Applications - implement when ready */}
            <Button variant="secondary" size="lg" className="w-full opacity-50 cursor-not-allowed">
                <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
                    <ListChecks className="h-8 w-8 mb-2 text-secondary-foreground" />
                    <span className="font-semibold">Le Mie Candidature</span>
                    <span className="text-xs text-secondary-foreground/80 mt-1">{applicationsCount} inviate (Prossimamente)</span>
                </div>
            </Button>
            {/* Placeholder for Notifications - implement when ready */}
            <Button variant="secondary" size="lg" className="w-full opacity-50 cursor-not-allowed">
                <div className="flex flex-col items-center justify-center h-32 p-4 text-center">
                    <Bell className="h-8 w-8 mb-2 text-secondary-foreground" />
                    <span className="font-semibold">Notifiche</span>
                    <span className="text-xs text-secondary-foreground/80 mt-1">{newNotificationsCount} non lette (Prossimamente)</span>
                </div>
            </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-semibold">Il Tuo Profilo</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
                <p className="text-md text-muted-foreground">Stato del profilo: <span className={isProfileComplete ? "font-semibold text-green-600" : "font-semibold text-yellow-600"}>{isProfileComplete ? "Completo" : "Incompleto"}</span></p>
                <p className="text-sm text-muted-foreground mt-1">Un profilo curato è il tuo miglior biglietto da visita.</p>
           </div>
           <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} passHref legacyBehavior>
            <Button asChild variant="outline" className="mt-4 sm:mt-0 self-start sm:self-center">
                <a className="flex items-center">
                <Edit2 className="mr-2 h-4 w-4" /> Aggiorna Profilo
                </a>
            </Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
