
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, ITALIAN_REGIONS, ROUTES } from '@/constants';
import { Briefcase, MapPin, Percent, Search, Filter, Construction, Code2, WifiOff, ListFilter, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Project, ProjectApplication } from '@/types/project';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, Timestamp, orderBy, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectCardSkeleton } from '@/components/ui/skeleton-card';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EmptyStateIllustration } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import type { ApplicationStatus } from '@/components/StatusBadge';
import { useCountAnimation } from '@/hooks/useCountAnimation';
import { ProjectCard } from '@/components/ProjectCard';

const getSkillLabel = (value: string) => BIM_SKILLS_OPTIONS.find(s => s.value === value)?.label || value;
const getSoftwareLabel = (value: string) => SOFTWARE_PROFICIENCY_OPTIONS.find(s => s.value === value)?.label || value;

const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__";
const APPLICATION_STATUS_APPLIED = "APPLIED"; 
const APPLICATION_STATUS_NOT_APPLIED = "NOT_APPLIED";
const APPLICATION_STATUS_ACCEPTED = "ACCEPTED"; 
const APPLICATION_STATUS_REJECTED = "REJECTED"; 

const applicationStatusOptions = [
    { value: ALL_ITEMS_FILTER_VALUE, label: "Tutti gli stati candidatura" },
    { value: APPLICATION_STATUS_APPLIED, label: "Solo Candidati (non rifiutati)" },
    { value: APPLICATION_STATUS_NOT_APPLIED, label: "Solo Non Candidati" },
    { value: APPLICATION_STATUS_ACCEPTED, label: "Solo Accettate" },
    { value: APPLICATION_STATUS_REJECTED, label: "Solo Rifiutate" },
];

const MAX_ITEMS_PREVIEW = 4; // Increased from 2 for better information density 

