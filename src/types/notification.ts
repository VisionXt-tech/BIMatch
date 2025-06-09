
import type { Timestamp } from 'firebase/firestore';

export interface UserNotification {
  id: string; // Firestore document ID
  userId: string; // UID of the user (professional or company) to whom the notification belongs
  type: 'APPLICATION_STATUS_UPDATED' | 'NEW_PROJECT_MATCH' | 'PROFILE_VIEW' | 'GENERIC_INFO' | 'NEW_APPLICATION_RECEIVED' | string; // Added NEW_APPLICATION_RECEIVED
  title: string; // A concise title for the notification
  message: string; // Detailed message of the notification
  linkTo?: string; // Relative path within the app (e.g., /projects/projectId)
  isRead: boolean;
  createdAt: Timestamp;
  relatedEntityId?: string; // e.g., projectId, applicationId
  icon?: string; // Optional: Lucide icon name string
  companyName?: string; // Optional: for notifications related to a company action (e.g., when professional is notified)
  projectTitle?: string; // Optional: for notifications related to a project
  applicantName?: string; // Optional: for company notifications about a new applicant
  professionalName?: string; // Optional: alias for applicantName, or if a professional is the subject for a company
}

