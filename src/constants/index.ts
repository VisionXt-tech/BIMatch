
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
  DASHBOARD_COMPANY_NOTIFICATIONS: '/dashboard/company/notifications',
  PROFESSIONALS_MARKETPLACE: '/professionals', 
  PROJECT_DETAILS: (id: string) => `/projects/${id}`,
  PROFESSIONAL_PROFILE_VIEW: (id: string) => `/professionals/${id}`, 
  TERMS_OF_SERVICE: '/terms-of-service',
  PRIVACY_POLICY: '/privacy-policy',
  HOW_IT_WORKS: '/how-it-works',
  FAQ: '/faq',
  // Admin Routes
  DASHBOARD_ADMIN: '/dashboard/admin',
  DASHBOARD_ADMIN_USERS: '/dashboard/admin/users',
  DASHBOARD_ADMIN_PROJECTS: '/dashboard/admin/projects',
  DASHBOARD_ADMIN_MATCHES: '/dashboard/admin/matches',
  DASHBOARD_ADMIN_CONTRACTS: '/dashboard/admin/contracts',
};

export const ROLES = {
  PROFESSIONAL: 'professional',
  COMPANY: 'company',
  ADMIN: 'admin', // For future use
};

export const BIM_SKILLS_OPTIONS = [
  // Competenze di Modellazione Base
  { value: "modellazione-architettonica", label: "Modellazione Architettonica" },
  { value: "modellazione-strutturale", label: "Modellazione Strutturale" },
  { value: "modellazione-mep", label: "Modellazione MEP (Meccanico, Elettrico, Idraulico)" },
  { value: "modellazione-infrastrutture", label: "Modellazione Infrastrutture e Opere Civili" },
  { value: "modellazione-paesaggistica", label: "Modellazione Paesaggistica e Urbanistica" },
  
  // Gestione e Coordinamento BIM
  { value: "bim-management", label: "BIM Management e Direzione Progetti" },
  { value: "bim-coordination", label: "BIM Coordination e Federazione Modelli" },
  { value: "clash-detection", label: "Clash Detection e Risoluzione Interferenze" },
  { value: "bim-authoring", label: "BIM Authoring e Standard di Modellazione" },
  { value: "bim-execution-planning", label: "BEP - BIM Execution Planning" },
  
  // Analisi e Simulazioni
  { value: "analisi-energetica-bim", label: "Analisi Energetica e Sostenibilità" },
  { value: "analisi-strutturale-bim", label: "Analisi Strutturale da Modelli BIM" },
  { value: "analisi-illuminotecnica", label: "Analisi Illuminotecnica e Comfort Visivo" },
  { value: "analisi-acustica", label: "Analisi Acustica e Comfort Ambientale" },
  { value: "cfd-analysis", label: "Simulazioni CFD e Fluidodinamica" },
  
  // Pianificazione e Controllo
  { value: "programmazione-lavori-4d", label: "Pianificazione Temporale (4D BIM)" },
  { value: "gestione-costi-5d", label: "Gestione Costi e Budget (5D BIM)" },
  { value: "computi-metrici-bim", label: "Computi Metrici e Analisi Quantità" },
  { value: "controllo-avanzamento", label: "Controllo Avanzamento Lavori" },
  
  // Visualizzazione e Comunicazione
  { value: "rendering-visualizzazione", label: "Rendering e Visualizzazione Avanzata" },
  { value: "realta-virtuale-aumentata", label: "Realtà Virtuale e Aumentata (VR/AR)" },
  { value: "presentazioni-immersive", label: "Presentazioni Immersive e Interattive" },
  { value: "documentazione-automatica", label: "Documentazione Automatica da BIM" },
  
  // Tecnologie Avanzate
  { value: "scansione-laser-point-cloud", label: "Scansione Laser 3D e Point Cloud" },
  { value: "fotogrammetria-drone", label: "Fotogrammetria e Rilievi con Droni" },
  { value: "automazione-dynamo-grasshopper", label: "Automazione e Scripting (Dynamo, Grasshopper)" },
  { value: "programmazione-api-bim", label: "Programmazione API e Plugin BIM" },
  { value: "machine-learning-bim", label: "AI e Machine Learning per BIM" },
  
  // Gestione Operativa e Facility
  { value: "facility-management-bim", label: "Facility Management e Asset Management" },
  { value: "manutenzione-predittiva", label: "Manutenzione Predittiva da BIM" },
  { value: "gemelli-digitali", label: "Digital Twin e Monitoraggio IoT" },
  
  // Competenze Specialistiche
  { value: "creazione-famiglie-oggetti-bim", label: "Creazione Famiglie e Componenti BIM" },
  { value: "interoperabilita-formati", label: "Interoperabilità e Gestione Formati (IFC, gbXML)" },
  { value: "bim-gis-integration", label: "Integrazione BIM-GIS" },
  { value: "lca-life-cycle", label: "LCA - Life Cycle Assessment" },
  { value: "bim-contratti-legale", label: "Aspetti Legali e Contrattuali BIM" },
];

