
'use client';

import { useState, useEffect } from 'react';
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

const getStatusBadgeVariant = (status: Project['status']) => {
  switch (status) {
    case 'attivo': return 'default';
    case 'in_revisione': return 'secondary';
    case 'completato': return 'outline';
    case 'chiuso': return 'destructive';
    case 'bozza': return 'secondary';
    default: return 'default';
  }
};
const getStatusBadgeText = (status: Project['status']) => {
  switch (status) {
    case 'attivo': return 'Attivo';
    case 'in_revisione': return 'In Revisione';
    case 'completato': return 'Completato';
    case 'chiuso': return 'Chiuso';
    case 'bozza': return 'Bozza';
    default: return status;
  }
};

export default function CompanyProjectsPage() {
  const { db } = useFirebase();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [companyProjects, setCompanyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || !userProfile || userProfile.role !== 'company') {
      setError("Devi essere un'azienda autenticata per visualizzare i progetti.");
      setLoading(false);
      return;
    }

    const fetchCompanyProjects = async () => {
      if (!db) {
        setError("Database non disponibile.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const projectsCollectionRef = collection(db, 'projects');
        const q = query(projectsCollectionRef, where('companyId', '==', user.uid), orderBy('postedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project);
        });
        setCompanyProjects(fetchedProjects);
      } catch (e: any)
      {
        console.error("Error fetching company projects:", e);
        let specificError = "Errore nel caricamento dei progetti.";
        if (typeof e.message === 'string') {
            if (e.message.includes('offline') || e.message.includes('Failed to get document because the client is offline')) {
                specificError = "Connessione persa. Controlla la tua rete.";
            } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
                specificError = "Permessi insufficienti per caricare i progetti. Controlla le regole di Firestore.";
            } else if (e.message.includes('indexes?create_composite=')) {
                specificError = "Indice Firestore mancante. Controlla la console per il link per crearlo.";
            }
        }
        setError(specificError);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProjects();
  }, [db, user, userProfile, authLoading]);

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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="px-4 pt-3 pb-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">I Miei Progetti Pubblicati</CardTitle>
              <CardDescription className="text-sm">Gestisci i tuoi progetti BIM, visualizza le candidature e trova i migliori talenti.</CardDescription>
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
          ) : companyProjects.length > 0 ? (
            <div className="space-y-3">
              {companyProjects.map((project) => (
                <Card key={project.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                        <Badge variant={getStatusBadgeVariant(project.status)} className="mt-1 sm:mt-0 text-xs">
                            {getStatusBadgeText(project.status)}
                        </Badge>
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
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-lg font-semibold mb-1">Non hai ancora pubblicato nessun progetto.</p>
              <p className="text-muted-foreground text-sm mb-3">Inizia ora per trovare i talenti BIM di cui hai bisogno.</p>
              <Button size="md" asChild>
                <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT}><PlusCircle className="mr-2 h-5 w-5" /> Pubblica il Tuo Primo Progetto</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
