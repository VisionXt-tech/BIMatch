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
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-primary/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Benvenuta, {userProfile.companyName || userProfile.displayName}!</CardTitle>
          <CardDescription className="text-lg">Gestisci i tuoi progetti BIM e trova i migliori talenti sulla tua dashboard BIMatch.</CardDescription>
        </CardHeader>
         {!isProfileComplete && (
          <CardContent>
             <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Completa il profilo aziendale!</p>
                <p>Un profilo dettagliato attira i migliori professionisti. <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="font-semibold underline hover:text-yellow-800">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progetti Attivi</CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjectsCount}</div>
            <p className="text-xs text-muted-foreground">
              Progetti BIM attualmente pubblicati.
            </p>
            <Button variant="link" asChild className="px-0 pt-2 text-primary">
              <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS}>Gestisci Progetti</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuovi Candidati</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newCandidatesCount}</div>
            <p className="text-xs text-muted-foreground">
              Professionisti interessati ai tuoi progetti.
            </p>
            <Button variant="link" asChild className="px-0 pt-2 text-primary">
              {/* This link might need to go to a specific project's candidates or a general candidate pool */}
              <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS}>Visualizza Candidati</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profilo Azienda</CardTitle>
            <Building className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isProfileComplete ? "Completo" : "Incompleto"}</div>
            <p className="text-xs text-muted-foreground">
              Mantieni il profilo della tua azienda aggiornato.
            </p>
            <Button variant="link" asChild className="px-0 pt-2 text-primary">
              <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE}>Modifica Profilo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Trova il Talento BIM Perfetto</CardTitle>
          <CardDescription>Pubblica i tuoi progetti e connettiti con professionisti qualificati in tutta Italia.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 items-center">
           <div>
            <p className="mb-4 text-foreground/90">
              BIMatch semplifica la ricerca di personale BIM qualificato. Descrivi i requisiti del tuo progetto e lascia che il nostro algoritmo ti aiuti a trovare i candidati ideali.
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/80">
              <li>Pubblica offerte di progetto dettagliate.</li>
              <li>Filtra i professionisti per competenze e software.</li>
              <li>Visualizza profili completi e portfolio.</li>
            </ul>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}> <FolderPlus className="mr-2 h-4 w-4" /> Pubblica un Nuovo Progetto</Link>
            </Button>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden">
            <Image 
              src="https://picsum.photos/500/300?random=3" 
              alt="Team working on BIM project" 
              layout="fill" 
              objectFit="cover"
              data-ai-hint="construction team"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
