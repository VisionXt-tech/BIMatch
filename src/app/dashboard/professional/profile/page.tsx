
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, UserCircle2 } from 'lucide-react';
import type { ProfessionalProfile } from '@/types/auth';
import { FormInput, FormTextarea, FormMultiSelect, FormSingleSelect } from '@/components/ProfileFormElements';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, AVAILABILITY_OPTIONS, ITALIAN_REGIONS, EXPERIENCE_LEVEL_OPTIONS } from '@/constants';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const professionalProfileSchema = z.object({
  firstName: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri.' }).optional(),
  lastName: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri.' }).optional(),
  displayName: z.string().min(2, "Il nome visualizzato è richiesto.").optional(),
  location: z.string().min(1, { message: 'La localizzazione è richiesta.' }).optional(),
  bio: z.string().max(1000, "La bio non può superare i 1000 caratteri.").optional().or(z.literal('')),
  bimSkills: z.array(z.string()).optional(),
  softwareProficiency: z.array(z.string()).optional(),
  availability: z.string().optional().or(z.literal('')),
  experienceLevel: z.string().optional().or(z.literal('')),
  portfolioUrl: z.string().url({ message: 'Inserisci un URL valido per il portfolio.' }).optional().or(z.literal('')),
  cvUrl: z.string().url({ message: 'Inserisci un URL valido per il CV (es. link a Google Drive, Dropbox).' }).optional().or(z.literal('')),
  linkedInProfile: z.string().url({message: 'Inserisci un URL valido per LinkedIn.'}).optional().or(z.literal('')),
  monthlyRate: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined; // Allow empty string to be treated as undefined
      const strVal = String(val).trim();
      if (strVal === "") return undefined; // If string is empty after trim, treat as undefined
      const num = Number(strVal);
      return isNaN(num) ? undefined : num; // If not a number, Zod will catch it with invalid_type_error
    },
    z.number({invalid_type_error: 'La retribuzione mensile deve essere un numero.'})
      .positive({ message: 'La retribuzione mensile deve essere un numero positivo.' })
      .optional()
      .nullable() // Allow null to be stored if field is emptied
  ),
});

type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;

