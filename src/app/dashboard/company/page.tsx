
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Building, Briefcase, Users, FolderPlus, Edit2, WifiOff, Loader2, Bell, Star } from 'lucide-react';
import { useState, useEffect, useCallback, memo } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCountAnimation } from '@/hooks/useCountAnimation';

function CompanyDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();

  const [activeProjectsCount, setActiveProjectsCount] = useState<number | null>(null);
  const [newCandidatesCount, setNewCandidatesCount] = useState<number | null>(null);
  const [unreadCompanyNotificationsCount, setUnreadCompanyNotificationsCount] = useState<number | null>(null);
  const [acceptedMatchesCount, setAcceptedMatchesCount] = useState<number | null>(null);
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
      const projectsRef = collection(db, 'projects');
      const qProjects = query(
        projectsRef,
        where('companyId', '==', user.uid),
        where('status', '==', 'attivo')
      );
      const projectsSnapshot = await getDocs(qProjects);
      setActiveProjectsCount(projectsSnapshot.size);

      const applicationsRef = collection(db, 'projectApplications');
      const qNewApplications = query(
        applicationsRef,
        where('companyId', '==', user.uid),
        where('status', '==', 'inviata')
      );
      const newApplicationsSnapshot = await getDocs(qNewApplications);
      setNewCandidatesCount(newApplicationsSnapshot.size);

      const qAcceptedApplications = query(
        applicationsRef,
        where('companyId', '==', user.uid),
        where('status', '==', 'accettata')
      );
      const acceptedApplicationsSnapshot = await getDocs(qAcceptedApplications);
      setAcceptedMatchesCount(acceptedApplicationsSnapshot.size);

      const notificationsRef = collection(db, 'notifications');
      const qNotifications = query(
        notificationsRef,
        where('userId', '==', user.uid),
        where('isRead', '==', false)
      );
      const notificationsSnapshot = await getDocs(qNotifications);
      setUnreadCompanyNotificationsCount(notificationsSnapshot.size);

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

  const animatedActiveProjects = useCountAnimation(activeProjectsCount ?? 0);
  const animatedNewCandidates = useCountAnimation(newCandidatesCount ?? 0);
  const animatedAcceptedMatches = useCountAnimation(acceptedMatchesCount ?? 0);
  const animatedUnreadNotifications = useCountAnimation(unreadCompanyNotificationsCount ?? 0);

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
      <div className="flex flex-col gap-3">

      {/* Header Welcome Card - Compact */}
      <Card className="shadow-lg bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 border-primary/20 flex-shrink-0">
        <CardHeader className="p-2 pb-1">
          <CardTitle className="text-lg font-bold text-primary break-words">Benvenuta, {userProfile.companyName || userProfile.displayName}!</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">La tua dashboard BIMatch per gestire progetti e talenti.</CardDescription>
        </CardHeader>
         {!isProfileComplete && (
          <CardContent className="px-3 pt-0 pb-2">
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-2 rounded-md" role="alert">
                <p className="font-bold text-xs">Completa il profilo aziendale! <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Left Column - Activity Cards */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl w-full h-full border-2 border-primary/10">
            <CardHeader className="p-2 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <div className="h-5 w-1 bg-primary rounded-full"></div>
                  Azioni Rapide
                </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-2 max-w-md">
            <div className="animate-fade-in opacity-0 animate-stagger-1">
            <Button asChild size="sm" className="w-full aspect-square max-h-32 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-lg">
                <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT} className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                    <FolderPlus className="h-5 w-5 text-primary-foreground" />
                    <span className="text-xs font-medium leading-tight">Nuovo</span>
                </Link>
            </Button>
            </div>
            <div className="animate-fade-in opacity-0 animate-stagger-2">
             <Button
                asChild
                size="sm"
                className={cn(
                    "w-full aspect-square max-h-32 flex flex-col items-center justify-center p-2 text-center text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-lg",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    activeProjectsCount && activeProjectsCount > 0 ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                 <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS} className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <Briefcase className="h-5 w-5 text-primary-foreground" />
                    <span className="text-xs font-medium leading-tight">Progetti</span>
                    {loadingCounts ? <Loader2 className="h-3 w-3 animate-spin text-primary-foreground/80" /> :
                        <span className="text-base text-primary-foreground font-bold">{animatedActiveProjects}</span>
                    }
                </Link>
            </Button>
            </div>
            <div className="animate-fade-in opacity-0 animate-stagger-3">
             <Button
                asChild
                size="sm"
                className={cn(
                    "w-full aspect-square max-h-32 flex flex-col items-center justify-center p-2 text-center text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-lg",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    newCandidatesCount && newCandidatesCount > 0 ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                )}
            >
                <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=candidates`} className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <Users className="h-5 w-5 text-primary-foreground" />
                    <span className="text-xs font-medium leading-tight">Candidati</span>
                     {loadingCounts ? <Loader2 className="h-3 w-3 animate-spin text-primary-foreground/80" /> :
                        <span className="text-base text-primary-foreground font-bold">{animatedNewCandidates}</span>
                    }
                </Link>
            </Button>
            </div>
            <div className="animate-fade-in opacity-0 animate-stagger-4">
            <Button
                asChild
                size="sm"
                className={cn(
                    "w-full aspect-square max-h-32 flex flex-col items-center justify-center p-2 text-center text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-lg",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    (acceptedMatchesCount && acceptedMatchesCount > 0
                        ? "bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 hover:opacity-90"
                        : "bg-muted-foreground hover:bg-muted-foreground/80")
                )}
            >
                <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=active_collaborations`} className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <Star className="h-5 w-5 text-primary-foreground" />
                    <span className="text-xs font-medium leading-tight">BIMatch</span>
                     {loadingCounts ? <Loader2 className="h-3 w-3 animate-spin text-primary-foreground/80" /> :
                        <span className="text-base text-primary-foreground font-bold">{animatedAcceptedMatches}</span>
                    }
                </Link>
            </Button>
            </div>
            <div className="animate-fade-in opacity-0 animate-stagger-5">
            <Button
                asChild
                size="sm"
                className={cn(
                    "w-full aspect-square max-h-32 flex flex-col items-center justify-center p-2 text-center text-primary-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-lg",
                    loadingCounts ? "bg-secondary hover:bg-secondary/80" :
                    unreadCompanyNotificationsCount && unreadCompanyNotificationsCount > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-muted-foreground hover:bg-muted-foreground/80"
                )}
            >
                <Link href={ROUTES.DASHBOARD_COMPANY_NOTIFICATIONS} className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <Bell className="h-5 w-5 text-primary-foreground" />
                    <span className="text-xs font-medium leading-tight">Notifiche</span>
                     {loadingCounts ? <Loader2 className="h-3 w-3 animate-spin text-primary-foreground/80" /> :
                        <span className="text-base text-primary-foreground font-bold">{animatedUnreadNotifications}</span>
                    }
                </Link>
            </Button>
            </div>
            </div>
        </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card className="shadow-xl w-full h-full border-2 border-primary/10 bg-gradient-to-b from-background to-muted/20">
            <CardHeader className="p-3 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-6 w-1 bg-primary rounded-full"></div>
                Profilo Aziendale
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex flex-col justify-between h-[calc(100%-3.5rem)]">
              <div className="space-y-3">
                {/* Avatar */}
                <div className="flex items-center justify-center pt-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center ring-4 ring-primary/20">
                      <Building className="h-8 w-8 text-primary-foreground" />
                    </div>
                    {isProfileComplete && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 ring-2 ring-background">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="text-center space-y-2">
                  <p className="text-lg font-bold break-words">{userProfile.companyName || userProfile.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className={isProfileComplete ? "font-semibold text-green-600" : "font-semibold text-yellow-600"}>{isProfileComplete ? "✓ Profilo Completo" : "⚠ Profilo Incompleto"}</span>
                  </p>
                </div>

                {/* Industry */}
                {userProfile.industry ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wide">Settore</p>
                    <div className="text-center">
                      <span className="inline-block text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">{userProfile.industry}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">Aggiungi il settore aziendale per attirare professionisti</p>
                  </div>
                )}

                {/* Company Size */}
                {userProfile.companySize && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Dimensione</p>
                    <span className="inline-block text-xs bg-accent/30 text-accent-foreground px-3 py-1 rounded-full font-medium">{userProfile.companySize}</span>
                  </div>
                )}

                {/* Location */}
                {userProfile.locations && userProfile.locations.length > 0 && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Sede</p>
                    <span className="inline-block text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">{userProfile.locations[0]}</span>
                  </div>
                )}
              </div>

              <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="w-full mt-4">
                <Button variant="default" size="default" className="w-full">
                  <Edit2 className="mr-2 h-4 w-4" /> Modifica Profilo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display - Fixed at bottom */}
      {errorCounts && (
        <Card className="shadow-md bg-destructive/10 border-destructive flex-shrink-0">
            <CardContent className="p-2 text-center text-destructive flex items-center justify-center gap-2">
                <WifiOff className="h-4 w-4" />
                <p className="font-semibold text-xs">{errorCounts}</p>
            </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}

export default memo(CompanyDashboardPage);
