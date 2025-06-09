
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER_PROFESSIONAL: '/register/professional',
  REGISTER_COMPANY: '/register/company',
  DASHBOARD: '/dashboard', // Generic dashboard, might redirect based on role
  DASHBOARD_PROFESSIONAL: '/dashboard/professional',
  DASHBOARD_PROFESSIONAL_PROFILE: '/dashboard/professional/profile',
  DASHBOARD_PROFESSIONAL_PROJECTS: '/dashboard/professional/projects',
  DASHBOARD_PROFESSIONAL_NOTIFICATIONS: '/dashboard/professional/notifications',
  DASHBOARD_COMPANY: '/dashboard/company',
  DASHBOARD_COMPANY_PROFILE: '/dashboard/company/profile',
  DASHBOARD_COMPANY_POST_PROJECT: '/dashboard/company/post-project',
  DASHBOARD_COMPANY_PROJECTS: '/dashboard/company/projects',
  DASHBOARD_COMPANY_CANDIDATES: '/dashboard/company/candidates', // To view candidates for a project
  DASHBOARD_COMPANY_NOTIFICATIONS: '/dashboard/company/notifications', // New route for company notifications
  PROFESSIONALS_MARKETPLACE: '/professionals', 
  PROJECT_DETAILS: (id: string) => `/projects/${id}`,
  PROFESSIONAL_PROFILE_VIEW: (id: string) => `/professionals/${id}`, 
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
};

export const ROLES = {
  PROFESSIONAL: 'professional',
  COMPANY: 'company',
  ADMIN: 'admin', // For future use
};

export const BIM_SKILLS_OPTIONS = [
  { value: "modellazione-architettonica", label: "Modellazione Architettonica" },
  { value: "modellazione-strutturale", label: "Modellazione Strutturale" },
  { value: "modellazione-mep", label: "Modellazione MEP" },
  { value: "bim-coordination", label: "BIM Coordination" },
  { value: "clash-detection", label: "Clash Detection" },
  { value: "bim-management", label: "BIM Management" },
  { value: "computi-metrici-bim", label: "Computi Metrici (da BIM)" },
  { value: "rendering-visualizzazione", label: "Rendering e Visualizzazione" },
  { value: "analisi-energetica-bim", label: "Analisi Energetica (BIM-based)" },
  { value: "programmazione-lavori-4d", label: "Programmazione Lavori (4D)" },
  { value: "gestione-costi-5d", label: "Gestione Costi (5D)" },
  { value: "facility-management-bim", label: "Facility Management (BIM-based)" },
  { value: "creazione-famiglie-oggetti-bim", label: "Creazione Famiglie/Oggetti BIM" },
  { value: "scansione-laser-point-cloud", label: "Scansione Laser e Point Cloud" },
  { value: "automazione-dynamo-grasshopper", label: "Automazione (Dynamo, Grasshopper)" },
];

export const SOFTWARE_PROFICIENCY_OPTIONS = [
  { value: "autodesk-revit", label: "Autodesk Revit" },
  { value: "autodesk-navisworks", label: "Autodesk Navisworks" },
  { value: "autodesk-autocad", label: "Autodesk AutoCAD" },
  { value: "graphisoft-archicad", label: "Graphisoft ArchiCAD" },
  { value: "tekla-structures", label: "Tekla Structures" },
  { value: "bentley-microstation", label: "Bentley MicroStation" },
  { value: "nemetschek-allplan", label: "Nemetschek Allplan" },
  { value: "nemetschek-vectorworks", label: "Nemetschek Vectorworks" },
  { value: "solibri-model-checker", label: "Solibri Model Checker" },
  { value: "trimble-connect", label: "Trimble Connect" },
  { value: "synchro-4d", label: "Synchro 4D" },
  { value: "dynamo", label: "Dynamo" },
  { value: "grasshopper", label: "Grasshopper" },
  { value: "enscape", label: "Enscape" },
  { value: "lumion", label: "Lumion" },
  { value: "twinmotion", label: "Twinmotion" },
  { value: "bimcollab-zoom", label: "BIMcollab ZOOM" },
  { value: "dalux-box", label: "Dalux Box" },
  { value: "accasoftware-edificius", label: "ACCA Software Edificius" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "immediata", label: "Immediata" },
  { value: "1-settimana", label: "Entro 1 settimana" },
  { value: "2-settimane", label: "Entro 2 settimane" },
  { value: "1-mese", label: "Entro 1 mese" },
  { value: "da-concordare", label: "Da concordare" },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 dipendenti" },
  { value: "11-50", label: "11-50 dipendenti" },
  { value: "51-200", label: "51-200 dipendenti" },
  { value: "201-500", label: "201-500 dipendenti" },
  { value: "500+", label: "Oltre 500 dipendenti" },
];

export const INDUSTRY_SECTORS = [
  { value: "architettura", label: "Architettura" },
  { value: "ingegneria-civile", label: "Ingegneria Civile" },
  { value: "ingegneria-strutturale", label: "Ingegneria Strutturale" },
  { value: "ingegneria-impiantistica", label: "Ingegneria Impiantistica (MEP)" },
  { value: "costruzioni-generali", label: "Costruzioni Generali" },
  { value: "project-management", label: "Project Management" },
  { value: "interior-design", label: "Interior Design" },
  { value: "urbanistica", label: "Urbanistica e Pianificazione Territoriale" },
  { value: "real-estate", label: "Real Estate e Sviluppo Immobiliare" },
  { value: "facility-management", label: "Facility Management" },
  { value: "consulenza-bim", label: "Consulenza BIM" },
  { value: "pubblica-amministrazione", label: "Pubblica Amministrazione" },
  { value: "altro", label: "Altro" },
];

export const ITALIAN_REGIONS = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", 
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche", 
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana", 
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

export const EXPERIENCE_LEVEL_OPTIONS = [
    { value: "entry", label: "Entry Level (0-2 anni)" },
    { value: "junior", label: "Junior (2-5 anni)" },
    { value: "mid", label: "Mid-Level (5-10 anni)" },
    { value: "senior", label: "Senior (10+ anni)" },
    { value: "expert", label: "Expert / Specialist" },
];

export const NOTIFICATION_TYPES = {
  APPLICATION_STATUS_UPDATED: 'APPLICATION_STATUS_UPDATED',
  NEW_PROJECT_MATCH: 'NEW_PROJECT_MATCH', // Future use for professionals
  PROFILE_VIEW: 'PROFILE_VIEW', // Future use for professionals
  NEW_APPLICATION_RECEIVED: 'NEW_APPLICATION_RECEIVED', // For companies
  GENERIC_INFO: 'GENERIC_INFO',
};
