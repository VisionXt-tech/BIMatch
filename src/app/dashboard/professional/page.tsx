
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
    <div className="space-y-3"> {/* Reduced space-y */}
      <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-primary">Ciao, {userProfile.firstName || userProfile.displayName}!</CardTitle> {/* Reduced font size */}
          <CardDescription className="text-base">Benvenuto nella tua dashboard BIMatch. Qui puoi gestire il tuo profilo e trovare nuove opportunità.</CardDescription> {/* Reduced font size */}
        </CardHeader>
        {!isProfileComplete && (
          <CardContent className="pt-0 pb-4"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert"> {/* Reduced padding */}
                <p className="font-bold">Completa il tuo profilo!</p>
                <p className="text-sm">Un profilo completo aumenta le tue possibilità di trovare il progetto giusto. <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p> {/* Reduced font size */}
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3"> {/* Reduced gap */}
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
            <Button variant="link" asChild className="px-0 pt-1 text-primary text-xs"> {/* Reduced pt and font size */}
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}>Visualizza Progetti</Link>
            </Button>
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
            <Button variant="link" asChild className="px-0 pt-1 text-primary text-xs"> {/* Reduced pt and font size */}
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE}>Gestisci Profilo</Link>
            </Button>
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
            <Button variant="link" asChild className="px-0 pt-1 text-primary text-xs"> {/* Reduced pt and font size */}
              <Link href="#">Visualizza Notifiche</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Potenzia la tua carriera BIM</CardTitle> {/* Reduced font size */}
          <CardDescription className="text-sm">Scopri come BIMatch può aiutarti a crescere professionalmente.</CardDescription> {/* Reduced font size */}
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 items-center p-3 pt-1"> {/* Reduced gap and padding */}
          <div>
            <p className="mb-2 text-sm text-foreground/90"> {/* Reduced mb and font size */}
              Con BIMatch, hai accesso a una vasta rete di aziende leader nel settore edilizio italiano. 
              Il nostro sistema di matching intelligente ti aiuta a trovare progetti che valorizzano le tue competenze specifiche.
            </p>
            <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-foreground/80"> {/* Reduced space-y, mb and font size */}
              <li>Presenta le tue abilità BIM in modo professionale.</li>
              <li>Ricevi notifiche per opportunità rilevanti.</li>
              <li>Semplifica il processo di candidatura.</li>
            </ul>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-1.5 px-3"> {/* Reduced font size and padding */}
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}>Esplora Opportunità</Link>
            </Button>
          </div>
          <div className="relative h-40 rounded-lg overflow-hidden"> {/* Reduced image height */}
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
