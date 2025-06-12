
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp, serverTimestamp, addDoc, getDoc } from 'firebase/firestore';
import type { UserNotification } from '@/types/notification';
import type { ProjectApplication } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BellRing, CheckCheck, Eye, ListChecks, WifiOff, Info, CalendarCheck, X, Send, Loader2, MessageSquare, Calendar as CalendarIcon, FileText, Users, ArrowLeft, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter as ModalFooter, DialogClose } from '@/components/ui/dialog'; // Renamed DialogFooter to ModalFooter to avoid conflict
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ROUTES, NOTIFICATION_TYPES } from '@/constants';

const getIconForNotificationType = (type: string, iconClassName: string) => {
  switch (type) {
    case NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED:
    case NOTIFICATION_TYPES.INTERVIEW_PROPOSED:
    case NOTIFICATION_TYPES.COLLABORATION_CONFIRMED:
      return <ListChecks className={cn("h-5 w-5", iconClassName)} />;
    case NOTIFICATION_TYPES.NEW_PROJECT_MATCH: 
        return <FileText className={cn("h-5 w-5", iconClassName)} />;
    default:
      return <BellRing className={cn("h-5 w-5", iconClassName)} />;
  }
};

const getNotificationCardStyle = (notification: UserNotification) => {
  let cardClassName = "shadow-sm hover:shadow-md transition-shadow duration-200";
  let iconClassName = "text-muted-foreground";

  if (!notification.isRead) {
    cardClassName = cn(cardClassName, "bg-primary/5 border-primary/30");
    iconClassName = "text-primary";
  } else {
     iconClassName = "text-muted-foreground/80"; 
  }

  switch (notification.type) {
    case NOTIFICATION_TYPES.INTERVIEW_PROPOSED:
    case NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED_BY_PRO:
      cardClassName = cn(cardClassName, !notification.isRead ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-500/5 border-yellow-500/20");
      iconClassName = !notification.isRead ? "text-yellow-700" : "text-yellow-600";
      break;
    case NOTIFICATION_TYPES.COLLABORATION_CONFIRMED:
    case NOTIFICATION_TYPES.INTERVIEW_ACCEPTED_BY_PRO:
      cardClassName = cn(cardClassName, !notification.isRead ? "bg-green-500/10 border-green-500/30" : "bg-green-500/5 border-green-500/20");
      iconClassName = !notification.isRead ? "text-green-700" : "text-green-600";
      break;
    case NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED:
      if (notification.message.toLowerCase().includes('rifiutat') || notification.title.toLowerCase().includes('rifiutat')) {
        cardClassName = cn(cardClassName, !notification.isRead ? "bg-destructive/10 border-destructive/30" : "bg-destructive/5 border-destructive/20");
        iconClassName = !notification.isRead ? "text-destructive" : "text-destructive/80";
      }
      break;
  }
  return { cardClassName, iconClassName };
};


const professionalResponseFormSchema = z.object({
  responseReason: z.string().min(10, { message: "La motivazione deve contenere almeno 10 caratteri." }).max(1000, "La motivazione non può superare i 1000 caratteri.").optional(),
  newProposedDate: z.date().optional(),
});
type ProfessionalResponseFormData = z.infer<typeof professionalResponseFormSchema>;

const DEFAULT_GROUP_TITLE = "Altre Notifiche";

export default function ProfessionalNotificationsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [groupedNotifications, setGroupedNotifications] = useState<Map<string, UserNotification[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedNotificationForResponse, setSelectedNotificationForResponse] = useState<UserNotification | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseActionType, setResponseActionType] = useState<'accept' | 'reject' | 'reschedule' | null>(null);
  const [processingResponse, setProcessingResponse] = useState(false);
  const [applicationDetailsForNotifications, setApplicationDetailsForNotifications] = useState<Record<string, ProjectApplication>>({});
  
  const [selectedProjectGroupKey, setSelectedProjectGroupKey] = useState<string | null>(null);


  const professionalResponseForm = useForm<ProfessionalResponseFormData>({
    resolver: zodResolver(professionalResponseFormSchema),
    defaultValues: { responseReason: '', newProposedDate: undefined },
  });

  const fetchNotificationsAndRelatedApplications = useCallback(async () => {
    if (authLoading || !user || !db) {
        if (!authLoading && !user) setError("Devi essere autenticato per vedere le notifiche.");
        if (!authLoading && !db) setError("Database non disponibile.");
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);
    const fetchedAppDetails: Record<string, ProjectApplication> = {};
    const newGroupedNotifications = new Map<string, UserNotification[]>();

    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(notificationsQuery);
        const fetchedNotifications: UserNotification[] = [];
        const applicationIdsToFetch: string[] = [];

        querySnapshot.forEach((doc) => {
            const notification = { id: doc.id, ...doc.data() } as UserNotification;
            fetchedNotifications.push(notification);
            if (notification.type === NOTIFICATION_TYPES.INTERVIEW_PROPOSED && notification.applicationId && !applicationIdsToFetch.includes(notification.applicationId)) {
                applicationIdsToFetch.push(notification.applicationId);
            }
        });
        
        fetchedNotifications.forEach(notification => {
            const groupKey = notification.projectTitle || DEFAULT_GROUP_TITLE;
            if (!newGroupedNotifications.has(groupKey)) {
                newGroupedNotifications.set(groupKey, []);
            }
            newGroupedNotifications.get(groupKey)!.push(notification);
        });
        setGroupedNotifications(newGroupedNotifications);

        if (applicationIdsToFetch.length > 0) {
            const MAX_QUERIES = 30; 
            for (let i = 0; i < applicationIdsToFetch.length; i += MAX_QUERIES) {
                const chunk = applicationIdsToFetch.slice(i, i + MAX_QUERIES);
                if (chunk.length > 0) {
                    const applicationsQuery = query(collection(db, 'projectApplications'), where('__name__', 'in', chunk));
                    const appSnapshot = await getDocs(applicationsQuery);
                    appSnapshot.forEach(appDoc => {
                        if(appDoc.exists()){
                             fetchedAppDetails[appDoc.id] = { id: appDoc.id, ...appDoc.data() } as ProjectApplication;
                        }
                    });
                }
            }
        }
        setApplicationDetailsForNotifications(fetchedAppDetails);

    } catch (e: any) {
        console.error("Error fetching notifications or related applications:", e);
        let specificErrorMessage = "Errore nel caricamento delle notifiche.";
        if (e.message?.includes('indexes?create_composite=')) {
            specificErrorMessage = `Indice Firestore mancante per le notifiche. Controlla la console Firebase per crearlo (notifications, userId ASC, createdAt DESC).`;
        } else if (e.message?.includes('offline')) {
            specificErrorMessage = "Connessione persa. Controlla la tua rete.";
        }
        setError(specificErrorMessage);
    } finally {
        setLoading(false);
    }
  }, [authLoading, user, db]);
  
  useEffect(() => {
    fetchNotificationsAndRelatedApplications();
  }, [fetchNotificationsAndRelatedApplications]);


  const handleMarkAsRead = async (notificationId: string) => {
    if (!db) return;
    const notificationRef = doc(db, 'notifications', notificationId);
    try {
      await updateDoc(notificationRef, { isRead: true });
      setGroupedNotifications(prevMap => {
        const newMap = new Map(prevMap);
        for (const [groupKey, notificationsInGroup] of newMap.entries()) {
          const updatedNotifications = notificationsInGroup.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          );
          if (updatedNotifications.some(n => n.id === notificationId && n.isRead)) {
            newMap.set(groupKey, updatedNotifications);
            break; 
          }
        }
        return newMap;
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!db || !user) return;

    const notificationsToUpdate = selectedProjectGroupKey
      ? groupedNotifications.get(selectedProjectGroupKey)?.filter(n => !n.isRead) || []
      : Array.from(groupedNotifications.values()).flat().filter(n => !n.isRead);

    if (notificationsToUpdate.length === 0) return;

    try {
      const batch = await import('firebase/firestore').then(m => m.writeBatch(db));
      notificationsToUpdate.forEach(n => {
        const notificationRef = doc(db, 'notifications', n.id);
        batch.update(notificationRef, { isRead: true });
      });
      await batch.commit();

      setGroupedNotifications(prevMap => {
        const newMap = new Map(prevMap);
        if (selectedProjectGroupKey) {
          const group = newMap.get(selectedProjectGroupKey);
          if (group) {
            newMap.set(selectedProjectGroupKey, group.map(n => ({ ...n, isRead: true })));
          }
        } else {
          newMap.forEach((notificationsInGroup, groupKey) => {
            newMap.set(groupKey, notificationsInGroup.map(n => ({ ...n, isRead: true })));
          });
        }
        return newMap;
      });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
    }
  };

  const handleSubmitProfessionalResponse = async (
    formData: Partial<ProfessionalResponseFormData>,
    directNotification?: UserNotification, 
    directActionType?: 'accept' 
  ) => {
    const activeNotification = directNotification || selectedNotificationForResponse;
    const activeActionType = directActionType || responseActionType;

    if (!activeNotification || !activeNotification.applicationId || !userProfile || !db || !activeActionType) {
      toast({ title: "Errore", description: "Dati mancanti per inviare la risposta.", variant: "destructive" });
      setProcessingResponse(false); 
      return;
    }
    setProcessingResponse(true);

    const appDocRef = doc(db, 'projectApplications', activeNotification.applicationId);
    let newStatus: ProjectApplication['status'];
    let updatePayload: Partial<ProjectApplication> = {};
    let companyNotificationType: UserNotification['type'];
    let companyNotificationMessage: string;
    let companyNotificationPayload: Partial<Pick<UserNotification, 'professionalResponseReason' | 'professionalNewDateProposal'>> = {};

    if (activeActionType === 'accept') {
      newStatus = 'colloquio_accettato_prof';
      updatePayload = { 
        status: newStatus, 
        updatedAt: serverTimestamp(),
        professionalNewDateProposal: formData.newProposedDate ? Timestamp.fromDate(formData.newProposedDate) : null,
        professionalResponseReason: formData.responseReason || undefined,
      };
      companyNotificationType = NOTIFICATION_TYPES.INTERVIEW_ACCEPTED_BY_PRO;
      let acceptanceMessage = `Il professionista ${userProfile.displayName} ha ACCETTATO la tua proposta di colloquio per il progetto "${activeNotification.projectTitle}".`;
      if (formData.newProposedDate) {
          acceptanceMessage += ` Nuova data/ora proposta: ${format(formData.newProposedDate, "PPP HH:mm", { locale: it })}.`;
          companyNotificationPayload.professionalNewDateProposal = format(formData.newProposedDate, "PPP HH:mm", { locale: it });
      }
      if (formData.responseReason) {
          acceptanceMessage += ` Messaggio: "${formData.responseReason}".`;
          companyNotificationPayload.professionalResponseReason = formData.responseReason;
      }
      companyNotificationMessage = acceptanceMessage;

    } else if (activeActionType === 'reject') {
      if (!formData.responseReason || formData.responseReason.length < 10) {
        professionalResponseForm.setError("responseReason", { type: "manual", message: "La motivazione del rifiuto è richiesta (min 10 caratteri)." });
        setProcessingResponse(false);
        return;
      }
      newStatus = 'colloquio_rifiutato_prof';
      updatePayload = { status: newStatus, professionalResponseReason: formData.responseReason, updatedAt: serverTimestamp() };
      companyNotificationType = NOTIFICATION_TYPES.INTERVIEW_REJECTED_BY_PRO;
      companyNotificationMessage = `Il professionista ${userProfile.displayName} ha RIFIUTATO la tua proposta di colloquio per "${activeNotification.projectTitle}". Motivazione: "${formData.responseReason}".`;
      companyNotificationPayload = { professionalResponseReason: formData.responseReason };
    } else if (activeActionType === 'reschedule') { 
      if (!formData.newProposedDate) {
        professionalResponseForm.setError("newProposedDate", { type: "manual", message: "Devi proporre una nuova data." });
        setProcessingResponse(false);
        return;
      }
      newStatus = 'colloquio_ripianificato_prof'; 
      const formattedNewDate = format(formData.newProposedDate, "PPP HH:mm", { locale: it });
      updatePayload = { 
        status: newStatus, 
        professionalNewDateProposal: Timestamp.fromDate(formData.newProposedDate),
        professionalResponseReason: formData.responseReason || undefined, 
        updatedAt: serverTimestamp() 
      };
      companyNotificationType = NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED_BY_PRO; 
      companyNotificationMessage = `Il professionista ${userProfile.displayName} ha ACCETTATO la proposta di colloquio per "${activeNotification.projectTitle}" ma ha proposto una NUOVA DATA/ORA: ${formattedNewDate}.${formData.responseReason ? ` Messaggio: "${formData.responseReason}".` : ''}`;
      companyNotificationPayload = { professionalNewDateProposal: formattedNewDate, professionalResponseReason: formData.responseReason || undefined };
    } else {
      setProcessingResponse(false);
      return;
    }

    try {
      await updateDoc(appDocRef, updatePayload);

      const projectDocSnap = await getDoc(doc(db, 'projects', activeNotification.relatedEntityId!));
      if (!projectDocSnap.exists()) throw new Error("Progetto non trovato per inviare notifica all'azienda.");
      const projectData = projectDocSnap.data();
      const companyId = projectData?.companyId;
      if (!companyId) throw new Error("ID Azienda non trovato nel progetto.");

      const companyNotification: Omit<UserNotification, 'id'> = {
        userId: companyId,
        type: companyNotificationType,
        title: `Risposta colloquio: ${activeNotification.projectTitle}`,
        message: companyNotificationMessage,
        linkTo: `${ROUTES.DASHBOARD_COMPANY_CANDIDATES}?projectId=${activeNotification.relatedEntityId}`,
        isRead: false,
        createdAt: serverTimestamp(),
        relatedEntityId: activeNotification.relatedEntityId, 
        applicationId: activeNotification.applicationId,
        projectTitle: activeNotification.projectTitle || "N/D",
        professionalName: userProfile.displayName || "Un Professionista",
        companyName: activeNotification.companyName || "Un'azienda",
        ...companyNotificationPayload,
      };
      await addDoc(collection(db, 'notifications'), companyNotification);

      toast({ title: "Risposta Inviata", description: "La tua risposta è stata inviata all'azienda." });
      
      if(isResponseModalOpen) setIsResponseModalOpen(false); 
      setSelectedNotificationForResponse(null); 
      setResponseActionType(null);
      professionalResponseForm.reset();
      if(activeNotification.id && !activeNotification.isRead) handleMarkAsRead(activeNotification.id);
      
      setApplicationDetailsForNotifications(prev => ({
        ...prev,
        [activeNotification.applicationId!]: {
          ...(prev[activeNotification.applicationId!] || {}),
          status: newStatus,
          ...updatePayload 
        } as ProjectApplication
      }));

      fetchNotificationsAndRelatedApplications(); 

    } catch (error: any) {
      console.error("Error submitting professional response:", error);
      toast({ title: "Errore Invio Risposta", description: error.message, variant: "destructive" });
    } finally {
      setProcessingResponse(false);
    }
  };

  const handleOpenResponseModal = (notification: UserNotification, action: 'accept' | 'reject' | 'reschedule') => {
    professionalResponseForm.reset({ responseReason: '', newProposedDate: undefined });
    setSelectedNotificationForResponse(notification);
    setResponseActionType(action);
    setIsResponseModalOpen(true);
  };

  const renderResponseModalContent = () => {
    if (!selectedNotificationForResponse) return null;

    const originalProposalDateStr = selectedNotificationForResponse.proposedInterviewDate;
    let originalProposalDate: Date | null = null;
    if (originalProposalDateStr) {
        try {
            originalProposalDate = parse(originalProposalDateStr, "PPP", new Date(), { locale: it });
            if (isNaN(originalProposalDate.getTime())) { 
                originalProposalDate = null; 
            }
        } catch (e) {
            originalProposalDate = null;
        }
    }
    
    const originalProposalMessage = selectedNotificationForResponse.interviewProposalMessage;

    if (responseActionType === 'accept') {
        return (
            <>
              <DialogDescription className="mb-4 text-sm">
                Stai per ACCETTARE la proposta di colloquio per <strong>&quot;{selectedNotificationForResponse.projectTitle}&quot;</strong>.
                <br/>Proposta originale dall&apos;azienda: <em>&quot;{originalProposalMessage}&quot;</em> {originalProposalDate && ` per il ${format(originalProposalDate, "PPP", {locale:it})}`}.
                <br/>Puoi confermare direttamente o proporre una data/ora alternativa e aggiungere un messaggio.
              </DialogDescription>
              <FormField
                control={professionalResponseForm.control}
                name="newProposedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Proponi Data/Ora Alternativa (Opzionale)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP HH:mm", { locale: it }) : <span>Scegli se vuoi proporre un&apos;alternativa</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus locale={it} />
                        <div className="p-2 border-t">
                            <input 
                                type="time" 
                                className="w-full p-1 border rounded text-sm"
                                defaultValue={field.value ? format(field.value, "HH:mm") : "09:00"}
                                onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':').map(Number);
                                    const currentSelectedDate = field.value || new Date();
                                    currentSelectedDate.setHours(hours, minutes);
                                    field.onChange(new Date(currentSelectedDate)); 
                                }}
                            />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={professionalResponseForm.control}
                name="responseReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Messaggio Aggiuntivo (Opzionale)</FormLabel>
                    <FormControl><Textarea placeholder="Es. Confermo disponibilità, oppure 'preferirei il...' " rows={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
        );
    }
    if (responseActionType === 'reject') {
      return (
        <>
          <DialogDescription className="mb-4 text-sm">
            Stai rifiutando la proposta di colloquio per il progetto <strong>&quot;{selectedNotificationForResponse.projectTitle}&quot;</strong>.
            <br/>Proposta originale dall&apos;azienda: <em>&quot;{originalProposalMessage}&quot;</em> {originalProposalDate && ` per il ${format(originalProposalDate, "PPP", {locale:it})}`}.
            <br/>Fornisci una breve motivazione per l&apos;azienda.
          </DialogDescription>
          <FormField
            control={professionalResponseForm.control}
            name="responseReason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivazione del Rifiuto</FormLabel>
                <FormControl><Textarea placeholder="Es. Non più disponibile, ho accettato altra offerta, ecc." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }
    return null; 
  };
  
  const ProjectNotificationGroupCard = ({ groupKey, notificationsInGroup, onClick }: { groupKey: string, notificationsInGroup: UserNotification[], onClick: () => void }) => {
    const unreadCount = notificationsInGroup.filter(n => !n.isRead).length;
    const hasUnreadInterviewProposal = notificationsInGroup.some(n => !n.isRead && n.type === NOTIFICATION_TYPES.INTERVIEW_PROPOSED && applicationDetailsForNotifications[n.applicationId!]?.status === 'colloquio_proposto');

    return (
        <Card 
            className="shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col"
            onClick={onClick}
        >
            <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-md font-semibold text-primary truncate">{groupKey}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow px-3 py-1">
                <p className="text-xs text-muted-foreground">
                    {notificationsInGroup.length} notifiche totali
                </p>
                {unreadCount > 0 && (
                    <Badge variant={hasUnreadInterviewProposal ? "default" : "secondary"} className={cn("mt-1.5 text-xs", hasUnreadInterviewProposal && "bg-yellow-500 text-white hover:bg-yellow-600")}>
                        {unreadCount} {unreadCount === 1 ? "non letta" : "non lette"}
                        {hasUnreadInterviewProposal && " (Proposta Colloquio!)"}
                    </Badge>
                )}
            </CardContent>
            <CardFooter className="px-3 pt-2 pb-3 border-t">
                <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary">
                    Vedi Notifiche <ArrowLeft className="h-3 w-3 ml-1 transform rotate-180"/>
                </Button>
            </CardFooter>
        </Card>
    );
  };


  const anyUnreadNotifications = selectedProjectGroupKey
    ? (groupedNotifications.get(selectedProjectGroupKey) || []).some(n => !n.isRead)
    : Array.from(groupedNotifications.values()).flat().some(n => !n.isRead);

  if (loading || authLoading) {
    const SkeletonCard = () => (
        <Card className="mb-4">
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent className="space-y-2">
                {[...Array(1)].map((_, j) => (
                    <Card key={`skel-item-${j}`} className="p-3"><div className="flex items-start space-x-3"><Skeleton className="h-5 w-5 rounded-full" /><div className="flex-grow space-y-1"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/5" /></div><Skeleton className="h-3 w-8" /></div></Card>
                ))}
            </CardContent>
        </Card>
    );
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-9 w-32" /></div>
        {!selectedProjectGroupKey ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <Card key={`skel-grid-${i}`} className="h-40"><CardContent className="flex flex-col justify-between h-full p-4"><Skeleton className="h-5 w-3/4"/><Skeleton className="h-4 w-1/2"/><Skeleton className="h-6 w-1/3 self-end"/></CardContent></Card>)}
            </div>
        ) : (
             <SkeletonCard />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg mx-auto max-w-2xl">
        <WifiOff className="mx-auto h-12 w-12 text-destructive mb-3" />
        <p className="text-lg font-semibold text-destructive mb-1">Errore di Caricamento</p>
        <p className="text-muted-foreground text-sm px-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <CardTitle className="text-2xl font-bold">
            {selectedProjectGroupKey ? `Notifiche per: ${selectedProjectGroupKey}` : "Le Tue Notifiche"}
        </CardTitle>
        <div className="flex gap-2 items-center self-start sm:self-center">
            {selectedProjectGroupKey && (
                <Button variant="outline" size="sm" onClick={() => setSelectedProjectGroupKey(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla Panoramica
                </Button>
            )}
            {anyUnreadNotifications && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                    <CheckCheck className="mr-2 h-4 w-4" /> 
                    {selectedProjectGroupKey ? "Segna tutte come lette (questo progetto)" : "Segna tutte come lette"}
                </Button>
            )}
        </div>
      </div>

      {groupedNotifications.size === 0 ? (
        <Card className="shadow-sm"><CardContent className="py-10 text-center"><Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p className="text-lg font-semibold">Nessuna notifica.</p><p className="text-sm text-muted-foreground">Non hai ancora ricevuto notifiche.</p></CardContent></Card>
      ) : !selectedProjectGroupKey ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(groupedNotifications.entries()).map(([groupKey, notificationsInGroup]) => (
                <ProjectNotificationGroupCard 
                    key={groupKey}
                    groupKey={groupKey}
                    notificationsInGroup={notificationsInGroup}
                    onClick={() => setSelectedProjectGroupKey(groupKey)}
                />
            ))}
        </div>
      ) : (
        groupedNotifications.get(selectedProjectGroupKey)?.length > 0 ? (
            <Card className="shadow-md overflow-hidden">
                <CardContent className="p-0">
                    <div className="space-y-0">
                    {(groupedNotifications.get(selectedProjectGroupKey) || []).map((notification) => {
                        const { cardClassName, iconClassName } = getNotificationCardStyle(notification);
                        const associatedApplication = notification.applicationId ? applicationDetailsForNotifications[notification.applicationId] : null;
                        const showResponseButtons = notification.type === NOTIFICATION_TYPES.INTERVIEW_PROPOSED &&
                                                    notification.applicationId &&
                                                    associatedApplication?.status === 'colloquio_proposto';
                        return (
                        <div key={notification.id} className={cn("border-b last:border-b-0", cardClassName)}>
                            <div className="p-4 flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">{getIconForNotificationType(notification.type, iconClassName)}</div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <h4 className={cn("font-semibold text-sm mb-0.5", !notification.isRead && "text-primary")}>{notification.title || "Nuova Notifica"}</h4>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">{notification.createdAt && (notification.createdAt as Timestamp).toDate ? formatDistanceToNowStrict((notification.createdAt as Timestamp).toDate(), { addSuffix: true, locale: it }) : 'N/A'}</p>
                                </div>
                                <p className={cn("text-xs text-muted-foreground whitespace-pre-line", !notification.isRead && "text-foreground/80")}>{notification.message}</p>
                                
                                {showResponseButtons && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 h-7 px-2 py-1" onClick={() => handleOpenResponseModal(notification, 'accept')} disabled={processingResponse}><CalendarCheck className="mr-1.5 h-3.5 w-3.5"/> Accetta / Riproposta</Button>
                                    <Button size="sm" variant="destructive" className="text-xs h-7 px-2 py-1" onClick={() => handleOpenResponseModal(notification, 'reject')} disabled={processingResponse}><X className="mr-1.5 h-3.5 w-3.5"/> Rifiuta</Button>
                                </div>
                                )}

                                {notification.linkTo && !showResponseButtons && (
                                <div className="mt-2">
                                    <Button variant="outline" size="sm" asChild onClick={() => !notification.isRead && handleMarkAsRead(notification.id)} className={cn("text-xs h-7 px-2 py-1", !notification.isRead && "border-primary/50 text-primary hover:bg-primary/10 hover:text-primary")}>
                                    <Link href={notification.linkTo}><Eye className="mr-1.5 h-3.5 w-3.5" /> Vedi Dettagli</Link>
                                    </Button>
                                </div>
                                )}
                            </div>
                            {!notification.isRead && (<Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-primary shrink-0" aria-label="Non letta"></Badge>)}
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </CardContent>
            </Card>
        ) : (
             <Card className="shadow-sm"><CardContent className="py-10 text-center"><Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p className="text-lg font-semibold">Nessuna notifica per questo progetto.</p></CardContent></Card>
        )
      )}

      <Dialog open={isResponseModalOpen} onOpenChange={(isOpen) => {
          setIsResponseModalOpen(isOpen);
          if (!isOpen) { 
              setSelectedNotificationForResponse(null); 
              setResponseActionType(null);
              professionalResponseForm.reset();
          }
      }}>
        {selectedNotificationForResponse && responseActionType && ['accept', 'reject', 'reschedule'].includes(responseActionType) && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {responseActionType === 'accept' && 'Accetta Proposta / Proponi Alternativa'}
                {responseActionType === 'reject' && 'Rifiuta Proposta di Colloquio'}
                {responseActionType === 'reschedule' && 'Proponi Nuova Data per Colloquio'}
              </DialogTitle>
            </DialogHeader>
            <Form {...professionalResponseForm}>
              <form onSubmit={professionalResponseForm.handleSubmit(data => handleSubmitProfessionalResponse(data))} className="space-y-4 py-2">
                {renderResponseModalContent()}
                <ModalFooter className="pt-4">
                  <DialogClose asChild><Button type="button" variant="outline" disabled={processingResponse}>Annulla</Button></DialogClose>
                  <Button type="submit" variant={responseActionType === 'reject' ? 'destructive' : 'default'} disabled={processingResponse}>
                    {processingResponse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {processingResponse ? 'Invio...' : 
                        responseActionType === 'accept' ? 'Invia Accettazione/Proposta' :
                        responseActionType === 'reject' ? 'Conferma Rifiuto' :
                        'Invia Risposta'
                    }
                  </Button>
                </ModalFooter>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
    

    