export const SOFTWARE_PROFICIENCY_OPTIONS = [
  // Software BIM Primari - Authoring
  { value: "autodesk-revit", label: "Autodesk Revit (Architettura, Strutture, MEP)" },
  { value: "graphisoft-archicad", label: "Graphisoft ArchiCAD" },
  { value: "tekla-structures", label: "Tekla Structures" },
  { value: "nemetschek-allplan", label: "Nemetschek Allplan" },
  { value: "nemetschek-vectorworks", label: "Nemetschek Vectorworks" },
  { value: "bentley-microstation", label: "Bentley MicroStation" },
  { value: "accasoftware-edificius", label: "ACCA Software Edificius" },
  
  // Software di Coordinamento e Revisione
  { value: "autodesk-navisworks", label: "Autodesk Navisworks Manage/Freedom" },
  { value: "solibri-model-checker", label: "Solibri Model Checker/Office" },
  { value: "bimcollab-zoom", label: "BIMcollab ZOOM" },
  { value: "dalux-box", label: "Dalux BIM Viewer" },
  { value: "bentley-navigator", label: "Bentley Navigator" },
  
  // Software di Pianificazione 4D/5D
  { value: "synchro-4d", label: "Synchro Pro (4D)" },
  { value: "vico-office", label: "Vico Office/Trimble Connect" },
  { value: "costx", label: "CostX (5D Estimating)" },
  { value: "innovaya", label: "Innovaya Visual Estimating" },
  
  // Software di Automazione e Scripting
  { value: "dynamo", label: "Dynamo for Revit" },
  { value: "grasshopper", label: "Grasshopper for Rhino" },
  { value: "revit-api", label: "Revit API e Plugin Development" },
  { value: "python-bim", label: "Python per BIM e Automazione" },
  
  // Software di Visualizzazione e Rendering
  { value: "enscape", label: "Enscape Real-time Rendering" },
  { value: "lumion", label: "Lumion" },
  { value: "twinmotion", label: "Twinmotion" },
  { value: "vray", label: "V-Ray for Revit/3ds Max" },
  { value: "3ds-max", label: "Autodesk 3ds Max" },
  { value: "cinema-4d", label: "Cinema 4D" },
  
  // Software di Analisi Energetica
  { value: "autodesk-insight", label: "Autodesk Insight (Green Building Studio)" },
  { value: "designbuilder", label: "DesignBuilder" },
  { value: "energyplus", label: "EnergyPlus" },
  { value: "ies-ve", label: "IES Virtual Environment" },
  { value: "dialux", label: "DIALux (Illuminotecnica)" },
  
  // Software di Analisi Strutturale
  { value: "robot-structural", label: "Autodesk Robot Structural Analysis" },
  { value: "sap2000", label: "SAP2000" },
  { value: "etabs", label: "ETABS" },
  { value: "midas-civil", label: "MIDAS Civil" },
  { value: "strand7", label: "Strand7" },
  
  // Software di Rilievo e Point Cloud
  { value: "recap-pro", label: "Autodesk ReCap Pro" },
  { value: "cloudcompare", label: "CloudCompare" },
  { value: "leica-cyclone", label: "Leica Cyclone" },
  { value: "faro-scene", label: "FARO SCENE" },
  
  // Software GIS e Infrastrutture
  { value: "civil-3d", label: "Autodesk Civil 3D" },
  { value: "bentley-openroads", label: "Bentley OpenRoads Designer" },
  { value: "arcgis", label: "ArcGIS (integrazione BIM-GIS)" },
  { value: "infraworks", label: "Autodesk InfraWorks" },
  
  // Piattaforme Cloud e Collaboration
  { value: "autodesk-construction-cloud", label: "Autodesk Construction Cloud" },
  { value: "trimble-connect", label: "Trimble Connect" },
  { value: "bentley-projectwise", label: "Bentley ProjectWise" },
  { value: "bim360", label: "BIM 360 (Autodesk)" },
  
  // Software Complementari
  { value: "autodesk-autocad", label: "AutoCAD (2D/3D)" },
  { value: "sketchup", label: "SketchUp Pro" },
  { value: "rhino3d", label: "Rhino 3D" },
  { value: "blender", label: "Blender (Open Source)" },
];

// Modalità Lavorativa
export const WORK_MODE_OPTIONS = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time-50", label: "Part-time 50%" },
  { value: "part-time-75", label: "Part-time 75%" },
  { value: "freelance-progetto", label: "Freelance a progetto" },
  { value: "freelance-continuativo", label: "Freelance continuativo" },
  { value: "consulenza", label: "Consulenza" },
];

