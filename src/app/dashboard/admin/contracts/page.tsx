'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { FileText, Eye, Plus, Loader2, Calendar, User, Building2 } from 'lucide-react';
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

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    GENERATED: 'bg-blue-500',
    PENDING_REVIEW: 'bg-yellow-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    ARCHIVED: 'bg-gray-400',
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
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#008080]" />
            Gestione Contratti AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Genera contratti personalizzati con AI per candidature in fase colloquio
          </p>
        </CardContent>
      </Card>

      {/* Applications pronte per contratto */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Candidature in Fase Colloquio (Senza Contratto)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-2">
                Nessuna candidatura in fase colloquio senza contratto
              </p>
              <p className="text-xs text-gray-400">
                Cercato in: jobs/*/applications e projectApplications
              </p>
            </div>
          ) : (
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
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.projectTitle || 'N/D'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        {app.professionalName || 'N/D'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {app.companyName || 'N/D'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateContract(app)}
                        className="bg-[#008080] hover:bg-[#006666]"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Genera Contratto
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Contratti esistenti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contratti Generati</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nessun contratto generato ancora
            </p>
          ) : (
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
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono text-xs">{contract.id?.slice(0, 8)}...</TableCell>
                    <TableCell>{contract.contractData.professional.name}</TableCell>
                    <TableCell>{contract.contractData.company.businessName}</TableCell>
                    <TableCell>€{contract.contractData.payment.totalAmount.toLocaleString('it-IT')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {contract.generatedAt
                          ? new Date(contract.generatedAt.seconds * 1000).toLocaleDateString('it-IT')
                          : 'N/D'}
                      </div>
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
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizza
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
