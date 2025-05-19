
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
    <div className="space-y-3">
      <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-primary">{userProfile.firstName ? `Ciao, ${userProfile.firstName}!` : `Ciao, ${userProfile.displayName}!`}</CardTitle>
          <CardDescription className="text-base">Benvenuto nella tua dashboard BIMatch. Qui puoi gestire il tuo profilo e trovare nuove opportunità.</CardDescription>
        </CardHeader>
        {!isProfileComplete && (
          <CardContent className="pt-0 pb-3"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert">
                <p className="font-bold">Completa il tuo profilo!</p>
                <p className="text-sm">Un profilo completo aumenta le tue possibilità di trovare il progetto giusto. <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progetti Compatibili</CardTitle>
            <Search className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1 pb-3 px-4"> 
            <div className="text-2xl font-bold">{projectMatchesCount}</div>
            <p className="text-xs text-muted-foreground">
              Progetti che corrispondono alle tue competenze.
            </p>
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-1 text-primary text-xs">
                <a>Visualizza Progetti</a>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Il Mio Profilo</CardTitle>
            <User className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1 pb-3 px-4"> 
            <div className="text-2xl font-bold">{isProfileComplete ? "Completo" : "Incompleto"}</div>
            <p className="text-xs text-muted-foreground">
              Mantieni il tuo profilo aggiornato.
            </p>
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-1 text-primary text-xs">
                <a>Gestisci Profilo</a>
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifiche</CardTitle>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-1 pb-3 px-4">
            <div className="text-2xl font-bold">{newNotificationsCount}</div>
            <p className="text-xs text-muted-foreground">
              Nuovi messaggi o aggiornamenti.
            </p>
            {/* Assuming '#' is a placeholder for a future route */}
            <Link href="#" passHref legacyBehavior>
              <Button variant="link" asChild className="px-0 pt-1 text-primary text-xs">
                 <a>Visualizza Notifiche</a>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Potenzia la tua carriera BIM</CardTitle>
          <CardDescription className="text-sm">Scopri come BIMatch può aiutarti a crescere professionalmente.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3 items-center p-3 pt-1">
          <div>
            <p className="mb-2 text-sm text-foreground/90">
              Con BIMatch, hai accesso a una vasta rete di aziende leader nel settore edilizio italiano. 
              Il nostro sistema di matching intelligente ti aiuta a trovare progetti che valorizzano le tue competenze specifiche.
            </p>
            <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-foreground/80">
              <li>Presenta le tue abilità BIM in modo professionale.</li>
              <li>Ricevi notifiche per opportunità rilevanti.</li>
              <li>Semplifica il processo di candidatura.</li>
            </ul>
            <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS} passHref legacyBehavior>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1.5 px-3">
                <a>Esplora Opportunità</a>
              </Button>
            </Link>
          </div>
          <div className="relative h-32 rounded-lg overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1612888262725-6b300edf916c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHwzRCUyME1vZGVsaW5nfGVufDB8fHx8MTc0NzQxMTMyOXww&ixlib=rb-4.1.0&q=80&w=1080" 
              alt="BIM professional working" 
              fill
              style={{objectFit: 'cover'}}
              data-ai-hint="BIM professional"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
