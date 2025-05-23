// This file can be used to export the initialized Firebase services (app, auth, db, storage)
// for easier import in other parts of your application, especially server-side components or utilities
// that might not be wrapped in the FirebaseProvider context.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

const configIsValid = 
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.authDomain && firebaseConfig.authDomain !== "YOUR_PROJECT_ID.firebaseapp.com" &&
  firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
  firebaseConfig.storageBucket && firebaseConfig.storageBucket !== "YOUR_PROJECT_ID.appspot.com";


if (!getApps().length) {
  if (configIsValid) {
    app = initializeApp(firebaseConfig);
  } else {
    // Log an error or throw if in a context where this is critical (e.g., server-side init)
    // For client-side, the FirebaseProvider will show a more user-friendly error.
    console.error("Firebase config is invalid or missing. App cannot be initialized here.");
    // Assign dummy objects to prevent crashes if these are imported elsewhere before provider check
    app = {} as FirebaseApp; 
  }
} else {
  app = getApp();
}

// Initialize services only if the app was successfully initialized
if (app && app.name) {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Emulator connections if in development and configured to use them
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    const { connectAuthEmulator } = await import('firebase/auth');
    const { connectFirestoreEmulator } = await import('firebase/firestore');
    const { connectStorageEmulator } = await import('firebase/storage');

    // Check if emulators are already connected to avoid errors
    // Firebase Auth emulator
    if (!(auth as any).emulatorConfig) {
        try {
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            console.log("Auth Emulator connected from firebase.ts");
        } catch (e) { console.warn("Auth Emulator already connected or connection failed in firebase.ts", e); }
    }
    // Firestore emulator
    // Note: Firestore's _settings property or a similar internal flag could be checked, 
    // but direct checks are often not robust across SDK versions.
    // A simpler approach is to attempt connection and catch if it's already connected.
    try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log("Firestore Emulator connected from firebase.ts");
    } catch (e) { console.warn("Firestore Emulator already connected or connection failed in firebase.ts", e); }
    
    // Storage emulator
    try {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log("Storage Emulator connected from firebase.ts");
    } catch (e) { console.warn("Storage Emulator already connected or connection failed in firebase.ts", e); }
  }
} else {
  // Assign dummy objects if app initialization failed
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };
