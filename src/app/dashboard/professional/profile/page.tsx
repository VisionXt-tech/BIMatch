
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, UserCircle2, Upload, FileText, Link as LinkIcon, Award, Trash2, Loader2, ShieldCheck, BadgeCheck, TrendingUp, Sparkles, MapPin } from 'lucide-react';
import type { ProfessionalProfile as FullProfessionalProfile } from '@/types/auth';
import { FormInput, FormTextarea, FormMultiSelect, FormSingleSelect } from '@/components/ProfileFormElements';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, WORK_MODE_OPTIONS, AVAILABILITY_OPTIONS, LOCATION_MODE_OPTIONS, ITALIAN_REGIONS, EXPERIENCE_LEVEL_OPTIONS, MONTHLY_RATE_OPTIONS } from '@/constants';
import { ItalyMap } from '@/components/ItalyMap';
import { BIM_SKILLS_CATEGORIES, SOFTWARE_CATEGORIES } from '@/constants/skillsCategories';
import { SkillsSelector } from '@/components/SkillsSelector';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSecureFileUpload } from '@/hooks/useSecureFileUpload';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseContext';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { useProfileStrength } from '@/hooks/useProfileStrength';
import { ProfileStrengthMeter, ProfileStrengthBar } from '@/components/ProfileStrengthMeter';
import { cn } from '@/lib/utils';


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
  workMode: z.string().min(1, "La modalità lavorativa è richiesta."),
  availability: z.string().min(1, "La disponibilità è richiesta."),
  locationMode: z.string().min(1, "La modalità di lavoro è richiesta."),
  experienceLevel: z.string().min(1, "Il livello di esperienza è richiesto."),
  monthlyRate: z.string().min(1, "La fascia retributiva è richiesta."),
  alboRegistrationUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
  alboSelfCertified: z.boolean().optional(),
  uniCertificationUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
  uniSelfCertified: z.boolean().optional(),
  otherCertificationsUrl: z.string().url({ message: 'URL non valido.' }).optional().or(z.literal('')),
  otherCertificationsSelfCertified: z.boolean().optional(),
});

type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;
type CertificationType = 'albo' | 'uni' | 'other' | 'cv';


const mapProfileToFormData = (profile?: FullProfessionalProfile | null): ProfessionalProfileFormData => {
  const p = (profile || {}) as FullProfessionalProfile;
  return {
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    displayName: p.displayName || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
    location: p.location || '',
    bio: p.bio || '',
    bimSkills: p.bimSkills || [],
    softwareProficiency: p.softwareProficiency || [],
    workMode: p.workMode || '',
    availability: p.availability || '',
    locationMode: p.locationMode || '',
    experienceLevel: p.experienceLevel || '',
    monthlyRate: typeof p.monthlyRate === 'string' ? p.monthlyRate : (p.monthlyRate ? String(p.monthlyRate) : ''),
    alboRegistrationUrl: p.alboRegistrationUrl || '',
    alboSelfCertified: p.alboSelfCertified || false,
    uniCertificationUrl: p.uniCertificationUrl || '',
    uniSelfCertified: p.uniSelfCertified || false,
    otherCertificationsUrl: p.otherCertificationsUrl || '',
    otherCertificationsSelfCertified: p.otherCertificationsSelfCertified || false,
  };
};

const selfCertifiedFieldName = (cert: CertificationType) => {
  if (cert === 'albo') return 'alboSelfCertified';
  if (cert === 'uni') return 'uniSelfCertified';
  return 'otherCertificationsSelfCertified';
};


