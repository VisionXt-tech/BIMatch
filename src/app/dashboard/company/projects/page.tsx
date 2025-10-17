
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {isFilteringByCandidates ? "Progetti con Candidature" : "I Miei Progetti"}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isFilteringByCandidates
                  ? "Progetti con almeno una candidatura"
                  : "Gestisci i tuoi progetti BIM"
                }
              </p>
            </div>
            <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}>
              <Button size="lg" className="gap-2 bg-[#008080] hover:bg-[#006666] text-white">
                <PlusCircle className="h-4 w-4" />
                Nuovo Progetto
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Projects List Card */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <WifiOff className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-semibold text-gray-900 mb-2">Errore di Caricamento</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : displayedProjects.length > 0 ? (
            <div className="space-y-4">
              {displayedProjects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:border-[#008080] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <Link href={ROUTES.PROJECT_DETAILS(project.id!)}>
                        <h3 className="text-base font-semibold text-gray-900 hover:text-[#008080] transition-colors">
                          {project.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Pubblicato: {project.postedAt && (project.postedAt as Timestamp).toDate ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT') : 'N/A'} • {project.location}
                      </p>
                    </div>
                    <StatusBadge
                      status={project.status as ProjectStatus}
                      type="project"
                      showIcon
                      size="sm"
                    />
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
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
                        <Users className="mr-2 h-4 w-4" /> Candidati ({project.applicationsCount || 0})
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={project.status === 'completato' || project.status === 'chiuso'}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Chiudi
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Conferma Chiusura</AlertDialogTitle>
                          <AlertDialogDescription>
                            Chiudere "{project.title}"? Azione irreversibile.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annulla</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleConfirmCloseProject(project)}>Conferma</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
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
