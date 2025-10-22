
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import type { UserProfile, ProfessionalProfile, CompanyProfile } from '@/types/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User, Building, Eye, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDetailModal from '@/components/admin/UserDetailModal';

export default function AdminUsersPage() {
  const { db } = useFirebase();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

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
      setFilteredUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const displayName = user.displayName || 
          (user.role === 'professional' ? `${(user as ProfessionalProfile).firstName} ${(user as ProfessionalProfile).lastName}` : 
           (user as CompanyProfile).companyName);
        return displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

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
    <div className="space-y-4 w-full min-w-0 max-w-7xl mx-auto px-4 py-4">
      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardContent className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
            <div className="flex items-center gap-4 min-w-0">
              <Users className="h-6 w-6 text-[#008080] shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900">Gestione Utenti</h1>
                <p className="text-sm text-gray-600 truncate">Visualizza e gestisci tutti gli utenti registrati sulla piattaforma.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 shrink-0">
              <span>Totale: {filteredUsers.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardContent className="p-4 sm:p-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 shrink-0" />
                <Input
                  placeholder="Cerca utenti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-sm w-full min-w-0"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm min-w-0">
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Filtra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">Tutti i ruoli</SelectItem>
                <SelectItem value="professional" className="text-sm">Professionisti</SelectItem>
                <SelectItem value="company" className="text-sm">Aziende</SelectItem>
                <SelectItem value="admin" className="text-sm">Amministratori</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : filteredUsers.map((user) => (
              <Card key={user.uid} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-gray-900 flex-1 min-w-0 break-words">
                          {user.displayName || (user.role === 'professional' ? `${(user as ProfessionalProfile).firstName} ${(user as ProfessionalProfile).lastName}`: (user as CompanyProfile).companyName)}
                        </h3>
                        <Badge variant={(user.role as any) === 'professional' ? 'secondary' : (user.role as any) === 'admin' ? 'destructive' : 'default'} className="text-xs shrink-0 whitespace-nowrap">
                          {user.role === 'professional' && <User className="mr-1 h-3 w-3" />}
                          {user.role === 'company' && <Building className="mr-1 h-3 w-3" />}
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 break-all leading-tight">{user.email}</p>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {user.createdAt && (user.createdAt as Timestamp).toDate
                          ? (user.createdAt as Timestamp).toDate().toLocaleDateString('it-IT')
                          : 'N/D'}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => handleViewUser(user)} className="min-h-[44px] text-sm w-full">
                        <Eye className="h-4 w-4 mr-2"/>
                        Visualizza
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ruolo</TableHead>
                  <TableHead>Data Registrazione</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderSkeleton() : filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium text-sm">{user.displayName || (user.role === 'professional' ? `${(user as ProfessionalProfile).firstName} ${(user as ProfessionalProfile).lastName}`: (user as CompanyProfile).companyName)}</TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={(user.role as any) === 'professional' ? 'secondary' : (user.role as any) === 'admin' ? 'destructive' : 'default'} className="text-sm">
                        {user.role === 'professional' && <User className="mr-1 h-3 w-3" />}
                        {user.role === 'company' && <Building className="mr-1 h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {user.createdAt && (user.createdAt as Timestamp).toDate
                        ? (user.createdAt as Timestamp).toDate().toLocaleDateString('it-IT')
                        : 'N/D'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewUser(user)} className="text-sm">
                        <Eye className="h-4 w-4 mr-1"/>
                        Visualizza
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
