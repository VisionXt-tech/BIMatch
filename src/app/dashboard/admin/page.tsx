
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useState, useEffect } from 'react';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import {
  Users,
  Briefcase,
  Shield,
  HandHeart,
  FileSignature,
  TrendingUp,
  Building,
  User,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalProfessionals: number;
  totalCompanies: number;
  totalProjects: number;
  activeProjects: number;
  totalApplications: number;
  totalContracts: number;
}

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();
  const { db } = useFirebase();
  const [stats, setStats] = useState<DashboardStats>({
    totalProfessionals: 0,
    totalCompanies: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalApplications: 0,
    totalContracts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!db) return;

      try {
        setLoading(true);

        // Count professionals
        const professionalsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'professional')
        );
        const professionalsSnap = await getCountFromServer(professionalsQuery);

        // Count companies
        const companiesQuery = query(
          collection(db, 'users'),
          where('role', '==', 'company')
        );
        const companiesSnap = await getCountFromServer(companiesQuery);

        // Count total projects
        const projectsSnap = await getCountFromServer(collection(db, 'projects'));

        // Count active projects
        const activeProjectsQuery = query(
          collection(db, 'projects'),
          where('status', '==', 'attivo')
        );
        const activeProjectsSnap = await getCountFromServer(activeProjectsQuery);

        // Count total applications
        let totalApplications = 0;
        try {
          const applicationsSnap = await getCountFromServer(collection(db, 'projectApplications'));
          totalApplications = applicationsSnap.data().count;
        } catch (err) {
          console.log('Using alternate collection for applications');
        }

        // Count contracts
        const contractsSnap = await getCountFromServer(collection(db, 'contracts'));

        setStats({
          totalProfessionals: professionalsSnap.data().count,
          totalCompanies: companiesSnap.data().count,
          totalProjects: projectsSnap.data().count,
          activeProjects: activeProjectsSnap.data().count,
          totalApplications,
          totalContracts: contractsSnap.data().count,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [db]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
  }: {
    title: string;
    value: number;
    icon: any;
    description: string;
  }) => (
    <Card className="border border-gray-200 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">
              {loading ? '...' : value.toLocaleString('it-IT')}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[#008080]/10 rounded-lg flex items-center justify-center">
              <Icon className="h-6 w-6 text-[#008080]" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto px-4 bg-gray-50 py-6">
      {/* Hero Section */}
      <Card className="border border-gray-200 bg-gradient-to-r from-[#008080] to-[#006666] text-white">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Shield className="h-10 w-10 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold">Pannello di Amministrazione</h1>
              <p className="text-sm opacity-90 mt-1">
                Benvenuto, {userProfile?.displayName || 'Admin'}. Gestisci la piattaforma BIMatch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Professionisti"
          value={stats.totalProfessionals}
          icon={User}
          description="Totale professionisti BIM"
        />
        <StatCard
          title="Aziende"
          value={stats.totalCompanies}
          icon={Building}
          description="Aziende registrate"
        />
        <StatCard
          title="Progetti Totali"
          value={stats.totalProjects}
          icon={Briefcase}
          description="Progetti pubblicati"
        />
        <StatCard
          title="Progetti Attivi"
          value={stats.activeProjects}
          icon={Clock}
          description="Progetti aperti"
        />
        <StatCard
          title="Candidature"
          value={stats.totalApplications}
          icon={HandHeart}
          description="Candidature totali"
        />
        <StatCard
          title="Contratti Generati"
          value={stats.totalContracts}
          icon={FileSignature}
          description="Contratti AI creati"
        />
      </div>

      {/* Main Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Azioni Principali</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* User Management */}
          <Card className="border border-gray-200 bg-white hover:border-[#008080] hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-[#008080]" />
                Gestione Utenti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Visualizza e gestisci tutti gli utenti della piattaforma
              </p>
              <Button
                asChild
                className="w-full bg-[#008080] hover:bg-[#006666]"
                size="sm"
              >
                <Link href={ROUTES.DASHBOARD_ADMIN_USERS}>
                  Gestisci Utenti
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Project Management */}
          <Card className="border border-gray-200 bg-white hover:border-[#008080] hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-5 w-5 text-[#008080]" />
                Gestione Progetti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Modera e gestisci i progetti pubblicati dalle aziende
              </p>
              <Button
                asChild
                className="w-full bg-[#008080] hover:bg-[#006666]"
                size="sm"
              >
                <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS}>
                  Gestisci Progetti
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Contracts AI */}
          <Card className="border border-gray-200 bg-white hover:border-[#008080] hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileSignature className="h-5 w-5 text-[#008080]" />
                Contratti AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600 mb-4">
                Genera contratti personalizzati con intelligenza artificiale
              </p>
              <Button
                asChild
                className="w-full bg-[#008080] hover:bg-[#006666]"
                size="sm"
              >
                <Link href={ROUTES.DASHBOARD_ADMIN_CONTRACTS}>
                  Gestisci Contratti
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats Table */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">Riepilogo Rapido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-600">Utenti Totali</span>
              <span className="text-sm font-semibold text-gray-900">
                {loading ? '...' : (stats.totalProfessionals + stats.totalCompanies).toLocaleString('it-IT')}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-600">Progetti Completati</span>
              <span className="text-sm font-semibold text-gray-900">
                {loading ? '...' : (stats.totalProjects - stats.activeProjects).toLocaleString('it-IT')}
              </span>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm text-gray-600">Tasso di Conversione</span>
              <span className="text-sm font-semibold text-gray-900">
                {loading || stats.totalApplications === 0
                  ? '...'
                  : `${((stats.totalContracts / stats.totalApplications) * 100).toFixed(1)}%`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Media Candidature/Progetto</span>
              <span className="text-sm font-semibold text-gray-900">
                {loading || stats.totalProjects === 0
                  ? '...'
                  : (stats.totalApplications / stats.totalProjects).toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
