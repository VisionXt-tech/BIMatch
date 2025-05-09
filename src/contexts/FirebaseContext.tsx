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
let authInstance: Auth;
let dbInstance: Firestore;
let storageInstance: FirebaseStorage;

// Configuration validity check
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
if (!firebaseConfig.storageBucket || firebaseConfig.storageBucket === "YOUR_PROJECT_ID.appspot.com") {
  missingKeys.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
}
// Add other critical keys if necessary

const configIsValid = missingKeys.length === 0;

if (typeof window !== 'undefined' && !configIsValid) {
    console.error(
      `Firebase configuration is incomplete or uses placeholder values. The following environment variables are missing, undefined, or are placeholders: ${missingKeys.join(', ')}. ` +
      "Please ensure they are correctly set in your .env.local file and that the file is being loaded. " +
      "Refer to your Firebase project settings to get these values. A UI error should be displayed."
    );
}


if (!getApps().length) {
  if (configIsValid) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    console.error("Firebase App could not be initialized due to missing or placeholder configuration values. Ensure .env.local is correctly set up and the development server was restarted.");
    firebaseApp = {} as FirebaseApp; 
  }
} else {
  firebaseApp = getApps()[0];
}

authInstance = firebaseApp.name ? getAuth(firebaseApp) : {} as Auth;
dbInstance = firebaseApp.name ? getFirestore(firebaseApp) : {} as Firestore;
storageInstance = firebaseApp.name ? getStorage(firebaseApp) : {} as FirebaseStorage;

if (process.env.NODE_ENV === 'development' && firebaseApp.name) {
  if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    console.log("Attempting to connect to Firebase Emulators based on NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true...");
    
    if (authInstance.name && !(authInstance as any).emulatorConfig) {
      try {
        connectAuthEmulator(authInstance, 'http://localhost:9099', { disableWarnings: true });
        console.log("Auth Emulator connection attempted.");
      } catch (error) {
        console.warn("Auth Emulator connection attempt failed (could be already connected or port unavailable):", error);
      }
    }

    if (dbInstance.app) { 
      try {
        connectFirestoreEmulator(dbInstance, 'localhost', 8080);
        console.log("Firestore Emulator connection attempted.");
      } catch (error) {
        console.warn("Firestore Emulator connection attempt failed:", error);
      }
    }

    if (storageInstance.app) { 
      try {
        connectStorageEmulator(storageInstance, 'localhost', 9199);
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
    auth: authInstance, 
    db: dbInstance, 
    storage: storageInstance 
  }), []); 

  if (firebaseAppInitializationError) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#D8000C', backgroundColor: '#FFD2D2', border: '1px solid #D8000C', margin: '20px', borderRadius: '8px', fontFamily: 'sans-serif' }}>
        <h2 style={{color: '#D8000C', marginTop: 0}}>Errore di Configurazione Firebase</h2>
        <p>Firebase non è configurato correttamente. Le seguenti variabili d&apos;ambiente sono mancanti, non definite o contengono valori placeholder nel tuo file <code>.env.local</code>:</p>
        <ul style={{listStyleType: 'disc', paddingLeft: '20px', textAlign: 'left', display: 'inline-block'}}>
          {missingKeys.map(key => <li key={key}><code>{key}</code></li>)}
        </ul>
        <p className="mt-4">Assicurati che queste variabili siano impostate correttamente con i valori del tuo progetto Firebase e che il server di sviluppo sia stato riavviato.</p>
        <p>Copia il file <code>.env.example</code> (se esiste) in <code>.env.local</code> e inserisci i tuoi dati Firebase, che puoi trovare nelle impostazioni del tuo progetto su <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{color: '#0056b3'}}>console.firebase.google.com</a>.</p>
        <p>Fai riferimento alla console del browser per ulteriori dettagli e messaggi di errore specifici.</p>
      </div>
    );
  }

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};
