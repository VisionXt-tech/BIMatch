
import type { Timestamp } from 'firebase/firestore';

export interface Project {
  id?: string; // Firestore document ID, optional until created
  title: string;
  companyId: string; // UID of the company that posted the project
  companyName: string;
  companyLogo?: string; // URL to company logo
  projectImage?: string; // URL to project hero image (Firebase Storage)
  location: string; // Region or City, State
  description: string; // Detailed project description
  requiredSkills: string[]; // Array of skill IDs/tags
  requiredSoftware: string[]; // Array of software IDs/names
  projectType: string; // e.g., "Full-time", "Contract", "Part-time"
  duration?: string; // e.g., "3 months", "Ongoing"
  budgetRange?: string; // e.g., "€50-€70/hour", "€50k-€60k/year"
  status: 'attivo' | 'in_revisione' | 'completato' | 'chiuso' | 'bozza'; // Project status
  postedAt: Timestamp | Date | any; // Firestore serverTimestamp
  updatedAt: Timestamp | Date | any; // Firestore serverTimestamp
  applicationDeadline?: Timestamp | Date | null; // Optional deadline for applications
  applicationsCount?: number; // Number of applications received (denormalized or calculated)
}

export interface ProjectApplication {
  id?: string; // Firestore document ID
  projectId: string;
  professionalId: string; // UID of the applying professional
  companyId: string; // UID of the company that owns the project (required for Firestore rules)
  professionalName: string;
  professionalEmail?: string; // For notifications
  applicationDate: Timestamp | Date | any;
  status: 
    | 'inviata' 
    | 'in_revisione' // Stato intermedio se l'azienda vuole segnarla come tale (non per rifiuto/preselezione diretta)
    | 'preselezionata' // L'azienda ha inviato una prima proposta di colloquio
    | 'rifiutata' 
    | 'ritirata' // Il professionista ha ritirato la propria candidatura
    | 'accettata' // L'azienda ha accettato il professionista per il progetto
    | 'colloquio_proposto' // Sinonimo di preselezionata, ma più esplicito
    | 'colloquio_accettato_prof' // Il professionista ha accettato la data del colloquio
    | 'colloquio_rifiutato_prof' // Il professionista ha rifiutato il colloquio
    | 'colloquio_ripianificato_prof'; // Il professionista ha proposto una nuova data
  
  coverLetterMessage: string; 
  relevantSkillsForProject?: string[]; 
  availabilityNotes?: string; 

  // Campi per il feedback/proposta dell'azienda
  rejectionReason?: string; 
  interviewProposalMessage?: string; 
  proposedInterviewDate?: Timestamp | Date | null; 

  // Campi per la risposta del professionista alla proposta di colloquio
  professionalResponseReason?: string; // Motivo se rifiuta o per riprogrammare
  professionalNewDateProposal?: Timestamp | Date | null; // Nuova data proposta dal professionista

  updatedAt?: Timestamp | Date | any; 
}

