import type { Timestamp } from 'firebase/firestore';

export interface ContractData {
  professional: {
    name: string;
    piva: string;
    fiscalCode: string;
    taxRegime: 'ordinario' | 'forfettario' | 'semplificato';
    address: string;
    email?: string;
    phone?: string;
  };
  company: {
    businessName: string;
    piva: string;
    address: string;
    legalRepresentative: string;
    email?: string;
    phone?: string;
  };
  project: {
    title: string;
    description: string;
    deliverables: string[];
    duration: string;
    startDate: string;
    endDate: string;
    workMode: 'remoto' | 'ibrido' | 'presenza';
    location?: string;
  };
  payment: {
    totalAmount: number;
    currency: 'EUR';
    paymentTerms: string;
    milestones?: Array<{
      phase: string;
      percentage: number;
      amount: number;
      description?: string;
    }>;
  };
  specialConditions?: {
    ndaRequired?: boolean;
    insuranceRequired?: boolean;
    travelExpenses?: boolean;
    equipmentProvided?: boolean;
    additionalClauses?: string[];
  };
}

export interface Contract {
  id?: string;
  jobId: string;
  applicationId: string;
  companyId: string;
  professionalId: string;

  status:
    | 'DRAFT'
    | 'GENERATED'
    | 'PENDING_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'ARCHIVED';

  // Dati generazione AI
  generatedText: string; // Testo completo markdown
  generatedHtml?: string; // HTML formattato (opzionale)
  pdfUrl?: string; // gs://bucket/contracts/contract_001.pdf
  generatedAt: Timestamp | Date | any;
  generatedBy: string; // UID dell'admin che ha generato
  aiModel: string; // es. "gemini-1.5-flash"
  aiPromptVersion: string; // es. "v1.0"

  // Dati contratto
  contractData: ContractData;

  // Metadata
  createdAt: Timestamp | Date | any;
  updatedAt: Timestamp | Date | any;

  // Note admin
  adminNotes?: string;

  // Revisioni (opzionale per futuro)
  revisionHistory?: Array<{
    version: number;
    modifiedAt: Timestamp | Date | any;
    modifiedBy: string;
    changes: string;
    previousPdfUrl?: string;
  }>;
}

export interface ContractTemplate {
  id?: string;
  type: 'freelance_consulenza' | 'tempo_determinato' | 'collaborazione_occasionale';
  category: string;
  name: string;
  description: string;
  systemPrompt: string;
  requiredFields: string[];
  validationRules?: {
    minBudget?: number;
    maxDuration?: string;
    requiredInsurance?: boolean;
  };
  isActive: boolean;
  createdAt: Timestamp | Date | any;
  updatedAt: Timestamp | Date | any;
}

// Helper type per il form di generazione contratto nell'admin
export interface ContractGenerationRequest {
  applicationId: string;
  jobId: string;
  templateType?: string;
  additionalNotes?: string;
}