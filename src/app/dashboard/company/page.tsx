
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Building, Briefcase, Users, FolderPlus, Edit2, WifiOff, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, getDocs, Timestamp, type DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyDashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();

  const [activeProjectsCount, setActiveProjectsCount] = useState<number | null>(null);
  const [newCandidatesCount, setNewCandidatesCount] = useState<number | null>(null);
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
      // 1. Fetch active projects count
      const projectsRef = collection(db, 'projects');
      const qProjects = query(projectsRef, where('companyId', '==', user.uid), where('status', '==', 'attivo'));
      const projectsSnapshot = await getDocs(qProjects);
      setActiveProjectsCount(projectsSnapshot.size);

      // 2. Fetch new candidates count (applications with status 'inviata' for company's projects)
      // This is a bit more complex as it might require fetching all company projects first,
      // then querying applications for those project IDs.
      // For simplicity, if project IDs are readily available on userProfile.projects or similar, use that.
      // Otherwise, a more optimized query or denormalization might be needed for large scale.
      // Current approach: fetch all company projects, then applications for those.

      const companyProjectIds: string[] = [];
      projectsSnapshot.forEach(doc => companyProjectIds.push(doc.id));

      let candidates = 0;
      if (companyProjectIds.length > 0) {
        // Firestore 'in' query supports up to 30 elements in the array
        // If a company has more than 30 projects, this needs chunking or a different strategy
        const MAX_PROJECTS_FOR_IN_QUERY = 30;
        const projectIdsChunks: string[][] = [];
        for (let i = 0; i < companyProjectIds.length; i += MAX_PROJECTS_FOR_IN_QUERY) {
            projectIdsChunks.push(companyProjectIds.slice(i, i + MAX_PROJECTS_FOR_IN_QUERY));
        }
        
        let totalNewCandidates = 0;
        for (const chunk of projectIdsChunks) {
            if (chunk.length > 0) {
                const applicationsRef = collection(db, 'projectApplications');
                const qApplications = query(
                    applicationsRef,
                    where('projectId', 'in', chunk),
                    where('status', '==', 'inviata') // Consider 'inviata' as new
                );
                const applicationsSnapshot = await getDocs(qApplications);
                totalNewCandidates += applicationsSnapshot.size;
            }
        }
        candidates = totalNewCandidates;
      }
      setNewCandidatesCount(candidates);

    } catch (e: any) {
      console.error("Error fetching company dashboard counts:", e);
      let specificError = "Errore nel caricamento dei dati della dashboard.";
       if (typeof e.message === 'string') {
            if (e.message.includes('offline')) {
                specificError = "Connessione persa. Controlla la tua rete.";
            } else if (e.message.includes('permission-denied') || e.message.includes('PERMISSION_DENIED')) {
                specificError = "Permessi insufficienti per caricare i dati.";
            } else if (e.message.includes('indexes?create_composite=')) {
                specificError = "Indice Firestore mancante. Controlla la console per il link per crearlo.";
                 if (e.message.includes('projectApplications') && e.message.includes('projectId') && e.message.includes('status')) {
                    specificError = "Indice Firestore mancante per le candidature. Controlla la console Firebase per il link per crearlo (projectApplications, projectId ASC, status ASC, __name__ ASC).";
                }
            }
        }
      setErrorCounts(specificError);
      setActiveProjectsCount(0);
      setNewCandidatesCount(0);
    } finally {
      setLoadingCounts(false);
    }
  }, [user, db, authLoading, userProfile]);

  useEffect(() => {
    fetchDashboardCounts();
  }, [fetchDashboardCounts]);


  if (authLoading && !userProfile) {
     return (
      <div className="space-y-4 w-full max-w-4xl mx-auto">
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
    <div className="space-y-4 w-full max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="p-4">
          <CardTitle className="text-2xl font-bold text-primary">Benvenuta, {userProfile.companyName || userProfile.displayName}!</CardTitle>
          <CardDescription className="text-md text-muted-foreground">Questa è la tua dashboard BIMatch per gestire progetti e talenti.</CardDescription>
        </CardHeader>
         {!isProfileComplete && (
          <CardContent className="px-4 pt-0 pb-3"> 
             <div className="bg-secondary border-l-4 border-primary text-secondary-foreground p-3 rounded-md" role="alert">
                <p className="font-bold text-sm">Completa il profilo aziendale!</p>
                <p className="text-xs">Un profilo dettagliato attira i migliori professionisti. <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="font-semibold underline hover:text-primary">Aggiorna ora</Link>.</p>
            </div>
          </CardContent>
        )}
      </Card>
      
       {errorCounts && (
        <Card className="shadow-md bg-destructive/10 border-destructive">
            <CardContent className="p-4 text-center text-destructive">
                <WifiOff className="mx-auto h-8 w-8 mb-2" />
                <p className="font-semibold">Errore nel caricamento delle attività</p>
                <p className="text-sm">{errorCounts}</p>
            </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardHeader className="p-4">
            <CardTitle className="text-xl font-semibold">Azioni Rapide</CardTitle>
            <CardDescription className="text-sm">Gestisci le attività principali della tua azienda.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button asChild size="lg" className="w-full">
                <Link href={ROUTES.DASHBOARD_COMPANY_POST_PROJECT} className="flex flex-col items-center justify-center h-28 p-3 text-center">
                    <FolderPlus className="h-6 w-6 mb-1 text-primary-foreground" />
                    <span className="text-sm font-semibold">Pubblica Nuovo Progetto</span>
                    <span className="text-xs text-primary-foreground/80 mt-0.5">Crea e lancia nuove offerte</span>
                </Link>
            </Button>
             <Button asChild variant="secondary" size="lg" className="w-full">
                 <Link href={ROUTES.DASHBOARD_COMPANY_PROJECTS} className="flex flex-col items-center justify-center h-28 p-3 text-center">
                    <Briefcase className="h-6 w-6 mb-1 text-secondary-foreground" />
                    <span className="text-sm font-semibold">Gestisci Progetti</span>
                    {loadingCounts ? <Loader2 className="h-4 w-4 mt-0.5 animate-spin text-secondary-foreground/80" /> :
                        <span className="text-xs text-secondary-foreground/80 mt-0.5">{activeProjectsCount ?? 0} attivi</span>
                    }
                </Link>
            </Button>
             <Button asChild variant="secondary" size="lg" className="w-full">
                <Link href={`${ROUTES.DASHBOARD_COMPANY_PROJECTS}?filter=candidates`} className="flex flex-col items-center justify-center h-28 p-3 text-center">
                    <Users className="h-6 w-6 mb-1 text-secondary-foreground" />
                    <span className="text-sm font-semibold">Visualizza Candidati</span>
                     {loadingCounts ? <Loader2 className="h-4 w-4 mt-0.5 animate-spin text-secondary-foreground/80" /> :
                        <span className="text-xs text-secondary-foreground/80 mt-0.5">{newCandidatesCount ?? 0} nuove candidature</span>
                    }
                </Link>
            </Button>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-semibold">Profilo Aziendale</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
           <div>
                <p className="text-sm text-muted-foreground">Stato del profilo: <span className={isProfileComplete ? "font-semibold text-green-600" : "font-semibold text-yellow-600"}>{isProfileComplete ? "Completo" : "Incompleto"}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">Mantieni aggiornate le informazioni per massimizzare la visibilità.</p>
           </div>
           <Button asChild variant="outline" size="sm" className="mt-2 sm:mt-0 self-start sm:self-center">
             <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} className="flex items-center">
               <Edit2 className="mr-2 h-3 w-3" /> Modifica Profilo
             </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