export default function ProfessionalProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { storage } = useFirebase();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);


  const form = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      displayName: '',
      location: '',
      bio: '',
      bimSkills: [],
      softwareProficiency: [],
      availability: '',
      experienceLevel: '',
      portfolioUrl: '',
      cvUrl: '',
      linkedInProfile: '',
      monthlyRate: undefined,
    },
  });

  useEffect(() => {
    if (userProfile && userProfile.role === 'professional') {
      const currentProfile = userProfile as ProfessionalProfile;
      form.reset({
        firstName: currentProfile.firstName || '',
        lastName: currentProfile.lastName || '',
        displayName: currentProfile.displayName || `${currentProfile.firstName || ''} ${currentProfile.lastName || ''}`.trim(),
        location: currentProfile.location || '',
        bio: currentProfile.bio || '',
        bimSkills: currentProfile.bimSkills || [],
        softwareProficiency: currentProfile.softwareProficiency || [],
        availability: currentProfile.availability || '',
        experienceLevel: currentProfile.experienceLevel || '',
        portfolioUrl: currentProfile.portfolioUrl || '',
        cvUrl: currentProfile.cvUrl || '',
        linkedInProfile: currentProfile.linkedInProfile || '',
        monthlyRate: currentProfile.monthlyRate === undefined || currentProfile.monthlyRate === null ? undefined : Number(currentProfile.monthlyRate),
      });
      if (currentProfile.photoURL) {
        setImagePreview(currentProfile.photoURL);
      }
    }
  }, [userProfile, form]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
          toast({ title: "Formato File Non Valido", description: "Seleziona un file immagine (es. JPG, PNG, WEBP).", variant: "destructive"});
          event.target.value = '';
          return;
      }
      if (file.size > 2 * 1024 * 1024) {
          toast({ title: "File Troppo Grande", description: "L'immagine non deve superare i 2MB.", variant: "destructive"});
          event.target.value = '';
          return;
      }
      if (file.size === 0) {
        toast({ title: "File Vuoto", description: "Il file selezionato è vuoto e non può essere caricato.", variant: "destructive" });
        event.target.value = '';
        return;
      }
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadProgress(null); // Reset progress for new file
      setIsUploading(false); // Reset uploading state for new file
    } else {
      setProfileImageFile(null);
      setImagePreview(userProfile?.photoURL || null);
    }
  };

  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user || !userProfile) {
      toast({ title: "Errore", description: "Utente non autenticato.", variant: "destructive" });
      return;
    }

    let photoURLToUpdate = userProfile.photoURL || '';

    if (profileImageFile && storage) {
      setIsUploading(true);
      setUploadProgress(0);
      const filePath = `profileImages/${user.uid}/${Date.now()}_${profileImageFile.name}`;
      const fileRef = storageRef(storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, profileImageFile);

      try {
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progressPercentage = snapshot.totalBytes > 0
                ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                : 0;
              setUploadProgress(progressPercentage);
            },
            (error: any) => {
              let userFriendlyMessage = "Errore durante il caricamento dell'immagine.";
              switch (error.code) {
                case 'storage/unauthorized':
                  userFriendlyMessage = "Non hai i permessi per caricare questo file.";
                  break;
                case 'storage/canceled':
                  userFriendlyMessage = "Caricamento annullato.";
                  break;
                default:
                   userFriendlyMessage = `Errore caricamento: ${error.message || 'Vedi console.'}`;
              }
              toast({ title: "Errore Caricamento Immagine", description: userFriendlyMessage, variant: "destructive" });
              setIsUploading(false);
              setUploadProgress(null);
              reject(error); // Reject the promise on error
            },
            async () => {
              try {
                photoURLToUpdate = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(); // Resolve the promise on successful upload and URL retrieval
              } catch (getUrlError: any) {
                 toast({ title: "Errore URL Immagine", description: `Impossibile ottenere l'URL dell'immagine: ${getUrlError.message}`, variant: "destructive" });
                 setIsUploading(false); // Ensure these are reset here too
                 setUploadProgress(null);
                 reject(getUrlError); // Reject the promise if getDownloadURL fails
              }
            }
          );
        });
      } catch (uploadError) {
        // This catch block will handle rejections from the promise created above
        // Error is already toasted in the error callback of uploadTask.on or getDownloadURL catch
        // Ensure uploading state is reset if we bail out here
        setIsUploading(false);
        setUploadProgress(null);
        return; // Stop submission if upload failed
      }
    }


    const updatedDisplayName = `${data.firstName || userProfile.firstName || ''} ${data.lastName || userProfile.lastName || ''}`.trim();

    const dataToUpdate : Partial<ProfessionalProfile> = {
      ...data,
      displayName: updatedDisplayName || userProfile.displayName,
      photoURL: photoURLToUpdate,
      // Ensure monthlyRate is either a number or null (for Firestore)
      // If undefined or empty string from form, it becomes null
      monthlyRate: data.monthlyRate === undefined || data.monthlyRate === null || String(data.monthlyRate).trim() === '' ? null : Number(data.monthlyRate),
    };

    try {
      await updateUserProfile(user.uid, dataToUpdate);
      // Toast for profile update success is handled within updateUserProfile
      setProfileImageFile(null); // Reset file input state after successful submission
    } catch (error) {
      // Error toast is handled within updateUserProfile
    } finally {
      // Reset uploading state regardless of profile update success, if an upload was attempted
      if (profileImageFile) {
        setIsUploading(false);
        setUploadProgress(null);
      }
    }
  };


  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'P';
    const names = name.split(' ');
    if (names.length > 1 && names[0] && names[names.length - 1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };


  if (authLoading) {
    return <div className="text-center py-10">Caricamento profilo...</div>;
  }

  if (!userProfile || userProfile.role !== 'professional') {
    return <div className="text-center py-10">Profilo non trovato o non autorizzato.</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-xl">
        <CardHeader className="p-4">
          <div className="flex items-center space-x-3">
            <UserCircle2 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-lg font-bold">Il Mio Profilo Professionale</CardTitle>
              <CardDescription className="text-xs">Mantieni aggiornate le tue informazioni per attrarre le migliori opportunità.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
                <FormLabel className="text-xs">Immagine del Profilo</FormLabel>
                <div className="flex items-center space-x-4 mt-1">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={imagePreview || userProfile.photoURL || undefined} alt={userProfile.displayName || 'User'} data-ai-hint="profile person" />
                    <AvatarFallback className="text-2xl">{getInitials(userProfile.displayName)}</AvatarFallback>
                  </Avatar>
                  <FormControl>
                     <Input
                        type="file"
                        accept="image/jpeg, image/png, image/webp"
                        onChange={handleFileChange}
                        className="max-w-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 h-9"
                      />
                  </FormControl>
                </div>
                {isUploading && uploadProgress !== null && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="w-full h-1.5" />
                    <p className="text-xs text-muted-foreground mt-0.5">Caricamento: {Math.round(uploadProgress)}%</p>
                  </div>
                )}
                 {!isUploading && uploadProgress === null && profileImageFile && (
                   <p className="text-xs text-green-600 mt-0.5">Nuova immagine selezionata. Salva per applicare.</p>
                 )}
                <FormDescription className="text-xs mt-0.5">Carica un&apos;immagine (max 2MB, es. JPG, PNG, WEBP).</FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>

              <Tabs defaultValue="info-personali" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="info-personali">Info Personali</TabsTrigger>
                  <TabsTrigger value="bio-competenze">Competenze</TabsTrigger>
                  <TabsTrigger value="dettagli-link">Economia e Link</TabsTrigger>
                </TabsList>

                <TabsContent value="info-personali" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                     <FormInput control={form.control} name="firstName" label="Nome" placeholder="Mario" />
                     <FormInput control={form.control} name="lastName" label="Cognome" placeholder="Rossi" />
                  </div>
                  <FormSingleSelect
                    control={form.control}
                    name="location"
                    label="Localizzazione (Regione Principale)"
                    options={ITALIAN_REGIONS.map(r => ({ value: r, label: r }))}
                    placeholder="Seleziona la tua regione principale"
                  />
                   <div className="grid md:grid-cols-2 gap-4">
                    <FormSingleSelect
                      control={form.control}
                      name="experienceLevel"
                      label="Livello di Esperienza"
                      options={EXPERIENCE_LEVEL_OPTIONS}
                      placeholder="Seleziona il tuo livello"
                    />
                    <FormSingleSelect
                      control={form.control}
                      name="availability"
                      label="Disponibilità"
                      options={AVAILABILITY_OPTIONS}
                      placeholder="Seleziona la tua disponibilità"
                    />
                  </div>
                  <FormTextarea control={form.control} name="bio" label="Breve Bio Professionale" placeholder="Descrivi la tua esperienza, specializzazioni e obiettivi..." rows={5} />
                </TabsContent>

                <TabsContent value="bio-competenze" className="space-y-4">
                  <FormMultiSelect
                    control={form.control}
                    name="bimSkills"
                    label="Competenze BIM"
                    options={BIM_SKILLS_OPTIONS}
                    placeholder="Seleziona le tue competenze BIM principali"
                  />
                  <FormMultiSelect
                    control={form.control}
                    name="softwareProficiency"
                    label="Software BIM Utilizzati"
                    options={SOFTWARE_PROFICIENCY_OPTIONS}
                    placeholder="Indica i software che conosci"
                  />
                </TabsContent>

                <TabsContent value="dettagli-link" className="space-y-4">
                   <FormItem>
                    <FormLabel className="text-xs">Retribuzione Mensile Lorda (€) (Opzionale)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Es. 2500"
                        step="1"
                        className="h-9"
                        {...form.register("monthlyRate", {
                            setValueAs: (value) => { // Ensure empty string is converted to null/undefined
                              if (value === "" || value === null || value === undefined) return null; // Treat empty as null
                              const strVal = String(value).trim();
                              if (strVal === "") return null; // If string is empty after trim, treat as null
                              const num = parseFloat(strVal);
                              return isNaN(num) ? undefined : num; // Let Zod handle if it's not a number after trying
                            }
                        })}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                  <FormInput control={form.control} name="portfolioUrl" label="Link al Portfolio (Opzionale)" placeholder="https://tuo.portfolio.com" />
                  <FormInput control={form.control} name="cvUrl" label="Link al CV (Opzionale)" placeholder="Link a Google Drive, Dropbox, etc." description="Assicurati che il link sia accessibile." />
                  <FormInput control={form.control} name="linkedInProfile" label="Profilo LinkedIn (Opzionale)" placeholder="https://linkedin.com/in/tuoprofilo" />
                </TabsContent>
              </Tabs>


              <Button type="submit" className="w-full md:w-auto mt-6" size="sm" disabled={authLoading || form.formState.isSubmitting || isUploading}>
                <Save className="mr-2 h-4 w-4" />
                {isUploading ? `Caricamento... ${uploadProgress !== null ? Math.round(uploadProgress) + '%' : ''}` : (form.formState.isSubmitting ? 'Salvataggio in corso...' : 'Salva Modifiche')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

