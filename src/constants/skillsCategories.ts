// Categorie strutturate per le competenze BIM
export const BIM_SKILLS_CATEGORIES = [
  {
    id: "modellazione",
    title: "Modellazione Base",
    icon: "📦",
    skills: [
      { value: "modellazione-architettonica", label: "Modellazione Architettonica" },
      { value: "modellazione-strutturale", label: "Modellazione Strutturale" },
      { value: "modellazione-mep", label: "Modellazione MEP (Meccanico, Elettrico, Idraulico)" },
      { value: "modellazione-infrastrutture", label: "Modellazione Infrastrutture e Opere Civili" },
      { value: "modellazione-paesaggistica", label: "Modellazione Paesaggistica e Urbanistica" },
    ]
  },
  {
    id: "gestione-coordinamento",
    title: "Gestione e Coordinamento BIM",
    icon: "👥",
    skills: [
      { value: "bim-management", label: "BIM Management e Direzione Progetti" },
      { value: "bim-coordination", label: "BIM Coordination e Federazione Modelli" },
      { value: "clash-detection", label: "Clash Detection e Risoluzione Interferenze" },
      { value: "bim-authoring", label: "BIM Authoring e Standard di Modellazione" },
      { value: "bim-execution-planning", label: "BEP - BIM Execution Planning" },
    ]
  },
  {
    id: "analisi-simulazioni",
    title: "Analisi e Simulazioni",
    icon: "📈",
    skills: [
      { value: "analisi-energetica-bim", label: "Analisi Energetica e Sostenibilità" },
      { value: "analisi-strutturale-bim", label: "Analisi Strutturale da Modelli BIM" },
      { value: "analisi-illuminotecnica", label: "Analisi Illuminotecnica e Comfort Visivo" },
      { value: "analisi-acustica", label: "Analisi Acustica e Comfort Ambientale" },
      { value: "cfd-analysis", label: "Simulazioni CFD e Fluidodinamica" },
    ]
  },
  {
    id: "pianificazione-controllo",
    title: "Pianificazione e Controllo (4D/5D)",
    icon: "📅",
    skills: [
      { value: "programmazione-lavori-4d", label: "Pianificazione Temporale (4D BIM)" },
      { value: "gestione-costi-5d", label: "Gestione Costi e Budget (5D BIM)" },
      { value: "computi-metrici-bim", label: "Computi Metrici e Analisi Quantità" },
      { value: "controllo-avanzamento", label: "Controllo Avanzamento Lavori" },
    ]
  },
  {
    id: "visualizzazione",
    title: "Visualizzazione e Comunicazione",
    icon: "🖼️",
    skills: [
      { value: "rendering-visualizzazione", label: "Rendering e Visualizzazione Avanzata" },
      { value: "realta-virtuale-aumentata", label: "Realtà Virtuale e Aumentata (VR/AR)" },
      { value: "presentazioni-immersive", label: "Presentazioni Immersive e Interattive" },
      { value: "documentazione-automatica", label: "Documentazione Automatica da BIM" },
    ]
  },
  {
    id: "tecnologie-avanzate",
    title: "Tecnologie Avanzate",
    icon: "🚀",
    skills: [
      { value: "scansione-laser-point-cloud", label: "Scansione Laser 3D e Point Cloud" },
      { value: "fotogrammetria-drone", label: "Fotogrammetria e Rilievi con Droni" },
      { value: "automazione-dynamo-grasshopper", label: "Automazione e Scripting (Dynamo, Grasshopper)" },
      { value: "programmazione-api-bim", label: "Programmazione API e Plugin BIM" },
      { value: "machine-learning-bim", label: "AI e Machine Learning per BIM" },
    ]
  },
  {
    id: "facility-management",
    title: "Gestione Operativa e Facility",
    icon: "🏢",
    skills: [
      { value: "facility-management-bim", label: "Facility Management e Asset Management" },
      { value: "manutenzione-predittiva", label: "Manutenzione Predittiva da BIM" },
      { value: "gemelli-digitali", label: "Digital Twin e Monitoraggio IoT" },
    ]
  },
  {
    id: "competenze-specialistiche",
    title: "Competenze Specialistiche",
    icon: "⭐",
    skills: [
      { value: "creazione-famiglie-oggetti-bim", label: "Creazione Famiglie e Componenti BIM" },
      { value: "interoperabilita-formati", label: "Interoperabilità e Gestione Formati (IFC, gbXML)" },
      { value: "bim-gis-integration", label: "Integrazione BIM-GIS" },
      { value: "lca-life-cycle", label: "LCA - Life Cycle Assessment" },
      { value: "bim-contratti-legale", label: "Aspetti Legali e Contrattuali BIM" },
    ]
  }
];

