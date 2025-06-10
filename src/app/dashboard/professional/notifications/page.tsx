
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp, serverTimestamp, addDoc, getDoc } from 'firebase/firestore';
import type { UserNotification } from '@/types/notification';
import type { ProjectApplication } from '@/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BellRing, CheckCheck, Eye, ListChecks, WifiOff, Info, MailReply, CalendarCheck, X, CalendarPlus, Send, Loader2, MessageSquare, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNowStrict, parse } from 'date-fns';
import { it } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { ROUTES, NOTIFICATION_TYPES } from '@/constants';

const getIconForNotificationType = (type: string, isRead: boolean) => {
  switch (type) {
    case NOTIFICATION_TYPES.APPLICATION_STATUS_UPDATED:
    case NOTIFICATION_TYPES.INTERVIEW_PROPOSED:
      return <ListChecks className={cn("h-5 w-5", isRead ? "text-muted-foreground" : "text-primary")} />;
    default:
      return <BellRing className={cn("h-5 w-5", isRead ? "text-muted-foreground" : "text-primary")} />;
  }
};

const professionalResponseFormSchema = z.object({
  responseReason: z.string().min(10, { message: "La motivazione deve contenere almeno 10 caratteri." }).max(1000, "La motivazione non può superare i 1000 caratteri.").optional(),
  newProposedDate: z.date().optional(),
});
type ProfessionalResponseFormData = z.infer<typeof professionalResponseFormSchema>;

