import { collection, addDoc, serverTimestamp, DocumentReference, getFirestore } from 'firebase/firestore';
// Note: This service requires Firebase Admin SDK access or should be called from a server-side API
import DOMPurify from 'isomorphic-dompurify';

// Define allowed notification types
export type NotificationType = 
  | 'APPLICATION_STATUS_UPDATED'
  | 'NEW_PROJECT_MATCH'
  | 'PROFILE_VIEW'
  | 'NEW_APPLICATION_RECEIVED'
  | 'INTERVIEW_PROPOSED'
  | 'INTERVIEW_ACCEPTED_BY_PRO'
  | 'INTERVIEW_REJECTED_BY_PRO'
  | 'GENERIC_INFO';

export interface SecureNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string; // ID of related project, application, etc.
  companyName?: string;
  professionalName?: string;
  projectTitle?: string;
}

// Rate limiting map to prevent spam
const rateLimitMap = new Map<string, number[]>();

export class SecureNotificationService {
  private static readonly MAX_NOTIFICATIONS_PER_HOUR = 50;
  private static readonly MAX_NOTIFICATIONS_PER_DAY = 200;
  private static readonly MAX_TITLE_LENGTH = 100;
  private static readonly MAX_MESSAGE_LENGTH = 500;

  /**
   * Create a secure notification with proper validation and sanitization
   */
  static async createNotification(
    recipientId: string,
    notificationData: SecureNotificationData,
    creatorId: string
  ): Promise<DocumentReference> {
    
    // Validate inputs
    this.validateInputs(recipientId, notificationData, creatorId);
    
    // Check rate limiting
    if (!this.checkRateLimit(creatorId)) {
      throw new Error('Rate limit exceeded for notification creation');
    }

    // Validate creator has permission to send to recipient
    const hasPermission = await this.validateNotificationPermission(
      creatorId,
      recipientId,
      notificationData.type
    );
    
    if (!hasPermission) {
      throw new Error('Unauthorized notification creation');
    }

    // Sanitize notification content
    const sanitizedData = this.sanitizeNotificationContent(notificationData);
    
    // Create notification document
    const notification = {
      userId: recipientId,
      type: sanitizedData.type,
      title: sanitizedData.title,
      message: sanitizedData.message,
      isRead: false,
      createdAt: serverTimestamp(),
      relatedId: sanitizedData.relatedId || null,
      companyName: sanitizedData.companyName || null,
      professionalName: sanitizedData.professionalName || null,
      projectTitle: sanitizedData.projectTitle || null,
    };

    // Create notification (requires admin privileges due to Firestore rules)
    const docRef = await addDoc(collection(db, 'notifications'), notification);
    
    // Log notification creation for audit
    console.log(`Secure notification created: ${docRef.id} for user ${recipientId} by ${creatorId}`);
    
    return docRef;
  }

  /**
   * Validate notification inputs
   */
  private static validateInputs(
    recipientId: string,
    notificationData: SecureNotificationData,
    creatorId: string
  ): void {
    if (!recipientId || typeof recipientId !== 'string') {
      throw new Error('Invalid recipient ID');
    }
    
    if (!creatorId || typeof creatorId !== 'string') {
      throw new Error('Invalid creator ID');
    }
    
    if (!notificationData.type || !notificationData.title || !notificationData.message) {
      throw new Error('Missing required notification data');
    }
    
    if (notificationData.title.length > this.MAX_TITLE_LENGTH) {
      throw new Error(`Title too long (max ${this.MAX_TITLE_LENGTH} characters)`);
    }
    
    if (notificationData.message.length > this.MAX_MESSAGE_LENGTH) {
      throw new Error(`Message too long (max ${this.MAX_MESSAGE_LENGTH} characters)`);
    }
    
    const allowedTypes: NotificationType[] = [
      'APPLICATION_STATUS_UPDATED',
      'NEW_PROJECT_MATCH',
      'PROFILE_VIEW',
      'NEW_APPLICATION_RECEIVED',
      'INTERVIEW_PROPOSED',
      'INTERVIEW_ACCEPTED_BY_PRO',
      'INTERVIEW_REJECTED_BY_PRO',
      'GENERIC_INFO'
    ];
    
    if (!allowedTypes.includes(notificationData.type)) {
      throw new Error('Invalid notification type');
    }
  }

