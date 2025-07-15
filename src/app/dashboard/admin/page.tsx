
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Users, Briefcase, Shield, BarChart2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, where,getCountFromServer } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();
  const { db } = useFirebase();

  const [stats, setStats] = useState({
    totalUsers: null as number | null,
    totalProfessionals: null as number | null,
    totalCompanies: null as number | null,
    totalProjects: null as number | null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    if (!db) return;
    try {
        const usersRef = collection(db, 'users');
        const projectsRef = collection(db, 'projects');

        const totalUsersSnapshot = await getCountFromServer(usersRef);
        const professionalsSnapshot = await getCountFromServer(query(usersRef, where('role', '==', 'professional')));
        const companiesSnapshot = await getCountFromServer(query(usersRef, where('role', '==', 'company')));
        const projectsSnapshot = await getCountFromServer(projectsRef);

        setStats({
            totalUsers: totalUsersSnapshot.data().count,
            totalProfessionals: professionalsSnapshot.data().count,
            totalCompanies: companiesSnapshot.data().count,
            totalProjects: projectsSnapshot.data().count
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
            <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        {key === 'totalUsers' && 'Utenti Totali'}
                        {key === 'totalProfessionals' && 'Professionisti'}
                        {key === 'totalCompanies' && 'Aziende'}
                        {key === 'totalProjects' && 'Progetti Totali'}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{value}</div>}
                </CardContent>
            </Card>
        ))}
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Azioni Rapide</CardTitle>
            <CardDescription>Gestisci le sezioni principali della piattaforma.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </CardContent>
       </Card>
    </div>
  );
}
