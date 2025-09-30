
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Users, Briefcase, Shield, HandHeart, Bell, FileText, Eye, Settings, MessageSquare } from 'lucide-react';

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <Shield className="h-8 w-8 text-primary"/>
             <div>
                <CardTitle className="text-2xl font-bold">Pannello di Amministrazione</CardTitle>
                <CardDescription>Benvenuto, {userProfile?.displayName || 'Admin'}. Gestisci la piattaforma BIMatch.</CardDescription>
             </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Management Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Gestione Utenti
            </CardTitle>
            <CardDescription>
              Visualizza, modifica ed elimina utenti registrati
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href={ROUTES.DASHBOARD_ADMIN_USERS}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizza Tutti gli Utenti
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.DASHBOARD_ADMIN_USERS + "?filter=professional"}>
                <Users className="h-4 w-4 mr-2" />
                Solo Professionisti
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.DASHBOARD_ADMIN_USERS + "?filter=company"}>
                <Briefcase className="h-4 w-4 mr-2" />
                Solo Aziende
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Project Management */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-green-600" />
              Gestione Progetti
            </CardTitle>
            <CardDescription>
              Modifica, approva o rimuovi progetti pubblicati
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizza Tutti i Progetti
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS + "?status=active"}>
                <Settings className="h-4 w-4 mr-2" />
                Progetti Attivi
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS + "?status=pending"}>
                <FileText className="h-4 w-4 mr-2" />
                In Approvazione
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Applications & Matches */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="h-6 w-6 text-purple-600" />
              Candidature & Match
            </CardTitle>
            <CardDescription>
              Monitora candidature e gestisci i match
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/admin/applications">
                <Eye className="h-4 w-4 mr-2" />
                Tutte le Candidature
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/applications?status=pending">
                <FileText className="h-4 w-4 mr-2" />
                Candidature Pending
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/matches">
                <HandHeart className="h-4 w-4 mr-2" />
                Match Riusciti
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-orange-600" />
              Sistema Notifiche
            </CardTitle>
            <CardDescription>
              Gestisci notifiche di sistema e comunicazioni
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/admin/notifications">
                <Eye className="h-4 w-4 mr-2" />
                Visualizza Notifiche
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/notifications/create">
                <MessageSquare className="h-4 w-4 mr-2" />
                Invia Notifica
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/notifications?unread=true">
                <Bell className="h-4 w-4 mr-2" />
                Non Lette
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Monitoring */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-600" />
              Monitoraggio Sistema
            </CardTitle>
            <CardDescription>
              Log di audit e monitoraggio attività
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/admin/audit-logs">
                <Eye className="h-4 w-4 mr-2" />
                Log di Audit
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/security">
                <Shield className="h-4 w-4 mr-2" />
                Sicurezza
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/analytics">
                <Settings className="h-4 w-4 mr-2" />
                Analitiche
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600" />
              Azioni Rapide
            </CardTitle>
            <CardDescription>
              Strumenti e configurazioni di sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard/admin/backup">
                <FileText className="h-4 w-4 mr-2" />
                Backup Dati
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Configurazioni
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/maintenance">
                <Shield className="h-4 w-4 mr-2" />
                Manutenzione
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
