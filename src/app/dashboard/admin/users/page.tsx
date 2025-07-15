
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { UserProfile, ProfessionalProfile, CompanyProfile } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, User, Building, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function AdminUsersPage() {
  const { db } = useFirebase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    if (!db) return;

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedUsers: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as UserProfile);
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/4" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/3" /></TableCell>
        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Gestione Utenti</CardTitle>
              <CardDescription>Visualizza e gestisci tutti gli utenti registrati sulla piattaforma.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / Nome Azienda</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead>Data Registrazione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? renderSkeleton() : users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.displayName || (user.role === 'professional' ? `${(user as ProfessionalProfile).firstName} ${(user as ProfessionalProfile).lastName}`: (user as CompanyProfile).companyName)}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'professional' ? 'secondary' : 'default'}>
                      {user.role === 'professional' && <User className="mr-1 h-3 w-3" />}
                      {user.role === 'company' && <Building className="mr-1 h-3 w-3" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt && (user.createdAt as Timestamp).toDate
                      ? (user.createdAt as Timestamp).toDate().toLocaleDateString('it-IT')
                      : 'N/D'}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role === 'professional' && (
                        <Button asChild variant="outline" size="sm">
                            <Link href={ROUTES.PROFESSIONAL_PROFILE_VIEW(user.uid)} target="_blank">
                               <ExternalLink className="h-4 w-4 mr-1"/> Vedi Profilo
                            </Link>
                        </Button>
                    )}
                     {user.role === 'company' && (
                        <Button asChild variant="outline" size="sm">
                            {/* We don't have a public company profile page yet, linking to their dashboard profile page for now */}
                            <Link href={ROUTES.DASHBOARD_COMPANY_PROFILE} target="_blank">
                               <ExternalLink className="h-4 w-4 mr-1"/> Vedi Profilo
                            </Link>
                        </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
