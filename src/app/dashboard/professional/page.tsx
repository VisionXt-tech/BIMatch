'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { DashboardStat } from '@/components/DashboardStat';
import { Search, Edit2, ListChecks, Bell, WifiOff, Star } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { useProfileStrength } from '@/hooks/useProfileStrength';
import type { ProfessionalProfile } from '@/types/auth';
import { BIM_SKILLS_CATEGORIES, SOFTWARE_CATEGORIES } from '@/constants/skillsCategories';
import { SkillsChart } from '@/components/charts/SkillsChart';

export default function ProfessionalDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();

  if (!userProfile || userProfile.role !== 'professional') {
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }

  // Dopo il controllo del ruolo possiamo fare il cast sicuro
  const profile = userProfile as ProfessionalProfile;
  const strengthData = useProfileStrength(profile);

  // Helper per controllo completezza profilo
  const isComplete = Boolean(profile.bio && profile.bimSkills?.length);

  const [newProjectsCount, setNewProjectsCount] = useState<number | null>(null);
  const [userActiveApplicationsCount, setUserActiveApplicationsCount] = useState<number | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number | null>(null);
  const [acceptedMatchesCount, setAcceptedMatchesCount] = useState<number | null>(null); 
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  // Data preparation for charts
  const bimSkillsData = BIM_SKILLS_CATEGORIES.map(category => {
    const categorySkills = category.skills.map(s => s.value);
    const userCategorySkills = profile.bimSkills?.filter(skill => 
      categorySkills.includes(skill)
    ) || [];
    const percentage = categorySkills.length > 0
      ? Math.round((userCategorySkills.length / categorySkills.length) * 100)
      : 0;
    return { name: category.title, percentage, icon: category.icon };
  });

  const softwareData = SOFTWARE_CATEGORIES.map(category => {
    const categorySkills = category.skills.map(s => s.value);
    const userCategorySkills = profile.softwareProficiency?.filter(software => 
      categorySkills.includes(software)
    ) || [];
    const percentage = categorySkills.length > 0
      ? Math.round((userCategorySkills.length / categorySkills.length) * 100)
      : 0;
    return { name: category.title, percentage, icon: category.icon };
  });

  const fetchCounts = useCallback(async () => { 
    if (authLoading || !user || !db || profile.role !== 'professional') {
      if (!authLoading && (!user || profile.role !== 'professional')) {
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

      const currentNewProjectsCount = activeNonExpiredProjectIds.filter(
        projectId => !appliedProjectIds.has(projectId)
      ).length;
      setNewProjectsCount(currentNewProjectsCount);

      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        where('isRead', '==', false)
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      setUnreadNotificationsCount(notificationsSnapshot.size);

    } catch (e: any) {
      let specificError = "Errore nel caricamento dei dati.";
      if (typeof e.message === 'string') {
        if (e.message.includes('offline')) {
          specificError = "Connessione persa. Controlla la tua rete.";
        } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
          specificError = "Impossibile accedere ai dati. Riprova.";
        } else if (e.message.includes('indexes') || e.message.includes('notifications')) {
          specificError = "Servizio temporaneamente non disponibile. Riprova più tardi.";
        }
      }

      // Log technical details to console for developers
      console.error('[Dashboard] Data fetch error:', e);

      setErrorCounts(specificError);
      setNewProjectsCount(0); 
      setUserActiveApplicationsCount(0);
      setUnreadNotificationsCount(0); 
      setAcceptedMatchesCount(0);
    } finally {
      setLoadingCounts(false);
    }
  }, [user, db, authLoading, profile]); 

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Animated counters
  const animatedNewProjects = useCountAnimation(newProjectsCount ?? 0);
  const animatedActiveApplications = useCountAnimation(userActiveApplicationsCount ?? 0);
  const animatedAcceptedMatches = useCountAnimation(acceptedMatchesCount ?? 0);
  const animatedUnreadNotifications = useCountAnimation(unreadNotificationsCount ?? 0);

  if (authLoading) {
    return (
  <div className="p-4 sm:p-6 md:p-8 space-y-4 w-full max-w-7xl mx-auto px-4 bg-gray-50">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <Skeleton className="h-6 sm:h-8 w-3/4" />
            <Skeleton className="h-3 sm:h-4 w-1/2 mt-3 sm:mt-4" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 sm:h-32 w-full" />
          ))}
        </div>
        <Card className="border border-gray-200 bg-white">
          <CardHeader className="p-4 sm:p-6 md:p-8">
            <Skeleton className="h-6 sm:h-8 w-1/4" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8">
            <Skeleton className="h-6 sm:h-8 w-1/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
  <div className="p-4 sm:p-6 md:p-8 space-y-4 w-full max-w-7xl mx-auto px-4 bg-gray-50">
      {/* Hero Section - Welcome Card */}
      <Card className="border border-gray-200 bg-white">
  <CardContent className="p-4 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 sm:gap-6 md:gap-8">
            {/* User Info */}
            <div className="flex-1 space-y-2 sm:space-y-3 md:space-y-4">
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                  {`Ciao, ${profile.displayName}`}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Completamento profilo: {strengthData.totalStrength}%</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="block w-full md:w-auto">
                <Button size="lg" className="gap-2 bg-[#008080] hover:bg-[#006666] text-white w-full md:w-auto">
                  <Edit2 className="h-4 w-4" />
                  Modifica Profilo
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Incomplete Alert */}
      {!isComplete && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 md:gap-8">
              <div className="flex-1">
                <p className="font-semibold text-xs sm:text-sm text-gray-900">Completa il tuo profilo</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 md:mt-4">
                  Aumenta la visibilità aggiungendo competenze.
                </p>
              </div>
              <Link href={ROUTES.DASHBOARD_PROFESSIONAL_PROFILE} className="w-full sm:w-auto">
                <Button size="sm" className="bg-[#008080] hover:bg-[#006666] text-white w-full sm:w-auto">Completa ora</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errorCounts && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4 sm:p-6 md:p-8 flex items-center gap-3 sm:gap-4">
            <WifiOff className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-900 font-medium">{errorCounts}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Progetti Disponibili */}
        <DashboardStat
          icon={Search}
          label="Progetti Disponibili"
          value={newProjectsCount ?? 0}
          loading={loadingCounts}
          href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}
        />

        {/* Candidature */}
        <DashboardStat
          icon={ListChecks}
          label="Candidature"
          value={userActiveApplicationsCount ?? 0}
          loading={loadingCounts}
          href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}
        />

        {/* BIMatch Confermati */}
        <DashboardStat
          icon={Star}
          label="BIMatch"
          value={acceptedMatchesCount ?? 0}
          loading={loadingCounts}
          href={ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS}
        />

        {/* Notifiche */}
        <DashboardStat
          icon={Bell}
          label="Notifiche"
          value={unreadNotificationsCount ?? 0}
          loading={loadingCounts}
          href={ROUTES.DASHBOARD_PROFESSIONAL_NOTIFICATIONS}
        />
      </div>

      {/* Skills Charts */}
      {(profile.bimSkills || profile.softwareProficiency) && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <SkillsChart
              title="Competenze BIM"
              data={bimSkillsData}
              barColor="#008080"
            />
          </div>
          <div className="lg:col-span-3">
            <SkillsChart
              title="Software"
              data={softwareData}
              barColor="#374151"
            />
          </div>
        </div>
      )}

      {/* Empty State for Skills */}
      {!profile.bimSkills?.length && !profile.softwareProficiency?.length && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Aggiungi le tue competenze BIM e software per visualizzare le statistiche.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}