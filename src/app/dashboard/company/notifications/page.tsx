
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import type { UserNotification } from '@/types/notification';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BellRing, CheckCheck, Eye, Info, ListChecks, Users, WifiOff, ArrowLeft, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { it } from 'date-fns/locale';
import { NOTIFICATION_TYPES } from '@/constants';

const getIconForNotificationType = (type: string, iconClassName: string) => {
  switch (type) {
    case NOTIFICATION_TYPES.NEW_APPLICATION_RECEIVED:
      return <Users className={cn("h-5 w-5", iconClassName)} />;
    case NOTIFICATION_TYPES.INTERVIEW_ACCEPTED_BY_PRO:
    case NOTIFICATION_TYPES.INTERVIEW_REJECTED_BY_PRO:
    case NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED_BY_PRO:
      return <ListChecks className={cn("h-5 w-5", iconClassName)} />;
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
    case NOTIFICATION_TYPES.NEW_APPLICATION_RECEIVED:
      cardClassName = cn(cardClassName, !notification.isRead ? "bg-blue-500/10 border-blue-500/30" : "bg-blue-500/5 border-blue-500/20");
      iconClassName = !notification.isRead ? "text-blue-700" : "text-blue-600";
      break;
    case NOTIFICATION_TYPES.INTERVIEW_ACCEPTED_BY_PRO:
      cardClassName = cn(cardClassName, !notification.isRead ? "bg-green-500/10 border-green-500/30" : "bg-green-500/5 border-green-500/20");
      iconClassName = !notification.isRead ? "text-green-700" : "text-green-600";
      break;
    case NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED_BY_PRO:
      cardClassName = cn(cardClassName, !notification.isRead ? "bg-yellow-500/10 border-yellow-500/30" : "bg-yellow-500/5 border-yellow-500/20");
      iconClassName = !notification.isRead ? "text-yellow-700" : "text-yellow-600";
      break;
    case NOTIFICATION_TYPES.INTERVIEW_REJECTED_BY_PRO:
      cardClassName = cn(cardClassName, !notification.isRead ? "bg-destructive/10 border-destructive/30" : "bg-destructive/5 border-destructive/20");
      iconClassName = !notification.isRead ? "text-destructive" : "text-destructive/80";
      break;
  }
  return { cardClassName, iconClassName };
};

const DEFAULT_GROUP_TITLE = "Altre Notifiche";

export default function CompanyNotificationsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();
  const [groupedNotifications, setGroupedNotifications] = useState<Map<string, UserNotification[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectGroupKey, setSelectedProjectGroupKey] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (authLoading || !user || !userProfile || userProfile.role !== 'company' || !db) {
      if (!authLoading && (!user || userProfile?.role !== 'company')) setError("Devi essere un'azienda autenticata per vedere le notifiche.");
      if (!authLoading && !db) setError("Database non disponibile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const newGroupedNotifications = new Map<string, UserNotification[]>();
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(notificationsQuery);
      
      querySnapshot.forEach((doc) => {
        const notification = { id: doc.id, ...doc.data() } as UserNotification;
        const groupKey = notification.projectTitle || DEFAULT_GROUP_TITLE;
        if (!newGroupedNotifications.has(groupKey)) {
            newGroupedNotifications.set(groupKey, []);
        }
        newGroupedNotifications.get(groupKey)!.push(notification);
      });
      setGroupedNotifications(newGroupedNotifications);

    } catch (e: any) {
      console.error("Error fetching company notifications:", e);
      let specificErrorMessage = "Si è verificato un errore imprevisto durante il caricamento delle notifiche. Controlla la console del browser per maggiori dettagli.";
      if (e.message?.includes('indexes?create_composite=')) {
          specificErrorMessage = `Indice Firestore mancante per le notifiche. Controlla la console Firebase per crearlo (notifications, userId ASC, createdAt DESC).`;
      } else if (e.message?.includes('offline')) {
          specificErrorMessage = "Connessione persa. Controlla la tua rete.";
      }
      setError(specificErrorMessage);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, userProfile, db]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
        console.error("Error marking all notifications as read:", error);
    }
  };
  
  const ProjectNotificationGroupCard = ({ groupKey, notificationsInGroup, onClick }: { groupKey: string, notificationsInGroup: UserNotification[], onClick: () => void }) => {
    const unreadCount = notificationsInGroup.filter(n => !n.isRead).length;
    const hasUnreadNewApplication = notificationsInGroup.some(n => !n.isRead && n.type === NOTIFICATION_TYPES.NEW_APPLICATION_RECEIVED);

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
                    <Badge variant={hasUnreadNewApplication ? "default" : "secondary"} className={cn("mt-1.5 text-xs", hasUnreadNewApplication && "bg-blue-500 text-white hover:bg-blue-600")}>
                        {unreadCount} {unreadCount === 1 ? "non letta" : "non lette"}
                        {hasUnreadNewApplication && " (Nuova Candidatura!)"}
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
                {[...Array(3)].map((_, i) => <Card key={`skel-grid-co-${i}`} className="h-40"><CardContent className="flex flex-col justify-between h-full p-4"><Skeleton className="h-5 w-3/4"/><Skeleton className="h-4 w-1/2"/><Skeleton className="h-6 w-1/3 self-end"/></CardContent></Card>)}
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
             {selectedProjectGroupKey ? `Notifiche per: ${selectedProjectGroupKey}` : "Notifiche Aziendali"}
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
        <Card className="shadow-sm">
          <CardContent className="py-10 text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">Nessuna notifica.</p>
            <p className="text-sm text-muted-foreground">Non hai ancora ricevuto notifiche.</p>
          </CardContent>
        </Card>
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
         (groupedNotifications.get(selectedProjectGroupKey) || []).length > 0 ? (
            <Card className="shadow-md overflow-hidden">
                <CardContent className="p-0">
                    <div className="space-y-0">
                    {(groupedNotifications.get(selectedProjectGroupKey) || []).map((notification) => {
                        const { cardClassName, iconClassName } = getNotificationCardStyle(notification);
                        return (
                        <div key={notification.id} className={cn("border-b last:border-b-0", cardClassName)}>
                             <div className="p-4 flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {getIconForNotificationType(notification.type, iconClassName)}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-start">
                                        <h4 className={cn("font-semibold text-sm mb-0.5", !notification.isRead && "text-primary")}>
                                            {notification.title || "Nuova Notifica"}
                                        </h4>
                                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                                            {notification.createdAt && (notification.createdAt as Timestamp).toDate
                                            ? formatDistanceToNowStrict((notification.createdAt as Timestamp).toDate(), { addSuffix: true, locale: it })
                                            : 'N/A'}
                                        </p>
                                    </div>
                                    <p className={cn("text-xs text-muted-foreground whitespace-pre-line", !notification.isRead && "text-foreground/80")}>
                                    {notification.message}
                                    </p>
                                    {notification.linkTo && (
                                    <div className="mt-2">
                                        <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                        className={cn("text-xs h-7 px-2 py-1", !notification.isRead && "border-primary/50 text-primary hover:bg-primary/10 hover:text-primary")}
                                        >
                                        <Link href={notification.linkTo}>
                                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Vedi Dettagli
                                        </Link>
                                        </Button>
                                    </div>
                                    )}
                                </div>
                                {!notification.isRead && (
                                    <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-primary shrink-0" aria-label="Non letta"></Badge>
                                )}
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
    </div>
  );
}
    

    