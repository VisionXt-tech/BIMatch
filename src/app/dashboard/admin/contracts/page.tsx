'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Eye, Plus, Loader2, RefreshCw, Search, Filter, ArrowUpDown } from 'lucide-react';
import { ContractGenerationModal } from '@/components/admin/ContractGenerationModal';
import { ContractViewer } from '@/components/admin/ContractViewer';
import type { Contract } from '@/types/contract';
import type { ProjectApplication, Project } from '@/types/project';
import type { ProfessionalProfile, CompanyProfile } from '@/types/auth';
import { toast } from 'react-hot-toast';

interface ApplicationWithDetails extends Omit<ProjectApplication, 'professionalName'> {
  projectTitle?: string;
  professionalName?: string;
  companyName?: string;
}

export default function AdminContractsPage() {
  const { db } = useFirebase();
  const { userProfile } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [selectedApplicationForGeneration, setSelectedApplicationForGeneration] =
    useState<ApplicationWithDetails | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(
    null
  );
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchContracts = useCallback(async () => {
    if (!db) return;

    try {
      setLoading(true);
      const contractsRef = collection(db, 'contracts');
      const q = query(contractsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const fetchedContracts: Contract[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contract[];

      setContracts(fetchedContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Errore nel caricamento dei contratti');
    } finally {
      setLoading(false);
    }
  }, [db]);

  const fetchApplicationsInInterview = useCallback(async () => {
    if (!db) return;

    try {
      const allApplications: ApplicationWithDetails[] = [];
      const validStatuses = [
        'colloquio_proposto',
        'colloquio_accettato_prof',
        'colloquio_ripianificato_prof',
      ];

      console.log('[Admin Contracts] Fetching applications from both sources...');

      // OPZIONE 1: Prova a fetchare da jobs/{jobId}/applications/{applicationId} (nuova struttura)
      try {
        const jobsRef = collection(db, 'jobs');
        const jobsSnapshot = await getDocs(jobsRef);
        console.log('[Admin Contracts] Found jobs:', jobsSnapshot.docs.length);

        for (const jobDoc of jobsSnapshot.docs) {
          const applicationsRef = collection(db, 'jobs', jobDoc.id, 'applications');
          const applicationsSnapshot = await getDocs(applicationsRef);

          for (const appDoc of applicationsSnapshot.docs) {
            const appData = { id: appDoc.id, ...appDoc.data() } as ApplicationWithDetails;

            if (validStatuses.includes(appData.status) && !appData.contractId) {
              appData.projectTitle = jobDoc.data().title;
              appData.projectId = jobDoc.id; // Assicurati che projectId sia impostato

              // Fetch professional name
              try {
                const profDoc = await getDoc(doc(db, 'users', appData.professionalId));
                if (profDoc.exists()) {
                  const profData = profDoc.data();
                  appData.professionalName =
                    `${profData.firstName || ''} ${profData.lastName || ''}`.trim() ||
                    profData.displayName;
                }
              } catch (err) {
                console.warn('Could not fetch professional:', err);
              }

              // Fetch company name
              try {
                const compDoc = await getDoc(doc(db, 'users', appData.companyId));
                if (compDoc.exists()) {
                  appData.companyName = compDoc.data().companyName;
                }
              } catch (err) {
                console.warn('Could not fetch company:', err);
              }

              allApplications.push(appData);
            }
          }
        }
        console.log('[Admin Contracts] Found applications in jobs:', allApplications.length);
      } catch (err) {
        console.warn('No applications found in jobs subcollection:', err);
      }

      // OPZIONE 2: Prova anche la collezione flat projectApplications (vecchia struttura)
      try {
        const projectApplicationsRef = collection(db, 'projectApplications');
        const projectAppsSnapshot = await getDocs(projectApplicationsRef);
        console.log('[Admin Contracts] Found projectApplications:', projectAppsSnapshot.docs.length);

        for (const appDoc of projectAppsSnapshot.docs) {
          const appData = { id: appDoc.id, ...appDoc.data() } as ApplicationWithDetails;

          console.log('[Admin Contracts] Checking application:', {
            id: appData.id,
            status: appData.status,
            hasContract: !!appData.contractId,
          });

          if (validStatuses.includes(appData.status) && !appData.contractId) {
            // Fetch project details
            try {
              const projectDoc = await getDoc(doc(db, 'projects', appData.projectId));
              if (projectDoc.exists()) {
                appData.projectTitle = projectDoc.data().title;
              }
            } catch (err) {
              console.warn('Could not fetch project:', err);
            }

            // Fetch professional name
            try {
              const profDoc = await getDoc(doc(db, 'users', appData.professionalId));
              if (profDoc.exists()) {
                const profData = profDoc.data();
                appData.professionalName =
                  `${profData.firstName || ''} ${profData.lastName || ''}`.trim() ||
                  profData.displayName;
              }
            } catch (err) {
              console.warn('Could not fetch professional:', err);
            }

            // Fetch company name
            try {
              const compDoc = await getDoc(doc(db, 'users', appData.companyId));
              if (compDoc.exists()) {
                appData.companyName = compDoc.data().companyName;
              }
            } catch (err) {
              console.warn('Could not fetch company:', err);
            }

            allApplications.push(appData);
          }
        }
      } catch (err) {
        console.warn('No applications found in projectApplications collection:', err);
      }

      console.log('[Admin Contracts] Total applications found:', allApplications.length);
      setApplications(allApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Errore nel caricamento delle candidature');
    }
  }, [db]);

  useEffect(() => {
    fetchContracts();
    fetchApplicationsInInterview();
  }, [fetchContracts, fetchApplicationsInInterview]);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="text"]');
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewerOpen(true);
  };

  const handleGenerateContract = async (application: ApplicationWithDetails) => {
    if (!db) return;

    try {
      console.log('[Admin Contracts] Preparing contract generation for application:', application.id);
      console.log('[Admin Contracts] ProjectId:', application.projectId);

      // Prova prima nella collezione projects (vecchia struttura)
      let jobDoc = await getDoc(doc(db, 'projects', application.projectId));

      // Se non trovato, prova nella collezione jobs (nuova struttura)
      if (!jobDoc.exists()) {
        console.log('[Admin Contracts] Project not found in projects collection, trying jobs...');
        jobDoc = await getDoc(doc(db, 'jobs', application.projectId));
      }

      const [profDoc, compDoc] = await Promise.all([
        getDoc(doc(db, 'users', application.professionalId)),
        getDoc(doc(db, 'users', application.companyId)),
      ]);

      console.log('[Admin Contracts] Data check:', {
        projectExists: jobDoc.exists(),
        professionalExists: profDoc.exists(),
        companyExists: compDoc.exists(),
      });

      if (!jobDoc.exists()) {
        toast.error(`Progetto non trovato: ${application.projectId}`);
        return;
      }

      if (!profDoc.exists()) {
        toast.error(`Professionista non trovato: ${application.professionalId}`);
        return;
      }

      if (!compDoc.exists()) {
        toast.error(`Azienda non trovata: ${application.companyId}`);
        return;
      }

      setSelectedProject({ id: jobDoc.id, ...jobDoc.data() } as Project);
      setSelectedProfessional(profDoc.data() as ProfessionalProfile);
      setSelectedCompany(compDoc.data() as CompanyProfile);
      setSelectedApplicationForGeneration(application);
      setIsGenerationModalOpen(true);
    } catch (error) {
      console.error('Error preparing contract generation:', error);
      toast.error('Errore nel caricamento dei dati');
    }
  };

  const handleContractGenerated = (contractId: string) => {
    setIsGenerationModalOpen(false);
    fetchContracts();
    fetchApplicationsInInterview();
    toast.success('Contratto generato! ID: ' + contractId);
  };

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchContracts(), fetchApplicationsInInterview()]);
      toast.success('Dati aggiornati');
    } catch (error) {
      toast.error('Errore nell\'aggiornamento');
    } finally {
      setRefreshing(false);
    }
  }, [fetchContracts, fetchApplicationsInInterview]);

  // Filtered and sorted applications
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.projectTitle?.toLowerCase().includes(query) ||
          app.professionalName?.toLowerCase().includes(query) ||
          app.companyName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [applications, searchQuery]);

  // Filtered and sorted contracts
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contract) =>
          contract.contractData.professional.name.toLowerCase().includes(query) ||
          contract.contractData.company.businessName.toLowerCase().includes(query) ||
          contract.id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((contract) => contract.status === statusFilter);
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          const dateA = a.generatedAt?.seconds || 0;
          const dateB = b.generatedAt?.seconds || 0;
          comparison = dateA - dateB;
          break;
        case 'amount':
          comparison = a.contractData.payment.totalAmount - b.contractData.payment.totalAmount;
          break;
        case 'name':
          comparison = a.contractData.professional.name.localeCompare(
            b.contractData.professional.name
          );
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [contracts, searchQuery, statusFilter, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalApplications: applications.length,
      totalContracts: contracts.length,
      pendingReview: contracts.filter((c) => c.status === 'PENDING_REVIEW').length,
      approved: contracts.filter((c) => c.status === 'APPROVED').length,
    };
  }, [applications.length, contracts]);

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
    GENERATED: 'bg-gray-100 text-gray-700 border border-gray-200',
    PENDING_REVIEW: 'bg-[#008080] text-white',
    APPROVED: 'bg-gray-100 text-gray-700 border border-gray-200',
    REJECTED: 'bg-red-50 text-red-700 border border-red-200',
    ARCHIVED: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'Bozza',
    GENERATED: 'Generato',
    PENDING_REVIEW: 'In Revisione',
    APPROVED: 'Approvato',
    REJECTED: 'Rifiutato',
    ARCHIVED: 'Archiviato',
  };

  return (
    <div className="space-y-4 sm:space-y-8 w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-4 lg:px-6 py-4">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Card className="border border-gray-200 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 truncate">Candidature</p>
                <p className="text-lg font-semibold text-gray-900 mt-2 tabular-nums">{stats.totalApplications}</p>
              </div>
              <div className="h-12 w-12 shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 truncate">Contratti Totali</p>
                <p className="text-lg font-semibold text-gray-900 mt-2 tabular-nums">{stats.totalContracts}</p>
              </div>
              <div className="h-12 w-12 shrink-0 bg-[#008080]/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-[#008080]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 truncate">In Revisione</p>
                <p className="text-lg font-semibold text-gray-900 mt-2 tabular-nums">{stats.pendingReview}</p>
              </div>
              <div className="h-12 w-12 shrink-0 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 min-w-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500 truncate">Approvati</p>
                <p className="text-lg font-semibold text-gray-900 mt-2 tabular-nums">{stats.approved}</p>
              </div>
              <div className="h-12 w-12 shrink-0 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 min-w-0">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cerca contratti..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 sm:pr-12 text-sm w-full min-w-0"
                aria-label="Cerca contratti"
              />
              <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-200 rounded hidden sm:inline-block">
                /
              </kbd>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm min-w-0" aria-label="Filtra per status">
                <Filter className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Tutti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-sm">Tutti gli stati</SelectItem>
                <SelectItem value="DRAFT" className="text-sm">Bozza</SelectItem>
                <SelectItem value="GENERATED" className="text-sm">Generato</SelectItem>
                <SelectItem value="PENDING_REVIEW" className="text-sm">In Revisione</SelectItem>
                <SelectItem value="APPROVED" className="text-sm">Approvato</SelectItem>
                <SelectItem value="REJECTED" className="text-sm">Rifiutato</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[180px] text-sm min-w-0" aria-label="Ordina per">
                <ArrowUpDown className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Ordina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date" className="text-sm">Data</SelectItem>
                <SelectItem value="amount" className="text-sm">Importo</SelectItem>
                <SelectItem value="name" className="text-sm">Nome</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm min-h-[40px] sm:min-h-[36px]"
              aria-label="Aggiorna dati"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>

          {/* Active filters indicator */}
          {(searchQuery || statusFilter !== 'all' || sortBy !== 'date') && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 pt-4 border-t border-gray-200 min-w-0">
              <span className="text-sm text-gray-600 shrink-0">Filtri attivi:</span>
              <div className="flex flex-wrap gap-2 min-w-0">
                {searchQuery && (
                  <Badge variant="outline" className="text-sm max-w-[200px] truncate">
                    Ricerca: {searchQuery}
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant="outline" className="text-sm truncate">
                    Status: {statusLabels[statusFilter] || statusFilter}
                  </Badge>
                )}
                {sortBy !== 'date' && (
                  <Badge variant="outline" className="text-sm truncate">
                    Ordinamento: {sortBy === 'amount' ? 'Importo' : 'Nome'}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setSortBy('date');
                    setSortOrder('desc');
                  }}
                  className="h-6 px-2 text-sm"
                >
                  Cancella filtri
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications pronte per contratto */}
      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <CardTitle className="text-lg font-semibold">Candidature in Colloquio</CardTitle>
            {!loading && (
              <Badge variant="outline" className="text-sm tabular-nums">
                {filteredApplications.length} di {applications.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:px-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {searchQuery ? 'Nessuna candidatura trovata' : 'Nessuna candidatura pronta'}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? 'Prova con termini di ricerca differenti'
                  : 'Le candidature in colloquio appariranno qui'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {filteredApplications.map((app) => (
                  <Card key={app.id} className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-900 mb-2 break-words leading-tight">
                            {app.projectTitle || 'N/D'}
                          </h3>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600 break-words">
                              <span className="font-medium">Professionista:</span> {app.professionalName || 'N/D'}
                            </p>
                            <p className="text-xs text-gray-600 break-words">
                              <span className="font-medium">Azienda:</span> {app.companyName || 'N/D'}
                            </p>
                            <Badge variant="outline" className="text-xs mt-1">{app.status}</Badge>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <Button
                            size="sm"
                            onClick={() => handleGenerateContract(app)}
                            className="bg-[#008080] hover:bg-[#006666] text-sm min-h-[44px] w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Genera Contratto
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
                      <TableHead>Progetto</TableHead>
                      <TableHead>Professionista</TableHead>
                      <TableHead>Azienda</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-semibold text-sm">{app.projectTitle || 'N/D'}</TableCell>
                        <TableCell className="text-sm">{app.professionalName || 'N/D'}</TableCell>
                        <TableCell className="text-sm">{app.companyName || 'N/D'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-sm">{app.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleGenerateContract(app)}
                            className="bg-[#008080] hover:bg-[#006666] text-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Genera Contratto
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contratti esistenti */}
      <Card className="border border-gray-200 rounded-lg min-w-0">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <CardTitle className="text-lg font-semibold">Contratti Generati</CardTitle>
            {!loading && (
              <Badge variant="outline" className="text-sm tabular-nums">
                {filteredContracts.length} di {contracts.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:px-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'Nessun contratto trovato' : 'Nessun contratto generato'}
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all'
                  ? 'Prova con filtri diversi'
                  : 'I contratti generati appariranno qui'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-3">
                {filteredContracts.map((contract) => (
                  <Card key={contract.id} className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-gray-900 flex-1 min-w-0 break-words leading-tight">
                              {contract.contractData.professional.name}
                            </h3>
                            <Badge className={`${statusColors[contract.status]} text-xs shrink-0 whitespace-nowrap`}>
                              {statusLabels[contract.status]}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600 break-words"><span className="font-medium">Azienda:</span> {contract.contractData.company.businessName}</p>
                            <p className="text-xs text-gray-600"><span className="font-medium">Importo:</span> €{contract.contractData.payment.totalAmount.toLocaleString('it-IT')}</p>
                            <p className="text-xs text-gray-600 break-all"><span className="font-medium">ID:</span> <span className="font-mono">{contract.id?.slice(0, 12)}...</span></p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {contract.generatedAt
                              ? new Date(contract.generatedAt.seconds * 1000).toLocaleDateString('it-IT')
                              : 'N/D'}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewContract(contract)}
                            className="text-sm min-h-[44px] w-full"
                          >
                            <Eye className="h-4 w-4 mr-2" />
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
                      <TableHead>ID</TableHead>
                      <TableHead>Professionista</TableHead>
                      <TableHead>Azienda</TableHead>
                      <TableHead>Importo</TableHead>
                      <TableHead>Data Generazione</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-mono text-sm tabular-nums">{contract.id?.slice(0, 8)}...</TableCell>
                        <TableCell className="text-sm">{contract.contractData.professional.name}</TableCell>
                        <TableCell className="text-sm">{contract.contractData.company.businessName}</TableCell>
                        <TableCell className="font-mono text-sm tabular-nums">€{contract.contractData.payment.totalAmount.toLocaleString('it-IT')}</TableCell>
                        <TableCell className="text-sm">
                          {contract.generatedAt
                            ? new Date(contract.generatedAt.seconds * 1000).toLocaleDateString('it-IT')
                            : 'N/D'}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[contract.status]}>
                            {statusLabels[contract.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewContract(contract)}
                            className="text-sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizza
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Contract Generation Modal */}
      {selectedApplicationForGeneration &&
        selectedProject &&
        selectedProfessional &&
        selectedCompany && (
          <ContractGenerationModal
            isOpen={isGenerationModalOpen}
            onClose={() => {
              setIsGenerationModalOpen(false);
              setSelectedApplicationForGeneration(null);
              setSelectedProject(null);
              setSelectedProfessional(null);
              setSelectedCompany(null);
            }}
            application={selectedApplicationForGeneration as ProjectApplication}
            project={selectedProject}
            professional={selectedProfessional}
            company={selectedCompany}
            onSuccess={handleContractGenerated}
          />
        )}

      {/* Contract Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizza Contratto</DialogTitle>
          </DialogHeader>
          {selectedContract && <ContractViewer contractId={selectedContract.id!} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
