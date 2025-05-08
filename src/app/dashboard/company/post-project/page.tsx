'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { FolderPlus, Save } from 'lucide-react';
import { FormInput, FormTextarea, FormMultiSelect, FormSingleSelect } from '@/components/ProfileFormElements';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, AVAILABILITY_OPTIONS, ITALIAN_REGIONS } from '@/constants';
import { useToast } from '@/hooks/use-toast';
// Firestore imports for adding project
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';


const projectSchema = z.object({
  title: z.string().min(5, { message: 'Il titolo del progetto deve contenere almeno 5 caratteri.' }),
  location: z.string().min(1, { message: 'La localizzazione del progetto è richiesta.' }),
  description: z.string().min(50, { message: 'La descrizione deve essere di almeno 50 caratteri.' }).max(5000, 'La descrizione non può superare i 5000 caratteri.'),
  requiredSkills: z.array(z.string()).min(1, { message: 'Seleziona almeno una competenza richiesta.' }),
  requiredSoftware: z.array(z.string()).min(1, { message: 'Seleziona almeno un software richiesto.' }),
  projectType: z.string().min(1, "Il tipo di progetto è richiesto."), // e.g., Full-time, Part-time, Contract
  duration: z.string().optional().or(z.literal('')), // e.g., 3 mesi, 6+ mesi, Indeterminato
  budgetRange: z.string().optional().or(z.literal('')), // e.g., €X - €Y, Da definire
  applicationDeadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Data non valida" }),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function PostProjectPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db } = useFirebase(); // Get Firestore instance
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
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
  
  const onSubmit = async (data: ProjectFormData) => {
    if (!user || !userProfile || userProfile.role !== 'company') {
      toast({ title: "Errore", description: "Devi essere un'azienda autenticata per pubblicare un progetto.", variant: "destructive" });
      return;
    }

    try {
      const projectData = {
        ...data,
        companyId: user.uid,
        companyName: userProfile.companyName || userProfile.displayName,
        companyLogo: (userProfile as any).logoUrl || '', // Assuming logoUrl is on company profile
        status: 'attivo', // Default status
        postedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);
      toast({ title: "Progetto Pubblicato!", description: `Il tuo progetto "${data.title}" è ora online.` });
      router.push(`${ROUTES.DASHBOARD_COMPANY_PROJECTS}`); // Redirect to company's project list
    } catch (error: any) {
      console.error("Error posting project:", error);
      toast({ title: "Errore Pubblicazione", description: error.message || "Impossibile pubblicare il progetto.", variant: "destructive" });
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


  if (authLoading) {
    return <div className="text-center py-10">Caricamento...</div>;
  }
  if (!userProfile || userProfile.role !== 'company') {
    return <div className="text-center py-10">Accesso non autorizzato. Devi essere un'azienda per pubblicare progetti.</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FolderPlus className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Pubblica un Nuovo Progetto BIM</CardTitle>
              <CardDescription>Descrivi il tuo progetto per trovare i professionisti BIM più adatti.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormInput control={form.control} name="title" label="Titolo del Progetto" placeholder="Es. Modellatore BIM per Progetto Residenziale" />
              
              <FormSingleSelect
                control={form.control}
                name="location"
                label="Localizzazione del Progetto (Regione)"
                options={ITALIAN_REGIONS.map(r => ({ value: r, label: r }))}
                placeholder="Seleziona la regione del progetto"
              />
              
              <FormTextarea control={form.control} name="description" label="Descrizione Dettagliata del Progetto" placeholder="Descrivi gli obiettivi, le responsabilità, il contesto del progetto..." rows={8} />
              
              <FormMultiSelect
                control={form.control}
                name="requiredSkills"
                label="Competenze BIM Richieste"
                options={BIM_SKILLS_OPTIONS}
                placeholder="Seleziona le competenze necessarie"
              />
              
              <FormMultiSelect
                control={form.control}
                name="requiredSoftware"
                label="Software Richiesti"
                options={SOFTWARE_PROFICIENCY_OPTIONS}
                placeholder="Indica i software che il professionista deve conoscere"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSingleSelect
                  control={form.control}
                  name="projectType"
                  label="Tipo di Contratto/Collaborazione"
                  options={projectTypeOptions}
                  placeholder="Seleziona il tipo di contratto"
                />
                 <FormInput control={form.control} name="duration" label="Durata Progetto/Contratto (Opzionale)" placeholder="Es. 6 mesi, Indeterminato" />
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput control={form.control} name="budgetRange" label="Range di Budget/RAL (Opzionale)" placeholder="Es. €30k-€40k RAL, €40-€60/ora" />
                <FormInput control={form.control} name="applicationDeadline" label="Scadenza Candidature (Opzionale)" type="date" />
              </div>
              
              <Button type="submit" className="w-full md:w-auto" disabled={authLoading || form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {form.formState.isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica Progetto'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
