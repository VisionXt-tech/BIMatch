
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams }from 'next/navigation';
import { Edit3, Save, ArrowLeft, Info, WifiOff } from 'lucide-react';
import { FormInput, FormTextarea, FormMultiSelect, FormSingleSelect } from '@/components/ProfileFormElements';
import { ROUTES, BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, ITALIAN_REGIONS } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from '@/types/project';
// Storage imports for image upload
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

// TODO: Consider moving this schema to a shared location if it's used in multiple places.
const projectSchema = z.object({
  title: z.string().min(5, { message: 'Il titolo del progetto deve contenere almeno 5 caratteri.' }),
  location: z.string().min(1, { message: 'La localizzazione del progetto è richiesta.' }),
  description: z.string().min(50, { message: 'La descrizione deve essere di almeno 50 caratteri.' }).max(5000, 'La descrizione non può superare i 5000 caratteri.'),
  requiredSkills: z.array(z.string()).min(1, { message: 'Seleziona almeno una competenza richiesta.' }),
  requiredSoftware: z.array(z.string()).min(1, { message: 'Seleziona almeno un software richiesto.' }),
  projectType: z.string().min(1, "Il tipo di progetto è richiesto."),
  duration: z.string().optional().or(z.literal('')),
  budgetRange: z.string().optional().or(z.literal('')),
  applicationDeadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)) || val === '', { message: "Data non valida" }),
  // Contract-specific fields
  deliverables: z.string().optional().or(z.literal('')),
  budgetAmount: z.string().optional().or(z.literal('')),
  budgetCurrency: z.enum(['EUR']).optional().or(z.literal('') as any),
  startDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)) || val === '', { message: "Data non valida" }),
  endDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)) || val === '', { message: "Data non valida" }),
  workMode: z.enum(['remoto', 'ibrido', 'presenza']).optional().or(z.literal('') as any),
  paymentTerms: z.string().optional().or(z.literal('')),
  ndaRequired: z.boolean().optional(),
  insuranceRequired: z.boolean().optional(),
  travelExpenses: z.boolean().optional(),
  equipmentProvided: z.boolean().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

// Helper to format Firestore Timestamp to YYYY-MM-DD string for date input
const formatDateForInput = (timestamp: Timestamp | Date | null | undefined): string => {
  if (!timestamp) return '';
  const date = (timestamp as Timestamp)?.toDate ? (timestamp as Timestamp).toDate() : (timestamp as Date);
  if (date instanceof Date && !isNaN(date.valueOf())) {
    return date.toISOString().split('T')[0];
  }
  return '';
};

