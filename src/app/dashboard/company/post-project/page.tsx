
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
import { ROUTES, BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, ITALIAN_REGIONS } from '@/constants';
import { useToast } from '@/hooks/use-toast';
// Firestore imports for adding project
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Storage imports for image upload
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';


const projectSchema = z.object({
  title: z.string().min(5, { message: 'Il titolo del progetto deve contenere almeno 5 caratteri.' }),
  location: z.string().min(1, { message: 'La localizzazione del progetto è richiesta.' }),
  description: z.string().min(50, { message: 'La descrizione deve essere di almeno 50 caratteri.' }).max(5000, 'La descrizione non può superare i 5000 caratteri.'),
  requiredSkills: z.array(z.string()).min(1, { message: 'Seleziona almeno una competenza richiesta.' }),
  requiredSoftware: z.array(z.string()).min(1, { message: 'Seleziona almeno un software richiesto.' }),
  projectType: z.string().min(1, "Il tipo di progetto è richiesto."), // e.g., Full-time, Part-time, Contract
  duration: z.string().optional().or(z.literal('')), // e.g., 3 mesi, 6+ mesi, Indeterminato
  budgetRange: z.string().optional().or(z.literal('')), // e.g., €X - €Y, Da definire
  applicationDeadline: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)) || val === '', { message: "Data non valida" }),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function PostProjectPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { db, storage } = useFirebase(); // Get Firestore and Storage instances
  const router = useRouter();
  const { toast: showToast } = useToast();

  // Image upload state
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectImagePreview, setProjectImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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

    const error = validateImage(file);
    if (error) {
      toast.error(error);
      return;
    }

    setProjectImageFile(file);
    setProjectImagePreview(URL.createObjectURL(file));
  };

  // Remove image
  const handleRemoveImage = () => {
    setProjectImageFile(null);
    if (projectImagePreview) {
      URL.revokeObjectURL(projectImagePreview);
    }
    setProjectImagePreview(null);
  };

  const onSubmit = async (data: ProjectFormData) => {
    if (!user || !userProfile || userProfile.role !== 'company') {
      showToast({ title: "Errore", description: "Devi essere un'azienda autenticata per pubblicare un progetto.", variant: "destructive" });
      return;
    }

    try {
      let projectImageUrl: string | undefined = undefined;

      // Upload image if present
      if (projectImageFile && storage) {
        setUploadingImage(true);
        toast.loading('Caricamento immagine...', { id: 'upload-image' });

        try {
          const storageRef = ref(storage, `projectImages/${user.uid}/${Date.now()}_${projectImageFile.name}`);
          const uploadResult = await uploadBytes(storageRef, projectImageFile);
          projectImageUrl = await getDownloadURL(uploadResult.ref);

          toast.success('Immagine caricata!', { id: 'upload-image' });
        } catch (uploadError) {
          console.error('Error uploading project image:', uploadError);
          toast.error('Errore durante upload immagine', { id: 'upload-image' });
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      const projectData = {
        ...data,
        companyId: user.uid,
        companyName: userProfile.companyName || userProfile.displayName,
        companyLogo: (userProfile as any).logoUrl || '',
        projectImage: projectImageUrl, // Add project image URL
        status: 'attivo',
        postedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        applicationDeadline: data.applicationDeadline && data.applicationDeadline !== '' ? new Date(data.applicationDeadline) : null,
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);
      showToast({ title: "Progetto Pubblicato!", description: `Il tuo progetto "${data.title}" è ora online.` });
      router.push(ROUTES.DASHBOARD_COMPANY_PROJECTS);
    } catch (error: any) {
      console.error("Error posting project:", error);
      showToast({ title: "Errore Pubblicazione", description: error.message || "Impossibile pubblicare il progetto.", variant: "destructive" });
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
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4">
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-gray-900">Pubblica Nuovo Progetto</h1>
            <p className="text-sm text-gray-600 mt-1">Trova i professionisti BIM ideali</p>
          </div>
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
                    control={form.control}
                    name="location"
                    label="Localizzazione del Progetto (Regione)"
                    options={ITALIAN_REGIONS.map(r => ({ value: r, label: r }))}
                    placeholder="Seleziona la regione del progetto"
                  />

                  {/* Project Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="projectImage" className="text-sm font-medium">
                      Immagine Progetto (opzionale)
                      <span className="text-xs text-muted-foreground ml-2 font-normal">
                        Consigliata: 1200×630px
                      </span>
                    </Label>
                    <Input
                      id="projectImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                      className="cursor-pointer"
                    />

                    {/* Image Preview */}
                    {projectImagePreview && (
                      <div className="relative w-full h-48 mt-2 rounded-lg overflow-hidden border border-border bg-muted">
                        <img
                          src={projectImagePreview}
                          alt="Anteprima immagine progetto"
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

                    <p className="text-xs text-muted-foreground">
                      Formato: JPG, PNG, WebP. Max 5MB. Dimensioni consigliate: 1200×630px (ratio 1.91:1)
                    </p>
                  </div>

                  <FormTextarea control={form.control} name="description" label="Descrizione Dettagliata del Progetto" placeholder="Descrivi gli obiettivi, le responsabilità, il contesto del progetto..." rows={6} />
                </TabsContent>

                <TabsContent value="requisiti" className="space-y-4">
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
                </TabsContent>

                <TabsContent value="dettagli-contratto" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSingleSelect
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

              <Button type="submit" className="w-full md:w-auto mt-3 bg-[#008080] hover:bg-[#006666]" size="default" disabled={authLoading || form.formState.isSubmitting}>
                <Save className="mr-2 h-5 w-5" />
                {form.formState.isSubmitting ? 'Pubblicazione...' : 'Pubblica Progetto'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
