
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Users, Edit3, Trash2, Eye, PlusCircle, WifiOff, Info } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types/project';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, Timestamp, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import type { ProjectStatus } from '@/components/StatusBadge';
import { EmptyStateIllustration } from '@/components/EmptyState';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSearchParams } from 'next/navigation';

export default function CompanyProjectsPage() {
  const { db } = useFirebase();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [companyProjects, setCompanyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectsWithApplicationCounts = useCallback(async () => {
    if (authLoading || !user || !userProfile || userProfile.role !== 'company' || !db) {
      if (!authLoading && (!user || userProfile?.role !== 'company')) {
        setError("Devi essere un'azienda autenticata per visualizzare i progetti.");
      }
      if (!authLoading && !db) {
        setError("Database non disponibile.");
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const projectsCollectionRef = collection(db, 'projects');
      const qProjects = query(projectsCollectionRef, where('companyId', '==', user.uid), orderBy('postedAt', 'desc'));
      const projectsSnapshot = await getDocs(qProjects);
      const fetchedProjects: Project[] = [];
      projectsSnapshot.forEach((doc) => {
        fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
      });

      const projectsWithCounts = await Promise.all(
        fetchedProjects.map(async (project) => {
          if (!project.id) return project; 
          const applicationsQuery = query(
            collection(db, 'projectApplications'),
            where('projectId', '==', project.id)
          );
          const applicationsSnapshot = await getDocs(applicationsQuery);
          return { ...project, applicationsCount: applicationsSnapshot.size };
        })
      );

      setCompanyProjects(projectsWithCounts);
    } catch (e: any) {
      console.error("Error fetching company projects or application counts:", e);
      let specificError = "Errore nel caricamento dei progetti e/o conteggio candidati.";
      if (typeof e.message === 'string') {
        if (e.message.includes('offline') || e.message.includes('Failed to get document because the client is offline')) {
          specificError = "Connessione persa. Controlla la tua rete.";
        } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
          specificError = "Permessi insufficienti per caricare i dati. Controlla le regole di Firestore.";
        } else if (e.message.includes('indexes?create_composite=')) {
          specificError = "Indice Firestore mancante. Controlla la console per il link per crearlo (probabilmente per la query dei progetti o delle candidature).";
        }
      }
      setError(specificError);
    } finally {
      setLoading(false);
    }
  }, [db, user, userProfile, authLoading]);

  useEffect(() => {
    fetchProjectsWithApplicationCounts();
  }, [fetchProjectsWithApplicationCounts]);

  const displayedProjects = useMemo(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'candidates') {
      return companyProjects.filter(p => p.applicationsCount && p.applicationsCount > 0);
    }
    return companyProjects;
  }, [companyProjects, searchParams]);

  const handleConfirmCloseProject = async (projectToClose: Project) => {
    if (!projectToClose || !db) return;
    try {
      const projectRef = doc(db, 'projects', projectToClose.id!);
      await updateDoc(projectRef, { status: 'chiuso', updatedAt: serverTimestamp() });
      toast({ title: "Progetto Chiuso", description: `Il progetto "${projectToClose.title}" è stato chiuso.` });
      setCompanyProjects(prev => prev.map(p => p.id === projectToClose.id ? {...p, status: 'chiuso', updatedAt: Timestamp.now()} : p));
    } catch (error: any) {
      toast({ title: "Errore", description: `Impossibile chiudere il progetto: ${error.message}`, variant: "destructive"});
    }
  };
  
  const isFilteringByCandidates = searchParams.get('filter') === 'candidates';

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="px-4 pt-3 pb-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">
                {isFilteringByCandidates ? "Progetti con Candidature" : "I Miei Progetti Pubblicati"}
              </CardTitle>
              <CardDescription className="text-sm">
                {isFilteringByCandidates 
                  ? "Elenco dei tuoi progetti che hanno ricevuto almeno una candidatura." 
                  : "Gestisci i tuoi progetti BIM, visualizza le candidature e trova i migliori talenti."
                }
              </CardDescription>
            </div>
            <Button asChild size="sm">
                <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}><PlusCircle className="mr-2 h-4 w-4" /> Pubblica Nuovo Progetto</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 py-2">
          {loading ? (
            <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="shadow-lg"><CardHeader className="px-3 pt-2 pb-1"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-3 w-1/2 mt-1" /></CardHeader><CardContent className="px-3 py-2 space-y-2"><Skeleton className="h-4 w-1/4" /><div className="flex flex-wrap gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></CardContent></Card>
                ))}
            </div>
          ) : error ? (
             <div className="text-center py-8 border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg">
              <WifiOff className="mx-auto h-12 w-12 text-destructive mb-3" />
              <p className="text-lg font-semibold text-destructive mb-1">Errore di Caricamento</p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          ) : displayedProjects.length > 0 ? (
            <div className="space-y-3">
              {displayedProjects.map((project, index) => (
                <Card key={project.id} className={cn(
                  "shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 animate-fade-in opacity-0",
                  `animate-stagger-${(index % 6) + 1}`
                )}>
                  <CardHeader className="px-3 pt-2 pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg hover:text-primary transition-colors">
                                <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>{project.title}</Link>
                            </CardTitle>
                            <div className="text-xs text-muted-foreground mt-1">
                                Pubblicato: {project.postedAt && (project.postedAt as Timestamp).toDate ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT') : 'N/A'} - Località: {project.location}
                            </div>
                        </div>
                        <StatusBadge
                          status={project.status as ProjectStatus}
                          type="project"
                          showIcon
                          size="sm"
                        />
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 py-2">
                    <div className="flex items-center text-xs text-muted-foreground mb-3">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{project.applicationsCount || 0} Candidati</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                          <Eye className="mr-2 h-4 w-4" /> Visualizza
                        </Link>
                      </Button>
                       <Button size="sm" variant="outline" asChild disabled={project.status === 'chiuso' || project.status === 'completato'}>
                        <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}/${project.id}/edit`}>
                          <Edit3 className="mr-2 h-4 w-4" /> Modifica
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`${ROUTES.DASHBOARD_COMPANY_CANDIDATES}?projectId=${project.id}`}>
                          <Users className="mr-2 h-4 w-4" /> Vedi Candidati ({project.applicationsCount || 0})
                        </Link>
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={project.status === 'completato' || project.status === 'chiuso'}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Chiudi Progetto
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Conferma Chiusura Progetto</AlertDialogTitle>
                            <AlertDialogDescription>
                              Sei sicuro di voler chiudere il progetto "{project.title}"? Questa azione non può essere annullata e il progetto non riceverà più candidature.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleConfirmCloseProject(project)}>Conferma Chiusura</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isFilteringByCandidates ? (
            <EmptyStateIllustration
              illustration="applications"
              title="Nessun Progetto con Candidature"
              description="Al momento, nessuno dei tuoi progetti attivi ha ricevuto candidature. Controlla più tardi o rivedi i dettagli dei tuoi progetti."
              action={{
                label: "Vedi Tutti i Progetti",
                href: ROUTES.DASHBOARD_COMPANY_PROJECTS
              }}
            />
          ) : (
            <EmptyStateIllustration
              illustration="projects"
              title="Nessun Progetto Pubblicato"
              description="Non hai ancora pubblicato nessun progetto sulla piattaforma. Inizia ora a trovare i migliori talenti BIM per i tuoi progetti."
              action={{
                label: "Pubblica il Tuo Primo Progetto",
                href: ROUTES.DASHBOARD_COMPANY_POST_PROJECT
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