export default function ProfessionalProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { db, storage } = useFirebase();
  const { uploadFile } = useSecureFileUpload();

  // Profile strength calculation
  const strengthData = useProfileStrength(userProfile as FullProfessionalProfile);

  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [alboPdfFile, setAlboPdfFile] = useState<File | null>(null);
  const [uniPdfFile, setUniPdfFile] = useState<File | null>(null);
  const [otherCertPdfFile, setOtherCertPdfFile] = useState<File | null>(null);
  const [cvPdfFile, setCvPdfFile] = useState<File | null>(null);
  
  const [alboUploadProgress, setAlboUploadProgress] = useState<number | null>(null);
  const [uniUploadProgress, setUniUploadProgress] = useState<number | null>(null);
  const [otherCertUploadProgress, setOtherCertUploadProgress] = useState<number | null>(null);
  const [cvUploadProgress, setCvUploadProgress] = useState<number | null>(null);
  
  const [isUploadingAnyFile, setIsUploadingAnyFile] = useState(false);

  const alboInputRef = useRef<HTMLInputElement>(null);
  const uniInputRef = useRef<HTMLInputElement>(null);
  const otherCertInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  
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
          form.setValue(selfCertifiedFieldName(certType) as any, true);
          if (certType === 'albo') setAlboPdfFile(null);
          if (certType === 'uni') setUniPdfFile(null);
          if (certType === 'other') setOtherCertPdfFile(null);
          form.setValue((certType === 'albo' ? 'alboRegistrationUrl' : certType === 'uni' ? 'uniCertificationUrl' : 'otherCertificationsUrl') as any, '');
          setCertDialogState({ isOpen: false, certType: null, onConfirm: () => {} });
        },
      });
    } else {
      form.setValue(selfCertifiedFieldName(certType) as any, false);
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
    form.setValue(`${certType}SelfCertified` as any, false as any);
      }
    }
  };


  // Secure file upload function using server-side validation
  const uploadFileAndGetURL = async (
    file: File,
    folder: string,
    setProgress: React.Dispatch<React.SetStateAction<number | null>>
  ): Promise<string> => {
    if (!user) throw new Error("Utente non loggato.");
    
    console.log('Secure upload starting:', {
      userUID: user.uid,
      folder: folder,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    setIsUploadingAnyFile(true);
    
    // Determine file type for validation
    const fileType: 'image' | 'document' = folder === 'profileImages' ? 'image' : 'document';
    
    // Determine size limits
    const maxSizeBytes = fileType === 'image' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    
    try {
      // Use secure upload with server-side validation
      const downloadURL = await uploadFile(file, user.uid, {
        folder: folder,
        fileType: fileType,
        maxSizeBytes: maxSizeBytes,
        onProgress: (progress) => {
          setProgress(progress);
        },
        onError: (error) => {
          console.error('Secure upload error:', error);
          setProgress(null);
          setIsUploadingAnyFile(false);
        },
        onSuccess: (url) => {
          console.log('Secure upload successful:', url);
          setProgress(100);
        }
      });
      
      return downloadURL;
      
    } catch (error) {
      setProgress(null);
      setIsUploadingAnyFile(false);
      throw error;
    }
  };
  
  const openDeleteConfirmation = (certType: CertificationType) => {
    setDeleteDialogState({ isOpen: true, certType });
  };

  const handleConfirmDeleteCertification = async () => {
    const certType = deleteDialogState.certType;
    if (!certType || !user || !userProfile || !storage || !db) {
        toast({ title: "Errore", description: "Impossibile procedere: dati mancanti.", variant: "destructive" });
        setDeleteDialogState({ isOpen: false, certType: null });
        return;
    }

    setIsDeletingFile(true);
    try {
        const urlKeyMap: Record<CertificationType, keyof FullProfessionalProfile> = {
            albo: 'alboRegistrationUrl',
            uni: 'uniCertificationUrl',
            other: 'otherCertificationsUrl',
            cv: 'cvUrl'
        };
        const selfCertifiedKeyMap: Record<CertificationType, keyof FullProfessionalProfile> = {
            albo: 'alboSelfCertified',
            uni: 'uniSelfCertified',
            other: 'otherCertificationsSelfCertified',
            cv: 'cvUrl' as any // CV doesn't have self-certification
        };

        const urlToDeleteKey = urlKeyMap[certType];
        const selfCertifiedKey = selfCertifiedKeyMap[certType];

        const urlToDelete = (userProfile as FullProfessionalProfile)[urlToDeleteKey] as string | undefined;

        if (urlToDelete) {
            try {
                const fileRef = storageRef(storage, urlToDelete);
                await deleteObject(fileRef);
            } catch (error: any) {
                if (error.code !== 'storage/object-not-found') {
                    throw error;
                }
                // File already deleted from storage
            }
        }
        
        const updatePayload = {
          [urlToDeleteKey]: deleteField(),
          [selfCertifiedKey]: deleteField(),
        };
        
        await updateUserProfile(updatePayload);
        await form.trigger(); // Re-validate the form after deletion
        
        toast({ title: "Documento Eliminato", description: "Il documento è stato rimosso con successo." });

    } catch (error: any) {
        // Error during certification deletion
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
    try {
        let photoURLToUpdate = (userProfile as FullProfessionalProfile).photoURL || '';
        
    const dataToUpdate: {[key: string]: any} = {
      ...data,
      displayName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      monthlyRate: data.monthlyRate ?? '',
    };

        if (profileImageFile) {
            setIsUploadingImage(true);
            photoURLToUpdate = await uploadFileAndGetURL(profileImageFile, 'profileImages', setImageUploadProgress);
            setIsUploadingImage(false);
        }
        dataToUpdate.photoURL = photoURLToUpdate;

        const certs: CertificationType[] = ['cv', 'albo', 'uni', 'other'];
        const urlKeyMap: Record<CertificationType, keyof FullProfessionalProfile> = {
            albo: 'alboRegistrationUrl', uni: 'uniCertificationUrl', other: 'otherCertificationsUrl', cv: 'cvUrl'
        };
        const fileMap: Record<CertificationType, File | null> = {
            albo: alboPdfFile, uni: uniPdfFile, other: otherCertPdfFile, cv: cvPdfFile
        };
        const progressMap: Record<CertificationType, React.Dispatch<React.SetStateAction<number|null>>> = {
            albo: setAlboUploadProgress, uni: setUniUploadProgress, other: setOtherCertUploadProgress, cv: setCvUploadProgress
        };
        
        for (const cert of certs) {
            const urlKey = urlKeyMap[cert];
            const file = fileMap[cert];
            const selfCertified = cert !== 'cv' ? (data as any)[`${cert}SelfCertified`] : false;

            if (file) {
                const folderPath = cert === 'cv' ? 'cvs' : `certifications/${cert}`;
                const url = await uploadFileAndGetURL(file, folderPath, progressMap[cert]);
                dataToUpdate[urlKey] = url;
                if (cert !== 'cv') {
                    dataToUpdate[`${cert}SelfCertified`] = false;
                }
            } else if (cert !== 'cv' && selfCertified) {
                dataToUpdate[urlKey] = deleteField();
                dataToUpdate[`${cert}SelfCertified`] = true;
            } else {
            if ((data as any)[urlKey] === '' || (data as any)[urlKey] === null || (data as any)[urlKey] === undefined) {
              dataToUpdate[urlKey] = deleteField();
                    if (cert !== 'cv') {
                        dataToUpdate[`${cert}SelfCertified`] = deleteField();
                    }
                 }
            }
        }

        await updateUserProfile(dataToUpdate);
        
        toast({ title: "Profilo Aggiornato", description: "Le modifiche sono state salvate con successo." });
        
        setProfileImageFile(null);
        setCvPdfFile(null);
        setAlboPdfFile(null);
        setUniPdfFile(null);
        setOtherCertPdfFile(null);
        if (profileImageInputRef.current) profileImageInputRef.current.value = "";
        if (cvInputRef.current) cvInputRef.current.value = "";
        if (alboInputRef.current) alboInputRef.current.value = "";
        if (uniInputRef.current) uniInputRef.current.value = "";
        if (otherCertInputRef.current) otherCertInputRef.current.value = "";

    } catch (error: any) {
        toast({ title: "Errore", description: "Impossibile salvare le modifiche al profilo.", variant: "destructive" });
    } finally {
        setIsUploadingImage(false);
        setIsUploadingAnyFile(false);
        setImageUploadProgress(null);
        setCvUploadProgress(null);
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


  if (authLoading && !userProfile) {
    return <div className="text-center py-10">Caricamento profilo...</div>;
  }

  if (!user || !userProfile || userProfile.role !== 'professional') {
    return <div className="text-center py-10">Profilo non trovato o non autorizzato.</div>;
  }
  
  const CertificationSection = ({ certType, title, icon, fileState, progressState, inputRef, onDelete, showSelfCertify = true }: {
      certType: CertificationType;
      title: string;
      icon: React.ElementType;
      fileState: File | null;
      progressState: number | null;
      inputRef: React.RefObject<HTMLInputElement>;
      onDelete: (certType: CertificationType) => void;
      showSelfCertify?: boolean;
  }) => {
    const IconComponent = icon;
    const isUploadingThisFile = progressState !== null && progressState < 100;

    const urlKeyMap: Record<CertificationType, keyof FullProfessionalProfile> = {
        albo: 'alboRegistrationUrl',
        uni: 'uniCertificationUrl',
        other: 'otherCertificationsUrl',
        cv: 'cvUrl'
    };
    const urlKey = urlKeyMap[certType];
    const currentUrl = (userProfile as FullProfessionalProfile)?.[urlKey] as string | undefined;
  const selfCertified = certType !== 'cv' ? (form.watch(`${certType}SelfCertified` as any) as boolean) : false;
    const hasExistingFile = !!currentUrl;
    const hasPendingFile = !!fileState;

    return (
      <FormItem className="border p-2.5 sm:p-3 rounded-md shadow-sm bg-muted/30">
        <FormLabel className="text-sm font-semibold text-primary flex items-center">
          <IconComponent className="mr-1.5 h-4 w-4" />
          <span className="text-xs sm:text-sm">{title}</span>
        </FormLabel>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 mt-1.5">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploadingAnyFile || selfCertified} className="w-full sm:w-auto text-xs h-8">
            <Upload className="mr-1.5 h-3.5 w-3.5" /> {hasExistingFile ? 'Modifica' : 'Carica'}
          </Button>
          {hasExistingFile && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-8 px-2.5 py-1 text-xs w-full sm:w-auto"
              onClick={() => onDelete(certType)}
              disabled={isUploadingAnyFile || selfCertified}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              <span>Elimina</span>
            </Button>
          )}
        </div>
        
        <div className="mt-1.5 text-xs text-muted-foreground">
          {hasPendingFile && (
            <span className="truncate block">Selezionato: {fileState.name}</span>
          )}
          {!hasPendingFile && hasExistingFile && (
            <Link href={currentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
              <LinkIcon className="mr-1 h-3.5 w-3.5" /> Visualizza PDF
            </Link>
          )}
        </div>

        {isUploadingThisFile && progressState !== null && (
          <div className="mt-1.5"><Progress value={progressState} className="w-full h-1.5" /><p className="text-xs text-muted-foreground mt-1">Caricamento: {Math.round(progressState)}%</p></div>
        )}
        {hasPendingFile && (
           <p className="text-xs text-green-600 mt-1">Nuovo file pronto. Clicca "Salva Profilo".</p>
        )}
        <FormDescription className="text-xs mt-1">Max {MAX_PDF_SIZE_MB}MB (PDF).</FormDescription>

        {showSelfCertify && (
            <div className="flex items-start space-x-2 mt-2.5 pt-2.5 border-t border-border/50">
          <FormField
            control={form.control}
            name={`${certType}SelfCertified` as any}
            render={({ field }) => (
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id={`${certType}SelfCertified`}
                        checked={field.value as any}
                        onCheckedChange={(checked) => handleCertificationCheckboxChange(certType, !!checked)}
                        disabled={isUploadingAnyFile || (hasExistingFile as any) || (hasPendingFile as any) }
                        className="mt-0.5 sm:mt-0"
                      />
                      <label
                        htmlFor={`${certType}SelfCertified`}
                        className="text-xs sm:text-sm font-medium leading-tight sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                      >
                        In alternativa, autocertifico il possesso di questo requisito.
                      </label>
                    </div>
                  )}
                />
            </div>
        )}
      </FormItem>
    );
  };


  return (
    <>
    <div className="space-y-4 w-full max-w-7xl mx-auto">
      {/* Gamification Header */}
      <Card className="relative overflow-hidden border-2 shadow-xl bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Progress Ring */}
            <div className="flex-shrink-0">
              <ProfileStrengthMeter strengthData={strengthData} size="md" showDetails={true} />
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Il Mio Profilo Professionale
                </h1>
                <p className="text-muted-foreground mt-1">
                  Completa il tuo profilo per sbloccare più opportunità e aumentare la tua visibilità
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-2xl">
                <ProfileStrengthBar strengthData={strengthData} showBreakdown={false} />
              </div>

              {/* Next Milestone Hint */}
              {strengthData.nextMilestone && strengthData.nextMilestone.suggestions.length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-2xl">
                  <p className="text-sm font-semibold text-primary mb-1">💡 Suggerimento Rapido:</p>
                  <p className="text-xs text-muted-foreground">
                    {strengthData.nextMilestone.suggestions[0]} per guadagnare punti!
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Card */}
      <Card className="shadow-xl">
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
               <Tabs defaultValue="personal-info" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-3 h-auto">
                  <TabsTrigger value="personal-info" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">Info Personali</TabsTrigger>
                  <TabsTrigger value="skills-details" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">Competenze</TabsTrigger>
                  <TabsTrigger value="certifications" className="text-xs sm:text-sm px-2 py-1.5 sm:px-3 sm:py-2">CV e Certificazioni</TabsTrigger>
                </TabsList>

                <TabsContent value="personal-info" className="space-y-4">
                  {/* Header con Avatar Gamification */}
                  <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-primary/30 shadow-lg">
                          <AvatarImage src={imagePreview || undefined} alt={(userProfile as FullProfessionalProfile).displayName || 'User'} data-ai-hint="profile person" />
                          <AvatarFallback className="text-3xl sm:text-4xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                            {getInitials((userProfile as FullProfessionalProfile).displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-background border-2 border-primary rounded-full p-1.5">
                          <span className="text-xl">{strengthData.levelEmoji}</span>
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-bold flex items-center justify-center sm:justify-start gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Profilo {strengthData.level}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {strengthData.powerPoints} Power Points • {Math.round((strengthData as any).percentage || 0)}% completato
                        </p>
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => profileImageInputRef.current?.click()}
                            className="bg-primary/10 hover:bg-primary/20 border-primary/30 text-xs"
                            disabled={isUploadingAnyFile}
                          >
                            <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Carica / Modifica Immagine</span>
                            <span className="sm:hidden">Carica Immagine</span>
                          </Button>
                          {profileImageFile && (
                            <span className="text-xs sm:text-sm text-muted-foreground truncate block mt-1">
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
                          <FormDescription className="text-xs mt-1">Max 2MB (JPG, PNG, WEBP)</FormDescription>
                        </div>
                      </div>
                    </div>
                    {isUploadingImage && imageUploadProgress !== null && (
                      <div className="mt-3">
                        <Progress value={imageUploadProgress} className="w-full h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Caricamento: {Math.round(imageUploadProgress)}%</p>
                      </div>
                    )}
                    {!isUploadingImage && imageUploadProgress === 100 && profileImageFile && (
                      <p className="text-sm text-green-600 mt-2">✓ Nuova immagine pronta per il salvataggio</p>
                    )}
                  </div>

                  {/* Dati Anagrafici */}
                  <div className="bg-card rounded-lg border p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <UserCircle2 className="h-4 w-4 text-primary" />
                      Dati Anagrafici
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormInput control={form.control} name="firstName" label="Nome" placeholder="Mario" />
                      <FormInput control={form.control} name="lastName" label="Cognome" placeholder="Rossi" />
                    </div>
                  </div>

                  {/* Riga a 3 colonne: Localizzazione, Cognome, Regione */}
                  <div className="bg-card rounded-lg border p-4 mb-4">
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Localizzazione e Regione
                    </h3>
                    <div>
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regione</FormLabel>
                            <FormControl>
                              <select
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-primary"
                                value={field.value || ''}
                                onChange={e => field.onChange(e.target.value)}
                              >
                                <option value="" disabled>-- Seleziona la regione --</option>
                                {ITALIAN_REGIONS.map(region => (
                                  <option key={region} value={region}>{region}</option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Bio Professionale */}
                  <div className="bg-card rounded-lg border p-4">
                    <FormTextarea
                      control={form.control}
                      name="bio"
                      label="📝 Breve Bio Professionale"
                      placeholder="Descrivi la tua esperienza, specializzazioni e obiettivi nel settore BIM..."
                      rows={4}
                    />
                  </div>

                  {/* Esperienza e Modalità Lavorativa */}
                  <div className="bg-card rounded-lg border p-4 space-y-4">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Esperienza e Disponibilità
                    </h3>

                    <FormSingleSelect
                      key={`experienceLevel-${form.watch('experienceLevel') || 'default'}`}
                      control={form.control}
                      name="experienceLevel"
                      label="Livello di Esperienza"
                      options={EXPERIENCE_LEVEL_OPTIONS}
                      placeholder="Seleziona il livello"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormSingleSelect
                        key={`workMode-${form.watch('workMode') || 'default'}`}
                        control={form.control}
                        name="workMode"
                        label="Modalità Lavorativa"
                        options={WORK_MODE_OPTIONS}
                        placeholder="Es: Full-time"
                      />

                      <FormSingleSelect
                        key={`availability-${form.watch('availability') || 'default'}`}
                        control={form.control}
                        name="availability"
                        label="Disponibilità Temporale"
                        options={AVAILABILITY_OPTIONS}
                        placeholder="Es: Immediata"
                      />
                    </div>

                    <FormSingleSelect
                      key={`locationMode-${form.watch('locationMode') || 'default'}`}
                      control={form.control}
                      name="locationMode"
                      label="Preferenza Sede di Lavoro"
                      options={LOCATION_MODE_OPTIONS}
                      placeholder="Es: Remoto, Ibrido, In Sede"
                    />
                  </div>

                  {/* Retribuzione */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20 p-4">
                    <FormSingleSelect
                      key={`monthlyRate-${form.watch('monthlyRate') || 'default'}`}
                      control={form.control}
                      name="monthlyRate"
                      label="💰 Fascia Retributiva Mensile Lorda"
                      options={MONTHLY_RATE_OPTIONS}
                      placeholder="Seleziona la fascia retributiva"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="skills-details" className="space-y-5">
                  <SkillsSelector
                    categories={BIM_SKILLS_CATEGORIES}
                    selectedSkills={form.watch('bimSkills') || []}
                    onChange={(skills) => form.setValue('bimSkills', skills)}
                    label="Competenze BIM Specialistiche"
                    description="Seleziona le tue competenze BIM organizzate per categoria"
                  />

                  <div className="border-t pt-5"></div>

                  <SkillsSelector
                    categories={SOFTWARE_CATEGORIES}
                    selectedSkills={form.watch('softwareProficiency') || []}
                    onChange={(skills) => form.setValue('softwareProficiency', skills)}
                    label="Software di Piena Competenza"
                    description="Seleziona solo i software che padroneggi completamente"
                  />
                </TabsContent>
                
                <TabsContent value="certifications" className="space-y-4">
                   <Input type="file" className="hidden" ref={cvInputRef} accept="application/pdf" onChange={(e) => handleGenericFileChange(e, setCvPdfFile, 'cv')} />
                   <Input type="file" className="hidden" ref={alboInputRef} accept="application/pdf" onChange={(e) => handleGenericFileChange(e, setAlboPdfFile, 'albo')} />
                   <Input type="file" className="hidden" ref={uniInputRef} accept="application/pdf" onChange={(e) => handleGenericFileChange(e, setUniPdfFile, 'uni')} />
                   <Input type="file" className="hidden" ref={otherCertInputRef} accept="application/pdf" onChange={(e) => handleGenericFileChange(e, setOtherCertPdfFile, 'other')} />

                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Documenti e Certificazioni
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <CertificationSection
                        certType="cv"
                        title="Curriculum Vitae"
                        icon={FileText}
                        fileState={cvPdfFile}
                        progressState={cvUploadProgress}
                        inputRef={cvInputRef}
                        onDelete={openDeleteConfirmation}
                        showSelfCertify={false}
                      />
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
                        showSelfCertify={false}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full md:w-auto mt-3" size="default" disabled={authLoading || form.formState.isSubmitting || isUploadingAnyFile}>
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
