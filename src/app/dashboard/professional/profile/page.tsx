
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
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';


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
  hourlyRate: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const strVal = String(val).trim();
      if (strVal === "") return undefined;
      const num = Number(strVal);
      return isNaN(num) ? strVal : num;
    },
    z.number({invalid_type_error: 'La tariffa oraria deve essere un numero valido.'}).positive({ message: 'La tariffa oraria deve essere un numero positivo.' }).optional()
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
      hourlyRate: undefined,
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
        hourlyRate: currentProfile.hourlyRate === undefined || currentProfile.hourlyRate === null ? undefined : Number(currentProfile.hourlyRate),
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
          toast({ title: "Formato File Non Valido", description: "Seleziona un file immagine (es. JPG, PNG).", variant: "destructive"});
          event.target.value = '';
          return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          toast({ title: "File Troppo Grande", description: "L'immagine non deve superare i 2MB.", variant: "destructive"});
          event.target.value = '';
          return;
      }
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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

    setIsUploading(true);
    setUploadProgress(0); // Initialize progress to 0

    let photoURLToUpdate = userProfile.photoURL || '';

    if (profileImageFile && storage) {
      const filePath = `profileImages/${user.uid}/${Date.now()}_${profileImageFile.name}`;
      const fileRef = storageRef(storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, profileImageFile);

      try {
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done. State: ' + snapshot.state);
              setUploadProgress(progress);
              switch (snapshot.state) {
                case 'paused':
                  console.log('Upload is paused');
                  break;
                case 'running':
                  console.log('Upload is running');
                  break;
              }
            },
            (error: any) => {
              console.error('Upload failed:', error);
              console.error('Upload failed with error code:', error.code, 'Message:', error.message, 'Full error object:', error);
              let userFriendlyMessage = "Errore durante il caricamento dell'immagine.";
              switch (error.code) {
                case 'storage/unauthorized':
                  userFriendlyMessage = "Non hai i permessi per caricare questo file. Controlla le regole di Firebase Storage.";
                  break;
                case 'storage/canceled':
                  userFriendlyMessage = "Caricamento annullato.";
                  break;
                case 'storage/unknown':
                  userFriendlyMessage = "Errore sconosciuto durante il caricamento. Riprova o controlla la console per dettagli.";
                  break;
                default:
                   userFriendlyMessage = `Errore: ${error.message}`;
              }
              toast({ title: "Errore Caricamento Immagine", description: userFriendlyMessage, variant: "destructive" });
              setUploadProgress(null);
              setIsUploading(false);
              reject(error);
            },
            async () => {
              try {
                photoURLToUpdate = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at', photoURLToUpdate);
                resolve();
              } catch (getUrlError: any) {
                 console.error('Failed to get download URL', getUrlError);
                 toast({ title: "Errore URL Immagine", description: (getUrlError as Error).message, variant: "destructive" });
                 setIsUploading(false);
                 reject(getUrlError);
              }
            }
          );
        });
      } catch (uploadError) {
          // Error is handled in the uploadTask's error callback, this catch might be redundant for upload-specific errors
          // but can catch other synchronous errors in the try block.
          console.error('Outer catch for upload process:', uploadError);
          if (isUploading) setIsUploading(false); // Ensure uploading state is reset
          if (uploadProgress === 0) setUploadProgress(null); // Clear progress if it never started
          return;
      }
    }

    const updatedDisplayName = `${data.firstName || userProfile.firstName || ''} ${data.lastName || userProfile.lastName || ''}`.trim();

    const dataToUpdate : Partial<ProfessionalProfile> = {
      ...data,
      displayName: updatedDisplayName || userProfile.displayName,
      photoURL: photoURLToUpdate,
      hourlyRate: data.hourlyRate === undefined || data.hourlyRate === null || String(data.hourlyRate).trim() === '' ? undefined : Number(data.hourlyRate),
    };

    try {
      await updateUserProfile(user.uid, dataToUpdate);
      setProfileImageFile(null); // Clear the selected file after successful update
      // Toast for profile update is handled by updateUserProfile
    } catch (error) {
      // Toast for profile update error is handled by updateUserProfile
      console.error('Profile update failed on page:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(null); // Reset progress after submission attempt (success or fail)
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
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserCircle2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Il Mio Profilo Professionale</CardTitle>
              <CardDescription>Mantieni aggiornate le tue informazioni per attrarre le migliori opportunità.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormItem>
                <FormLabel>Immagine del Profilo</FormLabel>
                <div className="flex items-center space-x-4 mt-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={imagePreview || userProfile.photoURL || undefined} alt={userProfile.displayName || 'User'} data-ai-hint="profile person" />
                    <AvatarFallback>{getInitials(userProfile.displayName)}</AvatarFallback>
                  </Avatar>
                  <FormControl>
                     <Input
                        type="file"
                        accept="image/jpeg, image/png, image/webp, image/gif"
                        onChange={handleFileChange}
                        className="max-w-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                  </FormControl>
                </div>
                {isUploading && uploadProgress !== null && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Caricamento: {Math.round(uploadProgress)}%</p>
                  </div>
                )}
                 {!isUploading && uploadProgress === null && profileImageFile && (
                   <p className="text-xs text-green-600 mt-1">Nuova immagine selezionata. Salva per applicare.</p>
                 )}
                <FormDescription className="mt-1">Carica un&apos;immagine (max 2MB, es. JPG, PNG).</FormDescription>
                <FormMessage />
              </FormItem>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormTextarea control={form.control} name="bio" label="Breve Bio Professionale" placeholder="Descrivi la tua esperienza, specializzazioni e obiettivi..." rows={5} />

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSingleSelect
                  control={form.control}
                  name="availability"
                  label="Disponibilità"
                  options={AVAILABILITY_OPTIONS}
                  placeholder="Seleziona la tua disponibilità"
                />
                <FormSingleSelect
                  control={form.control}
                  name="experienceLevel"
                  label="Livello di Esperienza"
                  options={EXPERIENCE_LEVEL_OPTIONS}
                  placeholder="Seleziona il tuo livello"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput control={form.control} name="portfolioUrl" label="Link al Portfolio (Opzionale)" placeholder="https://tuo.portfolio.com" />
                <FormInput control={form.control} name="cvUrl" label="Link al CV (Opzionale)" placeholder="Link a Google Drive, Dropbox, etc." description="Assicurati che il link sia accessibile." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput control={form.control} name="linkedInProfile" label="Profilo LinkedIn (Opzionale)" placeholder="https://linkedin.com/in/tuoprofilo" />
                 <FormItem>
                  <FormLabel>Tariffa Oraria Indicativa (€) (Opzionale)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Es. 50"
                      {...form.register("hourlyRate", {
                          setValueAs: (value) => value === "" ? undefined : Number(value),
                       })}
                      defaultValue={form.getValues('hourlyRate') ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={authLoading || form.formState.isSubmitting || isUploading}>
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

