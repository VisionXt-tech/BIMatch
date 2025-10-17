
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
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4 bg-gray-50">
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Users className="h-6 w-6 text-[#008080]" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Gestione Utenti</h1>
                <p className="text-sm text-gray-600">Visualizza e gestisci tutti gli utenti registrati sulla piattaforma.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Totale: {filteredUsers.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per nome o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtra per ruolo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i ruoli</SelectItem>
                <SelectItem value="professional">Professionisti</SelectItem>
                <SelectItem value="company">Aziende</SelectItem>
                <SelectItem value="admin">Amministratori</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              {loading ? renderSkeleton() : filteredUsers.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">{user.displayName || (user.role === 'professional' ? `${(user as ProfessionalProfile).firstName} ${(user as ProfessionalProfile).lastName}`: (user as CompanyProfile).companyName)}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={(user.role as any) === 'professional' ? 'secondary' : (user.role as any) === 'admin' ? 'destructive' : 'default'}>
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
                    <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                      <Eye className="h-4 w-4 mr-1"/> Visualizza
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
