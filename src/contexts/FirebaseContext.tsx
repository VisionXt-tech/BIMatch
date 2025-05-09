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
if (typeof window !== 'undefined') { // Only run this check on the client-side initially
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    const missingKeys: string[] = [];
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
    if (!firebaseConfig.authDomain) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    if (!firebaseConfig.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    
    // This error will be thrown during server-side rendering or at the top-level client-side,
    // preventing the app from starting with invalid config.
    // However, since this file is 'use client', this specific throw might not occur server-side as expected.
    // The primary check should be robust.
    console.error(
      `Firebase configuration is incomplete or uses placeholder values. The following environment variables are missing, undefined, or are placeholders: ${missingKeys.join(', ')}. ` +
      "Please ensure they are correctly set in your .env.local file and that the file is being loaded. " +
      "Refer to your Firebase project settings to get these values."
    );
    // Optionally, throw an error here if you want to halt execution on the client if config is bad
    // throw new Error(`Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}`);
  }
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

// Initialize Firebase only if it hasn't been initialized yet
if (!getApps().length) {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.authDomain && firebaseConfig.projectId) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    // Handle the case where config is still bad, perhaps show a global error UI or log
    // This part is tricky because we are in 'use client' context already.
    // The console error above should provide a warning.
    // For a production app, you might want a more graceful fallback or error display.
    console.error("Firebase App could not be initialized due to missing or placeholder configuration values.");
    // A pseudo-app or a way to prevent further Firebase calls might be needed if you don't throw.
    // This is a simplified handling.
    firebaseApp = {} as FirebaseApp; // Placeholder to avoid crashes if accessed before proper init
  }
} else {
  firebaseApp = getApps()[0];
}

// These will attempt to use firebaseApp, which might be a placeholder if config was bad.
// Guarding these calls or ensuring firebaseApp is valid is important.
const auth: Auth = firebaseApp.name ? getAuth(firebaseApp) : {} as Auth;
const db: Firestore = firebaseApp.name ? getFirestore(firebaseApp) : {} as Firestore;
const storage: FirebaseStorage = firebaseApp.name ? getStorage(firebaseApp) : {} as FirebaseStorage;


// Connect to emulators if running in development and emulators are configured
if (process.env.NODE_ENV === 'development' && firebaseApp.name) { // Also check if firebaseApp is a real app
  // Check for environment variables to enable emulators
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    console.log("Attempting to connect to Firebase Emulators...");
    
    // Check if already connected to avoid errors, especially with HMR
    if (!(auth as any).emulatorConfig && auth.name) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log("Auth Emulator connected.");
      } catch (error) {
        console.warn("Auth Emulator connection attempt failed (could be already connected or port unavailable):", error);
      }
    } else if (auth.name) {
        console.log("Auth Emulator already configured or not available.");
    }

    // Firestore's emulator connection doesn't have a direct 'emulatorConfig' property easily checkable like auth.
    // A simple check like this can be prone to issues if the Firestore instance isn't fully initialized.
    // We'll rely on trying to connect and catching errors.
    if (db.app) { // Check if db is associated with an app
        try {
            // This might throw if already connected, Firebase SDK handles this internally usually.
            // Or if the emulator is not running.
            connectFirestoreEmulator(db, 'localhost', 8080);
            console.log("Firestore Emulator connected (or connection attempted).");
        } catch (error) {
            console.warn("Firestore Emulator connection attempt failed (could be already connected, port unavailable, or other issue):", error);
        }
    } else {
        console.log("Firestore instance not available for emulator connection.");
    }


    if (storage.app) { // Check if storage is associated with an app
        try {
            connectStorageEmulator(storage, 'localhost', 9199);
            console.log("Storage Emulator connected (or connection attempted).");
        } catch (error) {
            console.warn("Storage Emulator connection attempt failed (could be already connected, port unavailable, or other issue):", error);
        }
    } else {
        console.log("Storage instance not available for emulator connection.");
    }
  }
}


export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  // Ensure that the value provided to context is stable, especially if firebaseApp could be a placeholder
  const value = useMemo(() => ({ 
    app: firebaseApp.name ? firebaseApp : {} as FirebaseApp, // Provide placeholder if not initialized
    auth: auth.name ? auth : {} as Auth, 
    db: db.app ? db : {} as Firestore, 
    storage: storage.app ? storage : {} as FirebaseStorage 
  }), []); // Empty dependency array means this runs once

  // If Firebase app failed to initialize properly, you might want to render an error message
  // instead of the children, or a loading state.
  if (!firebaseApp.name) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Firebase non è configurato correttamente. Controlla le variabili d&apos;ambiente.
      </div>
    );
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};
