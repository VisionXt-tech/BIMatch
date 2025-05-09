
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
      return isNaN(num) ? strVal : num; // Keep as string if not a valid number for Zod to catch
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
    setUploadProgress(null);

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
              setUploadProgress(progress);
            },
            (error) => {
              // Firebase Storage errors (like permission denied) will be caught here.
              // Check browser console for detailed error codes from Firebase.
              console.error('Upload failed:', error);
              toast({ title: "Errore Caricamento Immagine", description: `Dettaglio: ${error.message}. Controlla la console per maggiori informazioni.`, variant: "destructive" });
              setUploadProgress(null);
              reject(error); 
            },
            async () => {
              try {
                photoURLToUpdate = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(); 
              } catch (getUrlError) {
                 console.error('Failed to get download URL', getUrlError);
                 toast({ title: "Errore URL Immagine", description: (getUrlError as Error).message, variant: "destructive" });
                 reject(getUrlError); 
              }
            }
          );
        });
      } catch (uploadError) {
          setIsUploading(false); 
          return; 
      }
    }

    const updatedDisplayName = `${data.firstName || userProfile.firstName || ''} ${data.lastName || userProfile.lastName || ''}`.trim();
    
    const dataToUpdate : Partial<ProfessionalProfile> = {
      ...data,
      displayName: updatedDisplayName || userProfile.displayName, // Ensure display name isn't accidentally cleared
      photoURL: photoURLToUpdate,
      hourlyRate: data.hourlyRate === undefined || data.hourlyRate === null || String(data.hourlyRate).trim() === '' ? undefined : Number(data.hourlyRate),
    };

    try {
      await updateUserProfile(user.uid, dataToUpdate);
      setProfileImageFile(null); 
    } catch (error) {
      console.error('Profile update failed on page:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
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
                  <Progress value={uploadProgress} className="w-full mt-2 h-2" />
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
                <FormInput 
                    control={form.control} 
                    name="hourlyRate" 
                    label="Tariffa Oraria Indicativa (€) (Opzionale)" 
                    type="number" 
                    placeholder="Es. 50" 
                    value={form.watch('hourlyRate') ?? ''} // Ensure controlled component behavior
                    onChange={(e) => {
                        const value = e.target.value;
                        form.setValue('hourlyRate', value === '' ? undefined : Number(value), { shouldValidate: true });
                    }}
                 />
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

