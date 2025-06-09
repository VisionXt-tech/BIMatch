
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import type { UserNotification } from '@/types/notification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { BellRing, CheckCheck, Eye, Info, ListChecks, Users, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { it } from 'date-fns/locale';

const getIconForNotificationType = (type: string, isRead: boolean) => {
  switch (type) {
    case 'NEW_APPLICATION_RECEIVED':
      return <Users className={cn("h-5 w-5", isRead ? "text-muted-foreground" : "text-primary")} />;
    default:
      return <BellRing className={cn("h-5 w-5", isRead ? "text-muted-foreground" : "text-primary")} />;
  }
};

export default function CompanyNotificationsPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (authLoading || !user || !userProfile || userProfile.role !== 'company' || !db) {
      if (!authLoading && (!user || userProfile?.role !== 'company')) setError("Devi essere un'azienda autenticata per vedere le notifiche.");
      if (!authLoading && !db) setError("Database non disponibile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid), // userId is the company's UID here
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(notificationsQuery);
      const fetchedNotifications: UserNotification[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() } as UserNotification);
      });
      setNotifications(fetchedNotifications);
    } catch (e: any) {
      console.error("Error fetching company notifications:", e);
      let specificErrorMessage = "Si è verificato un errore imprevisto durante il caricamento delle notifiche. Controlla la console del browser per maggiori dettagli.";
      if (e.code) {
        switch (e.code) {
          case 'permission-denied':
          case 'PERMISSION_DENIED': 
            specificErrorMessage = "Accesso negato. Controlla i permessi di Firestore per la collezione 'notifications'.";
            break;
          case 'failed-precondition':
            specificErrorMessage = "Indice Firestore mancante. Controlla la console del browser (o Firestore > Indici nella console Firebase) per creare l'indice richiesto per 'notifications' (probabilmente su 'userId' ASC, 'createdAt' DESC).";
            break;
          case 'unavailable':
            specificErrorMessage = "Servizio momentaneamente non disponibile o connessione persa. Riprova più tardi.";
            break;
          default:
            specificErrorMessage = `Errore Firestore: ${e.message || 'Errore sconosciuto'} (Codice: ${e.code})`;
        }
      } else if (e.message) {
        if (e.message.includes('offline')) {
            specificErrorMessage = "Connessione persa. Controlla la tua rete e riprova.";
        } else if (e.message.includes('indexes?create_composite=')) { 
            specificErrorMessage = `Indice Firestore mancante per le notifiche. Il messaggio di errore originale è: "${e.message}". Segui il link nella console del browser per crearlo, oppure vai alla console Firebase > Firestore Database > Indici (Collezione: notifications, Campi: userId ASC, createdAt DESC).`;
        } else {
            specificErrorMessage = `Errore: ${e.message}`;
        }
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


  if (loading || authLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-9 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start space-x-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-grow space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          </Card>
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
        <CardTitle className="text-2xl font-bold">Notifiche Aziendali</CardTitle>
        {notifications.some(n => !n.isRead) && (
             <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="self-start sm:self-center">
                <CheckCheck className="mr-2 h-4 w-4" /> Segna tutte come lette
            </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-10 text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold">Nessuna notifica.</p>
            <p className="text-sm text-muted-foreground">Non hai ancora ricevuto notifiche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "shadow-sm hover:shadow-md transition-shadow duration-200",
                !notification.isRead && "bg-primary/5 border-primary/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIconForNotificationType(notification.type, notification.isRead)}
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
                    <p className={cn("text-xs text-muted-foreground", !notification.isRead && "text-foreground/80")}>
                      {notification.message}
                    </p>
                    {notification.linkTo && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                          className={cn("text-xs", !notification.isRead && "border-primary/50 text-primary hover:bg-primary/10 hover:text-primary")}
                        >
                          <Link href={notification.linkTo}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" /> Vedi Dettagli
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <Badge variant="default" className="h-2 w-2 p-0 rounded-full bg-primary" aria-label="Non letta"></Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
