export interface ProfessionalMarketplaceProfile {
  id: string;
  displayName: string;
  photoURL?: string;
  location: string; // e.g., "Milano, Lombardia"
  bimSkills: string[]; // Array of skill values from BIM_SKILLS_OPTIONS
  experienceLevel?: string; // Value from EXPERIENCE_LEVEL_OPTIONS
  availability?: string; // Value from AVAILABILITY_OPTIONS
  tagline?: string; // A short bio snippet or professional tagline
  // Add other fields that might be useful for a quick overview card
  // For example, a few key software proficiencies or certifications
  keySoftware?: string[]; // Few top software
  alboRegistrationUrl?: string;
  uniCertificationUrl?: string;
  otherCertificationsUrl?: string;
}
