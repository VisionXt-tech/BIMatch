
// This file can be used to export the initialized Firebase services (app, auth, db, storage)
// for easier import in other parts of your application, especially server-side components or utilities
// that might not be wrapped in the FirebaseProvider context.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

const configIsValid = 
  firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.authDomain && firebaseConfig.authDomain !== "YOUR_PROJECT_ID.firebaseapp.com" &&
  firebaseConfig.projectId && firebaseConfig.projectId !== "YOUR_PROJECT_ID" &&
  firebaseConfig.storageBucket && firebaseConfig.storageBucket !== "YOUR_PROJECT_ID.appspot.com";

if (!getApps().length) {
  if (configIsValid) {
    try {
      const initializedApp = initializeApp(firebaseConfig);
      // Ensure the initialized app is valid (e.g., has a name)
      if (initializedApp && initializedApp.name) {
        app = initializedApp;
      } else {
        console.error("firebase.ts: Firebase initializeApp was called but returned an invalid app object (e.g., missing name). This can happen with incorrect config values. Current Config:", firebaseConfig);
        // app remains null
      }
    } catch (e) {
      console.error("firebase.ts: Error during Firebase initializeApp:", e, "Current Config:", firebaseConfig);
      // app remains null
    }
  } else {
    console.error("firebase.ts: Firebase config is invalid (contains placeholders or missing values). App cannot be initialized.");
    // app remains null
  }
} else {
  const existingApp = getApp();
  if (existingApp && existingApp.name) {
    app = existingApp;
  } else {
    console.error("firebase.ts: Firebase getApp() returned an invalid app object (e.g., missing name). This is unexpected if an app was previously initialized.");
    // app remains null
  }
}

// Initialize services only if the app was successfully initialized
if (app) {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Emulator connections if in development and configured to use them
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
    (async () => {
      try {
        // Attempting to connect to Firebase Emulators
        const { connectAuthEmulator } = await import('firebase/auth');
        const { connectFirestoreEmulator } = await import('firebase/firestore');
        const { connectStorageEmulator } = await import('firebase/storage');

        if (auth && !(auth as any).emulatorConfig) {
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            // Auth Emulator connection attempted
        } else if (auth) {
            // Auth Emulator likely already connected
        }
        
        if (db) {
          connectFirestoreEmulator(db, 'localhost', 8080);
          // Firestore Emulator connection attempted
        } else {
          // Firestore instance is null, skipping emulator connection
        }
        
        if (storage) {
          connectStorageEmulator(storage, 'localhost', 9199);
          // Storage Emulator connection attempted
        } else {
          // Storage instance is null, skipping emulator connection
        }
        // Emulator connections initiated

      } catch (e) {
        // Emulator connection attempt failed
      }
    })();
  }
} else {
  console.error("firebase.ts: Firebase app is not valid (app is null). Auth, Firestore, and Storage services will be null. Check Firebase configuration and previous logs.");
  // auth, db, storage remain null by default
}

export { app, auth, db, storage };
