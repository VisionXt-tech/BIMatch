'use client';

import type { FirebaseApp } from 'firebase/app';
import { initializeApp, getApps } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { createContext, useContext, ReactNode, useMemo } from 'react';
import { firebaseConfig } from '@/lib/firebase/config';

// Check for essential Firebase configuration keys before initialization
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  const missingKeys: string[] = [];
  if (!firebaseConfig.apiKey) missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  // You can add checks for other critical keys if needed, e.g.:
  // if (!firebaseConfig.storageBucket) missingKeys.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  // if (!firebaseConfig.appId) missingKeys.push('NEXT_PUBLIC_FIREBASE_APP_ID');

  // This error will be thrown during server-side rendering or at the top-level client-side,
  // preventing the app from starting with invalid config.
  throw new Error(
    `Firebase configuration is incomplete. The following environment variables are missing or undefined: ${missingKeys.join(', ')}. ` +
    "Please ensure they are correctly set in your .env.local file and that the file is being loaded. " +
    "Refer to your Firebase project settings to get these values."
  );
}

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

interface FirebaseProviderProps {
  children: ReactNode;
}

let firebaseApp: FirebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// Connect to emulators if running in development and emulators are configured
if (process.env.NODE_ENV === 'development') {
  // Check for environment variables to enable emulators
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    console.log("Connecting to Firebase Emulators...");
    // Check if already connected to avoid errors, especially with HMR
    if (!(auth as any).emulatorConfig) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log("Auth Emulator connected.");
      } catch (error) {
        console.warn("Auth Emulator connection attempt failed (could be already connected or other issue):", error);
      }
    } else {
        console.log("Auth Emulator already configured.");
    }
    if (!(db as any).toJSON) { // A simple check; Firestore doesn't have a direct 'emulatorConfig' like auth
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log("Firestore Emulator connected.");
      } catch (error) {
        console.warn("Firestore Emulator connection attempt failed (could be already connected or other issue):", error);
      }
    } else {
        console.log("Firestore Emulator already configured (or check is not precise).");
    }

    if (!(storage as any).emulatorConfig) {
      try {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log("Storage Emulator connected.");
      } catch (error) {
        console.warn("Storage Emulator connection attempt failed (could be already connected or other issue):", error);
      }
    } else {
        console.log("Storage Emulator already configured.");
    }
  }
}


export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const value = useMemo(() => ({ app: firebaseApp, auth, db, storage }), []);

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};