export default function ProfessionalNotificationsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedNotificationForResponse, setSelectedNotificationForResponse] = useState<UserNotification | null>(null);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [responseActionType, setResponseActionType] = useState<'accept' | 'reject' | 'reschedule' | null>(null);
  const [processingResponse, setProcessingResponse] = useState(false);

  const professionalResponseForm = useForm<ProfessionalResponseFormData>({
    resolver: zodResolver(professionalResponseFormSchema),
    defaultValues: { responseReason: '', newProposedDate: undefined },
  });

  const fetchNotifications = useCallback(async () => {
    if (authLoading || !user || !db) {
      if (!authLoading && !user) setError("Devi essere autenticato per vedere le notifiche.");
      if (!authLoading && !db) setError("Database non disponibile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(notificationsQuery);
      const fetchedNotifications: UserNotification[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as UserNotification);
      });
      setNotifications(fetchedNotifications);
    } catch (e: any) {
      console.error("Error fetching notifications:", e);
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
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!db) return;
    const notificationRef = doc(db, 'notifications', notificationId);
    try {
      await updateDoc(notificationRef, { isRead: true });
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    if (!db || !user) return;
    const unreadNotifications = notifications.filter(n => !n.isRead);
    if (unreadNotifications.length === 0) return;

    try {
      const batch = await import('firebase/firestore').then(m => m.writeBatch(db));
      unreadNotifications.forEach(n => {
        const notificationRef = doc(db, 'notifications', n.id);
        batch.update(notificationRef, { isRead: true });
      });
      await batch.commit();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
  };

  const handleOpenResponseModal = (notification: UserNotification, action: 'accept' | 'reject' | 'reschedule') => {
    setSelectedNotificationForResponse(notification);
    setResponseActionType(action);
    professionalResponseForm.reset({ responseReason: '', newProposedDate: undefined }); 
    if (action === 'accept' && notification.applicationId) { 
        handleSubmitProfessionalResponse({}); 
    } else {
        setIsResponseModalOpen(true);
    }
  };

  const handleSubmitProfessionalResponse = async (formData: Partial<ProfessionalResponseFormData>) => {
    if (!selectedNotificationForResponse || !selectedNotificationForResponse.applicationId || !userProfile || !db || !responseActionType) {
      toast({ title: "Errore", description: "Dati mancanti per inviare la risposta.", variant: "destructive" });
      return;
    }
    setProcessingResponse(true);

    const appDocRef = doc(db, 'projectApplications', selectedNotificationForResponse.applicationId);
    let newStatus: ProjectApplication['status'];
    let updatePayload: Partial<ProjectApplication> = {};
    let companyNotificationType: UserNotification['type'];
    let companyNotificationMessage: string;
    let companyNotificationPayload: Partial<Pick<UserNotification, 'professionalResponseReason' | 'professionalNewDateProposal'>> = {};


    if (responseActionType === 'accept') {
      newStatus = 'colloquio_accettato_prof';
      updatePayload = { status: newStatus, updatedAt: serverTimestamp() };
      companyNotificationType = NOTIFICATION_TYPES.INTERVIEW_ACCEPTED_BY_PRO;
      companyNotificationMessage = `Il professionista ${userProfile.displayName} ha ACCETTATO la tua proposta di colloquio per il progetto "${selectedNotificationForResponse.projectTitle}".`;
    } else if (responseActionType === 'reject') {
      if (!formData.responseReason || formData.responseReason.length < 10) {
        professionalResponseForm.setError("responseReason", { type: "manual", message: "La motivazione del rifiuto è richiesta (min 10 caratteri)." });
        setProcessingResponse(false);
        return;
      }
      newStatus = 'colloquio_rifiutato_prof';
      updatePayload = { status: newStatus, professionalResponseReason: formData.responseReason, updatedAt: serverTimestamp() };
      companyNotificationType = NOTIFICATION_TYPES.INTERVIEW_REJECTED_BY_PRO;
      companyNotificationMessage = `Il professionista ${userProfile.displayName} ha RIFIUTATO la tua proposta di colloquio per "${selectedNotificationForResponse.projectTitle}". Motivazione: "${formData.responseReason}".`;
      companyNotificationPayload = { professionalResponseReason: formData.responseReason };
    } else if (responseActionType === 'reschedule') {
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
      companyNotificationMessage = `Il professionista ${userProfile.displayName} ha proposto una NUOVA DATA (${formattedNewDate}) per il colloquio relativo al progetto "${selectedNotificationForResponse.projectTitle}".${formData.responseReason ? ` Messaggio: "${formData.responseReason}".` : ''}`;
      companyNotificationPayload = { professionalNewDateProposal: formattedNewDate, professionalResponseReason: formData.responseReason || undefined };
    } else {
      setProcessingResponse(false);
      return;
    }

    try {
      await updateDoc(appDocRef, updatePayload);

      const projectDocSnap = await getDoc(doc(db, 'projects', selectedNotificationForResponse.relatedEntityId!));
      if (!projectDocSnap.exists()) throw new Error("Progetto non trovato per inviare notifica all'azienda.");
      const projectData = projectDocSnap.data();
      const companyId = projectData?.companyId;
      if (!companyId) throw new Error("ID Azienda non trovato nel progetto.");

      const companyNotification: Omit<UserNotification, 'id'> = {
        userId: companyId,
        type: companyNotificationType,
        title: `Risposta colloquio: ${selectedNotificationForResponse.projectTitle}`,
        message: companyNotificationMessage,
        linkTo: `${ROUTES.DASHBOARD_COMPANY_CANDIDATES}?projectId=${selectedNotificationForResponse.relatedEntityId}`,
        isRead: false,
        createdAt: serverTimestamp(),
        relatedEntityId: selectedNotificationForResponse.relatedEntityId, 
        applicationId: selectedNotificationForResponse.applicationId,
        projectTitle: selectedNotificationForResponse.projectTitle || "N/D",
        professionalName: userProfile.displayName || "Un Professionista",
        companyName: selectedNotificationForResponse.companyName || "Un'azienda",
        ...companyNotificationPayload,
      };
      await addDoc(collection(db, 'notifications'), companyNotification);

      toast({ title: "Risposta Inviata", description: "La tua risposta è stata inviata all'azienda." });
      setIsResponseModalOpen(false);
      setSelectedNotificationForResponse(null);
      professionalResponseForm.reset();
      if(selectedNotificationForResponse.id) handleMarkAsRead(selectedNotificationForResponse.id);
      fetchNotifications(); 

    } catch (error: any) {
      console.error("Error submitting professional response:", error);
      toast({ title: "Errore Invio Risposta", description: error.message, variant: "destructive" });
    } finally {
      setProcessingResponse(false);
    }
  };

  const renderResponseModalContent = () => {
    if (!selectedNotificationForResponse) return null;

    const originalProposalDate = selectedNotificationForResponse.proposedInterviewDate
      ? parse(selectedNotificationForResponse.proposedInterviewDate, "PPP", new Date(), { locale: it })
      : null;
    
    const originalProposalMessage = selectedNotificationForResponse.interviewProposalMessage;

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
    if (responseActionType === 'reschedule') {
      return (
        <>
          <DialogDescription className="mb-4 text-sm">
            Stai proponendo una nuova data per il colloquio per <strong>&quot;{selectedNotificationForResponse.projectTitle}&quot;</strong>.
            <br/>Proposta originale dall&apos;azienda: <em>&quot;{originalProposalMessage}&quot;</em> {originalProposalDate && ` per il ${format(originalProposalDate, "PPP", {locale:it})}`}.
          </DialogDescription>
          <FormField
            control={professionalResponseForm.control}
            name="newProposedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Nuova Data e Ora Proposte</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP HH:mm", { locale: it }) : <span>Scegli data e ora</span>}
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
                <FormControl><Textarea placeholder="Es. Questa data funzionerebbe meglio per me..." rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      );
    }
    return null; 
  };


  if (loading || authLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-9 w-32" /></div>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4"><div className="flex items-start space-x-3"><Skeleton className="h-6 w-6 rounded-full" /><div className="flex-grow space-y-1.5"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/4" /></div><Skeleton className="h-3 w-10" /></div></Card>
        ))}
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
        <CardTitle className="text-2xl font-bold">Le Tue Notifiche</CardTitle>
        {notifications.some(n => !n.isRead) && (
             <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="self-start sm:self-center">
                <CheckCheck className="mr-2 h-4 w-4" /> Segna tutte come lette
            </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="shadow-sm"><CardContent className="py-10 text-center"><Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" /><p className="text-lg font-semibold">Nessuna notifica.</p><p className="text-sm text-muted-foreground">Non hai ancora ricevuto notifiche.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={cn("shadow-sm hover:shadow-md transition-shadow", !notification.isRead && "bg-primary/5 border-primary/20")}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">{getIconForNotificationType(notification.type, notification.isRead)}</div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className={cn("font-semibold text-sm mb-0.5", !notification.isRead && "text-primary")}>{notification.title || "Nuova Notifica"}</h4>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{notification.createdAt && (notification.createdAt as Timestamp).toDate ? formatDistanceToNowStrict((notification.createdAt as Timestamp).toDate(), { addSuffix: true, locale: it }) : 'N/A'}</p>
                    </div>
                    <p className={cn("text-xs text-muted-foreground whitespace-pre-line", !notification.isRead && "text-foreground/80")}>{notification.message}</p>
                    
                    {notification.type === NOTIFICATION_TYPES.INTERVIEW_PROPOSED && notification.applicationId && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700 h-7 px-2 py-1" onClick={() => handleOpenResponseModal(notification, 'accept')} disabled={processingResponse}><CalendarCheck className="mr-1.5 h-3.5 w-3.5"/> Accetta</Button>
                        <Button size="sm" variant="destructive" className="text-xs h-7 px-2 py-1" onClick={() => handleOpenResponseModal(notification, 'reject')} disabled={processingResponse}><X className="mr-1.5 h-3.5 w-3.5"/> Rifiuta</Button>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-2 py-1" onClick={() => handleOpenResponseModal(notification, 'reschedule')} disabled={processingResponse}><CalendarPlus className="mr-1.5 h-3.5 w-3.5"/> Proponi Altra Data</Button>
                      </div>
                    )}

                    {notification.linkTo && notification.type !== NOTIFICATION_TYPES.INTERVIEW_PROPOSED && (
                      <div className="mt-2">
                        <Button variant="outline" size="sm" asChild onClick={() => !notification.isRead && handleMarkAsRead(notification.id)} className={cn("text-xs h-7 px-2 py-1", !notification.isRead && "border-primary/50 text-primary hover:bg-primary/10 hover:text-primary")}>
                          <Link href={notification.linkTo}><Eye className="mr-1.5 h-3.5 w-3.5" /> Vedi Dettagli</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (<Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-primary" aria-label="Non letta"></Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isResponseModalOpen} onOpenChange={(isOpen) => {
          setIsResponseModalOpen(isOpen);
          if (!isOpen) {
              setSelectedNotificationForResponse(null);
              setResponseActionType(null);
              professionalResponseForm.reset();
          }
      }}>
        {selectedNotificationForResponse && responseActionType && ['reject', 'reschedule'].includes(responseActionType) && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {responseActionType === 'reject' && 'Rifiuta Proposta di Colloquio'}
                {responseActionType === 'reschedule' && 'Proponi Nuova Data per Colloquio'}
              </DialogTitle>
            </DialogHeader>
            <Form {...professionalResponseForm}>
              <form onSubmit={professionalResponseForm.handleSubmit(handleSubmitProfessionalResponse)} className="space-y-4 py-2">
                {renderResponseModalContent()}
                <DialogFooter className="pt-4">
                  <DialogClose asChild><Button type="button" variant="outline" disabled={processingResponse}>Annulla</Button></DialogClose>
                  <Button type="submit" variant={responseActionType === 'reject' ? 'destructive' : 'default'} disabled={processingResponse}>
                    {processingResponse ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {processingResponse ? 'Invio...' : 'Invia Risposta'}
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

