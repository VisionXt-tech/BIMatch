
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, UserCircle2, Upload } from 'lucide-react';
import type { ProfessionalProfile } from '@/types/auth';
import { FormInput, FormTextarea, FormMultiSelect, FormSingleSelect } from '@/components/ProfileFormElements';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, AVAILABILITY_OPTIONS, ITALIAN_REGIONS, EXPERIENCE_LEVEL_OPTIONS } from '@/constants';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, type FirebaseStorageError } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Removed Tabs


const professionalProfileSchema = z.object({
  firstName: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri.' }),
  lastName: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri.' }),
  displayName: z.string().min(2, "Il nome visualizzato è richiesto.").optional(),
  location: z.string().min(1, { message: 'La localizzazione è richiesta.' }),
  bio: z.string().max(1000, "La bio non può superare i 1000 caratteri.").min(1, "La bio è richiesta."),
  bimSkills: z.array(z.string()).min(1, "Seleziona almeno una competenza BIM."),
  softwareProficiency: z.array(z.string()).min(1, "Seleziona almeno un software."),
  availability: z.string().min(1, "La disponibilità è richiesta."),
  experienceLevel: z.string().min(1, "Il livello di esperienza è richiesto."),
  portfolioUrl: z.string().url({ message: 'Inserisci un URL valido per il portfolio.' }).optional().or(z.literal('')),
  cvUrl: z.string().url({ message: 'Inserisci un URL valido per il CV (es. link a Google Drive, Dropbox).' }).optional().or(z.literal('')),
  linkedInProfile: z.string().url({message: 'Inserisci un URL valido per LinkedIn.'}).optional().or(z.literal('')),
  monthlyRate: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const strVal = String(val).trim();
      if (strVal === "") return undefined;
      const num = Number(strVal);
      return isNaN(num) ? undefined : num;
    },
    z.number({invalid_type_error: 'La retribuzione mensile deve essere un numero.'})
      .positive({ message: 'La retribuzione mensile deve essere un numero positivo.' })
      .optional()
      .nullable()
  ),
});

type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;

const mapProfileToFormData = (profile?: ProfessionalProfile | null): ProfessionalProfileFormData => {
  const p = profile || {}; 
  return {
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    displayName: p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    location: p.location || '',
    bio: p.bio || '',
    bimSkills: p.bimSkills || [],
    softwareProficiency: p.softwareProficiency || [],
    availability: p.availability || '',
    experienceLevel: p.experienceLevel || '',
    portfolioUrl: p.portfolioUrl || '',
    cvUrl: p.cvUrl || '',
    linkedInProfile: p.linkedInProfile || '',
    monthlyRate: p.monthlyRate === undefined || p.monthlyRate === null || String(p.monthlyRate).trim() === '' ? undefined : Number(p.monthlyRate),
  };
};


