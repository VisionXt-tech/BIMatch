
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, UserCircle2, Upload, FileText, Link as LinkIcon, Award, Trash2, Loader2, ShieldCheck, BadgeCheck } from 'lucide-react';
import type { ProfessionalProfile as FullProfessionalProfile } from '@/types/auth';
import { FormInput, FormTextarea, FormMultiSelect, FormSingleSelect } from '@/components/ProfileFormElements';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, AVAILABILITY_OPTIONS, ITALIAN_REGIONS, EXPERIENCE_LEVEL_OPTIONS } from '@/constants';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject, type FirebaseStorageError } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { doc, updateDoc, deleteField } from 'firebase/firestore';


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
  alboSelfCertified: z.boolean().optional(),
  uniCertificationUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
  uniSelfCertified: z.boolean().optional(),
  otherCertificationsUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
  otherCertificationsSelfCertified: z.boolean().optional(),
});

type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;
type CertificationType = 'albo' | 'uni' | 'other';


const mapProfileToFormData = (profile?: FullProfessionalProfile | null): ProfessionalProfileFormData => {
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
    alboSelfCertified: p.alboSelfCertified || false,
    uniCertificationUrl: p.uniCertificationUrl || '',
    uniSelfCertified: p.uniSelfCertified || false,
    otherCertificationsUrl: p.otherCertificationsUrl || '',
    otherCertificationsSelfCertified: p.otherCertificationsSelfCertified || false,
  };
};