export default function AvailableProjectsPage() {
  const { db } = useFirebase();
  const { user, userProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [userApplicationDetails, setUserApplicationDetails] = useState<Array<{ projectId: string; status: ProjectApplication['status'] }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    skill: ALL_ITEMS_FILTER_VALUE,
    software: ALL_ITEMS_FILTER_VALUE,
    location: ALL_ITEMS_FILTER_VALUE,
    applicationStatus: ALL_ITEMS_FILTER_VALUE,
  });

  const resetFilters = () => {
    setFilters({
      skill: ALL_ITEMS_FILTER_VALUE,
      software: ALL_ITEMS_FILTER_VALUE,
      location: ALL_ITEMS_FILTER_VALUE,
      applicationStatus: ALL_ITEMS_FILTER_VALUE,
    });
  };

  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'applied' && userProfile?.role === 'professional') {
      setFilters(prev => ({ ...prev, applicationStatus: APPLICATION_STATUS_APPLIED }));
    }
    if (filterParam === 'accepted' && userProfile?.role === 'professional') {
      setFilters(prev => ({ ...prev, applicationStatus: APPLICATION_STATUS_ACCEPTED }));
    }
  }, [searchParams, userProfile, loadingApplications]);

  useEffect(() => {
    const fetchProjectsAndApplications = async () => {
      if (!db) {
        setError("Database non disponibile.");
        setLoading(false);
        setLoadingApplications(false);
        return;
      }
      setLoading(true);
      setLoadingApplications(true);
      setError(null);

      try {
        const projectsCollectionRef = collection(db, 'projects');
        const qProjects = query(projectsCollectionRef, where('status', '==', 'attivo'), orderBy('postedAt', 'desc'));
        const querySnapshotProjects = await getDocs(qProjects);
        const fetchedProjects: Project[] = [];
        querySnapshotProjects.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(fetchedProjects);
      } catch (e: any) {
        console.error("Error fetching projects:", e);
        let specificError = "Errore nel caricamento dei progetti.";
         if (typeof e.message === 'string') {
            if (e.message.includes('offline') || e.message.includes('Failed to get document because the client is offline')) {
                specificError = "Connessione persa. Controlla la tua rete.";
            } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
                specificError = "Permessi insufficienti per caricare i progetti. Controlla le regole di Firestore.";
            } else if (e.message.includes('indexes?create_composite=')) {
                specificError = "Indice Firestore mancante per i progetti. Controlla la console per il link per crearlo.";
            }
        }
        setError(specificError);
      } finally {
        setLoading(false);
      }

      if (user && userProfile?.role === 'professional') {
        try {
          const appsCollectionRef = collection(db, 'projectApplications');
          const qApps = query(appsCollectionRef, where('professionalId', '==', user.uid));
          const querySnapshotApps = await getDocs(qApps);
          const fetchedAppDetails: Array<{ projectId: string; status: ProjectApplication['status'] }> = [];
          querySnapshotApps.forEach((doc) => {
            const appData = doc.data() as ProjectApplication;
            fetchedAppDetails.push({ projectId: appData.projectId, status: appData.status });
          });
          setUserApplicationDetails(fetchedAppDetails);
        } catch (e: any) {
          console.error("Error fetching user applications:", e);
        } finally {
          setLoadingApplications(false);
        }
      } else {
        setLoadingApplications(false);
      }
    };
    if (!authLoading) {
        fetchProjectsAndApplications();
    }
  }, [db, user, userProfile, authLoading]);

  const filteredProjects = useMemo(() => {
    if (filters.applicationStatus !== ALL_ITEMS_FILTER_VALUE && loadingApplications && userProfile?.role === 'professional') {
        return []; 
    }

    return projects.filter(project => {
      const skillMatch = filters.skill === ALL_ITEMS_FILTER_VALUE || (project.requiredSkills && project.requiredSkills.includes(filters.skill));
      const softwareMatch = filters.software === ALL_ITEMS_FILTER_VALUE || (project.requiredSoftware && project.requiredSoftware.includes(filters.software));
      const locationMatch = filters.location === ALL_ITEMS_FILTER_VALUE || project.location === filters.location;
      
      let applicationStatusMatch = true;
      if (userProfile?.role === 'professional' && !loadingApplications) {
        const currentAppDetail = userApplicationDetails.find(app => app.projectId === project.id!);
        const hasAppliedForFilter = !!currentAppDetail;

        if (filters.applicationStatus === APPLICATION_STATUS_APPLIED) {
            applicationStatusMatch = hasAppliedForFilter && currentAppDetail?.status !== 'rifiutata';
        } else if (filters.applicationStatus === APPLICATION_STATUS_NOT_APPLIED) {
            applicationStatusMatch = !hasAppliedForFilter;
        } else if (filters.applicationStatus === APPLICATION_STATUS_ACCEPTED) {
            applicationStatusMatch = hasAppliedForFilter && currentAppDetail?.status === 'accettata';
        } else if (filters.applicationStatus === APPLICATION_STATUS_REJECTED) {
            applicationStatusMatch = hasAppliedForFilter && currentAppDetail?.status === 'rifiutata';
        }
      }
      return skillMatch && softwareMatch && locationMatch && applicationStatusMatch && project.status === 'attivo';
    });
  }, [projects, filters, userApplicationDetails, userProfile, loadingApplications]);

  // Animated project count
  const animatedCount = useCountAnimation(filteredProjects.length);

  return (
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4">
      {/* Card for Filters */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center gap-4">
            <ListFilter className="h-5 w-5 text-gray-700" />
            <CardTitle className="text-lg font-semibold text-gray-900">Filtra Progetti</CardTitle>
            <Badge variant="secondary" className="ml-auto text-sm animate-count-up">
              {animatedCount} {animatedCount === 1 ? 'trovato' : 'trovati'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select onValueChange={(value) => setFilters(prev => ({...prev, skill: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))} value={filters.skill}>
                <SelectTrigger><SelectValue placeholder="Competenza BIM" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutte le competenze</SelectItem>
                    {BIM_SKILLS_OPTIONS.map(skill => <SelectItem key={skill.value} value={skill.value}>{skill.label}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select onValueChange={(value) => setFilters(prev => ({...prev, software: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))} value={filters.software}>
                <SelectTrigger><SelectValue placeholder="Software" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutti i software</SelectItem>
                    {SOFTWARE_PROFICIENCY_OPTIONS.map(sw => <SelectItem key={sw.value} value={sw.value}>{sw.label}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select onValueChange={(value) => setFilters(prev => ({...prev, location: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))} value={filters.location}>
                <SelectTrigger><SelectValue placeholder="Localizzazione" /></SelectTrigger>
                <SelectContent>
                     <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutte le regioni</SelectItem>
                    {ITALIAN_REGIONS.map(region => <SelectItem key={region} value={region}>{region}</SelectItem>)}
                </SelectContent>
            </Select>
            {userProfile?.role === 'professional' && (
              <Select
                  onValueChange={(value) => setFilters(prev => ({...prev, applicationStatus: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))}
                  value={filters.applicationStatus}
                  disabled={loadingApplications && authLoading}
              >
                  <SelectTrigger><SelectValue placeholder="Stato Candidatura" /></SelectTrigger>
                  <SelectContent>
                      {applicationStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card for Project Results */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="p-8">
            <CardTitle className="text-lg font-semibold text-gray-900">Opportunità Disponibili</CardTitle>
            <CardDescription className="text-sm text-gray-600">Esplora i progetti e candidati a quelli in linea con il tuo profilo.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading || (authLoading && loadingApplications && userProfile?.role === 'professional') ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`animate-fade-in opacity-0 animate-stagger-${(i % 4) + 1}`}>
                    <ProjectCardSkeleton />
                  </div>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg">
              <WifiOff className="mx-auto h-12 w-12 text-destructive mb-4" />
              <p className="text-lg font-semibold text-destructive">Errore di Caricamento</p>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">{error}</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project, index) => {
                const applicationDetail = userProfile?.role === 'professional' && !loadingApplications 
                  ? userApplicationDetails.find(app => app.projectId === project.id!) 
                  : undefined;
                const hasApplied = !!applicationDetail;
                const currentApplicationStatus = applicationDetail?.status;

                return (
                  <div key={project.id} className={cn(
                    "animate-fade-in opacity-0",
                    `animate-stagger-${(index % 4) + 1}`,
                    currentApplicationStatus === 'accettata' && "[&>div]:border-2 [&>div]:border-teal-500 [&>div]:bg-teal-500/5"
                  )}>
                    <ProjectCard
                      project={project}
                      actionButton={
                        <div className="flex items-center gap-2">
                          {hasApplied && currentApplicationStatus && (
                            <StatusBadge
                              status={currentApplicationStatus as ApplicationStatus}
                              type="application"
                              showIcon
                              size="sm"
                            />
                          )}
                          {currentApplicationStatus !== 'accettata' && (
                            <Button size="sm" asChild>
                              <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                                <ExternalLink className="mr-1.5 h-4 w-4"/>
                                {hasApplied ? 'Vedi Dettagli' : 'Candidati Ora'}
                              </Link>
                            </Button>
                          )}
                        </div>
                      }
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyStateIllustration
              illustration="search"
              title="Nessun Progetto Trovato"
              description="Non ci sono progetti che corrispondono ai tuoi criteri di ricerca. Prova a modificare i filtri o controlla più tardi per nuove opportunità."
              action={{
                label: "Resetta Filtri",
                onClick: resetFilters
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
