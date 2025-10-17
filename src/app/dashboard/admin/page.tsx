
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
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4 bg-gray-50">
      {/* Hero Section - Welcome Card */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <Shield className="h-8 w-8 text-[#008080]"/>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Pannello di Amministrazione</h1>
              <p className="text-sm text-gray-600">Benvenuto, {userProfile?.displayName || 'Admin'}. Gestisci la piattaforma BIMatch.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Management Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* User Management */}
        <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-[#008080]" />
              <h3 className="text-sm font-semibold text-gray-900">Gestione Utenti</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Visualizza, modifica ed elimina utenti registrati
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-[#008080] hover:bg-[#006666] text-white" size="sm">
                <Link href={ROUTES.DASHBOARD_ADMIN_USERS}>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizza Tutti gli Utenti
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href={ROUTES.DASHBOARD_ADMIN_USERS + "?filter=professional"}>
                  <Users className="h-4 w-4 mr-2" />
                  Solo Professionisti
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href={ROUTES.DASHBOARD_ADMIN_USERS + "?filter=company"}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Solo Aziende
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Management */}
        <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-[#008080]" />
              <h3 className="text-sm font-semibold text-gray-900">Gestione Progetti</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Modifica, approva o rimuovi progetti pubblicati
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-[#008080] hover:bg-[#006666] text-white" size="sm">
                <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS}>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizza Tutti i Progetti
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS + "?status=active"}>
                  <Settings className="h-4 w-4 mr-2" />
                  Progetti Attivi
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS + "?status=pending"}>
                  <FileText className="h-4 w-4 mr-2" />
                  In Approvazione
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications & Matches */}
        <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <HandHeart className="h-5 w-5 text-[#008080]" />
              <h3 className="text-sm font-semibold text-gray-900">Candidature & Match</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Monitora candidature e gestisci i match
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-[#008080] hover:bg-[#006666] text-white" size="sm">
                <Link href="/dashboard/admin/applications">
                  <Eye className="h-4 w-4 mr-2" />
                  Tutte le Candidature
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/applications?status=pending">
                  <FileText className="h-4 w-4 mr-2" />
                  Candidature Pending
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/matches">
                  <HandHeart className="h-4 w-4 mr-2" />
                  Match Riusciti
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-[#008080]" />
              <h3 className="text-sm font-semibold text-gray-900">Sistema Notifiche</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Gestisci notifiche di sistema e comunicazioni
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-[#008080] hover:bg-[#006666] text-white" size="sm">
                <Link href="/dashboard/admin/notifications">
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizza Notifiche
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/notifications/create">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Invia Notifica
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/notifications?unread=true">
                  <Bell className="h-4 w-4 mr-2" />
                  Non Lette
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Monitoring */}
        <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[#008080]" />
              <h3 className="text-sm font-semibold text-gray-900">Monitoraggio Sistema</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Log di audit e monitoraggio attività
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-[#008080] hover:bg-[#006666] text-white" size="sm">
                <Link href="/dashboard/admin/audit-logs">
                  <Eye className="h-4 w-4 mr-2" />
                  Log di Audit
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/security">
                  <Shield className="h-4 w-4 mr-2" />
                  Sicurezza
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/analytics">
                  <Settings className="h-4 w-4 mr-2" />
                  Analitiche
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-200 bg-white hover:border-[#008080] transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-[#008080]" />
              <h3 className="text-sm font-semibold text-gray-900">Azioni Rapide</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Strumenti e configurazioni di sistema
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full bg-[#008080] hover:bg-[#006666] text-white" size="sm">
                <Link href="/dashboard/admin/backup">
                  <FileText className="h-4 w-4 mr-2" />
                  Backup Dati
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurazioni
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/dashboard/admin/maintenance">
                  <Shield className="h-4 w-4 mr-2" />
                  Manutenzione
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
