
import type { Timestamp } from 'firebase/firestore';

export interface UserNotification {
  id: string; // Firestore document ID
  userId: string; // UID of the user (professional or company) to whom the notification belongs
  type: 
    | 'APPLICATION_STATUS_UPDATED' // Generico, usato prima, ora più specifico
    | 'NEW_PROJECT_MATCH' 
    | 'PROFILE_VIEW' 
    | 'GENERIC_INFO' 
    | 'NEW_APPLICATION_RECEIVED' // Per azienda: nuovo candidato
    | 'INTERVIEW_PROPOSED' // Per professionista: azienda propone colloquio
    | 'INTERVIEW_ACCEPTED_BY_PRO' // Per azienda: professionista accetta colloquio
    | 'INTERVIEW_REJECTED_BY_PRO' // Per azienda: professionista rifiuta colloquio
    | 'INTERVIEW_RESCHEDULED_BY_PRO' // Per azienda: professionista propone nuova data
    | string; 
  title: string; 
  message: string; 
  linkTo?: string; 
  isRead: boolean;
  createdAt: Timestamp;
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
}

