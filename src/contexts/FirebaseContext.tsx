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
// This check runs on the client-side after the module has loaded.
if (typeof window !== 'undefined') { 
  const essentialKeys = {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
  };
  const missingKeys: string[] = [];

  if (!essentialKeys.apiKey || essentialKeys.apiKey === "YOUR_API_KEY") {
    missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  }
  if (!essentialKeys.authDomain) {
    missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  }
  if (!essentialKeys.projectId) {
    missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }

  if (missingKeys.length > 0) {
    console.error(
      `Firebase configuration is incomplete or uses placeholder values. The following environment variables are missing, undefined, or are placeholders: ${missingKeys.join(', ')}. ` +
      "Please ensure they are correctly set in your .env.local file and that the file is being loaded. " +
      "Refer to your Firebase project settings to get these values."
    );
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
const configIsValid = firebaseConfig.apiKey && 
                      firebaseConfig.apiKey !== "YOUR_API_KEY" && 
                      firebaseConfig.authDomain && 
                      firebaseConfig.projectId;

if (!getApps().length) {
  if (configIsValid) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    // No console.error here as the top-level check and UI error are primary.
    // The app will show a UI error via FirebaseProvider if firebaseApp.name is not set.
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

    if (db.app) { 
        try {
            connectFirestoreEmulator(db, 'localhost', 8080);
            console.log("Firestore Emulator connected (or connection attempted).");
        } catch (error) {
            console.warn("Firestore Emulator connection attempt failed (could be already connected, port unavailable, or other issue):", error);
        }
    } else {
        console.log("Firestore instance not available for emulator connection.");
    }


    if (storage.app) { 
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
  const value = useMemo(() => ({ 
    app: firebaseApp.name ? firebaseApp : {} as FirebaseApp, 
    auth: auth.name ? auth : {} as Auth, 
    db: db.app ? db : {} as Firestore, 
    storage: storage.app ? storage : {} as FirebaseStorage 
  }), []); 

  if (!firebaseApp.name) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red', backgroundColor: '#fff1f1', border: '1px solid red', margin: '20px', borderRadius: '8px' }}>
        <h2>Errore di Configurazione Firebase</h2>
        <p>Firebase non è configurato correttamente. Assicurati che le variabili d&apos;ambiente richieste (es. <code>NEXT_PUBLIC_FIREBASE_API_KEY</code>) siano impostate nel tuo file <code>.env.local</code> e che il server di sviluppo sia stato riavviato.</p>
        <p>Fai riferimento alla console per dettagli specifici sulle chiavi mancanti o errate.</p>
      </div>
    );
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};
