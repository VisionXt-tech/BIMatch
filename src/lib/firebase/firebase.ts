
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
    (async () => {
      try {
        console.log("firebase.ts: Attempting to connect to Firebase Emulators...");
        const { connectAuthEmulator } = await import('firebase/auth');
        const { connectFirestoreEmulator } = await import('firebase/firestore');
        const { connectStorageEmulator } = await import('firebase/storage');

        // Check if emulators are already connected to avoid errors/warnings if possible
        // For Auth, checking emulatorConfig is a common way.
        if (!(auth as any).emulatorConfig) {
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            console.log("firebase.ts: Auth Emulator connection attempted.");
        } else {
            console.log("firebase.ts: Auth Emulator likely already connected.");
        }
        
        // For Firestore and Storage, connectEmulator typically doesn't error if called multiple times for the same endpoint.
        // It might log an internal warning in the Firebase SDK, which is generally fine.
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log("firebase.ts: Firestore Emulator connection attempted.");
        
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log("firebase.ts: Storage Emulator connection attempted.");
        console.log("firebase.ts: Emulator connections initiated.");

      } catch (e) {
        console.warn("firebase.ts: Emulator connection attempt failed (could be due to prior connection or other issues):", e);
      }
    })();
  }
} else {
  // Assign dummy objects if app initialization failed
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };
