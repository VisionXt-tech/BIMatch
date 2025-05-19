
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Building, Briefcase, Users, FolderPlus, Edit2 } from 'lucide-react';

export default function CompanyDashboardPage() {
  const { userProfile } = useAuth();

  // Placeholder data - replace with actual data fetching
  const activeProjectsCount = 3; 
  const newCandidatesCount = 12; 

  if (!userProfile || userProfile.role !== 'company') {
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }
  
  const isProfileComplete = userProfile.companyDescription && userProfile.industry;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-3xl font-bold text-primary">Benvenuta, {userProfile.companyName || userProfile.displayName}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">Questa è la tua dashboard BIMatch per gestire progetti e talenti.</CardDescription>
        </CardHeader>
         {!isProfileComplete && (
          <CardContent className="px-6 pt-0 pb-4"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-4 rounded-md" role="alert">
                <p className="font-bold text-md">Completa il profilo aziendale!</p>
                <p className="text-sm">Un profilo dettagliato attira i migliori professionisti. <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold">Azioni Rapide</CardTitle>
            <CardDescription>Gestisci le attività principali della tua azienda.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT} passHref legacyBehavior>
                <Button asChild size="lg" className="w-full">
                    <a className="flex flex-col items-center justify-center h-32 p-4 text-center">
                        <FolderPlus className="h-8 w-8 mb-2 text-primary-foreground" />
                        <span className="font-semibold">Pubblica Nuovo Progetto</span>
                        <span className="text-xs text-primary-foreground/80 mt-1">Crea e lancia nuove offerte</span>
                    </a>
                </Button>
            </Link>
             <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS} passHref legacyBehavior>
                <Button asChild variant="secondary" size="lg" className="w-full">
                     <a className="flex flex-col items-center justify-center h-32 p-4 text-center">
                        <Briefcase className="h-8 w-8 mb-2 text-secondary-foreground" />
                        <span className="font-semibold">Gestisci Progetti</span>
                        <span className="text-xs text-secondary-foreground/80 mt-1">{activeProjectsCount} attivi</span>
                    </a>
                </Button>
            </Link>
             <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=candidates`} passHref legacyBehavior>
                <Button asChild variant="secondary" size="lg" className="w-full">
                    <a className="flex flex-col items-center justify-center h-32 p-4 text-center">
                        <Users className="h-8 w-8 mb-2 text-secondary-foreground" />
                        <span className="font-semibold">Visualizza Candidati</span>
                        <span className="text-xs text-secondary-foreground/80 mt-1">{newCandidatesCount} nuove candidature</span>
                    </a>
                </Button>
            </Link>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-semibold">Profilo Aziendale</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
           <div>
                <p className="text-md text-muted-foreground">Stato del profilo: <span className={isProfileComplete ? "font-semibold text-green-600" : "font-semibold text-yellow-600"}>{isProfileComplete ? "Completo" : "Incompleto"}</span></p>
                <p className="text-sm text-muted-foreground mt-1">Mantieni aggiornate le informazioni per massimizzare la visibilità.</p>
           </div>
           <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} passHref legacyBehavior>
            <Button asChild variant="outline" className="mt-4 sm:mt-0 self-start sm:self-center">
                <a className="flex items-center">
                <Edit2 className="mr-2 h-4 w-4" /> Modifica Profilo
                </a>
            </Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
