
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { User, Search, Edit2, ListChecks, Bell, WifiOff, Loader2, Star, TrendingUp } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, Timestamp, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useProfileStrength } from '@/hooks/useProfileStrength';
import { ProfileStrengthMeter, ProfileStrengthBar } from '@/components/ProfileStrengthMeter';
import { QuickActionsChecklist } from '@/components/QuickActionsChecklist';
import type { ProfessionalProfile } from '@/types/auth';

export default function ProfessionalDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();

  const [newProjectsCount, setNewProjectsCount] = useState<number | null>(null);
  const [userActiveApplicationsCount, setUserActiveApplicationsCount] = useState<number | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number | null>(null);
  const [acceptedMatchesCount, setAcceptedMatchesCount] = useState<number | null>(null); 
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => { 
    if (authLoading || !user || !db || userProfile?.role !== 'professional') {
      if (!authLoading && (!user || userProfile?.role !== 'professional')) {
         setLoadingCounts(false); 
      }
      return;
    }

    setLoadingCounts(true);
    setErrorCounts(null);
    try {
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

      const applicationsRef = collection(db, 'projectApplications');
      const qApplications = query(applicationsRef, where('professionalId', '==', user.uid));
      const applicationsSnapshot = await getDocs(qApplications);
      
      const appliedProjectIds = new Set<string>();
      let activeApplicationsCount = 0;
      let currentAcceptedMatchesCount = 0; 
      applicationsSnapshot.forEach(doc => {
          const appData = doc.data();
          appliedProjectIds.add(appData.projectId);
          if (['inviata', 'in_revisione', 'colloquio_proposto', 'colloquio_accettato_prof', 'colloquio_ripianificato_prof'].includes(appData.status)) {
              activeApplicationsCount++;
          }
          if (appData.status === 'accettata') {
            currentAcceptedMatchesCount++;
          }
      });
      setUserActiveApplicationsCount(activeApplicationsCount);
      setAcceptedMatchesCount(currentAcceptedMatchesCount);

      const currentNewProjectsCount = activeNonExpiredProjectIds.filter(projectId => !appliedProjectIds.has(projectId)).length;
      setNewProjectsCount(currentNewProjectsCount);

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('isRead', '==', false)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      setUnreadNotificationsCount(notificationsSnapshot.size);


    } catch (e: any) {
      let specificError = "Errore nel caricamento dei dati della dashboard.";
       if (typeof e.message === 'string') {
            if (e.message.includes('offline')) {
                specificError = "Connessione persa. Controlla la tua rete.";
            } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
                specificError = "Permessi insufficienti per caricare i dati.";
            } else if (e.message.includes('indexes?create_composite=')) {
                specificError = "Indice Firestore mancante. Controlla la console per il link per crearlo.";
                 if (e.message.includes('notifications') && e.message.includes('userId') && e.message.includes('isRead')) {
                     specificError = "Indice Firestore mancante per le notifiche. Controlla la console Firebase per il link per crearlo (notifications, userId ASC, isRead ASC, createdAt DESC).";
                 }
            }
        }
      setErrorCounts(specificError);
      setNewProjectsCount(0); 
      setUserActiveApplicationsCount(0);
      setUnreadNotificationsCount(0); 
      setAcceptedMatchesCount(0);
    } finally {
      setLoadingCounts(false);
    }
  }, [user, db, authLoading, userProfile, setNewProjectsCount, setUserActiveApplicationsCount, setUnreadNotificationsCount, setAcceptedMatchesCount, setLoadingCounts, setErrorCounts]); 

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Animated counters
  const animatedNewProjects = useCountAnimation(newProjectsCount ?? 0);
  const animatedActiveApplications = useCountAnimation(userActiveApplicationsCount ?? 0);
  const animatedAcceptedMatches = useCountAnimation(acceptedMatchesCount ?? 0);
  const animatedUnreadNotifications = useCountAnimation(unreadNotificationsCount ?? 0);

  // Profile strength calculation
  const strengthData = useProfileStrength(userProfile as ProfessionalProfile);

  if (authLoading) {
    return (
      <div className="space-y-3 w-full max-w-7xl mx-auto">
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/2 mt-1" /></CardHeader></Card>
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-7 w-1/3" /></CardHeader><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{[...Array(4)].map((_,i) => <Skeleton key={i} className="h-28 w-full" />)}</CardContent></Card>
        <Card className="shadow-lg"><CardHeader className="p-4"><Skeleton className="h-7 w-1/4" /></CardHeader><CardContent className="p-4"><Skeleton className="h-10 w-1/3" /></CardContent></Card>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'professional') {
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }
  
  const isProfileComplete = userProfile.bio && userProfile.bimSkills && userProfile.bimSkills.length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* Hero Section - Digital Avatar Card */}
      <Card className="relative overflow-hidden border-2 shadow-xl bg-gradient-to-br from-background via-background to-muted/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar with Progress Ring */}
            <div className="flex-shrink-0">
              <ProfileStrengthMeter strengthData={strengthData} size="lg" showDetails={false} />
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  {userProfile.firstName ? `Ciao, ${userProfile.firstName}!` : `Ciao, ${userProfile.displayName}!`}
                  <span className="text-2xl">{strengthData.levelEmoji}</span>
                </h1>
                <p className="text-muted-foreground mt-1">Ecco un riepilogo della tua attività BIM</p>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  <span>{strengthData.levelLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-semibold">💎 {strengthData.powerPoints} Power Points</span>
                </div>
                {strengthData.nextMilestone && (
                  <div className="text-muted-foreground">
                    <span className="text-xs">Prossimo: </span>
                    <span className="font-semibold text-foreground">{strengthData.nextMilestone.label}</span>
                    <span className="text-xs ml-1">({strengthData.nextMilestone.missing} pts)</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="max-w-md">
                <ProfileStrengthBar strengthData={strengthData} />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE}>
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Edit2 className="h-5 w-5" />
                  Modifica Profilo
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Incomplete Alert */}
      {!isProfileComplete && (
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary rounded-full p-2 mt-0.5">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Completa il tuo profilo</p>
                <p className="text-xs text-muted-foreground mt-0.5">Aggiungi competenze e informazioni per aumentare la visibilità.</p>
              </div>
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE}>
                <Button size="sm" variant="default">Completa ora</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errorCounts && (
        <Card className="border-l-4 border-l-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive font-medium">{errorCounts}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Nuovi Progetti Card */}
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wide mb-2">Nuovi Progetti</p>
                {loadingCounts ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary-foreground/80" />
                ) : (
                  <p className="text-3xl font-bold text-primary-foreground">{animatedNewProjects}</p>
                )}
                <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS} className="text-xs text-primary-foreground/90 hover:text-primary-foreground hover:underline mt-2 inline-block font-medium">
                  Esplora progetti →
                </Link>
              </div>
              <div className="bg-primary-foreground/20 rounded-full p-3 backdrop-blur-sm">
                <Search className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidature Attive Card */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0",
          userActiveApplicationsCount && userActiveApplicationsCount > 0
            ? "bg-gradient-to-br from-green-600 via-green-600 to-green-700 text-white"
            : "bg-gradient-to-br from-accent via-accent to-accent/90 text-accent-foreground"
        )}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={cn(
                  "text-xs font-medium uppercase tracking-wide mb-2",
                  userActiveApplicationsCount && userActiveApplicationsCount > 0 ? "text-white/80" : "text-accent-foreground/80"
                )}>Candidature Attive</p>
                {loadingCounts ? (
                  <Loader2 className={cn(
                    "h-6 w-6 animate-spin",
                    userActiveApplicationsCount && userActiveApplicationsCount > 0 ? "text-white/80" : "text-accent-foreground/80"
                  )} />
                ) : (
                  <p className={cn(
                    "text-3xl font-bold",
                    userActiveApplicationsCount && userActiveApplicationsCount > 0 ? "text-white" : "text-accent-foreground"
                  )}>{animatedActiveApplications}</p>
                )}
                <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS + "?filter=applied"} className={cn(
                  "text-xs hover:underline mt-2 inline-block font-medium",
                  userActiveApplicationsCount && userActiveApplicationsCount > 0 ? "text-white/90 hover:text-white" : "text-accent-foreground/90 hover:text-accent-foreground"
                )}>
                  Vedi candidature →
                </Link>
              </div>
              <div className={cn(
                "rounded-full p-3 backdrop-blur-sm",
                userActiveApplicationsCount && userActiveApplicationsCount > 0 ? "bg-white/20" : "bg-accent-foreground/20"
              )}>
                <ListChecks className={cn(
                  "h-5 w-5",
                  userActiveApplicationsCount && userActiveApplicationsCount > 0 ? "text-white" : "text-accent-foreground"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BIMatch Accettati Card */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0",
          acceptedMatchesCount && acceptedMatchesCount > 0
            ? "bg-gradient-to-br from-cyan-500 via-cyan-500 to-cyan-600 text-white"
            : "bg-gradient-to-br from-secondary via-secondary to-secondary/90 text-secondary-foreground"
        )}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={cn(
                  "text-xs font-medium uppercase tracking-wide mb-2",
                  acceptedMatchesCount && acceptedMatchesCount > 0 ? "text-white/80" : "text-secondary-foreground/70"
                )}>BIMatch</p>
                {loadingCounts ? (
                  <Loader2 className={cn(
                    "h-6 w-6 animate-spin",
                    acceptedMatchesCount && acceptedMatchesCount > 0 ? "text-white/80" : "text-secondary-foreground/70"
                  )} />
                ) : (
                  <p className={cn(
                    "text-3xl font-bold",
                    acceptedMatchesCount && acceptedMatchesCount > 0 ? "text-white" : "text-secondary-foreground"
                  )}>{animatedAcceptedMatches}</p>
                )}
                <Link href={`${ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}?filter=accepted`} className={cn(
                  "text-xs hover:underline mt-2 inline-block font-medium",
                  acceptedMatchesCount && acceptedMatchesCount > 0 ? "text-white/90 hover:text-white" : "text-secondary-foreground/80 hover:text-secondary-foreground"
                )}>
                  Vedi match →
                </Link>
              </div>
              <div className={cn(
                "rounded-full p-3 backdrop-blur-sm",
                acceptedMatchesCount && acceptedMatchesCount > 0 ? "bg-white/20" : "bg-secondary-foreground/10"
              )}>
                <Star className={cn(
                  "h-5 w-5",
                  acceptedMatchesCount && acceptedMatchesCount > 0 ? "text-white" : "text-secondary-foreground"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifiche Card */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0",
          unreadNotificationsCount && unreadNotificationsCount > 0
            ? "bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 text-white"
            : "bg-gradient-to-br from-muted via-muted to-muted/90 text-muted-foreground"
        )}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={cn(
                  "text-xs font-medium uppercase tracking-wide mb-2",
                  unreadNotificationsCount && unreadNotificationsCount > 0 ? "text-white/80" : "text-muted-foreground/80"
                )}>Notifiche</p>
                {loadingCounts ? (
                  <Loader2 className={cn(
                    "h-6 w-6 animate-spin",
                    unreadNotificationsCount && unreadNotificationsCount > 0 ? "text-white/80" : "text-muted-foreground/80"
                  )} />
                ) : (
                  <p className={cn(
                    "text-3xl font-bold",
                    unreadNotificationsCount && unreadNotificationsCount > 0 ? "text-white" : "text-muted-foreground"
                  )}>{animatedUnreadNotifications}</p>
                )}
                <Link href={ROUTES.DASHBOARD_PROFESSIONAL_NOTIFICATIONS} className={cn(
                  "text-xs hover:underline mt-2 inline-block font-medium",
                  unreadNotificationsCount && unreadNotificationsCount > 0 ? "text-white/90 hover:text-white" : "text-muted-foreground/80 hover:text-muted-foreground"
                )}>
                  Vedi notifiche →
                </Link>
              </div>
              <div className={cn(
                "rounded-full p-3 backdrop-blur-sm",
                unreadNotificationsCount && unreadNotificationsCount > 0 ? "bg-white/20" : "bg-muted-foreground/10"
              )}>
                <Bell className={cn(
                  "h-5 w-5",
                  unreadNotificationsCount && unreadNotificationsCount > 0 ? "text-white" : "text-muted-foreground"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionsChecklist
            strengthData={strengthData}
            profileLink={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE}
          />
        </div>

        {/* Right Column - Profile Summary */}
        <div className="lg:col-span-2">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="h-5 w-1 bg-primary rounded-full"></div>
                Riepilogo Profilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center ring-4 transition-all",
                    strengthData.level === 'expert' && "bg-gradient-to-br from-amber-500 to-orange-600 ring-amber-500/20",
                    strengthData.level === 'solid' && "bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-500/20",
                    strengthData.level === 'growing' && "bg-gradient-to-br from-blue-400 to-blue-600 ring-blue-500/20",
                    strengthData.level === 'beginner' && "bg-gradient-to-br from-gray-400 to-gray-500 ring-gray-500/20"
                  )}>
                    <User className="h-8 w-8 text-white" />
                  </div>
                  {strengthData.totalStrength === 100 && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-1.5 ring-2 ring-background">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold">{userProfile.firstName || userProfile.displayName}</h3>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      strengthData.totalStrength === 100
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : strengthData.totalStrength >= 50
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                    )}>
                      {strengthData.totalStrength}% {strengthData.levelEmoji}
                    </span>
                  </div>

                  {userProfile.experienceLevel && (
                    <p className="text-sm text-muted-foreground mb-3">
                      Livello di esperienza: <span className="font-medium text-foreground">{userProfile.experienceLevel}</span>
                    </p>
                  )}

                  {/* Skills */}
                  {userProfile.bimSkills && userProfile.bimSkills.length > 0 ? (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                        Competenze Principali
                        <span className="text-primary">💡 {userProfile.bimSkills.length * 3} pts</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.bimSkills.slice(0, 8).map((skill, idx) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium border border-primary/20 hover:bg-primary/20 transition-colors">
                            {skill}
                          </span>
                        ))}
                        {userProfile.bimSkills.length > 8 && (
                          <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-semibold border">
                            +{userProfile.bimSkills.length - 8} altre
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Suggerimento:</strong> Aggiungi le tue competenze BIM per guadagnare Power Points e aumentare la visibilità.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