export default function ProfessionalProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { db, storage } = useFirebase();
  
  const [localProfile, setLocalProfile] = useState<FullProfessionalProfile | null>(null);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [alboPdfFile, setAlboPdfFile] = useState<File | null>(null);
  const [uniPdfFile, setUniPdfFile] = useState<File | null>(null);
  const [otherCertPdfFile, setOtherCertPdfFile] = useState<File | null>(null);
  
  const [alboUploadProgress, setAlboUploadProgress] = useState<number | null>(null);
  const [uniUploadProgress, setUniUploadProgress] = useState<number | null>(null);
  const [otherCertUploadProgress, setOtherCertUploadProgress] = useState<number | null>(null);
  
  const [isUploadingAnyFile, setIsUploadingAnyFile] = useState(false);

  const alboInputRef = useRef<HTMLInputElement>(null);
  const uniInputRef = useRef<HTMLInputElement>(null);
  const otherCertInputRef = useRef<HTMLInputElement>(null);
  
  const [certDialogState, setCertDialogState] = useState<{ isOpen: boolean; certType: CertificationType | null; onConfirm: () => void }>({ isOpen: false, certType: null, onConfirm: () => {} });
  const [deleteDialogState, setDeleteDialogState] = useState<{ isOpen: boolean; certType: CertificationType | null; }>({ isOpen: false, certType: null });
  const [isDeletingFile, setIsDeletingFile] = useState(false);


  const form = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: mapProfileToFormData(userProfile as FullProfessionalProfile),
  });
  
  useEffect(() => {
    if (userProfile && userProfile.role === 'professional') {
        const fullProfile = userProfile as FullProfessionalProfile;
        setLocalProfile(fullProfile);
        form.reset(mapProfileToFormData(fullProfile));
        setImagePreview(fullProfile.photoURL || null);
    }
  }, [userProfile, form]);

  
  const handleCertificationCheckboxChange = (
    certType: CertificationType,
    isChecked: boolean
  ) => {
    if (isChecked) {
      setCertDialogState({
        isOpen: true,
        certType,
        onConfirm: () => {
          form.setValue(`${certType}SelfCertified`, true);
          if (certType === 'albo') setAlboPdfFile(null);
          if (certType === 'uni') setUniPdfFile(null);
          if (certType === 'other') setOtherCertPdfFile(null);
          form.setValue(`${certType}RegistrationUrl`, '');
          setCertDialogState({ isOpen: false, certType: null, onConfirm: () => {} });
        },
      });
    } else {
      form.setValue(`${certType}SelfCertified`, false);
    }
  };

  const handleGenericFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    certType: CertificationType | 'image'
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const isPdf = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      const maxSizeMB = isImage ? 2 : MAX_PDF_SIZE_MB;
      const maxSize = maxSizeMB * 1024 * 1024;

      if ((certType !== 'image' && !isPdf) || (certType === 'image' && !isImage)) {
        toast({ title: "Formato File Non Valido", description: `Seleziona un file ${isImage ? 'immagine' : 'PDF'}.`, variant: "destructive"});
        event.target.value = ''; setFile(null); return;
      }
      if (file.size > maxSize) {
        toast({ title: "File Troppo Grande", description: `Il file non deve superare i ${maxSizeMB}MB.`, variant: "destructive"});
        event.target.value = ''; setFile(null); return;
      }
      
      setFile(file);
      
      if (certType === 'image') {
        setImagePreview(URL.createObjectURL(file));
        setImageUploadProgress(null);
      } else {
        form.setValue(`${certType}SelfCertified`, false);
      }
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
            setProgress(100); 
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
  
  const openDeleteConfirmation = (certType: CertificationType) => {
    setDeleteDialogState({ isOpen: true, certType });
  };

  const handleConfirmDeleteCertification = async () => {
    const certType = deleteDialogState.certType;
    if (!certType || !user || !localProfile || !storage || !db) {
        toast({ title: "Errore", description: "Impossibile procedere: dati mancanti.", variant: "destructive" });
        setDeleteDialogState({ isOpen: false, certType: null });
        return;
    }

    setIsDeletingFile(true);
    try {
        const urlToDeleteKey = `${certType}RegistrationUrl` as keyof FullProfessionalProfile;
        const selfCertifiedKey = `${certType}SelfCertified` as keyof FullProfessionalProfile;
        const urlToDelete = localProfile[urlToDeleteKey] as string | undefined;

        if (urlToDelete) {
            try {
                const fileRef = storageRef(storage, urlToDelete);
                await deleteObject(fileRef);
            } catch (error: any) {
                if (error.code !== 'storage/object-not-found') {
                    throw error;
                }
                console.warn(`File non trovato nello storage (già eliminato?): ${urlToDelete}`);
            }
        }
        
        const updatePayload = {
          [urlToDeleteKey]: deleteField(),
          [selfCertifiedKey]: deleteField(),
        };
        
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, updatePayload);

        const newLocalProfile = { ...localProfile };
        delete (newLocalProfile as any)[urlToDeleteKey];
        delete (newLocalProfile as any)[selfCertifiedKey];
        setLocalProfile(newLocalProfile);
        
        toast({ title: "Documento Eliminato", description: "Il documento è stato rimosso con successo." });

    } catch (error: any) {
        console.error("Errore durante l'eliminazione della certificazione:", error);
        toast({ title: "Errore Eliminazione", description: `Impossibile completare l'eliminazione: ${error.message}`, variant: "destructive" });
    } finally {
        setIsDeletingFile(false);
        setDeleteDialogState({ isOpen: false, certType: null });
    }
  };


  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user || !userProfile) {
        toast({ title: "Errore", description: "Utente non autenticato.", variant: "destructive" });
        return;
    }

    setIsUploadingAnyFile(true);
    let photoURLToUpdate = (userProfile as FullProfessionalProfile).photoURL || '';
    let alboUrlToUpdate = (userProfile as FullProfessionalProfile).alboRegistrationUrl || '';
    let uniUrlToUpdate = (userProfile as FullProfessionalProfile).uniCertificationUrl || '';
    let otherCertUrlToUpdate = (userProfile as FullProfessionalProfile).otherCertificationsUrl || '';

    try {
        if (profileImageFile) {
            setIsUploadingImage(true);
            photoURLToUpdate = await uploadFileAndGetURL(profileImageFile, 'profileImages', setImageUploadProgress);
            setIsUploadingImage(false);
        }
        if (alboPdfFile) {
            alboUrlToUpdate = await uploadFileAndGetURL(alboPdfFile, 'professionalCertifications/albo', setAlboUploadProgress);
        }
        if (uniPdfFile) {
            uniUrlToUpdate = await uploadFileAndGetURL(uniPdfFile, 'professionalCertifications/uni', setUniUploadProgress);
        }
        if (otherCertPdfFile) {
            otherCertUrlToUpdate = await uploadFileAndGetURL(otherCertPdfFile, 'professionalCertifications/other', setOtherCertUploadProgress);
        }

        const dataToUpdate: Partial<FullProfessionalProfile> = {
            ...data,
            displayName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            photoURL: photoURLToUpdate,
            monthlyRate: data.monthlyRate === undefined || data.monthlyRate === null ? null : Number(data.monthlyRate),
            alboRegistrationUrl: data.alboSelfCertified ? undefined : alboUrlToUpdate,
            uniCertificationUrl: data.uniSelfCertified ? undefined : uniUrlToUpdate,
            otherCertificationsUrl: data.otherCertificationsSelfCertified ? undefined : otherCertUrlToUpdate,
        };

        await updateUserProfile(user.uid, dataToUpdate);
        
        toast({ title: "Profilo Aggiornato", description: "Le modifiche sono state salvate con successo." });
        
        setProfileImageFile(null);
        setAlboPdfFile(null);
        setUniPdfFile(null);
        setOtherCertPdfFile(null);
        if (profileImageInputRef.current) profileImageInputRef.current.value = "";
        if (alboInputRef.current) alboInputRef.current.value = "";
        if (uniInputRef.current) uniInputRef.current.value = "";
        if (otherCertInputRef.current) otherCertInputRef.current.value = "";

    } catch (error: any) {
        console.error("Error submitting profile update:", error);
    } finally {
        setIsUploadingImage(false);
        setIsUploadingAnyFile(false);
        setImageUploadProgress(null);
        setAlboUploadProgress(null);
        setUniUploadProgress(null);
        setOtherCertUploadProgress(null);
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


  if (authLoading && !localProfile) {
    return <div className="text-center py-10">Caricamento profilo...</div>;
  }

  if (!user || !localProfile || localProfile.role !== 'professional') {
    return <div className="text-center py-10">Profilo non trovato o non autorizzato.</div>;
  }
  
  const CertificationSection = ({ certType, title, icon, fileState, progressState, inputRef, onDelete }: {
      certType: CertificationType;
      title: string;
      icon: React.ElementType;
      fileState: File | null;
      progressState: number | null;
      inputRef: React.RefObject<HTMLInputElement>;
      onDelete: (certType: CertificationType) => void;
  }) => {
    const IconComponent = icon;
    const isUploadingThisFile = progressState !== null && progressState < 100;
    const currentUrl = localProfile?.[`${certType}RegistrationUrl` as keyof FullProfessionalProfile] as string | undefined;
    const selfCertified = form.watch(`${certType}SelfCertified`);
    const hasExistingFile = !!currentUrl;
    const hasPendingFile = !!fileState;

    return (
      <FormItem className="border p-4 rounded-md shadow-sm bg-muted/30">
        <FormLabel className="text-md font-semibold text-primary flex items-center">
          <IconComponent className="mr-2 h-5 w-5" /> {title}
        </FormLabel>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploadingAnyFile || selfCertified}>
            <Upload className="mr-2 h-4 w-4" /> {hasExistingFile ? 'Modifica PDF' : 'Carica PDF'}
          </Button>
          {hasExistingFile && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 px-2 py-1 text-xs"
              onClick={() => onDelete(certType)}
              disabled={isUploadingAnyFile || selfCertified}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Elimina PDF
            </Button>
          )}
        </div>
        
        <div className="mt-2 text-sm text-muted-foreground">
          {hasPendingFile && (
            <span className="truncate max-w-xs block">Selezionato: {fileState.name}</span>
          )}
          {!hasPendingFile && hasExistingFile && (
            <Link href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
              <LinkIcon className="mr-1 h-4 w-4" /> Visualizza PDF Caricato
            </Link>
          )}
        </div>

        {isUploadingThisFile && progressState !== null && (
          <div className="mt-2"><Progress value={progressState} className="w-full h-1.5" /><p className="text-xs text-muted-foreground mt-1">Caricamento: {Math.round(progressState)}%</p></div>
        )}
        {hasPendingFile && (
           <p className="text-xs text-green-600 mt-1">Nuovo file "{fileState.name}" pronto. Clicca "Salva Profilo" per completare.</p>
        )}
        <FormDescription className="text-xs mt-1">Max {MAX_PDF_SIZE_MB}MB (solo PDF).</FormDescription>
        
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border/50">
           <FormField
              control={form.control}
              name={`${certType}SelfCertified`}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${certType}SelfCertified`}
                    checked={field.value}
                    onCheckedChange={(checked) => handleCertificationCheckboxChange(certType, !!checked)}
                    disabled={isUploadingAnyFile || hasExistingFile || hasPendingFile }
                  />
                  <label
                    htmlFor={`${certType}SelfCertified`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                  >
                    In alternativa, autocertifico il possesso di questo requisito.
                  </label>
                </div>
              )}
            />
        </div>
      </FormItem>
    );
  };


  return (
    <>
    <div className="space-y-6">
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
                            <AvatarImage src={imagePreview || undefined} alt={localProfile.displayName || 'User'} data-ai-hint="profile person" />
                            <AvatarFallback className="text-3xl">{getInitials(localProfile.displayName)}</AvatarFallback>
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
                                onChange={(e) => handleGenericFileChange(e, setProfileImageFile, 'image')}
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
                   <Input type="file" className="hidden" ref={alboInputRef} accept="application/pdf" onChange={(e) => handleGenericFileChange(e, setAlboPdfFile, 'albo')} />
                   <Input type="file" className="hidden" ref={uniInputRef} accept="application/pdf" onChange={(e) => handleGenericFileChange(e, setUniPdfFile, 'uni')} />
                   <Input type="file" className="hidden" ref={otherCertInputRef} accept="application/pdf" onChange={(e) => handleGenericFileChange(e, setOtherCertPdfFile, 'other')} />

                  <CertificationSection
                    certType="albo"
                    title="Iscrizione Albo Professionale (ove applicabile)"
                    icon={Award}
                    fileState={alboPdfFile}
                    progressState={alboUploadProgress}
                    inputRef={alboInputRef}
                    onDelete={openDeleteConfirmation}
                  />
                  <CertificationSection
                    certType="uni"
                    title="Certificazione UNI 11337 (o equivalenti)"
                    icon={BadgeCheck}
                    fileState={uniPdfFile}
                    progressState={uniUploadProgress}
                    inputRef={uniInputRef}
                    onDelete={openDeleteConfirmation}
                  />
                  <CertificationSection
                    certType="other"
                    title="Altre Certificazioni Rilevanti"
                    icon={FileText}
                    fileState={otherCertPdfFile}
                    progressState={otherCertUploadProgress}
                    inputRef={otherCertInputRef}
                    onDelete={openDeleteConfirmation}
                  />
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
    
    <AlertDialog open={certDialogState.isOpen} onOpenChange={(isOpen) => !isOpen && setCertDialogState({ isOpen: false, certType: null, onConfirm: () => {} })}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center"><ShieldCheck className="mr-2 h-6 w-6 text-yellow-500"/>Conferma Autocertificazione</AlertDialogTitle>
            <AlertDialogDescription>
                Stai per dichiarare di possedere la certificazione{" "}
                <strong>
                {certDialogState.certType === 'albo' && 'di Iscrizione all\'Albo Professionale'}
                {certDialogState.certType === 'uni' && 'UNI 11337 (o equivalente)'}
                {certDialogState.certType === 'other' && 'rilevante per la professione'}
                </strong>.
                <br/><br/>
                Assicurati che le informazioni siano veritiere e corrette.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCertDialogState({ isOpen: false, certType: null, onConfirm: () => {} })}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={certDialogState.onConfirm}>Confermo e Accetto</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={deleteDialogState.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteDialogState({ isOpen: false, certType: null })}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Conferma Eliminazione Documento</AlertDialogTitle>
                <AlertDialogDescription>
                    Sei sicuro di voler eliminare questo documento dal tuo profilo? L'azione è permanente e non può essere annullata.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteDialogState({ isOpen: false, certType: null })} disabled={isDeletingFile}>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDeleteCertification} disabled={isDeletingFile} className="bg-destructive hover:bg-destructive/90">
                    {isDeletingFile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Elimina Definitivamente
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    </>
  );
}
