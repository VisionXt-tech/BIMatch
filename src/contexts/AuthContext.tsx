
'use client';

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification } from 'firebase/auth';
import type { DocumentData, DocumentReference } from 'firebase/firestore';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useFirebase } from './FirebaseContext';
import { useToast } from "@/hooks/use-toast";
import type { LoginFormData, ProfessionalRegistrationFormData, CompanyRegistrationFormData, UserProfile, ProfessionalProfile as FullProfessionalProfile, CompanyProfile as FullCompanyProfile } from '@/types/auth';
import { ROLES, ROUTES } from '@/constants';
import { useRouter } from 'next/navigation';
import { useRateLimit } from '@/hooks/useRateLimit';
import { createAuditLogger } from '@/lib/auditLog';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean; // For initial auth state and profile fetching
  isLoggingIn: boolean; // Specifically for the login process
  login: (data: LoginFormData) => Promise<void>;
  registerProfessional: (data: ProfessionalRegistrationFormData) => Promise<void>;
  registerCompany: (data: CompanyRegistrationFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<UserProfile | null>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
 
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { auth, db } = useFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { checkRateLimit, recordAttempt, getRemainingTime } = useRateLimit();
  const auditLog = createAuditLogger(db);

  const fetchUserProfile = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      console.log('Fetching profile for user:', firebaseUser.uid);
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfile;
          console.log('Profile data loaded:', profileData);
          setUserProfile(profileData);
        } else {
          console.warn(`User profile for ${firebaseUser.uid} not found in Firestore.`);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      }
    } else {
      console.log('No firebase user, setting profile to null');
      setUserProfile(null);
    }
  }, [db]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);
      await fetchUserProfile(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth, fetchUserProfile]);

  const login = async (data: LoginFormData) => {
    console.log('Starting login for:', data.email);
    
    // Rate limiting check
    const rateLimitKey = `login_${data.email}`;
    if (!checkRateLimit(rateLimitKey, { maxAttempts: 5, windowMs: 900000, blockDurationMs: 900000 })) { // 15 min
      const remainingTime = getRemainingTime(rateLimitKey);
      const minutes = Math.ceil(remainingTime / 60000);
      toast({
        title: "Troppi tentativi di accesso",
        description: `Riprova tra ${minutes} minuti.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const result = await signInWithEmailAndPassword(auth, data.email, data.password!);
      console.log('Firebase authentication successful:', result.user.uid);
      
      // Audit log successful login
      await auditLog({
        userId: result.user.uid,
        action: 'LOGIN_SUCCESS',
        details: { email: data.email },
        severity: 'LOW'
      });
      
      // No toast here, direct redirect
      router.push(ROUTES.DASHBOARD); 
    } catch (error: any) {
      // Record failed attempt for rate limiting
      recordAttempt(rateLimitKey);
      console.error("Login error:", error);
      
      // Audit log failed login
      await auditLog({
        action: 'LOGIN_FAILED',
        details: { email: data.email, errorCode: error.code },
        severity: 'MEDIUM'
      });
      
      let errorMessage: string;
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password': // Deprecated, but good to have for older SDK versions
        case 'auth/user-not-found': // Deprecated
          errorMessage = "Credenziali non corrette. Controlla email e password e riprova.";
          break;
        case 'auth/invalid-email':
          errorMessage = "L'indirizzo email inserito non è valido.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Accesso temporaneamente disabilitato a causa di troppi tentativi falliti. Riprova più tardi.";
          break;
        case 'auth/network-request-failed':
            errorMessage = "Errore di rete. Controlla la tua connessione internet e riprova.";
            break;
        default:
          errorMessage = error.message || "Si è verificato un errore imprevisto durante l'accesso.";
      }
      toast({ title: "Errore di Accesso", description: errorMessage, variant: "destructive" });
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const registerProfessional = async (data: ProfessionalRegistrationFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password!);
      const newUser = userCredential.user;

      // Send email verification immediately after registration
      await sendEmailVerification(newUser);
      console.log('Email verification sent to:', newUser.email);

      const userDocRef = doc(db, 'users', newUser.uid);

      const professionalProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: `${data.firstName} ${data.lastName}`,
        role: ROLES.PROFESSIONAL as 'professional',
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        photoURL: newUser.photoURL || '',
        bimSkills: [],
        softwareProficiency: [],
        availability: '',
        experienceLevel: '',
        cvUrl: '',
        portfolioUrl: '',
        bio: '',
        monthlyRate: null,
        linkedInProfile: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, professionalProfile);
      setUserProfile(professionalProfile);
      toast({
        title: "Registrazione Completata",
        description: "Controlla la tua email per verificare l'account. Completa poi il tuo profilo."
      });
    } catch (error: any) {
      console.error("Professional registration error:", error);
      toast({ title: "Errore di Registrazione", description: error.message || "Impossibile registrarsi.", variant: "destructive" });
      throw error;
    }
  };

  const registerCompany = async (data: CompanyRegistrationFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password!);
      const newUser = userCredential.user;

      // Send email verification immediately after registration
      await sendEmailVerification(newUser);
      console.log('Email verification sent to:', newUser.email);

      const userDocRef = doc(db, 'users', newUser.uid);

      const companyProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: data.companyName,
        role: ROLES.COMPANY as 'company',
        companyName: data.companyName,
        companyVat: data.companyVat,
        companyWebsite: data.companyWebsite || '',
        companyLocation: data.companyLocation,
        photoURL: newUser.photoURL || '',
        companySize: '',
        industry: '',
        companyDescription: '',
        logoUrl: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, companyProfile);
      setUserProfile(companyProfile);
      toast({
        title: "Registrazione Azienda Completata",
        description: "Controlla la tua email per verificare l'account. Crea poi il profilo della tua azienda."
      });
    } catch (error: any) {
      console.error("Company registration error:", error);
      toast({ title: "Errore di Registrazione", description: error.message || "Impossibile registrarsi.", variant: "destructive" });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      router.push(ROUTES.HOME); // Redirect immediately
      toast({ title: "Logout Effettuato", description: "A presto!" });
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: "Errore di Logout", description: error.message, variant: "destructive" });
    }
  };
  
  const updateUserProfile = async (data: Partial<UserProfile>): Promise<UserProfile | null> => {
    // Security fix: Always use authenticated user's UID
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const dataToUpdate = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(userDocRef, dataToUpdate);
      const updatedDocSnap = await getDoc(userDocRef);
      if (updatedDocSnap.exists()) {
        const updatedProfileData = updatedDocSnap.data() as UserProfile;
        setUserProfile(updatedProfileData); 
        return updatedProfileData; 
      }
      return null;
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast({ title: "Errore Aggiornamento Profilo", description: error.message, variant: "destructive" });
      throw error; 
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Email di Recupero Inviata",
        description: `Se l'indirizzo ${email} è associato a un account, riceverai un'email con le istruzioni per reimpostare la password.`,
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage = "Impossibile inviare l'email di recupero password. Riprova.";
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Nessun utente trovato con questa email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "L'indirizzo email non è valido.";
      }
      toast({
        title: "Errore Recupero Password",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere loggato per richiedere la verifica email.",
        variant: "destructive",
      });
      return;
    }

    if (user.emailVerified) {
      toast({
        title: "Email Già Verificata",
        description: "La tua email è già stata verificata.",
      });
      return;
    }

    try {
      await sendEmailVerification(user);
      toast({
        title: "Email Inviata",
        description: "Controlla la tua casella email per il link di verifica.",
      });
    } catch (error: any) {
      console.error("Email verification resend error:", error);
      let errorMessage = "Impossibile inviare l'email di verifica.";
      if (error.code === 'auth/too-many-requests') {
        errorMessage = "Troppi tentativi. Riprova tra qualche minuto.";
      }
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isLoggingIn,
    login,
    registerProfessional,
    registerCompany,
    logout,
    updateUserProfile,
    requestPasswordReset,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
