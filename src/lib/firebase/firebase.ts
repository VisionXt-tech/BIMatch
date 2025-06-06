
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
        console.log("firebase.ts: Attempting to connect to Firebase Emulators...");
        const { connectAuthEmulator } = await import('firebase/auth');
        const { connectFirestoreEmulator } = await import('firebase/firestore');
        const { connectStorageEmulator } = await import('firebase/storage');

        if (auth && !(auth as any).emulatorConfig) {
            connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
            console.log("firebase.ts: Auth Emulator connection attempted.");
        } else if (auth) {
            console.log("firebase.ts: Auth Emulator likely already connected or auth instance is invalid.");
        }
        
        if (db) {
          connectFirestoreEmulator(db, 'localhost', 8080);
          console.log("firebase.ts: Firestore Emulator connection attempted.");
        } else {
          console.log("firebase.ts: Firestore instance is null, skipping emulator connection.");
        }
        
        if (storage) {
          connectStorageEmulator(storage, 'localhost', 9199);
          console.log("firebase.ts: Storage Emulator connection attempted.");
        } else {
          console.log("firebase.ts: Storage instance is null, skipping emulator connection.");
        }
        console.log("firebase.ts: Emulator connections initiated (if services were valid).");

      } catch (e) {
        console.warn("firebase.ts: Emulator connection attempt failed (could be due to prior connection or other issues):", e);
      }
    })();
  }
} else {
  console.error("firebase.ts: Firebase app is not valid (app is null). Auth, Firestore, and Storage services will be null. Check Firebase configuration and previous logs.");
  // auth, db, storage remain null by default
}

export { app, auth, db, storage };
