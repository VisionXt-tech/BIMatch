import type { Timestamp } from 'firebase/firestore';

export interface Project {
  id?: string; // Firestore document ID, optional until created
  title: string;
  companyId: string; // UID of the company that posted the project
  companyName: string;
  companyLogo?: string; // URL to company logo
  location: string; // Region or City, State
  description: string; // Detailed project description
  requiredSkills: string[]; // Array of skill IDs/tags
  requiredSoftware: string[]; // Array of software IDs/names
  projectType: string; // e.g., "Full-time", "Contract", "Part-time"
  duration?: string; // e.g., "3 months", "Ongoing"
  budgetRange?: string; // e.g., "€50-€70/hour", "€50k-€60k/year"
  status: 'attivo' | 'in_revisione' | 'completato' | 'chiuso' | 'bozza'; // Project status
  postedAt: Timestamp | Date | any; // Firestore serverTimestamp
  updatedAt: Timestamp | Date | any; // Firestore serverTimestamp
  applicationDeadline?: Timestamp | Date | null; // Optional deadline for applications
  applicationsCount?: number; // Number of applications received (denormalized or calculated)
  // Add other relevant fields as needed:
  // experienceLevelRequired?: string;
  // remoteOption?: 'si' | 'no' | 'ibrido';
  // projectStartDate?: Timestamp | Date;
}

export interface ProjectApplication {
  id?: string; // Firestore document ID
  projectId: string;
  professionalId: string; // UID of the applying professional
  professionalName: string;
  professionalEmail?: string; // For notifications
  applicationDate: Timestamp | Date | any;
  status: 'inviata' | 'in_revisione' | 'preselezionata' | 'rifiutata' | 'accettata';
  coverLetter?: string; // Optional cover letter or message
  // You might store a snapshot of key professional details at time of application
  // professionalSkillsSnapshot?: string[]; 
}
