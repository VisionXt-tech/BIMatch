
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Briefcase, Users, FolderPlus, Edit2, WifiOff, Loader2, Bell, Star, TrendingUp, BarChart3 } from 'lucide-react';
import { useState, useEffect, useCallback, memo } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { ApplicationsTimelineChart } from '@/components/charts/ApplicationsTimelineChart';
import { TopSkillsChart } from '@/components/charts/TopSkillsChart';
import { Badge } from '@/components/ui/badge';
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, isWithinInterval } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Project } from '@/types/project';

function CompanyDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();

  const [activeProjectsCount, setActiveProjectsCount] = useState<number | null>(null);
  const [newCandidatesCount, setNewCandidatesCount] = useState<number | null>(null);
  const [unreadCompanyNotificationsCount, setUnreadCompanyNotificationsCount] = useState<number | null>(null);
  const [acceptedMatchesCount, setAcceptedMatchesCount] = useState<number | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [errorCounts, setErrorCounts] = useState<string | null>(null);

  // Analytics data
  const [timelineData, setTimelineData] = useState<Array<{ date: string; count: number }>>([]);
  const [topSkillsData, setTopSkillsData] = useState<Array<{ name: string; count: number }>>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

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

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    if (authLoading || !user || !db || userProfile?.role !== 'company') {
      setLoadingAnalytics(false);
      return;
    }

    setLoadingAnalytics(true);
    try {
      // Fetch applications for timeline (last 8 weeks)
      const now = new Date();
      const weeksAgo8 = subWeeks(now, 7);

      const weeks = eachWeekOfInterval({
        start: weeksAgo8,
        end: now
      }, { weekStartsOn: 1 }); // Monday as start of week

      const applicationsRef = collection(db, 'projectApplications');
      const qApplications = query(
        applicationsRef,
        where('companyId', '==', user.uid)
      );
      const applicationsSnapshot = await getDocs(qApplications);

      // Group applications by week
      const applicationsByWeek = new Map<string, { count: number; start: Date; end: Date }>();
      weeks.forEach(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekLabel = `${format(weekStart, 'dd', { locale: it })}-${format(weekEnd, 'dd MMM', { locale: it })}`;
        applicationsByWeek.set(weekLabel, { count: 0, start: weekStart, end: weekEnd });
      });

      applicationsSnapshot.forEach(doc => {
        const appData = doc.data();
        if (appData.applicationDate) {
          const appDate = (appData.applicationDate as Timestamp).toDate();

          // Find which week this application belongs to
          applicationsByWeek.forEach((weekData, weekLabel) => {
            if (isWithinInterval(appDate, { start: weekData.start, end: weekData.end })) {
              weekData.count++;
            }
          });
        }
      });

      setTimelineData(
        Array.from(applicationsByWeek.entries()).map(([date, data]) => ({
          date,
          count: data.count,
        }))
      );

      // Fetch projects to analyze top skills
      const projectsRef = collection(db, 'projects');
      const qProjects = query(
        projectsRef,
        where('companyId', '==', user.uid)
      );
      const projectsSnapshot = await getDocs(qProjects);

      const skillsMap = new Map<string, number>();
      projectsSnapshot.forEach(doc => {
        const project = doc.data();
        if (project.requiredSkills && Array.isArray(project.requiredSkills)) {
          project.requiredSkills.forEach((skill: string) => {
            skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
          });
        }
      });

      // Get top 5 skills
      const sortedSkills = Array.from(skillsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setTopSkillsData(sortedSkills);

      // Fetch recent projects (last 3)
      const qRecentProjects = query(
        projectsRef,
        where('companyId', '==', user.uid),
        orderBy('postedAt', 'desc'),
        limit(3)
      );
      const recentProjectsSnapshot = await getDocs(qRecentProjects);
      const projects: Project[] = [];
      recentProjectsSnapshot.forEach(doc => {
        projects.push({ id: doc.id, ...doc.data() } as Project);
      });
      setRecentProjects(projects);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [user, db, authLoading, userProfile]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const animatedActiveProjects = useCountAnimation(activeProjectsCount ?? 0);
  const animatedNewCandidates = useCountAnimation(newCandidatesCount ?? 0);
  const animatedAcceptedMatches = useCountAnimation(acceptedMatchesCount ?? 0);
  const animatedUnreadNotifications = useCountAnimation(unreadCompanyNotificationsCount ?? 0);

  if (authLoading && !userProfile) {
     return (
      <div className="p-8 space-y-4 w-full max-w-7xl mx-auto px-4 bg-gray-50">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-4" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'company') {
    return <div className="text-center py-10">Accesso non autorizzato o profilo non trovato.</div>;
  }

  const isProfileComplete = userProfile.companyDescription && userProfile.industry;

  return (
    <div className="p-8 space-y-4 w-full max-w-7xl mx-auto px-4 bg-gray-50">
      {/* Hero Section - Welcome Card */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {`Ciao, ${userProfile.companyName || userProfile.displayName}`}
                </h1>
                <p className="text-sm text-gray-600">Dashboard aziendale BIMatch</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE}>
                <Button size="lg" className="gap-2 bg-[#008080] hover:bg-[#006666] text-white">
                  <Edit2 className="h-4 w-4" />
                  Modifica Profilo
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Incomplete Alert */}
      {!isProfileComplete && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Completa il tuo profilo</p>
                <p className="text-sm text-gray-600 mt-4">
                  Aumenta la visibilità aggiungendo informazioni aziendali.
                </p>
              </div>
              <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE}>
                <Button size="sm" className="bg-[#008080] hover:bg-[#006666] text-white">Completa ora</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {errorCounts && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8 flex items-center gap-4">
            <WifiOff className="h-4 w-4 text-gray-600 flex-shrink-0" />
            <p className="text-sm text-gray-900 font-medium">{errorCounts}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Nuovo Progetto */}
        <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}>
          <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors cursor-pointer h-full">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Azione Rapida</p>
                  <div className="flex items-center gap-2">
                    <FolderPlus className="h-5 w-5 text-[#008080]" />
                    <h3 className="text-sm font-semibold text-gray-900">Nuovo Progetto</h3>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Progetti Attivi */}
        <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS}>
          <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors cursor-pointer h-full">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Progetti Attivi</p>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-gray-700" />
                    {loadingCounts ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-900">{animatedActiveProjects}</h3>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Candidati */}
        <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=candidates`}>
          <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors cursor-pointer h-full">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Nuovi Candidati</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-700" />
                    {loadingCounts ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-900">{animatedNewCandidates}</h3>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* BIMatch */}
        <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=active_collaborations`}>
          <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors cursor-pointer h-full">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">BIMatch</p>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-gray-700" />
                    {loadingCounts ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-900">{animatedAcceptedMatches}</h3>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Notifiche */}
        <Link href={ROUTES.DASHBOARD_COMPANY_NOTIFICATIONS}>
          <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors cursor-pointer h-full">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Notifiche</p>
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-700" />
                    {loadingCounts ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <h3 className="text-2xl font-bold text-gray-900">{animatedUnreadNotifications}</h3>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Analytics Section */}
      {loadingAnalytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-8">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-[380px] w-full" />
            </CardContent>
          </Card>
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-8">
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-[380px] w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Applications Timeline */}
          {timelineData.length > 0 && (
            <ApplicationsTimelineChart data={timelineData} title="Candidature Ultime 8 Settimane" />
          )}

          {/* Top Skills */}
          {topSkillsData.length > 0 && (
            <TopSkillsChart data={topSkillsData} title="Skills Più Richieste" />
          )}
        </div>
      )}

      {/* Recent Projects */}
      {!loadingAnalytics && recentProjects.length > 0 && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-900">Progetti Recenti</h3>
              <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS}>
                <Button variant="outline" size="sm">
                  Vedi Tutti
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:border-[#008080] transition-colors"
                >
                  <div className="flex-1">
                    <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                      <h4 className="text-sm font-semibold text-gray-900 hover:text-[#008080] transition-colors">
                        {project.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-gray-600 mt-1">
                      {project.location} • Pubblicato il {project.postedAt ? format((project.postedAt as Timestamp).toDate(), 'dd MMM yyyy', { locale: it }) : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={project.status === 'attivo' ? 'default' : 'secondary'} className="text-xs">
                      {project.status}
                    </Badge>
                    <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                      <Button variant="outline" size="sm">
                        Dettagli
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loadingAnalytics && recentProjects.length === 0 && topSkillsData.length === 0 && (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-16 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">Nessun dato disponibile</h3>
            <p className="text-sm text-gray-600 mb-6">
              Pubblica il tuo primo progetto per visualizzare statistiche e analisi.
            </p>
            <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}>
              <Button className="bg-[#008080] hover:bg-[#006666]">
                <FolderPlus className="mr-2 h-4 w-4" />
                Pubblica Progetto
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

export default memo(CompanyDashboardPage);
