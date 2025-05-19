
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Building, Briefcase, Users, FolderPlus } from 'lucide-react';
import Image from 'next/image';


export default function CompanyDashboardPage() {
  const { userProfile } = useAuth();

  // Placeholder data - replace with actual data fetching
  const activeProjectsCount = 3; // Example
  const newCandidatesCount = 12; // Example

  if (!userProfile || userProfile.role !== 'company') {
    // This should ideally be handled by the layout, but as a fallback:
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }
  
  const isProfileComplete = userProfile.companyDescription && userProfile.industry;

  return (
    <div className="space-y-2">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-primary/10 shadow-md">
        <CardHeader className="pb-1 px-4 pt-3">
          <CardTitle className="text-xl font-bold text-primary">Benvenuta, {userProfile.companyName || userProfile.displayName}!</CardTitle>
          <CardDescription className="text-base">Gestisci i tuoi progetti BIM e trova i migliori talenti sulla tua dashboard BIMatch.</CardDescription>
        </CardHeader>
         {!isProfileComplete && (
          <CardContent className="px-4 pt-0 pb-2"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert">
                <p className="font-bold">Completa il profilo aziendale!</p>
                <p className="text-sm">Un profilo dettagliato attira i migliori professionisti. <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-1">
            <CardTitle className="text-sm font-medium">Progetti Attivi</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pt-0 pb-2"> 
            <div className="text-2xl font-bold">{activeProjectsCount}</div>
            <p className="text-xs text-muted-foreground">
              Progetti BIM attualmente pubblicati.
            </p>
            <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-0 text-primary text-xs">
                <a>Gestisci Progetti</a>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-1">
            <CardTitle className="text-sm font-medium">Nuovi Candidati</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pt-0 pb-2">
            <div className="text-2xl font-bold">{newCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">
              Professionisti interessati ai tuoi progetti.
            </p>
            <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS} passHref legacyBehavior>
               <a className="px-0 pt-0 text-primary text-xs underline-offset-4 hover:underline">
                Visualizza Candidati
              </a>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-1">
            <CardTitle className="text-sm font-medium">Profilo Azienda</CardTitle>
            <Building className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pt-0 pb-2">
            <div className="text-2xl font-bold">{isProfileComplete ? "Completo" : "Incompleto"}</div>
            <p className="text-xs text-muted-foreground">
              Mantieni il profilo della tua azienda aggiornato.
            </p>
            <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-0 text-primary text-xs">
                <a>Modifica Profilo</a>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="px-4 pt-3 pb-1">
          <CardTitle className="text-lg">Trova il Talento BIM Perfetto</CardTitle>
          <CardDescription className="text-sm">Pubblica i tuoi progetti e connettiti con professionisti qualificati in tutta Italia.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-2 items-center p-2 pt-1">
           <div>
            <p className="mb-2 text-sm text-foreground/90">
              BIMatch semplifica la ricerca di personale BIM qualificato. Descrivi i requisiti del tuo progetto.
            </p>
            <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-foreground/80">
              <li>Pubblica offerte di progetto dettagliate.</li>
              <li>Esplora profili di professionisti verificati.</li>
              <li>Filtra i professionisti per competenze e software.</li>
            </ul>
            <div className="flex flex-wrap gap-2">
              <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT} passHref legacyBehavior>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1.5 px-3">
                  <a className="flex items-center">
                    <FolderPlus className="mr-2 h-4 w-4" /> Pubblica Progetto
                  </a>
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-24 rounded-lg overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1744627049721-73c27008ad28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxCSU18ZW58MHx8fHwxNzQ3NDEyNDUxfDA&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="Team working on BIM project" 
              fill
              style={{objectFit: 'cover'}}
              data-ai-hint="construction team"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
