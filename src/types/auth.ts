import type { Timestamp } from 'firebase/firestore';

export interface LoginFormData {
  email: string;
  password?: string; // Password might be optional if using OAuth, but for email/pass it's required
}

export interface ProfessionalRegistrationFormData extends LoginFormData {
  firstName: string;
  lastName: string;
  location: string; // e.g., City, Region
  confirmPassword?: string;
}

export interface CompanyRegistrationFormData extends LoginFormData {
  companyName: string;
  companyVat: string; // Partita IVA
  companyLocation: string; // Sede legale o principale
  companyWebsite?: string;
  confirmPassword?: string;
}

// Base User Profile
interface BaseUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  role: 'professional' | 'company' | 'admin'; // User role
  createdAt: Timestamp | Date | any; // FieldValue for serverTimestamp on creation
  updatedAt: Timestamp | Date | any; // FieldValue for serverTimestamp on update
}

// Profile for BIM Professionals
export interface ProfessionalProfile extends BaseUserProfile {
  role: 'professional';
  firstName?: string;
  lastName?: string;
  location?: string; // e.g., "Milano, Lombardia"
  bio?: string;
  bimSkills?: string[]; // Array of skill tags/IDs like "revit-architecture", "navisworks-coordination"
  softwareProficiency?: string[]; // Array of software IDs/names
  availability?: string; // e.g., "full-time", "part-time", "contract", "immediata"
  experienceLevel?: string; // e.g., "entry", "mid", "senior"
  certifications?: string[];
  portfolioUrl?: string;
  cvUrl?: string; // Link to CV/Resume PDF in Firebase Storage
  hourlyRate?: number | ''; // Optional, allow empty string for form handling
  linkedInProfile?: string;
  preferredProjectTypes?: string[];
}

// Profile for Companies
export interface CompanyProfile extends BaseUserProfile {
  role: 'company';
  companyName?: string;
  companyVat?: string; // Partita IVA
  companyLocation?: string; // Sede principale
  companyWebsite?: string;
  companySize?: string; // e.g., "1-10", "11-50"
  industry?: string; // e.g., "architecture", "construction"
  companyDescription?: string;
  logoUrl?: string; // Link to logo in Firebase Storage
  contactPerson?: string;
  contactEmail?: string; 
  contactPhone?: string;
}

export type UserProfile = ProfessionalProfile | CompanyProfile;
