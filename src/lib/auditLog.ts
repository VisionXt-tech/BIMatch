'use client';

import { doc, addDoc, collection, serverTimestamp, Firestore } from 'firebase/firestore';

export interface AuditLogEntry {
  userId?: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_RESET' | 'PROFILE_UPDATE' | 
          'FILE_UPLOAD' | 'FILE_DELETE' | 'PROJECT_CREATE' | 'PROJECT_UPDATE' | 'PROJECT_DELETE' |
          'APPLICATION_SUBMIT' | 'APPLICATION_UPDATE' | 'ADMIN_ACTION' | 'SECURITY_VIOLATION';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp?: any;
}

// Get client IP (best effort in browser environment)
const getClientIP = async (): Promise<string> => {
  try {
    // This is a simple fallback for client-side
    return 'client-side';
  } catch {
    return 'unknown';
  }
};

export const createAuditLogger = (db: Firestore | null) => {
  return async (entry: Omit<AuditLogEntry, 'timestamp' | 'ipAddress' | 'userAgent'>) => {
    try {
      const logEntry: AuditLogEntry = {
        ...entry,
        ipAddress: await getClientIP(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        timestamp: serverTimestamp(),
      };

      // Only log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit Log:', logEntry);
      }

      // Only write to Firestore if db is available
      if (db) {
        await addDoc(collection(db, 'auditLogs'), logEntry);
      } else {
        console.warn('Audit log: Firestore not available, logging to console only');
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Don't throw error to avoid breaking application flow
    }
  };
};