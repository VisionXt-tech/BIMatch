
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, orderBy, Timestamp, type DocumentData, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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
import { Users, ArrowLeft, ExternalLink, Mail, Info, WifiOff, Briefcase, Check, X, Hourglass, FileText, ListChecks, MessageSquare, CalendarDays, Calendar as CalendarIcon, AlertTriangle, Ban } from 'lucide-react';
import { ROUTES, NOTIFICATION_TYPES, BIM_SKILLS_OPTIONS } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import type { UserNotification } from '@/types/notification';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  projectTitle?: string; 
  companyName?: string; 
}

const rejectionFormSchema = z.object({
  rejectionReason: z.string().min(10, { message: "La motivazione del rifiuto deve contenere almeno 10 caratteri." }).max(1000, "La motivazione non può superare i 1000 caratteri."),
});
type RejectionFormData = z.infer<typeof rejectionFormSchema>;

const preselectionFormSchema = z.object({
  interviewProposalMessage: z.string().min(10, { message: "Il messaggio di proposta deve contenere almeno 10 caratteri." }).max(1000, "Il messaggio non può superare i 1000 caratteri."),
  proposedInterviewDate: z.date({ required_error: "La data per il colloquio è richiesta." }),
});
type PreselectionFormData = z.infer<typeof preselectionFormSchema>;


