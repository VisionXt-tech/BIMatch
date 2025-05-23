
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, orderBy, Timestamp, type DocumentData } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ProjectApplication } from '@/types/project';
import type { ProfessionalProfile } from '@/types/auth';
import type { Project } from '@/types/project';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Users, ArrowLeft, ExternalLink, Mail, Info, WifiOff, Briefcase } from 'lucide-react';
import { ROUTES } from '@/constants';

// Helper function for avatar fallbacks
const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'P';
  const names = name.split(' ');
  if (names.length > 1 && names[0] && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

interface EnrichedApplication extends ProjectApplication {
  professionalProfile?: ProfessionalProfile;
}

export default function CompanyCandidatesPage() {
  const { db } = useFirebase();
  const { user, userProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const projectId = searchParams.get('projectId');

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectAndCandidates = useCallback(async () => {
    if (!projectId || !db) {
      setError("ID progetto non specificato o database non disponibile.");
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (!user || !userProfile || userProfile.role !== 'company') {
        setError("Accesso non autorizzato. Devi essere un'azienda per visualizzare i candidati.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch project details
      const projectDocRef = doc(db, 'projects', projectId);
      const projectDocSnap = await getDoc(projectDocRef);

      if (!projectDocSnap.exists() || projectDocSnap.data()?.companyId !== user.uid) {
        setError("Progetto non trovato o non appartenente a questa azienda.");
        setProject(null);
        setApplications([]);
        setLoading(false);
        return;
      }
      setProject({ id: projectDocSnap.id, ...projectDocSnap.data() } as Project);

      // Fetch applications for the project
      const applicationsQuery = query(
        collection(db, 'projectApplications'),
        where('projectId', '==', projectId),
        orderBy('applicationDate', 'desc')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const fetchedApplications: ProjectApplication[] = [];
      applicationsSnapshot.forEach((doc) => {
        fetchedApplications.push({ id: doc.id, ...doc.data() } as ProjectApplication);
      });

      // Enrich applications with professional profiles
      const enrichedApplications: EnrichedApplication[] = await Promise.all(
        fetchedApplications.map(async (app) => {
          const profDocRef = doc(db, 'users', app.professionalId);
          const profDocSnap = await getDoc(profDocRef);
          if (profDocSnap.exists()) {
            return { ...app, professionalProfile: profDocSnap.data() as ProfessionalProfile };
          }
          return app; // Return app without profile if not found
        })
      );
      setApplications(enrichedApplications);

    } catch (e: any) {
      console.error("Error fetching project candidates:", e);
      let specificError = "Errore nel caricamento dei candidati.";
      if (e.message?.includes('offline')) {
        specificError = "Connessione persa. Controlla la tua rete.";
      } else if (e.message?.includes('permission-denied') || e.message?.includes('PERMISSION_DENIED')) {
        specificError = "Permessi insufficienti per caricare i dati. Controlla le regole di Firestore.";
      } else if (e.message?.includes('indexes?create_composite=')) {
        specificError = "Indice Firestore mancante per le candidature. Controlla la console per il link per crearlo.";
      }
      setError(specificError);
    } finally {
      setLoading(false);
    }
  }, [projectId, db, authLoading, user, userProfile]);

  useEffect(() => {
    fetchProjectAndCandidates();
  }, [fetchProjectAndCandidates]);

  if (authLoading || loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4 mb-2" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-3 border-b">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-grow">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg">
        <WifiOff className="mx-auto h-12 w-12 text-destructive mb-3" />
        <p className="text-lg font-semibold text-destructive mb-1">Errore di Caricamento</p>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna Indietro
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
        <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-lg font-semibold mb-1">Progetto non trovato o non accessibile.</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai Miei Progetti
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS)} className="mb-0">
        <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai Miei Progetti
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Briefcase className="h-6 w-6 text-primary mt-1 shrink-0" />
            <div>
              <CardTitle className="text-xl font-bold">Candidati per: {project.title}</CardTitle>
              <CardDescription className="text-sm">Visualizza i professionisti che si sono candidati per questo progetto.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
                <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-md font-semibold">Nessuna candidatura ricevuta.</p>
                <p className="text-sm text-muted-foreground">Non ci sono ancora candidature per questo progetto.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Professionista</TableHead>
                    <TableHead>Data Candidatura</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={app.professionalProfile?.photoURL || undefined} alt={app.professionalName || 'Professionista'} />
                            <AvatarFallback>{getInitials(app.professionalName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{app.professionalName || 'Nome non disponibile'}</div>
                            {app.professionalProfile?.email && (
                                 <a href={`mailto:${app.professionalProfile.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center">
                                    <Mail className="h-3 w-3 mr-1" /> {app.professionalProfile.email}
                                </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {app.applicationDate && (app.applicationDate as Timestamp).toDate
                          ? (app.applicationDate as Timestamp).toDate().toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'inviata' ? 'secondary' : 'default'}>{app.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {app.professionalProfile?.uid && (
                             <Button variant="outline" size="sm" asChild>
                                <Link href={ROUTES.PROFESSIONAL_PROFILE_VIEW(app.professionalProfile.uid)}>
                                <ExternalLink className="mr-2 h-3.5 w-3.5" /> Vedi Profilo
                                </Link>
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