export default function ProfessionalProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { storage } = useFirebase();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: mapProfileToFormData(), 
  });

  useEffect(() => {
    if (userProfile && userProfile.role === 'professional') {
      const defaultValuesForForm = mapProfileToFormData(userProfile as ProfessionalProfile);
      form.reset(defaultValuesForForm);
      if (userProfile.photoURL) {
        setImagePreview(userProfile.photoURL);
      } else {
        setImagePreview(null); 
      }
    } else if (!authLoading && !userProfile) {
      form.reset(mapProfileToFormData());
      setImagePreview(null);
    }
  }, [userProfile, form, authLoading]); 

  const handleImagePickerClick = () => {
    profileImageInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
          toast({ title: "Formato File Non Valido", description: "Seleziona un file immagine (es. JPG, PNG, WEBP).", variant: "destructive"});
          if(event.target) event.target.value = ''; 
          setProfileImageFile(null);
          return;
      }
      if (file.size > 2 * 1024 * 1024) { 
          toast({ title: "File Troppo Grande", description: "L'immagine non deve superare i 2MB.", variant: "destructive"});
          if(event.target) event.target.value = ''; 
          setProfileImageFile(null);
          return;
      }
      if (file.size === 0) {
        toast({ title: "File Vuoto", description: "Il file selezionato è vuoto e non può essere caricato.", variant: "destructive" });
        if(event.target) event.target.value = ''; 
        setProfileImageFile(null);
        return;
      }
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadProgress(null);
      setIsUploading(false);
    } else { 
      setProfileImageFile(null);
      setImagePreview(userProfile?.photoURL || null);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = ""; 
      }
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
            (error: FirebaseStorageError) => { 
              console.error("Errore Caricamento Immagine su Firebase Storage:", error.code, error.message, error.serverResponse);
              let userFriendlyMessage = "Errore durante il caricamento dell'immagine.";
              switch (error.code) {
                case 'storage/unauthorized':
                  userFriendlyMessage = "Non hai i permessi per caricare questo file. Controlla le regole di Firebase Storage.";
                  break;
                case 'storage/canceled':
                  userFriendlyMessage = "Caricamento annullato.";
                  break;
                case 'storage/object-not-found':
                  userFriendlyMessage = "File non trovato durante il caricamento. Strano, riprova.";
                   break;
                case 'storage/retry-limit-exceeded':
                  userFriendlyMessage = "Limite tentativi superato. Controlla la connessione.";
                   break;
                case 'storage/quota-exceeded':
                    userFriendlyMessage = "Quota di archiviazione Firebase superata.";
                    break;
                default:
                   userFriendlyMessage = `Errore caricamento: ${error.message || 'Vedi console del browser per dettagli.'}`;
              }
              toast({ title: "Errore Caricamento Immagine", description: userFriendlyMessage, variant: "destructive" });
              setIsUploading(false);
              setUploadProgress(null);
              reject(error);
            },
            async () => {
              try {
                photoURLToUpdate = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch (getUrlError: any) {
                 console.error("Errore getDownloadURL:", getUrlError);
                 toast({ title: "Errore URL Immagine", description: `Impossibile ottenere l'URL dell'immagine: ${getUrlError.message}`, variant: "destructive" });
                 setIsUploading(false);
                 setUploadProgress(null);
                 reject(getUrlError);
              }
            }
          );
        });
      } catch (uploadError) {
        setIsUploading(false);
        setUploadProgress(null);
        return; 
      }
    }

    const updatedDisplayName = `${data.firstName || userProfile.firstName || ''} ${data.lastName || userProfile.lastName || ''}`.trim();

    const dataToUpdate : Partial<ProfessionalProfile> = {
      ...data,
      displayName: updatedDisplayName || userProfile.displayName,
      photoURL: photoURLToUpdate,
      monthlyRate: data.monthlyRate === undefined || data.monthlyRate === null || String(data.monthlyRate).trim() === '' ? null : Number(data.monthlyRate),
    };

    try {
      const updatedProfile = await updateUserProfile(user.uid, dataToUpdate);
      if (updatedProfile) {
        toast({ title: "Profilo Aggiornato", description: "Le modifiche sono state salvate con successo." });
      }
      setProfileImageFile(null); 
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = ""; 
      }
    } catch (error) {
    } finally {
      if (profileImageFile || isUploading) {
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


  if (authLoading && !userProfile) { 
    return <div className="text-center py-10">Caricamento profilo...</div>;
  }

  if (!user || !userProfile || userProfile.role !== 'professional') {
    return <div className="text-center py-10">Profilo non trovato o non autorizzato.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <UserCircle2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-bold">Il Mio Profilo Professionale</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Mantieni aggiornate le tue informazioni per attrarre le migliori opportunità.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             
            <div className="space-y-2">
                 <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Immagine del Profilo</h3>
                <FormItem>
                    <div className="flex items-center space-x-4">
                    <Avatar className="h-24 w-24 border">
                        <AvatarImage src={imagePreview || undefined} alt={userProfile.displayName || 'User'} data-ai-hint="profile person" />
                        <AvatarFallback className="text-3xl">{getInitials(userProfile.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-2">
                        <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleImagePickerClick}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit"
                        >
                        <Upload className="mr-2 h-4 w-4" />
                        Carica / Modifica Immagine
                        </Button>
                        {profileImageFile && (
                        <span className="text-sm text-muted-foreground">
                            File: {profileImageFile.name}
                        </span>
                        )}
                        <Input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            onChange={handleFileChange}
                            className="hidden" 
                            ref={profileImageInputRef}
                        />
                        <FormDescription className="text-xs">Max 2MB (JPG, PNG, WEBP).</FormDescription>
                    </div>
                    </div>
                    {isUploading && uploadProgress !== null && (
                    <div className="mt-2">
                        <Progress value={uploadProgress} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Caricamento: {Math.round(uploadProgress)}%</p>
                    </div>
                    )}
                    {!isUploading && uploadProgress === null && profileImageFile && (
                    <p className="text-sm text-green-600 mt-1">Nuova immagine pronta. Salva per applicare.</p>
                    )}
                    <FormMessage className="text-xs" />
                </FormItem>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Informazioni Personali e Disponibilità</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <FormInput control={form.control} name="firstName" label="Nome" placeholder="Mario" />
                    <FormInput control={form.control} name="lastName" label="Cognome" placeholder="Rossi" />
                </div>
                <FormSingleSelect
                  key={`location-${form.watch('location') || 'default'}`}
                  control={form.control}
                  name="location"
                  label="Localizzazione (Regione Principale)"
                  options={ITALIAN_REGIONS.map(r => ({ value: r, label: r }))}
                  placeholder="Seleziona la tua regione principale"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormSingleSelect
                    key={`experienceLevel-${form.watch('experienceLevel') || 'default'}`}
                    control={form.control}
                    name="experienceLevel"
                    label="Livello di Esperienza"
                    options={EXPERIENCE_LEVEL_OPTIONS}
                    placeholder="Seleziona il tuo livello"
                  />
                  <FormSingleSelect
                    key={`availability-${form.watch('availability') || 'default'}`}
                    control={form.control}
                    name="availability"
                    label="Disponibilità"
                    options={AVAILABILITY_OPTIONS}
                    placeholder="Seleziona la tua disponibilità"
                  />
                </div>
                <FormTextarea control={form.control} name="bio" label="Breve Bio Professionale" placeholder="Descrivi la tua esperienza, specializzazioni e obiettivi..." rows={5} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Competenze e Software</h3>
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
              </div>

              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Dettagli Economici e Link Esterni</h3>
                 <FormItem>
                  <FormLabel className="text-xs">Retribuzione Mensile Lorda (€) (Opzionale)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Es. 2500"
                      step="1"
                      className="h-9"
                      {...form.register("monthlyRate", {
                          setValueAs: (value) => {
                            if (value === "" || value === null || value === undefined) return null;
                            const strVal = String(value).trim();
                            if (strVal === "") return null;
                            const num = parseFloat(strVal);
                            return isNaN(num) ? undefined : num;
                          }
                      })}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
                <FormInput control={form.control} name="portfolioUrl" label="Link al Portfolio (Opzionale)" placeholder="https://tuo.portfolio.com" />
                <FormInput control={form.control} name="cvUrl" label="Link al CV (Opzionale)" placeholder="Link a Google Drive, Dropbox, etc." description="Assicurati che il link sia accessibile." />
                <FormInput control={form.control} name="linkedInProfile" label="Profilo LinkedIn (Opzionale)" placeholder="https://linkedin.com/in/tuoprofilo" />
              </div>
              
              <Button type="submit" className="w-full md:w-auto mt-6" size="lg" disabled={authLoading || form.formState.isSubmitting || isUploading}>
                <Save className="mr-2 h-5 w-5" />
                {isUploading ? `Caricamento Immagine... ${uploadProgress !== null ? Math.round(uploadProgress) + '%' : ''}` : (form.formState.isSubmitting ? 'Salvataggio Profilo...' : 'Salva Profilo Professionale')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
