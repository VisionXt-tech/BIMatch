
// This file is for Firebase configuration variables.
// IMPORTANT: These are loaded from .env.local.
// Ensure your .env.local file has the correct Firebase project configuration.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // Use environment variable
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Validation with secure error handling
if (typeof window !== 'undefined') {
  // Validate essential config without exposing values
  const requiredFields = ['apiKey', 'authDomain', 'projectId'] as const;
  const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
  
  if (missingFields.length > 0) {
    // Don't log specific missing keys in production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Firebase configuration incomplete. Missing:', missingFields.join(', '));
    }
    throw new Error('Firebase configuration is incomplete. Check environment variables.');
  }
}

// Runtime validation for security
export const validateFirebaseConfig = () => {
  if (!firebaseConfig.apiKey?.startsWith('AIza')) {
    throw new Error('Invalid Firebase API key format');
  }
  
  if (!firebaseConfig.projectId) {
    throw new Error('Firebase project ID missing');
  }
  
  // Only check for demo in development
  if (process.env.NODE_ENV === 'production' && firebaseConfig.projectId.includes('demo')) {
    throw new Error('Production Firebase project required');
  }
  
  return true;
};
