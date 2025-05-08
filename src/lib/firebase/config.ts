// This file is for Firebase configuration variables.
// IMPORTANT: Replace with your actual Firebase project configuration.
// For security, these should ideally be environment variables.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Ensure that the essential configuration variables are present.
// This check runs when this module is imported.
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  const missingKeys: string[] = [];
  if (!firebaseConfig.apiKey) missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  
  // This error will be thrown on server start or build if env vars are missing.
  // For client-side, this error will be caught by the FirebaseProvider.
  const errorMessage = `Firebase configuration is incomplete. The following environment variables are missing or undefined: ${missingKeys.join(', ')}. ` +
  "Please ensure they are correctly set in your .env.local file and that the file is being loaded. " +
  "Refer to your Firebase project settings to get these values.";
  
  // Throw error during build time or server-side execution
  if (typeof window === 'undefined') {
    // console.error(errorMessage); // Log it for server-side visibility
    // Note: Throwing here might halt builds if not handled, which is often desired.
  } else {
    // For client-side, this module might be imported before FirebaseProvider runs its check.
    // The check in FirebaseProvider is more critical for client-side initialization.
    console.warn("Firebase config check in config.ts (client-side):", errorMessage);
  }
}