  /**
   * Check if creator can send notification to recipient
   */
  private static async validateNotificationPermission(
    creatorId: string,
    recipientId: string,
    type: NotificationType
  ): Promise<boolean> {
    
    // System/admin can always create notifications
    if (creatorId === 'system' || creatorId === 'admin') {
      return true;
    }
    
    // Prevent self-notifications for certain types
    if (creatorId === recipientId && 
        ['NEW_APPLICATION_RECEIVED', 'PROFILE_VIEW'].includes(type)) {
      return false;
    }

    // Business logic validation based on notification type
    switch (type) {
      case 'NEW_APPLICATION_RECEIVED':
        // Only companies can receive application notifications
        return this.isCompanyUser(recipientId);
        
      case 'APPLICATION_STATUS_UPDATED':
      case 'INTERVIEW_PROPOSED':
      case 'INTERVIEW_ACCEPTED_BY_PRO':
      case 'INTERVIEW_REJECTED_BY_PRO':
        // Both professionals and companies can receive these
        return true;
        
      case 'NEW_PROJECT_MATCH':
        // Only professionals can receive project matches
        return this.isProfessionalUser(recipientId);
        
      case 'PROFILE_VIEW':
        // Both can receive profile view notifications
        return true;
        
      case 'GENERIC_INFO':
        // System notifications - only admin can send
        return false;
        
      default:
        return false;
    }
  }

  /**
   * Sanitize notification content to prevent XSS
   */
  private static sanitizeNotificationContent(
    data: SecureNotificationData
  ): SecureNotificationData {
    return {
      type: data.type,
      title: this.sanitizeString(data.title),
      message: this.sanitizeString(data.message),
      relatedId: data.relatedId ? this.sanitizeString(data.relatedId) : undefined,
      companyName: data.companyName ? this.sanitizeString(data.companyName) : undefined,
      professionalName: data.professionalName ? this.sanitizeString(data.professionalName) : undefined,
      projectTitle: data.projectTitle ? this.sanitizeString(data.projectTitle) : undefined
    };
  }

  /**
   * Sanitize string input
   */
  private static sanitizeString(input: string): string {
    // Use DOMPurify to clean HTML
    const cleaned = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    // Additional sanitization
    return cleaned
      .replace(/[<>&"']/g, (char) => {
        const entities: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#39;'
        };
        return entities[char];
      })
      .trim()
      .slice(0, 1000); // Prevent extremely long inputs
  }

  /**
   * Check rate limiting for notification creation
   */
  private static checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userNotifications = rateLimitMap.get(userId) || [];
    
    // Remove notifications older than 24 hours
    const dayAgo = now - (24 * 60 * 60 * 1000);
    const hourAgo = now - (60 * 60 * 1000);
    
    const recentNotifications = userNotifications.filter(timestamp => timestamp > dayAgo);
    const hourlyNotifications = recentNotifications.filter(timestamp => timestamp > hourAgo);
    
    // Check limits
    if (recentNotifications.length >= this.MAX_NOTIFICATIONS_PER_DAY) {
      return false;
    }
    
    if (hourlyNotifications.length >= this.MAX_NOTIFICATIONS_PER_HOUR) {
      return false;
    }
    
    // Add current notification
    recentNotifications.push(now);
    rateLimitMap.set(userId, recentNotifications);
    
    return true;
  }

  /**
   * Helper methods to check user roles
   * TODO: Implement actual user role checking against Firestore
   */
  private static async isCompanyUser(userId: string): Promise<boolean> {
    // TODO: Implement actual role checking
    return true; // Placeholder
  }

  private static async isProfessionalUser(userId: string): Promise<boolean> {
    // TODO: Implement actual role checking
    return true; // Placeholder
  }
}

// Factory functions for common notification types
export class NotificationFactory {
  
  static newApplicationReceived(
    recipientCompanyId: string,
    professionalName: string,
    projectTitle: string,
    applicationId: string
  ): SecureNotificationData {
    return {
      type: 'NEW_APPLICATION_RECEIVED',
      title: 'Nuova Candidatura Ricevuta',
      message: `${professionalName} si è candidato/a per il progetto "${projectTitle}". Rivedi la candidatura.`,
      relatedId: applicationId,
      professionalName,
      projectTitle
    };
  }

  static applicationStatusUpdated(
    recipientProfessionalId: string,
    status: string,
    projectTitle: string,
    companyName: string
  ): SecureNotificationData {
    return {
      type: 'APPLICATION_STATUS_UPDATED',
      title: 'Stato Candidatura Aggiornato',
      message: `La tua candidatura per "${projectTitle}" presso ${companyName} è stata ${status}.`,
      companyName,
      projectTitle
    };
  }

  static newProjectMatch(
    recipientProfessionalId: string,
    projectTitle: string,
    companyName: string,
    projectId: string
  ): SecureNotificationData {
    return {
      type: 'NEW_PROJECT_MATCH',
      title: 'Nuovo Progetto Compatibile',
      message: `Abbiamo trovato un nuovo progetto che potrebbe interessarti: "${projectTitle}" da ${companyName}.`,
      relatedId: projectId,
      companyName,
      projectTitle
    };
  }
}

// Quick client-side db reference for environments where this module runs in server-like context
// NOTE: This file originally intended to be server-side (Admin SDK). Using getFirestore() here
// is a pragmatic compilation-time fix. For production, migrate this to Admin SDK or server API.
const db = getFirestore();