export default function CompanyCandidatesPage() {
  const { db } = useFirebase();
  const { user, userProfile, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const projectId = searchParams.get('projectId');

  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [applicationForModal, setApplicationForModal] = useState<EnrichedApplication | null>(null);
  const [selectedApplicationForDetails, setSelectedApplicationForDetails] = useState<EnrichedApplication | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isPreselectModalOpen, setIsPreselectModalOpen] = useState(false);

  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);


  const rejectionForm = useForm<RejectionFormData>({
    resolver: zodResolver(rejectionFormSchema),
    defaultValues: { rejectionReason: '' },
  });

  const preselectionForm = useForm<PreselectionFormData>({
    resolver: zodResolver(preselectionFormSchema),
    defaultValues: { interviewProposalMessage: '' , proposedInterviewDate: undefined},
  });


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
      const projectDocRef = doc(db, 'projects', projectId);
      const projectDocSnap = await getDoc(projectDocRef);

      if (!projectDocSnap.exists() || projectDocSnap.data()?.companyId !== user.uid) {
        setError("Progetto non trovato o non appartenente a questa azienda.");
        setProject(null);
        setApplications([]);
        setLoading(false);
        return;
      }
      const projectData = { id: projectDocSnap.id, ...projectDocSnap.data() } as Project;
      setProject(projectData);

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

      const enrichedApplications: EnrichedApplication[] = await Promise.all(
        fetchedApplications.map(async (app) => {
          const profDocRef = doc(db, 'users', app.professionalId);
          const profDocSnap = await getDoc(profDocRef);
          if (profDocSnap.exists()) {
            return { 
              ...app, 
              professionalProfile: profDocSnap.data() as ProfessionalProfile,
              projectTitle: projectData.title, 
              companyName: userProfile.companyName || userProfile.displayName || 'Un\'azienda' 
            };
          }
          return {
            ...app,
            projectTitle: projectData.title,
            companyName: userProfile.companyName || userProfile.displayName || 'Un\'azienda'
          };
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

  const updateApplicationAndSendNotification = async (
    application: EnrichedApplication,
    newStatus: ProjectApplication['status'],
    applicationUpdatePayload: Partial<Omit<ProjectApplication, 'id' | 'projectId' | 'professionalId' | 'professionalName' | 'professionalEmail' | 'applicationDate' | 'status'>>,
    notificationTitle: string,
    notificationMessage: string
  ) => {
    if (!db || !application.id || !application.projectTitle || !application.companyName) {
      toast({ title: "Errore", description: "Dati mancanti per aggiornare lo stato o inviare notifica.", variant: "destructive" });
      return;
    }
    setProcessingApplicationId(application.id);
    try {
      const appDocRef = doc(db, 'projectApplications', application.id);
      const updatePayload: Partial<ProjectApplication> = { 
        status: newStatus,
        ...applicationUpdatePayload, 
        updatedAt: serverTimestamp()
      };
      await updateDoc(appDocRef, updatePayload);

      const notificationData: Omit<UserNotification, 'id'> = {
        userId: application.professionalId,
        type: NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED,
        title: notificationTitle,
        message: notificationMessage,
        linkTo: ROUTES.PROJECT_DETAILS(application.projectId),
        isRead: false,
        createdAt: serverTimestamp(),
        relatedEntityId: application.projectId,
        projectTitle: application.projectTitle,
        companyName: application.companyName,
      };
      await addDoc(collection(db, 'notifications'), notificationData);
      
      toast({ title: "Stato Aggiornato", description: `Lo stato della candidatura di ${application.professionalName} è stato aggiornato a "${newStatus}". Notifica inviata.` });

      setApplications(prevApps => 
        prevApps.map(app => 
          app.id === application.id ? { ...app, status: newStatus, ...applicationUpdatePayload, updatedAt: Timestamp.now() } : app 
        )
      );
      
      if (isRejectModalOpen) setIsRejectModalOpen(false);
      if (isPreselectModalOpen) setIsPreselectModalOpen(false);
      setApplicationForModal(null); // Resetta dopo chiusura modale
      rejectionForm.reset();
      preselectionForm.reset();

    } catch (error: any) {
      console.error("Error updating application status or sending notification:", error);
      toast({ title: "Errore", description: `Impossibile aggiornare lo stato o inviare notifica: ${error.message}`, variant: "destructive" });
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleOpenRejectDialog = (application: EnrichedApplication) => {
    setApplicationForModal(application);
    rejectionForm.reset();
    setIsRejectModalOpen(true);
  };

  const handleOpenPreselectDialog = (application: EnrichedApplication) => {
    setApplicationForModal(application);
    preselectionForm.reset();
    setIsPreselectModalOpen(true);
  };

  const onSubmitRejection = async (formData: RejectionFormData) => {
    if (!applicationForModal) return;
    const { rejectionReason } = formData;
    const notificationTitle = `Esito candidatura per "${applicationForModal.projectTitle}"`;
    const notificationMessage = `L'azienda ${applicationForModal.companyName} ha esaminato la tua candidatura per il progetto "${applicationForModal.projectTitle}".\nMotivazione del rifiuto: ${rejectionReason}\nTi ringraziamo per l'interesse.`;
    
    await updateApplicationAndSendNotification(
      applicationForModal,
      'rifiutata',
      { rejectionReason },
      notificationTitle,
      notificationMessage
    );
  };

  const onSubmitPreselection = async (formData: PreselectionFormData) => {
    if (!applicationForModal) return;
    const { interviewProposalMessage, proposedInterviewDate } = formData;
    const formattedDate = format(proposedInterviewDate, "PPP", { locale: it });

    const notificationTitle = `Proposta di colloquio per "${applicationForModal.projectTitle}"!`;
    const notificationMessage = `L'azienda ${applicationForModal.companyName} ha preselezionato la tua candidatura per il progetto "${applicationForModal.projectTitle}" e vorrebbe proporti un colloquio.\nMessaggio: "${interviewProposalMessage}"\nData proposta: ${formattedDate}.\nSarai ricontattato/a per conferma.`;
    
    await updateApplicationAndSendNotification(
      applicationForModal,
      'preselezionata',
      { interviewProposalMessage, proposedInterviewDate: Timestamp.fromDate(proposedInterviewDate) },
      notificationTitle,
      notificationMessage
    );
  };
  
  const openApplicationDetailsModal = (application: EnrichedApplication) => {
    setSelectedApplicationForDetails(application);
    setIsDetailsModalOpen(true);
  };

  const getSkillLabel = (value: string) => BIM_SKILLS_OPTIONS.find(s => s.value === value)?.label || value;


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

  const getStatusBadgeVariant = (status: ProjectApplication['status']) => {
    switch (status) {
      case 'inviata': return 'secondary';
      case 'in_revisione': return 'default'; 
      case 'preselezionata': return 'default'; 
      case 'rifiutata': return 'destructive';
      case 'accettata': return 'default'; 
      default: return 'outline';
    }
  };
   const getStatusBadgeColorClass = (status: ProjectApplication['status']) => {
    switch (status) {
      case 'preselezionata': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
      case 'accettata': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'in_revisione': return 'bg-blue-500 hover:bg-blue-600 text-white';
      default: return '';
    }
  };


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
              <CardDescription className="text-sm">Gestisci i professionisti che si sono candidati per questo progetto.</CardDescription>
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
                        <Badge 
                            variant={getStatusBadgeVariant(app.status)}
                            className={getStatusBadgeColorClass(app.status)}
                        >
                            {app.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7 px-2 py-1"
                            onClick={() => openApplicationDetailsModal(app)}
                            >
                            <FileText className="mr-1.5 h-3 w-3" /> Dettagli Candidatura
                        </Button>
                        {app.professionalProfile?.uid && (
                             <Button variant="outline" size="sm" asChild className="text-xs h-7 px-2 py-1">
                                <Link href={ROUTES.PROFESSIONAL_PROFILE_VIEW(app.professionalProfile.uid)}>
                                <ExternalLink className="mr-1.5 h-3 w-3" /> Profilo
                                </Link>
                            </Button>
                        )}

                        {app.status === 'inviata' && (
                          <>
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="text-xs h-7 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => handleOpenPreselectDialog(app)}
                                disabled={processingApplicationId === app.id}
                            >
                                {processingApplicationId === app.id ? <Hourglass className="mr-1.5 h-3 w-3 animate-spin" /> : <Check className="mr-1.5 h-3 w-3" />} Preseleziona
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="text-xs h-7 px-2 py-1"
                                onClick={() => handleOpenRejectDialog(app)}
                                disabled={processingApplicationId === app.id}
                            >
                                {processingApplicationId === app.id ? <Hourglass className="mr-1.5 h-3 w-3 animate-spin" /> : <X className="mr-1.5 h-3 w-3" />} Rifiuta
                            </Button>
                          </>
                        )}
                        
                        {app.status === 'preselezionata' && (
                          <>
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="text-xs h-7 px-2 py-1 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => updateApplicationAndSendNotification(app, 'accettata', {}, `Ottime notizie per il progetto "${app.projectTitle}"!`, `Congratulazioni! L'azienda ${app.companyName} ha accettato la tua candidatura per il progetto "${app.projectTitle}". Sarai ricontattato/a a breve per i prossimi passi.`)}
                                disabled={processingApplicationId === app.id}
                            >
                                {processingApplicationId === app.id ? <Hourglass className="mr-1.5 h-3 w-3 animate-spin" /> : <Check className="mr-1.5 h-3 w-3" />} Accetta
                            </Button>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="text-xs h-7 px-2 py-1"
                                onClick={() => handleOpenRejectDialog(app)} 
                                disabled={processingApplicationId === app.id}
                            >
                                {processingApplicationId === app.id ? <Hourglass className="mr-1.5 h-3 w-3 animate-spin" /> : <X className="mr-1.5 h-3 w-3" />} Rifiuta
                            </Button>
                          </>
                        )}
                        
                         {app.status === 'rifiutata' && (
                            <Badge variant="destructive" className="text-xs cursor-default">
                                <Ban className="mr-1.5 h-3 w-3" /> Rifiutata
                            </Badge>
                         )}
                         {app.status === 'accettata' && (
                            <Badge variant="default" className={cn("text-xs cursor-default", getStatusBadgeColorClass(app.status))}>
                                <Check className="mr-1.5 h-3 w-3" /> Accettata
                            </Badge>
                         )}
                         {app.status === 'in_revisione' && (
                            <Badge variant="default" className={cn("text-xs cursor-default", getStatusBadgeColorClass(app.status))}>
                                <Hourglass className="mr-1.5 h-3 w-3" /> In Revisione
                            </Badge>
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

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={(isOpen) => {
          setIsDetailsModalOpen(isOpen);
          if (!isOpen) {
              setSelectedApplicationForDetails(null);
          }
      }}>
        {selectedApplicationForDetails && (
            <DialogContent className="sm:max-w-lg max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Dettagli Candidatura per {project?.title}</DialogTitle>
                    <DialogDescription>
                        Candidatura di: <strong>{selectedApplicationForDetails.professionalName}</strong>
                         {selectedApplicationForDetails.professionalProfile?.email && (
                            <a href={`mailto:${selectedApplicationForDetails.professionalProfile.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center mt-1">
                                <Mail className="h-3 w-3 mr-1" /> {selectedApplicationForDetails.professionalProfile.email}
                            </a>
                         )}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(80vh-150px)] pr-4">
                    <div className="space-y-4 py-2">
                        <div>
                            <h4 className="font-semibold text-sm mb-1 flex items-center"><MessageSquare className="h-4 w-4 mr-2 text-primary"/>Messaggio di Presentazione:</h4>
                            <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-line">{selectedApplicationForDetails.coverLetterMessage}</p>
                        </div>
                        {selectedApplicationForDetails.relevantSkillsForProject && selectedApplicationForDetails.relevantSkillsForProject.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-sm mb-1 flex items-center"><ListChecks className="h-4 w-4 mr-2 text-primary"/>Competenze Evidenziate per il Progetto:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplicationForDetails.relevantSkillsForProject.map(skillValue => (
                                        <Badge key={skillValue} variant="secondary" className="text-xs">
                                            {getSkillLabel(skillValue)}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectedApplicationForDetails.availabilityNotes && (
                            <div>
                                <h4 className="font-semibold text-sm mb-1 flex items-center"><CalendarDays className="h-4 w-4 mr-2 text-primary"/>Note sulla Disponibilità:</h4>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md whitespace-pre-line">{selectedApplicationForDetails.availabilityNotes}</p>
                            </div>
                        )}
                         {!selectedApplicationForDetails.coverLetterMessage && 
                         (!selectedApplicationForDetails.relevantSkillsForProject || selectedApplicationForDetails.relevantSkillsForProject.length === 0) && 
                         !selectedApplicationForDetails.availabilityNotes && (
                            <p className="text-sm text-muted-foreground italic text-center py-4">Nessun dettaglio aggiuntivo fornito per questa candidatura.</p>
                         )}
                    </div>
                </ScrollArea>
                <DialogFooter className="pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Chiudi</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        )}
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={(isOpen) => {
          setIsRejectModalOpen(isOpen);
          if (!isOpen) {
              setApplicationForModal(null);
              rejectionForm.reset();
          }
      }}>
        {applicationForModal && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rifiuta Candidatura</DialogTitle>
              <DialogDescription>
                Fornisci una motivazione per il rifiuto della candidatura di <strong>{applicationForModal.professionalName}</strong> per il progetto "{applicationForModal.projectTitle}".
                <br/>Il professionista riceverà una notifica. <span className="text-destructive font-semibold">Una volta rifiutata, il professionista non potrà ricandidarsi per questo specifico progetto.</span>
              </DialogDescription>
            </DialogHeader>
            <Form {...rejectionForm}>
              <form onSubmit={rejectionForm.handleSubmit(onSubmitRejection)} className="space-y-4 py-2">
                <FormField
                  control={rejectionForm.control}
                  name="rejectionReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivazione del Rifiuto</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Es. Profilo non in linea con i requisiti specifici del progetto, esperienza insufficiente per il ruolo, ecc."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={processingApplicationId === applicationForModal.id}>Annulla</Button>
                  </DialogClose>
                  <Button type="submit" variant="destructive" disabled={processingApplicationId === applicationForModal.id}>
                    {processingApplicationId === applicationForModal.id ? <Hourglass className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                    Conferma Rifiuto
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>

      {/* Preselection Modal */}
      <Dialog open={isPreselectModalOpen} onOpenChange={(isOpen) => {
          setIsPreselectModalOpen(isOpen);
          if (!isOpen) {
              setApplicationForModal(null);
              preselectionForm.reset();
          }
      }}>
        {applicationForModal && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Preseleziona e Proponi Colloquio</DialogTitle>
              <DialogDescription>
                Invia un messaggio e proponi una data per un colloquio a <strong>{applicationForModal.professionalName}</strong> per il progetto "{applicationForModal.projectTitle}".
              </DialogDescription>
            </DialogHeader>
            <Form {...preselectionForm}>
              <form onSubmit={preselectionForm.handleSubmit(onSubmitPreselection)} className="space-y-4 py-2">
                <FormField
                  control={preselectionForm.control}
                  name="interviewProposalMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Messaggio di Proposta Colloquio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Es. Siamo rimasti colpiti dal suo profilo e vorremmo invitarla per un colloquio conoscitivo..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={preselectionForm.control}
                  name="proposedInterviewDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data Proposta per il Colloquio</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: it })
                              ) : (
                                <span>Scegli una data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } 
                            initialFocus
                            locale={it}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={processingApplicationId === applicationForModal.id}>Annulla</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white" disabled={processingApplicationId === applicationForModal.id}>
                    {processingApplicationId === applicationForModal.id ? <Hourglass className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    Invia Proposta
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>

    </div>
  );
}

    