// Disponibilità Temporale
export const AVAILABILITY_OPTIONS = [
  { value: "immediata", label: "Immediata" },
  { value: "1-mese", label: "Entro 1 mese" },
  { value: "2-mesi", label: "Entro 2 mesi" },
  { value: "3-mesi", label: "Entro 3 mesi" },
];

// Modalità di Lavoro (Sede)
export const LOCATION_MODE_OPTIONS = [
  { value: "remoto", label: "Solo remoto" },
  { value: "ibrido", label: "Ibrido (remoto + sede)" },
  { value: "sede", label: "Solo in sede" },
  { value: "flessibile", label: "Flessibile" },
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
    { value: "entry-0-1", label: "Entry Level - 0-1 anni" },
    { value: "junior-1-3", label: "Junior - 1-3 anni" },
    { value: "intermediate-3-5", label: "Intermediate - 3-5 anni" },
    { value: "senior-5-8", label: "Senior - 5-8 anni" },
    { value: "expert-8-plus", label: "Expert - 8+ anni" },
];

export const MONTHLY_RATE_OPTIONS = [
    { value: "1000-1500", label: "€1.000 - €1.500" },
    { value: "1500-2000", label: "€1.500 - €2.000" },
    { value: "2000-2500", label: "€2.000 - €2.500" },
    { value: "2500-3000", label: "€2.500 - €3.000" },
    { value: "3000-3500", label: "€3.000 - €3.500" },
    { value: "3500-4000", label: "€3.500 - €4.000" },
    { value: "4000-5000", label: "€4.000 - €5.000" },
    { value: "5000-6000", label: "€5.000 - €6.000" },
    { value: "6000-plus", label: "€6.000+" },
];

export const NOTIFICATION_TYPES = {
  APPLICATION_STATUS_UPDATED: 'APPLICATION_STATUS_UPDATED',
  NEW_PROJECT_MATCH: 'NEW_PROJECT_MATCH',
  PROFILE_VIEW: 'PROFILE_VIEW',
  NEW_APPLICATION_RECEIVED: 'NEW_APPLICATION_RECEIVED', 
  GENERIC_INFO: 'GENERIC_INFO',
  INTERVIEW_PROPOSED: 'INTERVIEW_PROPOSED', 
  INTERVIEW_ACCEPTED_BY_PRO: 'INTERVIEW_ACCEPTED_BY_PRO', 
  INTERVIEW_REJECTED_BY_PRO: 'INTERVIEW_REJECTED_BY_PRO', 
  INTERVIEW_RESCHEDULED_BY_PRO: 'INTERVIEW_RESCHEDULED_BY_PRO',
  COLLABORATION_CONFIRMED: 'COLLABORATION_CONFIRMED',
};

// Moved from dashboard/layout.tsx
import { LogOut, User, Briefcase, LayoutDashboard, FolderPlus, Building, Search, Users, Bell, type LucideIcon, HelpCircle as FaqIcon, Shield } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon; // Using LucideIcon type
}

export const ProfessionalNavItems: NavItem[] = [
  { href: ROUTES.DASHBOARD_PROFESSIONAL, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD_PROFESSIONAL_PROFILE, label: 'Profilo', icon: User },
  { href: ROUTES.DASHBOARD_PROFESSIONAL_PROJECTS, label: 'Progetti', icon: Search },
  { href: ROUTES.DASHBOARD_PROFESSIONAL_NOTIFICATIONS, label: 'Notifiche', icon: Bell },
];

export const CompanyNavItems: NavItem[] = [
  { href: ROUTES.DASHBOARD_COMPANY, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD_COMPANY_PROFILE, label: 'Profilo Azienda', icon: Building },
  { href: ROUTES.DASHBOARD_COMPANY_POST_PROJECT, label: 'Pubblica', icon: FolderPlus },
  { href: ROUTES.DASHBOARD_COMPANY_PROJECTS, label: 'Progetti', icon: Briefcase },
  // { href: ROUTES.PROFESSIONALS_MARKETPLACE, label: 'Cerca Professionisti', icon: Users }, // Already in Navbar, maybe remove from here if dashboard specific
  { href: ROUTES.DASHBOARD_COMPANY_NOTIFICATIONS, label: 'Notifiche', icon: Bell },
];

export const AdminNavItems: NavItem[] = [
    { href: ROUTES.DASHBOARD_ADMIN_USERS, label: 'Gestisci Utenti', icon: Users },
    { href: ROUTES.DASHBOARD_ADMIN_PROJECTS, label: 'Gestisci Progetti', icon: Briefcase },
];
