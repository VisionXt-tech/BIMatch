
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, ProjectApplication } from '@/types/project';
import type { ProfessionalProfile } from '@/types/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MapPin, Briefcase, Settings, Code2, CalendarDays, Wallet, FileText, Send, CheckCircle2, XCircle, UserCircle2, Building, Info, Trash2 } from 'lucide-react';
import { ROUTES, BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'P';
  const names = name.split(' ');
  if (names.length > 1 && names[0] && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getLabelForValue = (options: { value: string; label: string }[], value?: string): string | undefined => {
  return options.find(opt => opt.value === value)?.label;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { db } = useFirebase();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const [errorProject, setErrorProject] = useState<string | null>(null);
  
  const [isApplying, setIsApplying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [checkingApplication, setCheckingApplication] = useState(true);

  const projectId = typeof params?.projectId === 'string' ? params.projectId : null;

  const fetchProjectData = useCallback(async () => {
    if (!projectId || !db) {
      setErrorProject("ID Progetto non valido o database non disponibile.");
      setLoadingProject(false);
      return;
    }
    setLoadingProject(true);
    setErrorProject(null);
    try {
      const projectDocRef = doc(db, 'projects', projectId);
      const projectDocSnap = await getDoc(projectDocRef);
      if (projectDocSnap.exists()) {
        setProject({ id: projectDocSnap.id, ...projectDocSnap.data() } as Project);
      } else {
        setErrorProject('Progetto non trovato.');
        setProject(null);
      }
    } catch (e: any) {
      console.error("Error fetching project:", e);
      setErrorProject(e.message || 'Errore nel caricamento del progetto.');
    } finally {
      setLoadingProject(false);
    }
  }, [projectId, db]);

  const checkExistingApplication = useCallback(async () => {
    if (!projectId || !user || !db || userProfile?.role !== 'professional') {
      setCheckingApplication(false);
      return;
    }
    setCheckingApplication(true);
    try {
      const q = query(
        collection(db, 'projectApplications'),
        where('projectId', '==', projectId),
        where('professionalId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setHasApplied(true);
        setApplicationId(querySnapshot.docs[0].id); // Store the application ID
      } else {
        setHasApplied(false);
        setApplicationId(null);
      }
    } catch (error) {
      console.error("Error checking existing application:", error);
      toast({ title: "Errore", description: "Impossibile verificare lo stato della candidatura.", variant: "destructive" });
    } finally {
      setCheckingApplication(false);
    }
  }, [projectId, user, userProfile, db, toast]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    if (!authLoading && user && userProfile?.role === 'professional') {
      checkExistingApplication();
    } else if (!authLoading) {
      setCheckingApplication(false); // User not logged in or not professional
    }
  }, [authLoading, user, userProfile, checkExistingApplication]);

  const handleApply = async () => {
    if (!user || !userProfile || userProfile.role !== 'professional' || !project || !db) {
      toast({ title: "Azione non permessa", description: "Devi essere un professionista autenticato per candidarti.", variant: "destructive" });
      return;
    }
    if (hasApplied) {
      toast({ title: "Già Candidato", description: "Ti sei già candidato per questo progetto.", variant: "default" });
      return;
    }

    setIsApplying(true);
    try {
      const applicationData: Omit<ProjectApplication, 'id'> = {
        projectId: project.id!,
        professionalId: user.uid,
        professionalName: userProfile.displayName || `${(userProfile as ProfessionalProfile).firstName} ${(userProfile as ProfessionalProfile).lastName}`,
        professionalEmail: userProfile.email || '',
        applicationDate: serverTimestamp(),
        status: 'inviata',
      };
      const docRef = await addDoc(collection(db, 'projectApplications'), applicationData);
      toast({ title: "Candidatura Inviata!", description: `La tua candidatura per "${project.title}" è stata inviata con successo.` });
      setHasApplied(true);
      setApplicationId(docRef.id); // Store new application ID
    } catch (error: any) {
      console.error("Error applying to project:", error);
      toast({ title: "Errore Candidatura", description: error.message || "Impossibile inviare la candidatura.", variant: "destructive" });
    } finally {
      setIsApplying(false);
    }
  };

  const handleWithdrawApplication = async () => {
    if (!user || !userProfile || userProfile.role !== 'professional' || !project || !applicationId || !db) {
      toast({ title: "Azione non permessa", description: "Impossibile ritirare la candidatura.", variant: "destructive" });
      return;
    }
    setIsWithdrawing(true);
    try {
      const appDocRef = doc(db, 'projectApplications', applicationId);
      await deleteDoc(appDocRef);
      toast({ title: "Candidatura Ritirata", description: `La tua candidatura per "${project.title}" è stata ritirata.` });
      setHasApplied(false);
      setApplicationId(null);
    } catch (error: any) {
      console.error("Error withdrawing application:", error);
      toast({ title: "Errore Ritiro Candidatura", description: error.message || "Impossibile ritirare la candidatura.", variant: "destructive" });
    } finally {
      setIsWithdrawing(false);
    }
  };


  if (loadingProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Card className="shadow-xl">
          <CardHeader className="p-6 border-b">
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (errorProject) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive mb-2">Errore nel caricamento del progetto</p>
        <p className="text-muted-foreground mb-6">{errorProject}</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna Indietro
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground">Progetto non disponibile.</p>
         <Button onClick={() => router.back()} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna Indietro
        </Button>
      </div>
    );
  }
  
  const deadlineDate = project.applicationDeadline && (project.applicationDeadline as Timestamp).toDate 
    ? (project.applicationDeadline as Timestamp).toDate() 
    : null;
  
  const isDeadlinePassed = deadlineDate ? deadlineDate < new Date() : false;
  const canInteractWithApplication = user && userProfile?.role === 'professional' && !isDeadlinePassed;


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 group text-sm">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Torna alla Lista
      </Button>

      <Card className="shadow-xl border overflow-hidden">
        <CardHeader className="p-6 bg-muted/30 border-b">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-grow">
              <CardTitle className="text-2xl md:text-3xl font-bold text-primary mb-1.5">{project.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                {project.companyLogo ? (
                  <Image data-ai-hint="company logo" src={project.companyLogo} alt={`${project.companyName} logo`} width={20} height={20} className="mr-2 rounded-sm border" />
                ) : (
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                )}
                <span>Pubblicato da: <strong>{project.companyName}</strong></span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" /> {project.location}
              </div>
            </div>
            <div className="shrink-0 text-xs text-muted-foreground text-left md:text-right">
                <p>Pubblicato il: {project.postedAt && (project.postedAt as Timestamp).toDate ? (project.postedAt as Timestamp).toDate().toLocaleDateString('it-IT') : 'N/A'}</p>
                {deadlineDate && (
                     <p className={isDeadlinePassed ? "text-destructive font-semibold" : ""}>
                        Scadenza: {deadlineDate.toLocaleDateString('it-IT')} {isDeadlinePassed && "(Scaduto)"}
                    </p>
                )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/>Descrizione del Progetto</h3>
              <p className="text-foreground/80 whitespace-pre-line leading-relaxed text-sm">{project.description}</p>
            </div>

            {project.requiredSkills && project.requiredSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Settings className="mr-2 h-5 w-5 text-primary"/>Competenze BIM Richieste</h3>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills.map(skillKey => {
                    const skill = getLabelForValue(BIM_SKILLS_OPTIONS, skillKey);
                    return skill ? <Badge key={skillKey} variant="secondary" className="text-xs py-1 px-2.5 bg-primary/10 text-primary border-primary/30">{skill}</Badge> : null;
                  })}
                </div>
              </div>
            )}

            {project.requiredSoftware && project.requiredSoftware.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center"><Code2 className="mr-2 h-5 w-5 text-primary"/>Software Richiesti</h3>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSoftware.map(swKey => {
                    const software = getLabelForValue(SOFTWARE_PROFICIENCY_OPTIONS, swKey);
                    return software ? <Badge key={swKey} variant="outline" className="text-xs py-1 px-2.5">{software}</Badge> : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6 pt-2 lg:pt-0 lg:border-l lg:pl-8">
            <Card className="bg-muted/30 shadow-sm">
                <CardHeader className="pb-3 pt-4 px-4"><CardTitle className="text-md font-semibold flex items-center"><Briefcase className="mr-2 h-4 w-4 text-primary"/>Dettagli Contratto</CardTitle></CardHeader>
                <CardContent className="space-y-2.5 text-sm px-4 pb-4">
                    {project.projectType && <p><strong className="text-foreground/90">Tipo:</strong> {project.projectType}</p>}
                    {project.duration && <p><strong className="text-foreground/90">Durata:</strong> {project.duration}</p>}
                    {project.budgetRange && <p><strong className="text-foreground/90">Budget/RAL:</strong> {project.budgetRange}</p>}
                </CardContent>
            </Card>
            
            {!authLoading && canInteractWithApplication && (
              <div className="mt-6">
                {checkingApplication ? (
                  <Button className="w-full" disabled>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifica candidatura...
                  </Button>
                ) : hasApplied ? (
                  <Button className="w-full" onClick={handleWithdrawApplication} disabled={isWithdrawing} variant="outline">
                    {isWithdrawing ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Trash2 className="mr-2 h-5 w-5" />
                    )}
                    {isWithdrawing ? 'Ritiro in corso...' : 'Ritira Candidatura'}
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleApply} disabled={isApplying}>
                    {isApplying ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Send className="mr-2 h-5 w-5" />
                    )}
                    {isApplying ? 'Invio candidatura...' : 'Candidati per questo Progetto'}
                  </Button>
                )}
              </div>
            )}
             {!authLoading && user && userProfile?.role === 'professional' && isDeadlinePassed && (
                 <Button className="w-full" disabled variant="destructive">
                    <XCircle className="mr-2 h-5 w-5" /> Termine Candidature Scaduto
                </Button>
             )}
             {!user && !authLoading && (
                 <Card className="bg-accent/10 border-accent/30 text-center p-4">
                     <p className="text-sm text-accent-foreground/90 mb-2">Per candidarti, accedi come professionista.</p>
                     <Button size="sm" asChild>
                         <Link href={`${ROUTES.LOGIN}?redirect=/projects/${projectId}`}>Accedi o Registrati</Link>
                     </Button>
                 </Card>
             )}
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-muted/30 border-t">
           <p className="text-xs text-muted-foreground">ID Progetto: {project.id}</p>
        </CardFooter>
      </Card>
    </div>
  );
}

