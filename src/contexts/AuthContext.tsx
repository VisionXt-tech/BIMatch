'use client';

import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { DocumentData, DocumentReference } from 'firebase/firestore';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useFirebase } from './FirebaseContext';
import { useToast } from "@/hooks/use-toast";
import type { LoginFormData, ProfessionalRegistrationFormData, CompanyRegistrationFormData, UserProfile } from '@/types/auth';
import { ROLES, ROUTES } from '@/constants';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  registerProfessional: (data: ProfessionalRegistrationFormData) => Promise<void>;
  registerCompany: (data: CompanyRegistrationFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
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
  const { toast } = useToast();
  const router = useRouter();

  const fetchUserProfile = useCallback(async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserProfile(userDocSnap.data() as UserProfile);
      } else {
        // This case might happen if a user is authenticated but their profile doc doesn't exist yet
        // or was deleted. For BIMatch, profile creation is part of registration.
        console.warn(`User profile for ${firebaseUser.uid} not found in Firestore.`);
        setUserProfile(null); 
      }
    } else {
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
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: "Accesso Effettuato", description: "Bentornato!" });
      // User profile will be fetched by onAuthStateChanged listener
      // router.push(ROUTES.DASHBOARD) is handled by login page after successful promise
    } catch (error: any) {
      console.error("Login error:", error);
      toast({ title: "Errore di Accesso", description: error.message || "Credenziali non valide.", variant: "destructive" });
      throw error;
    }
  };

  const registerProfessional = async (data: ProfessionalRegistrationFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;
      const userDocRef = doc(db, 'users', newUser.uid);
      
      const professionalProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: `${data.firstName} ${data.lastName}`,
        role: ROLES.PROFESSIONAL,
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        // Initialize other professional-specific fields as empty or default
        photoURL: newUser.photoURL || '',
        bimSkills: [],
        softwareProficiency: [],
        availability: '',
        cvUrl: '', 
        portfolioUrl: '',
        bio: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, professionalProfile);
      setUserProfile(professionalProfile); // Update local state
      toast({ title: "Registrazione Completata", description: "Benvenuto in BIMatch! Completa il tuo profilo." });
      // router.push(ROUTES.DASHBOARD_PROFESSIONAL_PROFILE) is handled by registration page
    } catch (error: any) {
      console.error("Professional registration error:", error);
      toast({ title: "Errore di Registrazione", description: error.message || "Impossibile registrarsi.", variant: "destructive" });
      throw error;
    }
  };

  const registerCompany = async (data: CompanyRegistrationFormData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;
      const userDocRef = doc(db, 'users', newUser.uid);

      const companyProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: data.companyName,
        role: ROLES.COMPANY,
        companyName: data.companyName,
        companyVat: data.companyVat,
        companyWebsite: data.companyWebsite || '',
        companyLocation: data.companyLocation,
        // Initialize other company-specific fields
        photoURL: newUser.photoURL || '',
        companySize: '',
        industry: '',
        companyDescription: '',
        logoUrl: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, companyProfile);
      setUserProfile(companyProfile); // Update local state
      toast({ title: "Registrazione Azienda Completata", description: "Benvenuta in BIMatch! Crea il profilo della tua azienda." });
      // router.push(ROUTES.DASHBOARD_COMPANY_PROFILE) is handled by registration page
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
      toast({ title: "Logout Effettuato", description: "A presto!" });
      // router.push(ROUTES.HOME) handled by Navbar/DashboardLayout
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: "Errore di Logout", description: error.message, variant: "destructive" });
    }
  };
  
  const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    const userDocRef = doc(db, 'users', userId);
    try {
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      // Re-fetch or update local userProfile state
      const updatedDocSnap = await getDoc(userDocRef);
      if (updatedDocSnap.exists()) {
        setUserProfile(updatedDocSnap.data() as UserProfile);
      }
      toast({ title: "Profilo Aggiornato", description: "Le modifiche sono state salvate." });
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toast({ title: "Errore Aggiornamento Profilo", description: error.message, variant: "destructive" });
      throw error;
    }
  };


  const value = {
    user,
    userProfile,
    loading,
    login,
    registerProfessional,
    registerCompany,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
