
import type { Timestamp } from 'firebase/firestore';

export interface UserNotification {
  id: string; // Firestore document ID
  userId: string; // Professional's UID to whom the notification belongs
  type: 'APPLICATION_STATUS_UPDATED' | 'NEW_PROJECT_MATCH' | 'PROFILE_VIEW' | 'GENERIC_INFO' | string; // Allow custom string for future types
  title: string; // A concise title for the notification
  message: string; // Detailed message of the notification
  linkTo?: string; // Relative path within the app (e.g., /projects/projectId)
  isRead: boolean;
  createdAt: Timestamp;
  relatedEntityId?: string; // e.g., projectId, applicationId
  icon?: string; // Optional: Lucide icon name string
  companyName?: string; // Optional: for notifications related to a company action
  projectTitle?: string; // Optional: for notifications related to a project
}
