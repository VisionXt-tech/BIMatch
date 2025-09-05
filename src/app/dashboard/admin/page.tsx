
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Users, Briefcase, Shield, BarChart2, HandHeart, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();
  const { db } = useFirebase();

  const [stats, setStats] = useState({
    totalUsers: null as number | null,
    totalProfessionals: null as number | null,
    totalCompanies: null as number | null,
    totalProjects: null as number | null,
    totalApplications: null as number | null,
    pendingApplications: null as number | null,
    acceptedApplications: null as number | null,
    rejectedApplications: null as number | null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    if (!db) return;
    try {
        const usersRef = collection(db, 'users');
        const projectsRef = collection(db, 'projects');
        const applicationsRef = collection(db, 'projectApplications');

        const [
          totalUsersSnapshot,
          professionalsSnapshot,
          companiesSnapshot,
          projectsSnapshot,
          totalApplicationsSnapshot,
          pendingApplicationsSnapshot,
          acceptedApplicationsSnapshot,
          rejectedApplicationsSnapshot
        ] = await Promise.all([
          getCountFromServer(usersRef),
          getCountFromServer(query(usersRef, where('role', '==', 'professional'))),
          getCountFromServer(query(usersRef, where('role', '==', 'company'))),
          getCountFromServer(projectsRef),
          getCountFromServer(applicationsRef),
          getCountFromServer(query(applicationsRef, where('status', '==', 'pending'))),
          getCountFromServer(query(applicationsRef, where('status', '==', 'accepted'))),
          getCountFromServer(query(applicationsRef, where('status', '==', 'rejected')))
        ]);

        setStats({
            totalUsers: totalUsersSnapshot.data().count,
            totalProfessionals: professionalsSnapshot.data().count,
            totalCompanies: companiesSnapshot.data().count,
            totalProjects: projectsSnapshot.data().count,
            totalApplications: totalApplicationsSnapshot.data().count,
            pendingApplications: pendingApplicationsSnapshot.data().count,
            acceptedApplications: acceptedApplicationsSnapshot.data().count,
            rejectedApplications: rejectedApplicationsSnapshot.data().count
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
    } finally {
        setLoadingStats(false);
    }
  }, [db]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
             <Shield className="h-8 w-8 text-primary"/>
             <div>
                <CardTitle className="text-2xl font-bold">Pannello di Amministrazione</CardTitle>
                <CardDescription>Benvenuto, {userProfile?.displayName || 'Admin'}.</CardDescription>
             </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalUsers}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionisti</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalProfessionals}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aziende</CardTitle>
            <Briefcase className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalCompanies}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progetti Attivi</CardTitle>
            <BarChart2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalProjects}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Match Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidature Totali</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.totalApplications}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.pendingApplications}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Match Riusciti</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.acceptedApplications}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidature Rifiutate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{stats.rejectedApplications}</div>}
          </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Azioni Rapide</CardTitle>
            <CardDescription>Gestisci tutte le sezioni della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <Button asChild size="lg">
                <Link href={ROUTES.DASHBOARD_ADMIN_USERS} className="flex items-center justify-center h-24 text-lg">
                    <Users className="mr-3 h-6 w-6" /> Gestisci Utenti
                </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
                <Link href={ROUTES.DASHBOARD_ADMIN_PROJECTS} className="flex items-center justify-center h-24 text-lg">
                    <Briefcase className="mr-3 h-6 w-6" /> Gestisci Progetti
                </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
                <Link href="/dashboard/admin/matches" className="flex items-center justify-center h-24 text-lg">
                    <HandHeart className="mr-3 h-6 w-6" /> Gestisci Match
                </Link>
            </Button>
        </CardContent>
       </Card>
    </div>
  );
}
