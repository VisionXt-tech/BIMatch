
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, UserCircle2, Upload, FileText, Link as LinkIcon, BadgeCheck, Award } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';

const MAX_PDF_SIZE_MB = 5;
const MAX_PDF_SIZE_BYTES = MAX_PDF_SIZE_MB * 1024 * 1024;

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
  alboRegistrationUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
  uniCertificationUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
  otherCertificationsUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
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
    alboRegistrationUrl: p.alboRegistrationUrl || '',
    uniCertificationUrl: p.uniCertificationUrl || '',
    otherCertificationsUrl: p.otherCertificationsUrl || '',
  };
};


export default function ProfessionalProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { storage } = useFirebase();

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [alboPdfFile, setAlboPdfFile] = useState<File | null>(null);
  const [uniPdfFile, setUniPdfFile] = useState<File | null>(null);
  const [otherCertPdfFile, setOtherCertPdfFile] = useState<File | null>(null);

  const [alboPdfUrl, setAlboPdfUrl] = useState<string | null>(null);
  const [uniPdfUrl, setUniPdfUrl] = useState<string | null>(null);
  const [otherCertPdfUrl, setOtherCertPdfUrl] = useState<string | null>(null);

  const [alboUploadProgress, setAlboUploadProgress] = useState<number | null>(null);
  const [uniUploadProgress, setUniUploadProgress] = useState<number | null>(null);
  const [otherCertUploadProgress, setOtherCertUploadProgress] = useState<number | null>(null);
  
  const [isUploadingAnyFile, setIsUploadingAnyFile] = useState(false);

  const alboInputRef = useRef<HTMLInputElement>(null);
  const uniInputRef = useRef<HTMLInputElement>(null);
  const otherCertInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: mapProfileToFormData(),
  });

  useEffect(() => {
    if (userProfile && userProfile.role === 'professional') {
      const professionalData = userProfile as ProfessionalProfile;
      const defaultValuesForForm = mapProfileToFormData(professionalData);
      form.reset(defaultValuesForForm);
      setImagePreview(professionalData.photoURL || null);
      setAlboPdfUrl(professionalData.alboRegistrationUrl || null);
      setUniPdfUrl(professionalData.uniCertificationUrl || null);
      setOtherCertPdfUrl(professionalData.otherCertificationsUrl || null);
    } else if (!authLoading && !userProfile) {
      form.reset(mapProfileToFormData());
      setImagePreview(null);
      setAlboPdfUrl(null);
      setUniPdfUrl(null);
      setOtherCertPdfUrl(null);
    }
  }, [userProfile, form, authLoading]);

  const handleGenericFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>, // Not used for PDF, but kept for consistency if reused
    setUploadProgress: React.Dispatch<React.SetStateAction<number | null>>,
    fileType: 'image' | 'pdf' = 'image',
    maxSizeMB: number = 2
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const maxSize = maxSizeMB * 1024 * 1024;

      if (fileType === 'image' && !file.type.startsWith('image/')) {
        toast({ title: "Formato File Non Valido", description: `Seleziona un file immagine (es. JPG, PNG, WEBP).`, variant: "destructive"});
        event.target.value = ''; setFile(null); return;
      }
      if (fileType === 'pdf' && file.type !== 'application/pdf') {
        toast({ title: "Formato File Non Valido", description: `Seleziona un file PDF.`, variant: "destructive"});
        event.target.value = ''; setFile(null); return;
      }
      if (file.size > maxSize) {
        toast({ title: "File Troppo Grande", description: `Il file non deve superare i ${maxSizeMB}MB.`, variant: "destructive"});
        event.target.value = ''; setFile(null); return;
      }
      if (file.size === 0) {
        toast({ title: "File Vuoto", description: "Il file selezionato è vuoto.", variant: "destructive" });
        event.target.value = ''; setFile(null); return;
      }
      
      setFile(file);
      if (fileType === 'image') setPreviewUrl(URL.createObjectURL(file));
      // For PDFs, we don't set a direct preview URL from createObjectURL, URL will come from storage
      setUploadProgress(null); // Reset progress for new file
    } else {
      setFile(null);
      // Logic to reset preview for images, PDF URLs handled by profile data
    }
  };

  const uploadFileAndGetURL = async (
    file: File,
    path: string,
    setProgress: React.Dispatch<React.SetStateAction<number | null>>
  ): Promise<string> => {
    if (!storage || !user) throw new Error("Servizio di storage non disponibile o utente non loggato.");
    setIsUploadingAnyFile(true);
    setProgress(0);
    const filePath = `${path}/${user.uid}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error("Errore Upload File:", error);
          toast({ title: "Errore Upload File", description: error.message, variant: "destructive" });
          setProgress(null);
          setIsUploadingAnyFile(false);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setProgress(100); // Mark as complete
            resolve(downloadURL);
          } catch (error) {
            console.error("Errore getDownloadURL:", error);
            toast({ title: "Errore URL File", description: (error as Error).message, variant: "destructive" });
            setProgress(null);
            setIsUploadingAnyFile(false);
            reject(error);
          }
        }
      );
    });
  };


  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user || !userProfile) {
      toast({ title: "Errore", description: "Utente non autenticato.", variant: "destructive" });
      return;
    }

    let photoURLToUpdate = (userProfile as ProfessionalProfile).photoURL || '';
    let alboUrlToUpdate = form.getValues('alboRegistrationUrl') || (userProfile as ProfessionalProfile).alboRegistrationUrl || '';
    let uniUrlToUpdate = form.getValues('uniCertificationUrl') || (userProfile as ProfessionalProfile).uniCertificationUrl || '';
    let otherCertUrlToUpdate = form.getValues('otherCertificationsUrl') || (userProfile as ProfessionalProfile).otherCertificationsUrl || '';

    setIsUploadingAnyFile(true); // Set at the beginning of submission process

    try {
      if (profileImageFile && storage) {
        setIsUploadingImage(true);
        photoURLToUpdate = await uploadFileAndGetURL(profileImageFile, 'profileImages', setImageUploadProgress);
        setIsUploadingImage(false);
        setImagePreview(photoURLToUpdate); 
      }

      if (alboPdfFile && storage) {
        alboUrlToUpdate = await uploadFileAndGetURL(alboPdfFile, 'professionalCertifications/albo', setAlboUploadProgress);
        setAlboPdfUrl(alboUrlToUpdate);
        form.setValue('alboRegistrationUrl', alboUrlToUpdate);
      }
      if (uniPdfFile && storage) {
        uniUrlToUpdate = await uploadFileAndGetURL(uniPdfFile, 'professionalCertifications/uni', setUniUploadProgress);
        setUniPdfUrl(uniUrlToUpdate);
        form.setValue('uniCertificationUrl', uniUrlToUpdate);
      }
      if (otherCertPdfFile && storage) {
        otherCertUrlToUpdate = await uploadFileAndGetURL(otherCertPdfFile, 'professionalCertifications/other', setOtherCertUploadProgress);
        setOtherCertPdfUrl(otherCertUrlToUpdate);
        form.setValue('otherCertificationsUrl', otherCertUrlToUpdate);
      }

      const updatedDisplayName = `${data.firstName || (userProfile as ProfessionalProfile).firstName || ''} ${data.lastName || (userProfile as ProfessionalProfile).lastName || ''}`.trim();
      const dataToUpdate : Partial<ProfessionalProfile> = {
        ...data,
        displayName: updatedDisplayName || userProfile.displayName,
        photoURL: photoURLToUpdate,
        monthlyRate: data.monthlyRate === undefined || data.monthlyRate === null || String(data.monthlyRate).trim() === '' ? null : Number(data.monthlyRate),
        alboRegistrationUrl: alboUrlToUpdate,
        uniCertificationUrl: uniUrlToUpdate,
        otherCertificationsUrl: otherCertUrlToUpdate,
      };

      await updateUserProfile(user.uid, dataToUpdate);
      toast({ title: "Profilo Aggiornato", description: "Le modifiche sono state salvate con successo." });
      
      setProfileImageFile(null); if (profileImageInputRef.current) profileImageInputRef.current.value = "";
      setAlboPdfFile(null); if (alboInputRef.current) alboInputRef.current.value = "";
      setUniPdfFile(null); if (uniInputRef.current) uniInputRef.current.value = "";
      setOtherCertPdfFile(null); if (otherCertInputRef.current) otherCertInputRef.current.value = "";

    } catch (error) {
      // Toast for upload errors is handled in uploadFileAndGetURL
      // General profile update error will be handled by updateUserProfile
    } finally {
      setIsUploadingImage(false);
      setImageUploadProgress(null);
      setAlboUploadProgress(null);
      setUniUploadProgress(null);
      setOtherCertUploadProgress(null);
      setIsUploadingAnyFile(false);
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

  const renderFileUploadSection = (
    title: string,
    icon: React.ElementType,
    fileState: File | null,
    urlState: string | null,
    progressState: number | null,
    inputRef: React.RefObject<HTMLInputElement>,
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    clearFileState: () => void,
    existingUrlFromForm: string | undefined
  ) => {
    const IconComponent = icon;
    const currentUrl = fileState ? null : (urlState || existingUrlFromForm);
    const isUploadingThisFile = progressState !== null && progressState < 100;

    return (
      <FormItem className="border p-4 rounded-md shadow-sm bg-muted/30">
        <FormLabel className="text-md font-semibold text-primary flex items-center">
          <IconComponent className="mr-2 h-5 w-5" /> {title}
        </FormLabel>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploadingAnyFile}>
            <Upload className="mr-2 h-4 w-4" /> {currentUrl || fileState ? 'Modifica PDF' : 'Carica PDF'}
          </Button>
          <Input type="file" accept=".pdf" onChange={handleChange} className="hidden" ref={inputRef} disabled={isUploadingAnyFile} />
          {fileState && (
            <span className="text-sm text-muted-foreground truncate max-w-xs">Selezionato: {fileState.name}</span>
          )}
          {!fileState && currentUrl && (
            <Link href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center">
              <LinkIcon className="mr-1 h-4 w-4" /> Visualizza PDF Caricato
            </Link>
          )}
        </div>
        {isUploadingThisFile && progressState !== null && (
          <div className="mt-2">
            <Progress value={progressState} className="w-full h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">Caricamento: {Math.round(progressState)}%</p>
          </div>
        )}
        {!isUploadingThisFile && progressState === 100 && fileState && (
           <p className="text-xs text-green-600 mt-1">Nuovo file "{fileState.name}" pronto per il salvataggio.</p>
        )}
        <FormDescription className="text-xs mt-1">Max {MAX_PDF_SIZE_MB}MB (solo PDF).</FormDescription>
      </FormItem>
    );
  };


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
               <Tabs defaultValue="personal-info" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mb-6">
                  <TabsTrigger value="personal-info">Info Personali e Immagine</TabsTrigger>
                  <TabsTrigger value="skills-details">Competenze e Dettagli</TabsTrigger>
                  <TabsTrigger value="certifications">Certificazioni</TabsTrigger>
                  <TabsTrigger value="links-rate">Link e Retribuzione</TabsTrigger>
                </TabsList>

                <TabsContent value="personal-info" className="space-y-4">
                  <FormItem>
                      <FormLabel className="text-sm font-semibold text-primary">Immagine del Profilo</FormLabel>
                      <div className="flex items-center space-x-4 pt-2">
                        <Avatar className="h-24 w-24 border">
                            <AvatarImage src={imagePreview || undefined} alt={userProfile.displayName || 'User'} data-ai-hint="profile person" />
                            <AvatarFallback className="text-3xl">{getInitials(userProfile.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-2">
                            <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => profileImageInputRef.current?.click()}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit"
                            disabled={isUploadingAnyFile}
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
                                onChange={(e) => handleGenericFileChange(e, setProfileImageFile, setImagePreview, setImageUploadProgress, 'image', 2)}
                                className="hidden"
                                ref={profileImageInputRef}
                                disabled={isUploadingAnyFile}
                            />
                            <FormDescription className="text-xs">Max 2MB (JPG, PNG, WEBP).</FormDescription>
                        </div>
                      </div>
                      {isUploadingImage && imageUploadProgress !== null && (
                        <div className="mt-2">
                            <Progress value={imageUploadProgress} className="w-full h-2" />
                            <p className="text-xs text-muted-foreground mt-1">Caricamento: {Math.round(imageUploadProgress)}%</p>
                        </div>
                      )}
                      {!isUploadingImage && imageUploadProgress === 100 && profileImageFile && (
                        <p className="text-sm text-green-600 mt-1">Nuova immagine pronta per il salvataggio.</p>
                      )}
                      <FormMessage className="text-xs" />
                  </FormItem>
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
                  <FormTextarea control={form.control} name="bio" label="Breve Bio Professionale" placeholder="Descrivi la tua esperienza, specializzazioni e obiettivi..." rows={5} />
                </TabsContent>

                <TabsContent value="skills-details" className="space-y-4">
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

                <TabsContent value="certifications" className="space-y-4">
                  {renderFileUploadSection(
                    "Iscrizione Albo Professionale (ove applicabile)",
                    Award,
                    alboPdfFile,
                    alboPdfUrl,
                    alboUploadProgress,
                    alboInputRef,
                    (e) => handleGenericFileChange(e, setAlboPdfFile, setAlboPdfUrl, setAlboUploadProgress, 'pdf', MAX_PDF_SIZE_MB),
                    () => { setAlboPdfFile(null); setAlboPdfUrl(null); form.setValue('alboRegistrationUrl',''); if (alboInputRef.current) alboInputRef.current.value=""; },
                    form.getValues('alboRegistrationUrl')
                  )}
                  {renderFileUploadSection(
                    "Certificazione UNI 11337 (o equivalenti)",
                    BadgeCheck,
                    uniPdfFile,
                    uniPdfUrl,
                    uniUploadProgress,
                    uniInputRef,
                    (e) => handleGenericFileChange(e, setUniPdfFile, setUniPdfUrl, setUniUploadProgress, 'pdf', MAX_PDF_SIZE_MB),
                    () => { setUniPdfFile(null); setUniPdfUrl(null); form.setValue('uniCertificationUrl',''); if (uniInputRef.current) uniInputRef.current.value=""; },
                    form.getValues('uniCertificationUrl')
                  )}
                  {renderFileUploadSection(
                    "Altre Certificazioni Rilevanti (es. Software Vendor)",
                    FileText,
                    otherCertPdfFile,
                    otherCertPdfUrl,
                    otherCertUploadProgress,
                    otherCertInputRef,
                    (e) => handleGenericFileChange(e, setOtherCertPdfFile, setOtherCertPdfUrl, setOtherCertUploadProgress, 'pdf', MAX_PDF_SIZE_MB),
                    () => { setOtherCertPdfFile(null); setOtherCertPdfUrl(null); form.setValue('otherCertificationsUrl',''); if (otherCertInputRef.current) otherCertInputRef.current.value=""; },
                    form.getValues('otherCertificationsUrl')
                  )}
                </TabsContent>

                <TabsContent value="links-rate" className="space-y-4">
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
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full md:w-auto mt-6" size="lg" disabled={authLoading || form.formState.isSubmitting || isUploadingAnyFile}>
                <Save className="mr-2 h-5 w-5" />
                {isUploadingAnyFile ? `Caricamento File...` : (form.formState.isSubmitting ? 'Salvataggio Profilo...' : 'Salva Profilo Professionale')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
