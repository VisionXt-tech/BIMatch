
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Building, Briefcase, Users, FolderPlus, Edit2, WifiOff, Loader2, Bell, Star } from 'lucide-react';
import { useState, useEffect, useCallback, memo } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, Timestamp, type DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

function CompanyDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();

  const [activeProjectsCount, setActiveProjectsCount] = useState<number | null>(null);
  const [newCandidatesCount, setNewCandidatesCount] = useState<number | null>(null);
  const [unreadCompanyNotificationsCount, setUnreadCompanyNotificationsCount] = useState<number | null>(null);
  const [acceptedMatchesCount, setAcceptedMatchesCount] = useState<number | null>(null); // New state for company's accepted matches
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  const fetchDashboardCounts = useCallback(async () => {
    if (authLoading || !user || !db || userProfile?.role !== 'company') {
        if (!authLoading && (!user || userProfile?.role !== 'company')) {
            setLoadingCounts(false);
        }
      return;
    }

    setLoadingCounts(true);
    setErrorCounts(null);

    try {
      console.log('Dashboard caricata per azienda:', user.uid);

      // 1. Conta progetti attivi dell'azienda
      const projectsRef = collection(db, 'projects');
      const qProjects = query(
        projectsRef,
        where('companyId', '==', user.uid),
        where('status', '==', 'attivo')
      );
      const projectsSnapshot = await getDocs(qProjects);
      setActiveProjectsCount(projectsSnapshot.size);
      console.log('Progetti attivi:', projectsSnapshot.size);

      // 2. Conta nuovi candidati (candidature con stato 'inviata')
      const applicationsRef = collection(db, 'projectApplications');
      const qNewApplications = query(
        applicationsRef,
        where('companyId', '==', user.uid),
        where('status', '==', 'inviata')
      );
      const newApplicationsSnapshot = await getDocs(qNewApplications);
      setNewCandidatesCount(newApplicationsSnapshot.size);
      console.log('Nuovi candidati:', newApplicationsSnapshot.size);

      // 3. Conta collaborazioni accettate
      const qAcceptedApplications = query(
        applicationsRef,
        where('companyId', '==', user.uid),
        where('status', '==', 'accettata')
      );
      const acceptedApplicationsSnapshot = await getDocs(qAcceptedApplications);
      setAcceptedMatchesCount(acceptedApplicationsSnapshot.size);
      console.log('Collaborazioni attive:', acceptedApplicationsSnapshot.size);

      // 4. Conta notifiche non lette
      const notificationsRef = collection(db, 'notifications');
      const qNotifications = query(
        notificationsRef,
        where('userId', '==', user.uid),
        where('isRead', '==', false)
      );
      const notificationsSnapshot = await getDocs(qNotifications);
      setUnreadCompanyNotificationsCount(notificationsSnapshot.size);
      console.log('Notifiche non lette:', notificationsSnapshot.size);

    } catch (e: any) {
      console.error("Errore nel caricamento dashboard azienda:", e);
      setErrorCounts("Errore nel caricamento dei dati.");
      setActiveProjectsCount(0);
      setNewCandidatesCount(0);
      setUnreadCompanyNotificationsCount(0);
      setAcceptedMatchesCount(0);
    } finally {
      setLoadingCounts(false);
    }
  }, [user, db, authLoading, userProfile]);

  useEffect(() => {
    fetchDashboardCounts();
  }, [fetchDashboardCounts]);


  if (authLoading && !userProfile) {
     return (
      <div className="space-y-3 w-full max-w-7xl mx-auto">
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/2 mt-1" /></CardHeader></Card>
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-7 w-1/3" /></CardHeader><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(3)].map((_,i) => <Skeleton key={i} className="h-28 w-full" />)}</CardContent></Card>
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-7 w-1/4" /></CardHeader><CardContent className="p-4"><Skeleton className="h-10 w-1/3" /></CardContent></Card>
      </div>
    );
  }
  
  if (!userProfile || userProfile.role !== 'company') {
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }
  
  const isProfileComplete = userProfile.companyDescription && userProfile.industry;

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="space-y-3">
      <Card className="shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-primary break-words">Benvenuta, {userProfile.companyName || userProfile.displayName}!</CardTitle>
          <CardDescription className="text-sm sm:text-base text-muted-foreground">Questa è la tua dashboard BIMatch per gestire progetti e talenti.</CardDescription>
        </CardHeader>
         {!isProfileComplete && (
          <CardContent className="px-4 pt-0 pb-3"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert">
                <p className="font-bold text-sm">Completa il profilo aziendale!</p>
                <p className="text-xs">Un profilo dettagliato attira i migliori professionisti. <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
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
        <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-semibold">Azioni Rapide</CardTitle>
            <CardDescription className="text-sm">Gestisci le attività principali della tua azienda.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT} className="flex flex-col items-center justify-center h-24 p-1.5 sm:p-3 text-center">
                    <FolderPlus className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-primary-foreground" />
                    <span className="text-xs sm:text-sm font-medium leading-tight">Nuovo Progetto</span>
                    <span className="text-xs text-primary-foreground/80 mt-0.5 hidden sm:block">Crea e lancia nuove offerte</span>
                </Link>
            </Button>
             <Button 
                asChild 
                size="lg" 
                className={cn(
                    "w-full flex flex-col items-center justify-center h-24 p-1.5 sm:p-3 text-center text-primary-foreground",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    activeProjectsCount && activeProjectsCount > 0 ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700" 
                )}
            >
                 <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS}>
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-primary-foreground" />
                    <span className="text-xs sm:text-sm font-medium leading-tight">Progetti</span>
                    {loadingCounts ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 animate-spin text-primary-foreground/80" /> :
                        <span className="text-xs text-primary-foreground/80 mt-0.5">{activeProjectsCount ?? 0} attivi</span>
                    }
                </Link>
            </Button>
             <Button 
                asChild 
                size="lg" 
                className={cn(
                    "w-full flex flex-col items-center justify-center h-24 p-1.5 sm:p-3 text-center text-primary-foreground",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    newCandidatesCount && newCandidatesCount > 0 ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=candidates`}>
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-primary-foreground" />
                    <span className="text-xs sm:text-sm font-medium leading-tight">Candidati</span>
                     {loadingCounts ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 animate-spin text-primary-foreground/80" /> :
                        <span className="text-xs text-primary-foreground/80 mt-0.5">{newCandidatesCount ?? 0} nuovi</span>
                    }
                </Link>
            </Button>
            <Button 
                asChild 
                size="lg" 
                className={cn(
                    "w-full flex flex-col items-center justify-center h-24 p-1.5 sm:p-3 text-center text-primary-foreground col-span-1 xs:col-span-2 sm:col-span-1",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    (acceptedMatchesCount && acceptedMatchesCount > 0 
                        ? "bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 hover:opacity-90" 
                        : "bg-muted-foreground hover:bg-muted-foreground/80")
                )}
            >
                <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=active_collaborations`}> 
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-primary-foreground" />
                    <span className="text-xs sm:text-sm font-medium leading-tight">Collaborazioni</span>
                     {loadingCounts ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 animate-spin text-primary-foreground/80" /> :
                        <span className="text-xs text-primary-foreground/80 mt-0.5">{acceptedMatchesCount ?? 0} attive</span>
                    }
                </Link>
            </Button>
            <Button 
                asChild 
                size="lg" 
                className={cn(
                    "w-full flex flex-col items-center justify-center h-24 p-1.5 sm:p-3 text-center text-primary-foreground col-span-1 xs:col-span-2 sm:col-span-1",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    unreadCompanyNotificationsCount && unreadCompanyNotificationsCount > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-muted-foreground hover:bg-muted-foreground/80"
                )}
            >
                <Link href={ROUTES.DASHBOARD_COMPANY_NOTIFICATIONS}>
                    <Bell className="h-5 w-5 sm:h-6 sm:w-6 mb-1 text-primary-foreground" />
                    <span className="text-xs sm:text-sm font-medium leading-tight">Notifiche</span>
                     {loadingCounts ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 animate-spin text-primary-foreground/80" /> :
                        <span className="text-xs text-primary-foreground/80 mt-0.5">{unreadCompanyNotificationsCount ?? 0} non lette</span>
                    }
                </Link>
            </Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-semibold">Profilo Aziendale</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
           <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground break-words">Stato del profilo: <span className={isProfileComplete ? "font-semibold text-green-600" : "font-semibold text-yellow-600"}>{isProfileComplete ? "Completo" : "Incompleto"}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Mantieni aggiornate le informazioni per massimizzare la visibilità.</p>
           </div>
           <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 self-start sm:self-center shrink-0">
             <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="flex items-center">
               <Edit2 className="mr-2 h-3 w-3" /> Modifica Profilo
             </Link>
            </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default memo(CompanyDashboardPage);

