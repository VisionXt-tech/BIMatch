
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, ITALIAN_REGIONS, ROUTES } from '@/constants';
import { Briefcase, MapPin, Percent, Search, Filter, Construction, Code2, WifiOff, Info, CheckCircle2, ListFilter, XCircle, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { Project, ProjectApplication } from '@/types/project';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, Timestamp, orderBy, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

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

const MAX_ITEMS_PREVIEW = 2; // Max skills/software to show before "+N more"

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


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="pb-4 pt-5 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-2xl font-bold">Progetti Disponibili</CardTitle>
              <CardDescription className="text-base">Esplora le opportunità BIM che corrispondono al tuo profilo.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-3 md:px-5">
            <Accordion type="single" collapsible className="w-full mb-4 border rounded-lg bg-muted/50 px-3">
              <AccordionItem value="filters" className="border-b-0">
                <AccordionTrigger className="text-md font-semibold hover:no-underline py-3">
                  <div className="flex items-center">
                    <ListFilter className="mr-2 h-4 w-4 text-primary"/> Filtri Avanzati
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                      <Select onValueChange={(value) => setFilters(prev => ({...prev, skill: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))} value={filters.skill}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Competenza BIM" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutte le competenze</SelectItem>
                              {BIM_SKILLS_OPTIONS.map(skill => <SelectItem key={skill.value} value={skill.value} className="text-xs">{skill.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => setFilters(prev => ({...prev, software: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))} value={filters.software}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Software" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutti i software</SelectItem>
                              {SOFTWARE_PROFICIENCY_OPTIONS.map(sw => <SelectItem key={sw.value} value={sw.value} className="text-xs">{sw.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <Select onValueChange={(value) => setFilters(prev => ({...prev, location: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))} value={filters.location}>
                          <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Localizzazione" /></SelectTrigger>
                          <SelectContent>
                               <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Tutte le regioni</SelectItem>
                              {ITALIAN_REGIONS.map(region => <SelectItem key={region} value={region} className="text-xs">{region}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      {userProfile?.role === 'professional' && (
                        <Select 
                            onValueChange={(value) => setFilters(prev => ({...prev, applicationStatus: value === ALL_ITEMS_FILTER_VALUE ? ALL_ITEMS_FILTER_VALUE : value}))} 
                            value={filters.applicationStatus}
                            disabled={loadingApplications && authLoading}
                        >
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Stato Candidatura" /></SelectTrigger>
                            <SelectContent>
                                {applicationStatusOptions.map(opt => <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                      )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          {loading || (authLoading && loadingApplications && userProfile?.role === 'professional') ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="shadow-md relative flex flex-col h-full">
                    <CardHeader className="p-3">
                        <Skeleton className="h-5 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2" />
                    </CardHeader>
                    <CardContent className="p-3 space-y-2 flex-grow">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <div className="flex flex-wrap gap-1 pt-1">
                           <Skeleton className="h-4 w-1/4 rounded-full" />
                           <Skeleton className="h-4 w-1/3 rounded-full" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-3 border-t mt-auto">
                        <Skeleton className="h-8 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : error ? (
            <div className="text-center py-10 border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg">
              <WifiOff className="mx-auto h-12 w-12 text-destructive mb-3" />
              <p className="text-lg font-semibold text-destructive mb-1">Errore di Caricamento</p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => {
                const applicationDetail = userProfile?.role === 'professional' && !loadingApplications 
                  ? userApplicationDetails.find(app => app.projectId === project.id!) 
                  : undefined;
                const hasApplied = !!applicationDetail;
                const currentApplicationStatus = applicationDetail?.status;
                const showStatusBadge = hasApplied || currentApplicationStatus === 'accettata' || currentApplicationStatus === 'rifiutata';

                return (
                  <Card key={project.id} className={cn(
                    "shadow-md hover:shadow-lg transition-shadow duration-200 relative flex flex-col h-full",
                    currentApplicationStatus === 'accettata' && "border-2 border-teal-500 bg-teal-500/5"
                  )}>
                    {currentApplicationStatus === 'accettata' ? (
                        <Badge variant="default" className="absolute top-2 right-2 text-xs px-1.5 py-0.5 z-10 flex items-center gap-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 text-primary-foreground hover:opacity-90">
                            <Star className="h-3 w-3" /> Accettata
                        </Badge>
                    ) : currentApplicationStatus === 'rifiutata' ? (
                        <Badge variant="outline" className="absolute top-2 right-2 text-xs px-1.5 py-0.5 z-10 flex items-center gap-1 border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100">
                            <XCircle className="h-3 w-3" /> Rifiutata
                        </Badge>
                    ) : hasApplied ? (
                        <Badge variant="default" className="absolute top-2 right-2 text-xs px-1.5 py-0.5 z-10 flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle2 className="h-3 w-3" /> Candidato
                        </Badge>
                    ) : null}

                    <CardHeader className={cn("p-3", showStatusBadge ? "pr-16 md:pr-20" : "")}>
                      <CardTitle className="text-base font-semibold hover:text-primary transition-colors line-clamp-2 leading-tight">
                          <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>{project.title}</Link>
                      </CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                          {project.companyLogo ?
                              <Image data-ai-hint="company logo" src={project.companyLogo} alt={`${project.companyName} logo`} width={16} height={16} className="mr-1.5 rounded-sm border" />
                              : <Briefcase className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"/>
                          }
                          <span className="truncate" title={project.companyName}>{project.companyName}</span>
                      </div>
                       <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                            <span>{project.location}</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-3 flex-grow space-y-2">
                      {project.requiredSkills && project.requiredSkills.length > 0 && (
                        <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center"><Construction className="h-3 w-3 mr-1 text-primary/80"/>Competenze:</h4>
                            <div className="flex flex-wrap gap-1">
                                {project.requiredSkills.slice(0,MAX_ITEMS_PREVIEW).map(skillKey => (
                                    <Badge key={skillKey} variant="secondary" className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/20">{getSkillLabel(skillKey)}</Badge>
                                ))}
                                {project.requiredSkills.length > MAX_ITEMS_PREVIEW && <Badge variant="outline" className="text-xs px-1.5 py-0.5">+{project.requiredSkills.length - MAX_ITEMS_PREVIEW}</Badge>}
                            </div>
                        </div>
                      )}
                       {project.requiredSoftware && project.requiredSoftware.length > 0 && (
                          <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center"><Code2 className="h-3 w-3 mr-1 text-primary/80"/>Software:</h4>
                              <div className="flex flex-wrap gap-1">
                                  {project.requiredSoftware.slice(0,MAX_ITEMS_PREVIEW).map(swKey => (
                                      <Badge key={swKey} variant="outline" className="text-xs px-1.5 py-0.5">{getSoftwareLabel(swKey)}</Badge>
                                  ))}
                                  {project.requiredSoftware.length > MAX_ITEMS_PREVIEW && <Badge variant="outline" className="text-xs px-1.5 py-0.5">+{project.requiredSoftware.length - MAX_ITEMS_PREVIEW}</Badge>}
                              </div>
                          </div>
                      )}
                    </CardContent>
                     <CardFooter className="p-3 border-t mt-auto">
                         <div className="flex justify-between items-center w-full">
                            <p className="text-xs text-muted-foreground">
                                {project.postedAt && (project.postedAt as Timestamp).toDate ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT', {day:'2-digit', month:'2-digit', year:'2-digit'}) : 'N/A'}
                            </p>
                            {currentApplicationStatus === 'accettata' ? (
                                <Button size="sm" disabled className="text-xs h-7 px-2 py-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500 text-primary-foreground cursor-default">
                                    <Star className="mr-1 h-3 w-3"/> Accettata
                                </Button>
                            ) : hasApplied ? (
                                currentApplicationStatus === 'rifiutata' ? (
                                <Button size="sm" asChild variant="outline" disabled className="text-xs h-7 px-2 py-1 border-orange-500 text-orange-600 bg-orange-50 cursor-not-allowed">
                                    <span><XCircle className="mr-1 h-3 w-3"/> Rifiutata</span>
                                </Button>
                                ) : (
                                <Button size="sm" asChild className="text-xs h-7 px-2 py-1 bg-green-600 hover:bg-green-700 text-white">
                                    <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                                        <CheckCircle2 className="mr-1 h-3 w-3"/>Già Candidato
                                    </Link>
                                </Button>
                                )
                            ) : (
                                <Button size="sm" asChild className="text-xs h-7 px-2 py-1">
                                    <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                                        <ExternalLink className="mr-1 h-3 w-3"/>Dettagli
                                    </Link>
                                </Button>
                            )}
                         </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg font-semibold">Nessun progetto disponibile al momento.</p>
              <p className="text-muted-foreground text-sm">Controlla più tardi o amplia i tuoi criteri di ricerca.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    