export default function EditProjectPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db, storage } = useFirebase();
  const router = useRouter();
  const params = useParams();
  const { toast: showToast } = useToast();

  const projectId = typeof params?.projectId === 'string' ? params.projectId : null;

  const [initialProjectData, setInitialProjectData] = useState<ProjectFormData | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Image upload state
  const [currentProjectImageUrl, setCurrentProjectImageUrl] = useState<string | null>(null);
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectImagePreview, setProjectImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { // Initial empty defaults, will be reset
      title: '',
      location: '',
      description: '',
      requiredSkills: [],
      requiredSoftware: [],
      projectType: '',
      duration: '',
      budgetRange: '',
      applicationDeadline: '',
      // Contract fields
      deliverables: '',
      budgetAmount: '',
      budgetCurrency: 'EUR' as any,
      startDate: '',
      endDate: '',
      workMode: '' as any,
      paymentTerms: '',
      ndaRequired: false,
      insuranceRequired: false,
      travelExpenses: false,
      equipmentProvided: false,
    },
  });

  // Image validation function
  const validateImage = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      return 'Formato non supportato. Usa JPG, PNG o WebP';
    }
    if (file.size > maxSize) {
      return 'Immagine troppo grande. Massimo 5MB';
    }
    return null;
  };

  // Image file change handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setProjectImageFile(file);
    setProjectImagePreview(URL.createObjectURL(file));
  };

  // Remove new image (revert to current or none)
  const handleRemoveImage = () => {
    setProjectImageFile(null);
    if (projectImagePreview) {
      URL.revokeObjectURL(projectImagePreview);
    }
    setProjectImagePreview(null);
  };

  // Delete current image from project
  const handleDeleteCurrentImage = async () => {
    if (!currentProjectImageUrl || !projectId) return;

    try {
      // Delete from Storage if it's a Firebase Storage URL
      if (currentProjectImageUrl.includes('firebase') && storage) {
        const imageRef = ref(storage, currentProjectImageUrl);
        await deleteObject(imageRef).catch((err) => {
          console.warn('Could not delete old image from storage:', err);
        });
      }

      // Update Firestore to remove image URL
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, { projectImage: null, updatedAt: serverTimestamp() });

      setCurrentProjectImageUrl(null);
      toast.success('Immagine eliminata');
    } catch (err: any) {
      console.error('Error deleting image:', err);
      toast.error('Errore eliminazione immagine');
    }
  };

  const fetchProjectData = useCallback(async () => {
    if (!projectId || !db || !user) {
      setError("ID progetto non valido o utente non autenticato.");
      setLoadingData(false);
      return;
    }
    setLoadingData(true);
    setError(null);

    try {
      const projectDocRef = doc(db, 'projects', projectId);
      const projectDocSnap = await getDoc(projectDocRef);

      if (projectDocSnap.exists() && projectDocSnap.data()?.companyId === user.uid) {
        const project = projectDocSnap.data() as Project;
        setProjectTitle(project.title);
        setCurrentProjectImageUrl(project.projectImage || null); // Load current image

        // Convert deliverables array to string (one per line)
        const deliverablesString = Array.isArray(project.deliverables)
          ? project.deliverables.join('\n')
          : '';

        const formData: ProjectFormData = {
          title: project.title || '',
          location: project.location || '',
          description: project.description || '',
          requiredSkills: project.requiredSkills || [],
          requiredSoftware: project.requiredSoftware || [],
          projectType: project.projectType || '',
          duration: project.duration || '',
          budgetRange: project.budgetRange || '',
          applicationDeadline: formatDateForInput(project.applicationDeadline),
          // Contract fields
          deliverables: deliverablesString,
          budgetAmount: project.budgetAmount ? String(project.budgetAmount) : '',
          budgetCurrency: (project.budgetCurrency || 'EUR') as any,
          startDate: project.startDate || '',
          endDate: project.endDate || '',
          workMode: (project.workMode || '') as any,
          paymentTerms: project.paymentTerms || '',
          ndaRequired: project.specialConditions?.ndaRequired || false,
          insuranceRequired: project.specialConditions?.insuranceRequired || false,
          travelExpenses: project.specialConditions?.travelExpenses || false,
          equipmentProvided: project.specialConditions?.equipmentProvided || false,
        };
        setInitialProjectData(formData);
        form.reset(formData); // Populate the form
      } else {
        setError("Progetto non trovato o non hai i permessi per modificarlo.");
        setInitialProjectData(null);
      }
    } catch (e: any) {
      console.error("Error fetching project for edit:", e);
      setError(e.message.includes('offline') ? "Connessione persa. Controlla la tua rete." : "Errore nel caricamento dei dati del progetto.");
    } finally {
      setLoadingData(false);
    }
  }, [projectId, db, user, form]);

  useEffect(() => {
    if (user && !authLoading) {
        fetchProjectData();
    } else if (!authLoading && !user) {
        router.push(ROUTES.LOGIN); // Redirect if not logged in
    }
  }, [user, authLoading, fetchProjectData, router]);


  const onSubmit = async (data: ProjectFormData) => {
    if (!user || !userProfile || userProfile.role !== 'company' || !projectId) {
      showToast({ title: "Errore", description: "Azione non permessa.", variant: "destructive" });
      return;
    }

    try {
      let projectImageUrl = currentProjectImageUrl; // Keep current by default

      // Upload new image if one was selected
      if (projectImageFile && storage) {
        setUploadingImage(true);
        toast.loading('Caricamento immagine...', { id: 'upload-image' });

        try {
          const storageRef = ref(storage, `projectImages/${user.uid}/${Date.now()}_${projectImageFile.name}`);
          const uploadResult = await uploadBytes(storageRef, projectImageFile);
          projectImageUrl = await getDownloadURL(uploadResult.ref);

          // Delete old image if exists
          if (currentProjectImageUrl && currentProjectImageUrl.includes('firebase')) {
            const oldImageRef = ref(storage, currentProjectImageUrl);
            await deleteObject(oldImageRef).catch((err) => {
              console.warn('Could not delete old image:', err);
            });
          }

          toast.success('Immagine aggiornata!', { id: 'upload-image' });
        } catch (uploadError) {
          console.error('Error uploading project image:', uploadError);
          toast.error('Errore durante upload immagine', { id: 'upload-image' });
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Process deliverables (split by newlines)
      const deliverablesArray = data.deliverables
        ? data.deliverables.split('\n').filter(d => d.trim() !== '')
        : [];

      // Process budget amount
      const budgetAmountNumber = data.budgetAmount && data.budgetAmount !== ''
        ? parseFloat(data.budgetAmount)
        : undefined;

      const projectRef = doc(db, "projects", projectId);
      const dataToUpdate: Partial<Project> = {
        ...data,
        projectImage: projectImageUrl || undefined, // Add updated image URL
        applicationDeadline: data.applicationDeadline && data.applicationDeadline !== '' ? new Date(data.applicationDeadline) : null,
        updatedAt: serverTimestamp(),
        // Process contract-specific fields
        deliverables: deliverablesArray.length > 0 ? deliverablesArray : undefined,
        budgetAmount: budgetAmountNumber,
        budgetCurrency: budgetAmountNumber ? 'EUR' : undefined,
        startDate: data.startDate && data.startDate !== '' ? data.startDate : undefined,
        endDate: data.endDate && data.endDate !== '' ? data.endDate : undefined,
        workMode: data.workMode && data.workMode !== '' ? data.workMode : undefined,
        paymentTerms: data.paymentTerms && data.paymentTerms !== '' ? data.paymentTerms : undefined,
        specialConditions: {
          ndaRequired: data.ndaRequired || false,
          insuranceRequired: data.insuranceRequired || false,
          travelExpenses: data.travelExpenses || false,
          equipmentProvided: data.equipmentProvided || false,
        },
      };

      await updateDoc(projectRef, dataToUpdate);
      showToast({ title: "Progetto Aggiornato!", description: `Il progetto "${data.title}" è stato modificato.` });
      router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS);
    } catch (error: any) {
      console.error("Error updating project:", error);
      showToast({ title: "Errore Aggiornamento", description: error.message || "Impossibile aggiornare il progetto.", variant: "destructive" });
    }
  };
  
  const projectTypeOptions = [
    { value: "full-time", label: "Full-time (Dipendente)" },
    { value: "part-time", label: "Part-time (Dipendente)" },
    { value: "collaborazione-piva", label: "Collaborazione P.IVA" },
    { value: "stage-tirocinio", label: "Stage/Tirocinio" },
    { value: "determinato", label: "Contratto a Tempo Determinato" },
    { value: "indeterminato", label: "Contratto a Tempo Indeterminato" },
  ];


  if (authLoading || loadingData) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Card>
          <CardHeader><Skeleton className="h-7 w-1/2" /><Skeleton className="h-4 w-3/4 mt-1" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-9 w-24 mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center border-2 border-dashed border-destructive/50 bg-destructive/5 rounded-lg">
        <WifiOff className="mx-auto h-12 w-12 text-destructive mb-3" />
        <p className="text-lg font-semibold text-destructive mb-1">Errore di Caricamento</p>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai Miei Progetti
        </Button>
      </div>
    );
  }

  if (!initialProjectData) {
     return (
      <div className="container mx-auto px-4 py-8 text-center border-2 border-dashed border-border rounded-lg">
        <Info className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-lg font-semibold mb-1">Progetto non Trovato.</p>
        <p className="text-muted-foreground text-sm mb-4">Impossibile caricare i dati per la modifica.</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai Miei Progetti
        </Button>
      </div>
    );
  }
  

  return (
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4">
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Modifica Progetto: {projectTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">Aggiorna i dettagli del tuo progetto BIM</p>
            </div>
            <Button variant="outline" onClick={() => router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai Progetti
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Tabs defaultValue="info-principali" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="info-principali">Info Principali</TabsTrigger>
                  <TabsTrigger value="requisiti">Requisiti</TabsTrigger>
                  <TabsTrigger value="dettagli-contratto">Dettagli Contratto</TabsTrigger>
                </TabsList>

                <TabsContent value="info-principali" className="space-y-4">
                  <FormInput control={form.control} name="title" label="Titolo del Progetto" placeholder="Es. Modellatore BIM per Progetto Residenziale" />
                  <FormSingleSelect
                    key={`location-${form.watch('location') || 'initial'}`}
                    control={form.control}
                    name="location"
                    label="Localizzazione del Progetto (Regione)"
                    options={ITALIAN_REGIONS.map(r => ({ value: r, label: r }))}
                    placeholder="Seleziona la regione del progetto"
                  />

                  {/* Project Image Upload/Edit */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Immagine Progetto (opzionale)
                      <span className="text-xs text-muted-foreground ml-2 font-normal">
                        Consigliata: 1200×630px
                      </span>
                    </Label>

                    {/* Show current image if exists and no new preview */}
                    {currentProjectImageUrl && !projectImagePreview && (
                      <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden border border-border bg-muted">
                        <img
                          src={currentProjectImageUrl}
                          alt="Immagine progetto corrente"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 shadow-lg"
                          onClick={handleDeleteCurrentImage}
                          type="button"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Elimina
                        </Button>
                      </div>
                    )}

                    {/* Show new image preview if exists */}
                    {projectImagePreview && (
                      <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden border border-primary bg-muted">
                        <img
                          src={projectImagePreview}
                          alt="Anteprima nuova immagine"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 shadow-lg"
                          onClick={handleRemoveImage}
                          type="button"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rimuovi
                        </Button>
                      </div>
                    )}

                    {/* File input */}
                    <Input
                      id="projectImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                      className="cursor-pointer"
                    />

                    <p className="text-xs text-muted-foreground">
                      {currentProjectImageUrl && !projectImagePreview
                        ? 'Seleziona una nuova immagine per sostituire quella corrente'
                        : 'Formato: JPG, PNG, WebP. Max 5MB. Dimensioni consigliate: 1200×630px (ratio 1.91:1)'}
                    </p>
                  </div>

                  <FormTextarea control={form.control} name="description" label="Descrizione Dettagliata del Progetto" placeholder="Descrivi gli obiettivi, le responsabilità, il contesto del progetto..." rows={6} />
                </TabsContent>

                <TabsContent value="requisiti" className="space-y-4">
                  <FormMultiSelect
                    key={`requiredSkills-${JSON.stringify(form.watch('requiredSkills'))}`}
                    control={form.control}
                    name="requiredSkills"
                    label="Competenze BIM Richieste"
                    options={BIM_SKILLS_OPTIONS}
                    placeholder="Seleziona le competenze necessarie"
                  />
                  <FormMultiSelect
                    key={`requiredSoftware-${JSON.stringify(form.watch('requiredSoftware'))}`}
                    control={form.control}
                    name="requiredSoftware"
                    label="Software Richiesti"
                    options={SOFTWARE_PROFICIENCY_OPTIONS}
                    placeholder="Indica i software che il professionista deve conoscere"
                  />
                </TabsContent>

                <TabsContent value="dettagli-contratto" className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">
                      💡 Dettagli Contrattuali per Generazione AI
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      Compilare questi campi faciliterà la generazione automatica dei contratti tramite AI. Più informazioni fornisci, più preciso sarà il contratto generato.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSingleSelect
                      key={`projectType-${form.watch('projectType') || 'initial'}`}
                      control={form.control}
                      name="projectType"
                      label="Tipo di Contratto/Collaborazione"
                      options={projectTypeOptions}
                      placeholder="Seleziona il tipo di contratto"
                    />
                    <FormInput control={form.control} name="duration" label="Durata Progetto/Contratto (Opzionale)" placeholder="Es. 6 mesi, Indeterminato" />
                  </div>

                  {/* Budget Details */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Budget e Compenso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput control={form.control} name="budgetRange" label="Range di Budget (Pubblico)" placeholder="Es. €30k-€40k, €40-€60/ora" />
                      <FormInput control={form.control} name="budgetAmount" label="Importo Preciso (Privato, per contratti)" placeholder="Es. 5000" type="number" />
                    </div>
                    <FormInput control={form.control} name="paymentTerms" label="Termini di Pagamento (Opzionale)" placeholder="Es. 30 giorni dalla fattura" />
                  </div>

                  {/* Project Dates and Deliverables */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Date e Deliverables</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput control={form.control} name="startDate" label="Data Inizio Prevista (Opzionale)" type="date" />
                      <FormInput control={form.control} name="endDate" label="Data Fine Prevista (Opzionale)" type="date" />
                    </div>
                    <FormInput control={form.control} name="applicationDeadline" label="Scadenza Candidature (Opzionale)" type="date" />
                    <FormTextarea
                      control={form.control}
                      name="deliverables"
                      label="Deliverables Specifici (Opzionale, uno per riga)"
                      placeholder="Es.&#10;Modello BIM architettonico LOD 300 formato IFC&#10;Elaborati grafici 2D estratti da modello&#10;Clash detection report"
                      rows={5}
                    />
                  </div>

                  {/* Work Mode */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Modalità Lavoro</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Modalità (Opzionale)</label>
                      <select
                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                        value={form.watch('workMode') || ''}
                        onChange={e => form.setValue('workMode', e.target.value as any)}
                      >
                        <option value="">-- Seleziona modalità --</option>
                        <option value="remoto">Remoto</option>
                        <option value="ibrido">Ibrido</option>
                        <option value="presenza">Presenza</option>
                      </select>
                    </div>
                  </div>

                  {/* Special Conditions */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Condizioni Speciali (Opzionali)</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={form.watch('ndaRequired') || false}
                          onChange={e => form.setValue('ndaRequired', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">NDA Richiesto</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={form.watch('insuranceRequired') || false}
                          onChange={e => form.setValue('insuranceRequired', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Assicurazione RC Obbligatoria</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={form.watch('travelExpenses') || false}
                          onChange={e => form.setValue('travelExpenses', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Spese Viaggio Rimborsabili</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={form.watch('equipmentProvided') || false}
                          onChange={e => form.setValue('equipmentProvided', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Attrezzatura Fornita</span>
                      </label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full md:w-auto mt-3 bg-[#008080] hover:bg-[#006666]" size="default" disabled={form.formState.isSubmitting || loadingData || uploadingImage}>
                <Save className="mr-2 h-5 w-5" />
                {uploadingImage ? 'Caricamento Immagine...' : (form.formState.isSubmitting ? 'Salvataggio...' : 'Salva Modifiche Progetto')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

