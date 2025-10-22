'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { HandHeart, Eye, Check, X, Trash2, Search, Filter, User, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectApplication {
  id: string;
  projectId: string;
  professionalId: string;
  companyId: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: any;
  message?: string;
  projectTitle?: string;
  professionalName?: string;
  companyName?: string;
}

export default function AdminMatchesPage() {
  const { db } = useFirebase();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<ProjectApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    if (!db) return;

    try {
      const applicationsRef = collection(db, 'projectApplications');
      const q = query(applicationsRef, orderBy('appliedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedApplications: ProjectApplication[] = [];
      
      for (const docSnap of querySnapshot.docs) {
        const applicationData = { id: docSnap.id, ...docSnap.data() } as ProjectApplication;
        
        // Fetch project details
        try {
          const projectDoc = await getDoc(doc(db, 'projects', applicationData.projectId));
          if (projectDoc.exists()) {
            applicationData.projectTitle = projectDoc.data().title;
          }
        } catch (error) {
          console.warn(`Could not fetch project ${applicationData.projectId}`);
        }

        // Fetch professional details
        try {
          const professionalDoc = await getDoc(doc(db, 'users', applicationData.professionalId));
          if (professionalDoc.exists()) {
            const professionalData = professionalDoc.data();
            applicationData.professionalName = professionalData.displayName || 
              `${professionalData.firstName} ${professionalData.lastName}`;
          }
        } catch (error) {
          console.warn(`Could not fetch professional ${applicationData.professionalId}`);
        }

        // Fetch company details
        try {
          const companyDoc = await getDoc(doc(db, 'users', applicationData.companyId));
          if (companyDoc.exists()) {
            const companyData = companyDoc.data();
            applicationData.companyName = companyData.companyName || companyData.displayName;
          }
        } catch (error) {
          console.warn(`Could not fetch company ${applicationData.companyId}`);
        }

        fetchedApplications.push(applicationData);
      }
      
      setApplications(fetchedApplications);
      setFilteredApplications(fetchedApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le candidature.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [db, toast]);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.professionalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    setActionLoading(true);
    try {
      const applicationRef = doc(db, 'projectApplications', applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      toast({
        title: "Stato aggiornato",
        description: `Candidatura ${newStatus === 'accepted' ? 'accettata' : 'rifiutata'} con successo.`,
      });

      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato della candidatura.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'projectApplications', selectedApplication.id));
      
      toast({
        title: "Candidatura eliminata",
        description: "La candidatura è stata eliminata con successo.",
      });

      fetchApplications();
      setShowDeleteDialog(false);
      setIsDetailModalOpen(false);
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare la candidatura.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (application: ProjectApplication) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const renderSkeleton = () => (
    [...Array(5)].map((_, i) => (
      <TableRow key={i}>
        <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/2" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/4" /></TableCell>
        <TableCell><Skeleton className="h-6 w-1/3" /></TableCell>
        <TableCell><Skeleton className="h-8 w-24" /></TableCell>
      </TableRow>
    ))
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Accettata';
      case 'rejected': return 'Rifiutata';
      default: return 'In Attesa';
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0 max-w-7xl mx-auto px-4 py-4">
      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardContent className="p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
            <div className="flex items-center gap-4 min-w-0">
              <HandHeart className="h-6 w-6 text-[#008080] shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-gray-900">Gestione Candidature</h1>
                <p className="text-sm text-gray-600 truncate">Visualizza e gestisci tutte le candidature tra professionisti e aziende.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 shrink-0">
              <span>Totale: {filteredApplications.length}</span>
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
                  placeholder="Cerca candidature..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-sm w-full min-w-0"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm min-w-0">
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Filtra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">Tutti gli stati</SelectItem>
                <SelectItem value="pending" className="text-sm">In Attesa</SelectItem>
                <SelectItem value="accepted" className="text-sm">Accettate</SelectItem>
                <SelectItem value="rejected" className="text-sm">Rifiutate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : filteredApplications.map((application) => (
              <Card key={application.id} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-gray-900 flex-1 min-w-0 break-words leading-tight">
                          {application.projectTitle || `Progetto #${application.projectId}`}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs shrink-0 whitespace-nowrap">
                          {getStatusText(application.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate text-xs">{application.professionalName || 'Sconosciuto'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-3 w-3 shrink-0" />
                          <span className="truncate text-xs">{application.companyName || 'Sconosciuta'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 block mb-2">
                        {application.appliedAt?.toDate?.()?.toLocaleDateString('it-IT') || 'N/D'}
                      </span>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                          className="min-h-[44px] text-sm w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Dettagli
                        </Button>
                        {application.status === 'pending' && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'accepted')}
                              disabled={actionLoading}
                              className="min-h-[44px] text-sm bg-[#008080] hover:bg-[#006666]"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-xs">Accetta</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              disabled={actionLoading}
                              className="min-h-[44px] text-sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              <span className="text-xs">Rifiuta</span>
                            </Button>
                          </div>
                        )}
                      </div>
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
                  <TableHead>Progetto</TableHead>
                  <TableHead>Professionista</TableHead>
                  <TableHead>Azienda</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Data Candidatura</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderSkeleton() : filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium text-sm">
                      {application.projectTitle || `Progetto #${application.projectId}`}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {application.professionalName || 'Sconosciuto'}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        {application.companyName || 'Sconosciuta'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(application.status)} className="text-sm">
                        {getStatusText(application.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {application.appliedAt?.toDate?.()?.toLocaleDateString('it-IT') || 'N/D'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application)}
                          className="text-sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Dettagli
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'accepted')}
                              disabled={actionLoading}
                              className="text-sm bg-[#008080] hover:bg-[#006666]"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accetta
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusChange(application.id, 'rejected')}
                              disabled={actionLoading}
                              className="text-sm"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rifiuta
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dettagli Candidatura</DialogTitle>
            <DialogDescription>
              Informazioni complete sulla candidatura
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Progetto</h4>
                  <p>{selectedApplication.projectTitle || `Progetto #${selectedApplication.projectId}`}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Stato</h4>
                  <Badge variant={getStatusBadgeVariant(selectedApplication.status)}>
                    {getStatusText(selectedApplication.status)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Professionista</h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {selectedApplication.professionalName || 'Professionista sconosciuto'}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Azienda</h4>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    {selectedApplication.companyName || 'Azienda sconosciuta'}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Data Candidatura</h4>
                  <p>{selectedApplication.appliedAt?.toDate?.()?.toLocaleDateString('it-IT') || 'N/D'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">ID Candidatura</h4>
                  <p className="text-xs font-mono">{selectedApplication.id}</p>
                </div>
              </div>

              {selectedApplication.message && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Messaggio del Professionista</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedApplication.message}</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina Candidatura
                </Button>
                
                <div className="flex gap-2">
                  {selectedApplication.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        onClick={() => handleStatusChange(selectedApplication.id, 'accepted')}
                        disabled={actionLoading}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accetta
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                        disabled={actionLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rifiuta
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. La candidatura verrà eliminata permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApplication} disabled={actionLoading}>
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}