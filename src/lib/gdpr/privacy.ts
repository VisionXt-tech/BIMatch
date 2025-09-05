// GDPR Compliance utilities for Italian market

export interface PrivacyConsent {
  necessary: boolean; // Always true - cannot be disabled
  analytics: boolean;
  marketing: boolean;
  timestamp: Date;
  version: string;
}

export interface UserDataExportRequest {
  userId: string;
  email: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: Date;
}

export interface DataDeletionRequest {
  userId: string;
  email: string;
  requestDate: Date;
  confirmationToken: string;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  completionDate?: Date;
  retentionReason?: string; // Legal obligation, contract, etc.
}

// GDPR-compliant data categories
export const DataCategories = {
  PERSONAL_IDENTITY: {
    name: 'Dati Identificativi',
    description: 'Nome, cognome, email, telefono',
    legalBasis: 'Consenso / Esecuzione contratto',
    retention: '5 anni dalla cessazione del rapporto',
    fields: ['firstName', 'lastName', 'email', 'phoneNumber']
  },
  PROFESSIONAL_DATA: {
    name: 'Dati Professionali',
    description: 'Competenze BIM, esperienza, certificazioni',
    legalBasis: 'Consenso / Legittimo interesse',
    retention: '2 anni dall\'ultima attività',
    fields: ['bimSkills', 'experienceLevel', 'certifications', 'portfolio']
  },
  USAGE_DATA: {
    name: 'Dati di Utilizzo',
    description: 'Log di accesso, preferenze, cronologia navigazione',
    legalBasis: 'Legittimo interesse',
    retention: '12 mesi',
    fields: ['loginHistory', 'searchHistory', 'preferences']
  },
  COMMUNICATIONS: {
    name: 'Comunicazioni',
    description: 'Messaggi, candidature, notifiche',
    legalBasis: 'Esecuzione contratto',
    retention: '7 anni per obblighi fiscali',
    fields: ['applications', 'messages', 'notifications']
  }
} as const;

// Privacy policy content for Italian GDPR compliance
export const PrivacyPolicyContent = {
  lastUpdated: '2024-01-15',
  controller: {
    name: 'BIMatch S.r.l.',
    address: 'Via esempio 123, 20100 Milano (MI)',
    email: 'privacy@bimatch.it',
    pec: 'bimatch@pec.it'
  },
  dpo: {
    name: 'Data Protection Officer',
    email: 'dpo@bimatch.it'
  },
  purposes: [
    {
      id: 'service_provision',
      title: 'Erogazione del servizio',
      description: 'Gestione della piattaforma di matching tra professionisti BIM e aziende',
      legalBasis: 'Esecuzione del contratto (art. 6, par. 1, lett. b GDPR)',
      dataCategories: ['PERSONAL_IDENTITY', 'PROFESSIONAL_DATA'],
      retention: '5 anni dalla cessazione del rapporto contrattuale'
    },
    {
      id: 'communication',
      title: 'Comunicazioni di servizio',
      description: 'Invio di notifiche, aggiornamenti, comunicazioni relative al servizio',
      legalBasis: 'Consenso (art. 6, par. 1, lett. a GDPR)',
      dataCategories: ['PERSONAL_IDENTITY'],
      retention: 'Fino alla revoca del consenso'
    },
    {
      id: 'marketing',
      title: 'Marketing e promozione',
      description: 'Invio di comunicazioni commerciali e promozionali',
      legalBasis: 'Consenso (art. 6, par. 1, lett. a GDPR)',
      dataCategories: ['PERSONAL_IDENTITY'],
      retention: 'Fino alla revoca del consenso, max 2 anni'
    },
    {
      id: 'analytics',
      title: 'Analisi e miglioramento del servizio',
      description: 'Analisi dell\'utilizzo della piattaforma per miglioramenti',
      legalBasis: 'Legittimo interesse (art. 6, par. 1, lett. f GDPR)',
      dataCategories: ['USAGE_DATA'],
      retention: '12 mesi'
    }
  ]
};

// User rights under GDPR
export const UserRights = {
  ACCESS: {
    title: 'Diritto di accesso (art. 15 GDPR)',
    description: 'Ottenere conferma del trattamento e copia dei dati personali',
    action: 'data-export'
  },
  RECTIFICATION: {
    title: 'Diritto di rettifica (art. 16 GDPR)',
    description: 'Correggere dati inesatti o incomplete',
    action: 'profile-edit'
  },
  ERASURE: {
    title: 'Diritto alla cancellazione (art. 17 GDPR)',
    description: 'Ottenere la cancellazione dei dati personali',
    action: 'data-deletion'
  },
  PORTABILITY: {
    title: 'Diritto alla portabilità (art. 20 GDPR)',
    description: 'Ricevere i dati in formato strutturato e leggibile',
    action: 'data-export'
  },
  OBJECTION: {
    title: 'Diritto di opposizione (art. 21 GDPR)',
    description: 'Opporsi al trattamento per motivi legittimi',
    action: 'consent-management'
  },
  COMPLAINT: {
    title: 'Diritto di reclamo',
    description: 'Presentare reclamo al Garante per la protezione dei dati personali',
    contact: 'https://www.gpdp.it'
  }
} as const;

// Cookie categories for consent management
export const CookieCategories = {
  NECESSARY: {
    name: 'Cookie Necessari',
    description: 'Essenziali per il funzionamento del sito',
    required: true,
    cookies: [
      { name: 'auth-token', purpose: 'Autenticazione utente', duration: '30 giorni' },
      { name: 'session', purpose: 'Sessione di navigazione', duration: 'Sessione' }
    ]
  },
  ANALYTICS: {
    name: 'Cookie Analitici',
    description: 'Raccolgono informazioni anonime sull\'utilizzo del sito',
    required: false,
    cookies: [
      { name: 'google-analytics', purpose: 'Analisi traffico', duration: '2 anni' }
    ]
  },
  MARKETING: {
    name: 'Cookie di Marketing',
    description: 'Utilizzati per fornire pubblicità personalizzata',
    required: false,
    cookies: [
      { name: 'marketing-prefs', purpose: 'Preferenze pubblicitarie', duration: '1 anno' }
    ]
  }
} as const;

// Utility functions for GDPR compliance
export const createConsentRecord = (consents: Omit<PrivacyConsent, 'timestamp' | 'version'>): PrivacyConsent => ({
  ...consents,
  necessary: true, // Always required
  timestamp: new Date(),
  version: PrivacyPolicyContent.lastUpdated
});

export const isConsentValid = (consent: PrivacyConsent, maxAge: number = 365 * 24 * 60 * 60 * 1000): boolean => {
  const age = Date.now() - consent.timestamp.getTime();
  return age <= maxAge;
};

export const anonymizeUserData = (userData: any) => {
  const anonymized = { ...userData };
  
  // Replace PII with anonymized values
  anonymized.firstName = 'Utente';
  anonymized.lastName = 'Anonimo';
  anonymized.email = 'user@anonymous.local';
  anonymized.displayName = 'Utente Anonimo';
  
  // Remove sensitive fields
  delete anonymized.phoneNumber;
  delete anonymized.cvUrl;
  delete anonymized.linkedInProfile;
  delete anonymized.portfolioUrl;
  
  return anonymized;
};