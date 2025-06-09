
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { User, Search, Edit2, ListChecks, Bell, WifiOff, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function ProfessionalDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();

  const [newProjectsCount, setNewProjectsCount] = useState<number | null>(null);
  const [userActiveApplicationsCount, setUserActiveApplicationsCount] = useState<number | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  // Placeholder for new notifications count, kept as is for now
  const newNotificationsCount = 3;

  useEffect(() => {
    if (authLoading || !user || !db || userProfile?.role !== 'professional') {
      if (!authLoading && (!user || userProfile?.role !== 'professional')) {
         setLoadingCounts(false); // Not a professional or not logged in, no need to load counts.
      }
      return;
    }

    const fetchCounts = async () => {
      setLoadingCounts(true);
      setErrorCounts(null);
      try {
        // 1. Fetch active, non-expired projects
        const projectsRef = collection(db, 'projects');
        const now = new Date();
        const qProjects = query(projectsRef, where('status', '==', 'attivo'));
        const projectsSnapshot = await getDocs(qProjects);
        
        const activeNonExpiredProjectIds: string[] = [];
        projectsSnapshot.forEach(doc => {
          const project = doc.data();
          const deadline = project.applicationDeadline ? (project.applicationDeadline as Timestamp).toDate() : null;
          if (!deadline || deadline > now) {
            activeNonExpiredProjectIds.push(doc.id);
          }
        });

        // 2. Fetch all applications for the current professional to get appliedProjectIds
        //    and count active applications.
        const applicationsRef = collection(db, 'projectApplications');
        const qApplications = query(applicationsRef, where('professionalId', '==', user.uid));
        const applicationsSnapshot = await getDocs(qApplications);
        
        const appliedProjectIds = new Set<string>();
        let activeApplicationsCount = 0;
        applicationsSnapshot.forEach(doc => {
            const appData = doc.data();
            appliedProjectIds.add(appData.projectId);
            if (['inviata', 'in_revisione', 'preselezionata'].includes(appData.status)) {
                activeApplicationsCount++;
            }
        });
        setUserActiveApplicationsCount(activeApplicationsCount);

        // 3. Calculate new projects count (activeNonExpired projects that are NOT in appliedProjectIds)
        const currentNewProjectsCount = activeNonExpiredProjectIds.filter(projectId => !appliedProjectIds.has(projectId)).length;
        setNewProjectsCount(currentNewProjectsCount);

      } catch (e: any) {
        console.error("Error fetching dashboard counts:", e);
        let specificError = "Errore nel caricamento dei dati della dashboard.";
        if (typeof e.message === 'string') {
            if (e.message.includes('offline')) {
                specificError = "Connessione persa. Controlla la tua rete.";
            } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
                specificError = "Permessi insufficienti per caricare i dati.";
            } else if (e.message.includes('indexes?create_composite=')) {
                specificError = "Indice Firestore mancante. Controlla la console per il link per crearlo.";
            }
        }
        setErrorCounts(specificError);
        setNewProjectsCount(0); 
        setUserActiveApplicationsCount(0);
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
  }, [user, db, authLoading, userProfile]);

  if (authLoading) { // Initial loading for auth context
    return (
      <div className="space-y-4 w-full max-w-4xl mx-auto">
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/2 mt-1" /></CardHeader></Card>
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-7 w-1/3" /></CardHeader><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-28 w-full" />)}</CardContent></Card>
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-7 w-1/4" /></CardHeader><CardContent className="p-4"><Skeleton className="h-10 w-1/3" /></CardContent></Card>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'professional') {
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }
  
  const isProfileComplete = userProfile.bio && userProfile.bimSkills && userProfile.bimSkills.length > 0;

  return (
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl font-bold text-primary">{userProfile.firstName ? `Ciao, ${userProfile.firstName}!` : `Ciao, ${userProfile.displayName}!`}</CardTitle>
          <CardDescription className="text-md text-muted-foreground">La tua dashboard per esplorare opportunità e gestire la tua carriera BIM.</CardDescription>
        </CardHeader>
        {!isProfileComplete && (
          <CardContent className="px-4 pt-0 pb-3"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert">
                <p className="font-bold text-sm">Completa il tuo profilo!</p>
                <p className="text-xs">Un profilo completo aumenta le tue possibilità di trovare il progetto giusto. <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {errorCounts && (
        <Card className="shadow-md bg-destructive/10 border-destructive">
            <CardContent className="p-4 text-center text-destructive">
                <WifiOff className="mx-auto h-8 w-8 mb-2" />
                <p className="font-semibold">Errore nel caricamento delle attività</p>
                <p className="text-sm">{errorCounts}</p>
            </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold">Le Tue Attività</CardTitle>
            <CardDescription className="text-sm">Monitora le tue interazioni e scopri nuove possibilità.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              asChild
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex flex-col items-center justify-center h-28 p-3 text-center"
            >
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}>
                <Search className="h-6 w-6 mb-1 text-primary-foreground" />
                <span className="text-sm font-semibold text-primary-foreground">Cerca Nuovi Progetti</span>
                {loadingCounts ? <Loader2 className="h-4 w-4 mt-0.5 animate-spin text-primary-foreground/80" /> :
                  <span className="text-xs text-primary-foreground/80 mt-0.5">{newProjectsCount ?? 0} disponibili</span>}
              </Link>
            </Button>
            
            <Button
              asChild
              size="lg"
              className={cn(
                "w-full text-primary-foreground flex flex-col items-center justify-center h-28 p-3 text-center",
                loadingCounts ? "bg-secondary hover:bg-secondary/80" : 
                (userActiveApplicationsCount && userActiveApplicationsCount > 0
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700")
              )}
            >
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS + "?filter=applied"}>
                <ListChecks className="h-6 w-6 mb-1 text-primary-foreground" />
                <span className="text-sm font-semibold text-primary-foreground">Le Mie Candidature</span>
                {loadingCounts ? <Loader2 className="h-4 w-4 mt-0.5 animate-spin text-primary-foreground/80" /> :
                  <span className="text-xs text-primary-foreground/80 mt-0.5">{userActiveApplicationsCount ?? 0} attive</span>}
              </Link>
            </Button>

            <Button variant="secondary" size="lg" className="w-full opacity-50 cursor-not-allowed">
                <div className="flex flex-col items-center justify-center h-28 p-3 text-center">
                    <Bell className="h-6 w-6 mb-1 text-secondary-foreground" />
                    <span className="text-sm font-semibold">Notifiche</span>
                    <span className="text-xs text-secondary-foreground/80 mt-0.5">{newNotificationsCount} non lette (Prossimamente)</span>
                </div>
            </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-semibold">Il Tuo Profilo</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
           <div>
                <p className="text-sm text-muted-foreground">Stato del profilo: <span className={isProfileComplete ? "font-semibold text-green-600" : "font-semibold text-yellow-600"}>{isProfileComplete ? "Completo" : "Incompleto"}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Un profilo curato è il tuo miglior biglietto da visita.</p>
           </div>
           <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} passHref legacyBehavior>
            <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 self-start sm:self-center">
                <a className="flex items-center">
                <Edit2 className="mr-2 h-3 w-3" /> Aggiorna Profilo
                </a>
            </Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}

    