/**
 * Firebase Admin SDK Configuration
 *
 * This file initializes the Firebase Admin SDK for server-side operations.
 * Admin SDK bypasses Firestore security rules and is used in API routes.
 *
 * OPTIMIZED: Lazy initialization to reduce Cloud Function cold start time
 */

import type * as AdminNamespace from 'firebase-admin';

let adminApp: AdminNamespace.app.App | undefined;
let adminDbInstance: AdminNamespace.firestore.Firestore | undefined;
let adminAuthInstance: AdminNamespace.auth.Auth | undefined;

/**
 * Initialize Firebase Admin SDK (lazy initialization)
 */
function initializeAdmin(): AdminNamespace.app.App {
  if (adminApp) {
    return adminApp;
  }

  // Dynamically import firebase-admin only when needed
  const adminModule = require('firebase-admin');

  try {
    if (!adminModule.apps.length) {
      // Option 1: Use service account key from environment variables
      if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
        adminApp = adminModule.initializeApp({
          credential: adminModule.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            // Private key stored in environment variable (with escaped newlines)
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
        });
        console.log('[Firebase Admin] Initialized with service account credentials from environment');
      }
      // Option 2: Use service account key JSON file
      else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
        const path = require('path');
        const fs = require('fs');
        const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          adminApp = adminModule.initializeApp({
            credential: adminModule.credential.cert(serviceAccount),
          });
          console.log('[Firebase Admin] Initialized with service account key file:', serviceAccountPath);
        } else {
          throw new Error(`Service account key file not found at: ${serviceAccountPath}`);
        }
      }
      // Option 3: Fallback for production (uses application default credentials in Firebase environment)
      else {
        adminApp = adminModule.initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log('[Firebase Admin] Initialized with default credentials (production mode)');
      }
    } else {
      adminApp = adminModule.apps[0];
    }
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
    throw error;
  }

  return adminApp!;
}

/**
 * Get Firestore instance (lazy initialization)
 */
export function getAdminDb(): AdminNamespace.firestore.Firestore {
  if (!adminDbInstance) {
    const app = initializeAdmin();
    const adminModule = require('firebase-admin');
    adminDbInstance = adminModule.firestore(app);
  }
  return adminDbInstance!;
}

/**
 * Get Auth instance (lazy initialization)
 */
export function getAdminAuth(): AdminNamespace.auth.Auth {
  if (!adminAuthInstance) {
    const app = initializeAdmin();
    const adminModule = require('firebase-admin');
    adminAuthInstance = adminModule.auth(app);
  }
  return adminAuthInstance!;
}

// Export legacy instances for backward compatibility
export const adminDb = new Proxy({} as AdminNamespace.firestore.Firestore, {
  get(target, prop) {
    return getAdminDb()[prop as keyof AdminNamespace.firestore.Firestore];
  }
});

export const adminAuth = new Proxy({} as AdminNamespace.auth.Auth, {
  get(target, prop) {
    return getAdminAuth()[prop as keyof AdminNamespace.auth.Auth];
  }
});

// Export the admin app getter
export function getAdmin(): AdminNamespace.app.App {
  return initializeAdmin();
}

// Backward compatibility
export const admin = new Proxy({} as typeof AdminNamespace, {
  get(target, prop) {
    if (prop === 'firestore') {
      return () => getAdminDb();
    }
    if (prop === 'auth') {
      return () => getAdminAuth();
    }
    const adminModule = require('firebase-admin');
    return adminModule[prop as keyof typeof AdminNamespace];
  }
});
