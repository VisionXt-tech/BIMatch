'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { ContractData } from '@/types/contract';
import type { ProjectApplication, Project } from '@/types/project';
import type { ProfessionalProfile, CompanyProfile } from '@/types/auth';

interface ContractGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ProjectApplication;
  project: Project;
  professional: ProfessionalProfile;
  company: CompanyProfile;
  onSuccess?: (contractId: string) => void;
}

export function ContractGenerationModal({
  isOpen,
  onClose,
  application,
  project,
  professional,
  company,
  onSuccess,
}: ContractGenerationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'generating' | 'success' | 'error'>('form');
  const [generatedContractId, setGeneratedContractId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state - AUTO-POPOLATO dai profili e dal progetto
  const [contractData, setContractData] = useState<ContractData>({
    professional: {
      name: `${professional.firstName} ${professional.lastName}`.trim() || professional.displayName || '',
      piva: professional.partitaIva || '', // AUTO-POPOLATO dal profilo
      fiscalCode: professional.fiscalCode || '', // AUTO-POPOLATO dal profilo
      taxRegime: professional.taxRegime || 'forfettario', // AUTO-POPOLATO dal profilo
      address: professional.fiscalAddress || professional.location || '', // AUTO-POPOLATO
      email: professional.email || '',
      phone: '',
    },
    company: {
      businessName: company.companyName || '',
      piva: company.companyVat || '',
      address: company.legalAddress || company.companyLocation || '', // AUTO-POPOLATO
      legalRepresentative: company.legalRepresentative || company.contactPerson || '', // AUTO-POPOLATO
      email: company.contactEmail || company.email || '',
      phone: company.contactPhone || '',
    },
    project: {
      title: project.title,
      description: project.description,
      deliverables: project.deliverables || [], // AUTO-POPOLATO dal progetto
      duration: project.duration || '3 mesi',
      startDate: project.startDate || '', // AUTO-POPOLATO dal progetto
      endDate: project.endDate || '', // AUTO-POPOLATO dal progetto
      workMode: project.workMode || 'remoto', // AUTO-POPOLATO dal progetto
      location: project.location,
    },
    payment: {
      totalAmount: project.budgetAmount || 0, // AUTO-POPOLATO dal progetto
      currency: 'EUR',
      paymentTerms: project.paymentTerms || '30 giorni dalla fattura', // AUTO-POPOLATO
      milestones: project.paymentMilestones || [], // AUTO-POPOLATO dal progetto
    },
    specialConditions: {
      ndaRequired: project.specialConditions?.ndaRequired || false, // AUTO-POPOLATO
      insuranceRequired: project.specialConditions?.insuranceRequired || false, // AUTO-POPOLATO
      travelExpenses: project.specialConditions?.travelExpenses || false, // AUTO-POPOLATO
      equipmentProvided: project.specialConditions?.equipmentProvided || false, // AUTO-POPOLATO
      additionalClauses: [],
    },
  });

  const handleGenerate = async () => {
    try {
      // Validazione dati professionista
      if (!contractData.professional.piva) {
        toast.error('P.IVA del professionista mancante. Aggiornare il profilo professionista.');
        return;
      }
      if (!contractData.professional.fiscalCode) {
        toast.error('Codice Fiscale del professionista mancante. Aggiornare il profilo professionista.');
        return;
      }
      if (!contractData.professional.address) {
        toast.error('Indirizzo fiscale del professionista mancante. Aggiornare il profilo.');
        return;
      }

      // Validazione dati azienda
      if (!contractData.company.piva) {
        toast.error("P.IVA dell'azienda mancante. Aggiornare il profilo azienda.");
        return;
      }
      if (!contractData.company.legalRepresentative) {
        toast.error("Rappresentante legale mancante. Aggiornare il profilo azienda.");
        return;
      }
      if (!contractData.company.address) {
        toast.error("Sede legale mancante. Aggiornare il profilo azienda.");
        return;
      }

      // Validazione dati progetto
      if (!contractData.project.startDate || !contractData.project.endDate) {
        toast.error('Date inizio/fine progetto mancanti. Aggiornare il progetto.');
        return;
      }
      if (contractData.project.deliverables.length === 0) {
        toast.error('Deliverables mancanti. Aggiornare il progetto o inserirli manualmente.');
        return;
      }

      // Validazione pagamento
      if (contractData.payment.totalAmount <= 0) {
        toast.error('Importo contratto mancante. Aggiornare il progetto.');
        return;
      }

      setLoading(true);
      setStep('generating');
      setError(null);

      const response = await fetch('/api/contracts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: application.id,
          jobId: application.projectId,
          contractData,
          adminUid: user?.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante la generazione del contratto');
      }

      const result = await response.json();

      setGeneratedContractId(result.contractId);
      setStep('success');
      toast.success('Contratto generato con successo!');

      if (onSuccess) {
        onSuccess(result.contractId);
      }
    } catch (err: any) {
      console.error('Error generating contract:', err);
      setError(err.message || 'Errore sconosciuto');
      setStep('error');
      toast.error('Errore nella generazione del contratto');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep('form');
    setError(null);
    setGeneratedContractId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#008080]" />
            Genera Contratto AI
          </DialogTitle>
          <DialogDescription className="text-sm">
            Contratto per <strong>{professional.displayName}</strong> e <strong>{company.companyName}</strong>
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-8 py-4">
            {/* Dati Professionista */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dati Professionista</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prof-name" className="text-sm">Nome *</Label>
                  <Input
                    id="prof-name"
                    className="text-sm"
                    value={contractData.professional.name}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        professional: { ...prev.professional, name: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prof-piva" className="text-sm">Partita IVA *</Label>
                  <Input
                    id="prof-piva"
                    className="text-sm"
                    placeholder="12345678901"
                    value={contractData.professional.piva}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        professional: { ...prev.professional, piva: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prof-cf" className="text-sm">Codice Fiscale *</Label>
                  <Input
                    id="prof-cf"
                    className="text-sm"
                    placeholder="RSSMRA80A01H501Z"
                    value={contractData.professional.fiscalCode}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        professional: { ...prev.professional, fiscalCode: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="prof-regime" className="text-sm">Regime Fiscale *</Label>
                  <Select
                    value={contractData.professional.taxRegime}
                    onValueChange={(value: 'ordinario' | 'forfettario' | 'semplificato') =>
                      setContractData((prev) => ({
                        ...prev,
                        professional: { ...prev.professional, taxRegime: value },
                      }))
                    }
                  >
                    <SelectTrigger id="prof-regime" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forfettario" className="text-sm">Forfettario (L. 190/2014)</SelectItem>
                      <SelectItem value="ordinario" className="text-sm">Ordinario</SelectItem>
                      <SelectItem value="semplificato" className="text-sm">Semplificato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="prof-address" className="text-sm">Indirizzo *</Label>
                  <Input
                    id="prof-address"
                    className="text-sm"
                    placeholder="Via Roma 1, Milano MI"
                    value={contractData.professional.address}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        professional: { ...prev.professional, address: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Dati Azienda */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dati Azienda</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="comp-name" className="text-sm">Ragione Sociale *</Label>
                  <Input
                    id="comp-name"
                    className="text-sm"
                    value={contractData.company.businessName}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        company: { ...prev.company, businessName: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="comp-piva" className="text-sm">Partita IVA *</Label>
                  <Input
                    id="comp-piva"
                    className="text-sm"
                    value={contractData.company.piva}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        company: { ...prev.company, piva: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="comp-address" className="text-sm">Sede Legale *</Label>
                  <Input
                    id="comp-address"
                    className="text-sm"
                    value={contractData.company.address}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        company: { ...prev.company, address: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="comp-legal" className="text-sm">Rappresentante Legale *</Label>
                  <Input
                    id="comp-legal"
                    className="text-sm"
                    value={contractData.company.legalRepresentative}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        company: { ...prev.company, legalRepresentative: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Dettagli Progetto */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Dettagli Progetto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="proj-start" className="text-sm">Data Inizio *</Label>
                  <Input
                    id="proj-start"
                    type="date"
                    className="text-sm"
                    value={contractData.project.startDate}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        project: { ...prev.project, startDate: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="proj-end" className="text-sm">Data Fine *</Label>
                  <Input
                    id="proj-end"
                    type="date"
                    className="text-sm"
                    value={contractData.project.endDate}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        project: { ...prev.project, endDate: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="proj-workmode" className="text-sm">Modalità Lavoro *</Label>
                  <Select
                    value={contractData.project.workMode}
                    onValueChange={(value: 'remoto' | 'ibrido' | 'presenza') =>
                      setContractData((prev) => ({
                        ...prev,
                        project: { ...prev.project, workMode: value },
                      }))
                    }
                  >
                    <SelectTrigger id="proj-workmode" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remoto" className="text-sm">Remoto</SelectItem>
                      <SelectItem value="ibrido" className="text-sm">Ibrido</SelectItem>
                      <SelectItem value="presenza" className="text-sm">In Sede</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="proj-deliverables" className="text-sm">Deliverables (uno per riga) *</Label>
                  <Textarea
                    id="proj-deliverables"
                    className="text-sm"
                    placeholder="Modello BIM LOD 300&#10;Elaborati grafici 2D&#10;Relazione tecnica"
                    rows={3}
                    value={contractData.project.deliverables.join('\n')}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        project: {
                          ...prev.project,
                          deliverables: e.target.value.split('\n').filter((d) => d.trim()),
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pagamento</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-amount" className="text-sm">Importo Totale (€) *</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min="0"
                    step="100"
                    className="text-sm font-mono tabular-nums"
                    value={contractData.payment.totalAmount}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        payment: { ...prev.payment, totalAmount: parseFloat(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="payment-terms" className="text-sm">Termini Pagamento *</Label>
                  <Input
                    id="payment-terms"
                    className="text-sm"
                    placeholder="30 giorni dalla fattura"
                    value={contractData.payment.paymentTerms}
                    onChange={(e) =>
                      setContractData((prev) => ({
                        ...prev,
                        payment: { ...prev.payment, paymentTerms: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Condizioni Speciali */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Condizioni Speciali</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nda"
                    checked={contractData.specialConditions?.ndaRequired}
                    onCheckedChange={(checked) =>
                      setContractData((prev) => ({
                        ...prev,
                        specialConditions: {
                          ...prev.specialConditions,
                          ndaRequired: checked as boolean,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="nda" className="text-sm font-normal cursor-pointer">
                    NDA Richiesto (clausola riservatezza rinforzata)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insurance"
                    checked={contractData.specialConditions?.insuranceRequired}
                    onCheckedChange={(checked) =>
                      setContractData((prev) => ({
                        ...prev,
                        specialConditions: {
                          ...prev.specialConditions,
                          insuranceRequired: checked as boolean,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="insurance" className="text-sm font-normal cursor-pointer">
                    Assicurazione RC Professionale Obbligatoria
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="travel"
                    checked={contractData.specialConditions?.travelExpenses}
                    onCheckedChange={(checked) =>
                      setContractData((prev) => ({
                        ...prev,
                        specialConditions: {
                          ...prev.specialConditions,
                          travelExpenses: checked as boolean,
                        },
                      }))
                    }
                  />
                  <Label htmlFor="travel" className="text-sm font-normal cursor-pointer">
                    Spese viaggio a carico committente
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 transition-opacity duration-300">
            <Loader2 className="h-12 w-12 animate-spin text-[#008080]" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Generazione contratto in corso...</p>
              <p className="text-sm text-gray-600 mt-4">
                L'AI sta analizzando i dati e creando il contratto personalizzato
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 transition-opacity duration-300">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Contratto generato con successo!</p>
              <p className="text-sm text-gray-600 mt-4">
                ID Contratto: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{generatedContractId}</code>
              </p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 transition-opacity duration-300">
            <AlertCircle className="h-16 w-16 text-red-600" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">Errore nella generazione</p>
              <p className="text-sm text-red-600 mt-4">{error}</p>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {step === 'form' && (
            <>
              <Button variant="outline" onClick={resetAndClose} disabled={loading} className="text-sm min-h-[44px] w-full sm:w-auto">
                Annulla
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-[#008080] hover:bg-[#006666] text-sm min-h-[44px] w-full sm:w-auto"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Genera Contratto
              </Button>
            </>
          )}
          {(step === 'success' || step === 'error') && (
            <Button onClick={resetAndClose} className="bg-[#008080] hover:bg-[#006666] text-sm min-h-[44px] w-full sm:w-auto">
              Chiudi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