export const SOFTWARE_CATEGORIES = [
  {
    id: "authoring",
    title: "Software BIM Primari - Authoring",
    icon: "🖱️",
    skills: [
      { value: "autodesk-revit", label: "Autodesk Revit (Architettura, Strutture, MEP)" },
      { value: "graphisoft-archicad", label: "Graphisoft ArchiCAD" },
      { value: "tekla-structures", label: "Tekla Structures" },
      { value: "nemetschek-allplan", label: "Nemetschek Allplan" },
      { value: "nemetschek-vectorworks", label: "Nemetschek Vectorworks" },
      { value: "bentley-microstation", label: "Bentley MicroStation" },
      { value: "accasoftware-edificius", label: "ACCA Software Edificius" },
    ]
  },
  {
    id: "coordination",
    title: "Coordinamento e Clash Detection",
    icon: "✅",
    skills: [
      { value: "autodesk-navisworks", label: "Autodesk Navisworks Manage/Freedom" },
      { value: "solibri-model-checker", label: "Solibri Model Checker/Office" },
      { value: "bimcollab-zoom", label: "BIMcollab ZOOM" },
      { value: "dalux-bim-viewer", label: "Dalux BIM Viewer" },
      { value: "bentley-navigator", label: "Bentley Navigator" },
    ]
  },
  {
    id: "planning-estimating",
    title: "Pianificazione e Computi (4D/5D)",
    icon: "🧮",
    skills: [
      { value: "synchro-pro", label: "Synchro Pro (4D)" },
      { value: "vico-trimble", label: "Vico Office/Trimble Connect" },
      { value: "costx", label: "CostX (5D Estimating)" },
      { value: "innovaya", label: "Innovaya Visual Estimating" },
    ]
  },
  {
    id: "automation",
    title: "Automazione e Scripting",
    icon: "🤖",
    skills: [
      { value: "dynamo-revit", label: "Dynamo for Revit" },
      { value: "grasshopper-rhino", label: "Grasshopper for Rhino" },
      { value: "revit-api", label: "Revit API e Plugin Development" },
      { value: "python-bim", label: "Python per BIM e Automazione" },
    ]
  },
  {
    id: "rendering",
    title: "Rendering e Visualizzazione",
    icon: "📷",
    skills: [
      { value: "enscape", label: "Enscape Real-time Rendering" },
      { value: "lumion", label: "Lumion" },
      { value: "twinmotion", label: "Twinmotion" },
      { value: "vray", label: "V-Ray for Revit/3ds Max" },
      { value: "3ds-max", label: "Autodesk 3ds Max" },
      { value: "cinema-4d", label: "Cinema 4D" },
    ]
  },
  {
    id: "energy-analysis",
    title: "Analisi Energetica",
    icon: "🌡️",
    skills: [
      { value: "autodesk-insight", label: "Autodesk Insight (Green Building Studio)" },
      { value: "designbuilder", label: "DesignBuilder" },
      { value: "energyplus", label: "EnergyPlus" },
      { value: "ies-virtual", label: "IES Virtual Environment" },
      { value: "dialux", label: "DIALux (Illuminotecnica)" },
    ]
  },
  {
    id: "structural",
    title: "Analisi Strutturale",
    icon: "🏢",
    skills: [
      { value: "robot-structural", label: "Autodesk Robot Structural Analysis" },
      { value: "sap2000", label: "SAP2000" },
      { value: "etabs", label: "ETABS" },
      { value: "midas-civil", label: "MIDAS Civil" },
      { value: "strand7", label: "Strand7" },
    ]
  },
  {
    id: "point-cloud",
    title: "Scansione 3D e Point Cloud",
    icon: "📡",
    skills: [
      { value: "recap-pro", label: "Autodesk ReCap Pro" },
      { value: "cloudcompare", label: "CloudCompare" },
      { value: "leica-cyclone", label: "Leica Cyclone" },
      { value: "faro-scene", label: "FARO SCENE" },
    ]
  },
  {
    id: "infrastructure",
    title: "Infrastrutture e GIS",
    icon: "🗺️",
    skills: [
      { value: "civil-3d", label: "Autodesk Civil 3D" },
      { value: "openroads", label: "Bentley OpenRoads Designer" },
      { value: "arcgis", label: "ArcGIS (integrazione BIM-GIS)" },
      { value: "infraworks", label: "Autodesk InfraWorks" },
    ]
  },
  {
    id: "collaboration",
    title: "Collaborazione e Cloud",
    icon: "☁️",
    skills: [
      { value: "acc", label: "Autodesk Construction Cloud" },
      { value: "trimble-connect", label: "Trimble Connect" },
      { value: "projectwise", label: "Bentley ProjectWise" },
      { value: "bim360", label: "BIM 360 (Autodesk)" },
    ]
  },
  {
    id: "cad-modeling",
    title: "CAD e Modellazione 3D",
    icon: "📏",
    skills: [
      { value: "autocad", label: "AutoCAD (2D/3D)" },
      { value: "sketchup", label: "SketchUp Pro" },
      { value: "rhino3d", label: "Rhino 3D" },
      { value: "blender", label: "Blender (Open Source)" },
    ]
  }
];
