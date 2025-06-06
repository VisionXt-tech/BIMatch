
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
  const { db } = useFirebase();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const projectId = typeof params?.projectId === 'string' ? params.projectId : null;

  const [initialProjectData, setInitialProjectData] = useState<ProjectFormData | null>(null);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    },
  });

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
      toast({ title: "Errore", description: "Azione non permessa.", variant: "destructive" });
      return;
    }

    try {
      const projectRef = doc(db, "projects", projectId);
      const dataToUpdate: Partial<Project> = {
        ...data,
        applicationDeadline: data.applicationDeadline && data.applicationDeadline !== '' ? new Date(data.applicationDeadline) : null,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(projectRef, dataToUpdate);
      toast({ title: "Progetto Aggiornato!", description: `Il progetto "${data.title}" è stato modificato.` });
      router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS);
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({ title: "Errore Aggiornamento", description: error.message || "Impossibile aggiornare il progetto.", variant: "destructive" });
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
    <div className="space-y-4">
       <Button variant="outline" size="sm" onClick={() => router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS)} className="mb-0">
        <ArrowLeft className="mr-2 h-4 w-4" /> Torna ai Miei Progetti
      </Button>
      <Card className="shadow-xl">
        <CardHeader className="p-4">
          <div className="flex items-center space-x-3">
            <Edit3 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Modifica Progetto: {projectTitle}</CardTitle>
              <CardDescription className="text-xs">Aggiorna i dettagli del tuo progetto BIM.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
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

                <TabsContent value="dettagli-contratto" className="space-y-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput control={form.control} name="budgetRange" label="Range di Budget/RAL (Opzionale)" placeholder="Es. €30k-€40k RAL, €40-€60/ora" />
                    <FormInput control={form.control} name="applicationDeadline" label="Scadenza Candidature (Opzionale)" type="date" />
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full md:w-auto mt-6" size="sm" disabled={form.formState.isSubmitting || loadingData}>
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Salvataggio in corso...' : 'Salva Modifiche Progetto'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

