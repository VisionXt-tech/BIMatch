
import type { Timestamp } from 'firebase/firestore';

export interface UserNotification {
  id: string; // Firestore document ID
  userId: string; // UID of the user (professional or company) to whom the notification belongs
  type:
    | 'APPLICATION_STATUS_UPDATED'
    | 'NEW_PROJECT_MATCH'
    | 'PROFILE_VIEW'
    | 'GENERIC_INFO'
    | 'NEW_APPLICATION_RECEIVED' // Per azienda: nuovo candidato
    | 'INTERVIEW_PROPOSED' // Per professionista: azienda propone colloquio
    | 'INTERVIEW_ACCEPTED_BY_PRO' // Per azienda: professionista accetta colloquio
    | 'INTERVIEW_REJECTED_BY_PRO' // Per azienda: professionista rifiuta colloquio
    | 'INTERVIEW_RESCHEDULED_BY_PRO' // Per azienda: professionista propone nuova data
    | 'COLLABORATION_CONFIRMED' // Per professionista: azienda conferma collaborazione
    | 'CONTRACT_DRAFT_SENT' // Bozza di contratto inviata per revisione
    | 'CONTRACT_APPROVED' // Contratto approvato
    | 'CONTRACT_REJECTED' // Contratto rifiutato
    | string; 
  title: string; 
  message: string; 
  linkTo?: string; 
  isRead: boolean;
  // createdAt can be a Firestore Timestamp or a serverTimestamp FieldValue during writes
  createdAt: Timestamp | any;
  relatedEntityId?: string; // e.g., projectId, applicationId
  icon?: string;
  companyName?: string;
  projectTitle?: string;
  applicantName?: string;
  professionalName?: string;

  // Campi specifici per payload notifiche
  interviewProposalMessage?: string;
  proposedInterviewDate?: string; // Stringa formattata della data per la notifica
  professionalResponseReason?: string;
  professionalNewDateProposal?: string; // Stringa formattata della nuova data per la notifica
  applicationId?: string; // ID della candidatura per azioni dirette dalla notifica

  // Campi specifici per contratti
  contractId?: string;
  amount?: number;
}

// Alias per retrocompatibilità con l'API
export type Notification = Omit<UserNotification, 'id' | 'isRead'> & {
  read: boolean;
  metadata?: {
    contractId?: string;
    professionalName?: string;
    companyName?: string;
    projectTitle?: string;
    amount?: number;
  };
};

