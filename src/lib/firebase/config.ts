// This file is for Firebase configuration variables.
// IMPORTANT: These are loaded from .env.local.
// Ensure your .env.local file has the correct Firebase project configuration.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase API key
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, // Replace with your Firebase auth domain
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, // Replace with your Firebase project ID
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Replace with your Firebase storage bucket URL
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Basic check to log if essential config values are missing.
// The more critical runtime check is within FirebaseProvider.
if (typeof window !== 'undefined') { // Only run this check on the client-side initially
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    const missingKeys: string[] = [];
    if (!firebaseConfig.apiKey) missingKeys.push('NEXT_PUBLIC_FIREBASE_API_KEY');
    if (!firebaseConfig.authDomain) missingKeys.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
    if (!firebaseConfig.projectId) missingKeys.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    
    console.warn(
      `Firebase configuration might be incomplete. Checked keys: ${missingKeys.join(', ')}. ` +
      "Please ensure they are correctly set in your .env.local file. " +
      "The application will attempt to initialize Firebase, but might fail if these are truly missing."
    );
  }
}
