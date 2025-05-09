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
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// Configuration validity check
const configIsValid = 
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.authDomain && firebaseConfig.authDomain !== "YOUR_PROJECT_ID.firebaseapp.com" &&
  firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID";

if (typeof window !== 'undefined' && !configIsValid) {
  const missingKeys: string[] = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") {
    missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  }
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain === "YOUR_PROJECT_ID.firebaseapp.com") {
    missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  }
  if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
    missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  // Add other critical keys if necessary, e.g., storageBucket if it's essential for app start

  if (missingKeys.length > 0) {
    console.error(
      `Firebase configuration is incomplete or uses placeholder values. The following environment variables are missing, undefined, or are placeholders: ${missingKeys.join(', ')}. ` +
      "Please ensure they are correctly set in your .env.local file and that the file is being loaded. " +
      "Refer to your Firebase project settings to get these values. A UI error should be displayed."
    );
  }
}


if (!getApps().length) {
  if (configIsValid) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    // This console.error is intentional for developer awareness during development.
    // The FirebaseProvider will show a UI error.
    console.error("Firebase App could not be initialized due to missing or placeholder configuration values. Ensure .env.local is correctly set up and the development server was restarted.");
    firebaseApp = {} as FirebaseApp; // Assign a placeholder to prevent immediate crashes on access
  }
} else {
  firebaseApp = getApps()[0];
}

// Initialize Firebase services, guarding against placeholder firebaseApp
auth = firebaseApp.name ? getAuth(firebaseApp) : {} as Auth;
db = firebaseApp.name ? getFirestore(firebaseApp) : {} as Firestore;
storage = firebaseApp.name ? getStorage(firebaseApp) : {} as FirebaseStorage;

// Connect to emulators if running in development and emulators are configured
if (process.env.NODE_ENV === 'development' && firebaseApp.name) {
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    console.log("Attempting to connect to Firebase Emulators based on NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true...");
    
    if (auth.name && !(auth as any).emulatorConfig) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log("Auth Emulator connection attempted.");
      } catch (error) {
        console.warn("Auth Emulator connection attempt failed (could be already connected or port unavailable):", error);
      }
    }

    if (db.app) { 
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log("Firestore Emulator connection attempted.");
      } catch (error) {
        console.warn("Firestore Emulator connection attempt failed:", error);
      }
    }

    if (storage.app) { 
      try {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log("Storage Emulator connection attempted.");
      } catch (error) {
        console.warn("Storage Emulator connection attempt failed:", error);
      }
    }
  }
}


export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const firebaseAppInitializationError = !configIsValid;

  const value = useMemo(() => ({ 
    app: firebaseApp, 
    auth: auth, 
    db: db, 
    storage: storage 
  }), []); // Dependencies are stable module-level variables

  if (firebaseAppInitializationError) {
    const missingKeyMessages: string[] = [];
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY") missingKeyMessages.push("NEXT_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain || firebaseConfig.authDomain === "YOUR_PROJECT_ID.firebaseapp.com") missingKeyMessages.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") missingKeyMessages.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    // Add others if they become critical for initialization

    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#D8000C', backgroundColor: '#FFD2D2', border: '1px solid #D8000C', margin: '20px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2 style={{color: '#D8000C', marginTop: 0}}>Errore di Configurazione Firebase</h2>
        <p>Firebase non è configurato correttamente. Le seguenti variabili d&apos;ambiente sono mancanti o contengono valori placeholder nel tuo file <code>.env.local</code>:</p>
        <ul style={{listStyleType: 'none', padding: 0}}>
          {missingKeyMessages.map(key => <li key={key}><code>{key}</code></li>)}
        </ul>
        <p>Assicurati che queste variabili siano impostate correttamente e che il server di sviluppo sia stato riavviato.</p>
        <p>Copia il file <code>.env.example</code> in <code>.env.local</code> e inserisci i tuoi dati Firebase, che puoi trovare nelle impostazioni del tuo progetto Firebase.</p>
        <p>Fai riferimento alla console del browser per ulteriori dettagli.</p>
      </div>
    );
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};