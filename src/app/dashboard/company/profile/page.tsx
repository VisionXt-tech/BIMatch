
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, Building, Upload } from 'lucide-react';
import type { CompanyProfile } from '@/types/auth';
import { FormInput, FormTextarea, FormSingleSelect } from '@/components/ProfileFormElements';
import { COMPANY_SIZE_OPTIONS, INDUSTRY_SECTORS, ITALIAN_REGIONS } from '@/constants';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/contexts/FirebaseContext';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const companyProfileSchema = z.object({
  companyName: z.string().min(2, { message: 'Il nome azienda deve contenere almeno 2 caratteri.' }),
  companyVat: z.string().regex(/^[0-9]{11}$/, { message: 'La Partita IVA deve essere di 11 cifre.' }),
  companyLocation: z.string().min(1, { message: 'La sede è richiesta.' }),
  companyWebsite: z.string().url({ message: 'Inserisci un URL valido per il sito web.' }),
  companySize: z.string().min(1, { message: 'Le dimensioni azienda sono richieste.' }),
  industry: z.string().min(1, { message: 'Il settore di attività è richiesto.' }),
  companyDescription: z.string().min(1, "La descrizione azienda è richiesta.").max(2000, "La descrizione non può superare i 2000 caratteri."),
  contactPerson: z.string().min(2, "Il nome della persona di riferimento è richiesto."),
  contactEmail: z.string().email("L'email di contatto è richiesta e deve essere valida."),
  contactPhone: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, "Il numero di telefono di contatto è richiesto e deve essere valido."),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export default function CompanyProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { storage } = useFirebase();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);


  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: '',
      companyVat: '',
      companyLocation: '',
      companyWebsite: '',
      companySize: '',
      industry: '',
      companyDescription: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  useEffect(() => {
    if (userProfile && userProfile.role === 'company' && !profileDataLoaded) {
      const currentProfile = userProfile as CompanyProfile;
      form.reset({
        companyName: currentProfile.companyName || '',
        companyVat: currentProfile.companyVat || '',
        companyLocation: currentProfile.companyLocation || '',
        companyWebsite: currentProfile.companyWebsite || '',
        companySize: currentProfile.companySize || '',
        industry: currentProfile.industry || '',
        companyDescription: currentProfile.companyDescription || '',
        contactPerson: currentProfile.contactPerson || '',
        contactEmail: currentProfile.contactEmail || '',
        contactPhone: currentProfile.contactPhone || '',
      });
      if (currentProfile.logoUrl) {
        setLogoPreview(currentProfile.logoUrl);
      }
      setProfileDataLoaded(true); // Mark data as loaded into the form
    }
  }, [userProfile, form, profileDataLoaded]);

  const handleLogoPickerClick = () => {
    logoInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
          toast({ title: "Formato File Non Valido", description: "Seleziona un file immagine (es. JPG, PNG, WEBP).", variant: "destructive"});
          if(event.target) event.target.value = ''; 
          setLogoFile(null);
          return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          toast({ title: "File Troppo Grande", description: "Il logo non deve superare i 2MB.", variant: "destructive"});
          if(event.target) event.target.value = ''; 
          setLogoFile(null);
          return;
      }
      if (file.size === 0) {
        toast({ title: "File Vuoto", description: "Il file selezionato è vuoto e non può essere caricato.", variant: "destructive" });
        if(event.target) event.target.value = ''; 
        setLogoFile(null);
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setUploadProgress(null);
      setIsUploading(false);
    } else {
      setLogoFile(null);
      setLogoPreview((userProfile as CompanyProfile)?.logoUrl || null);
    }
  };


  const onSubmit = async (data: CompanyProfileFormData) => {
    if (!user || !userProfile) {
      toast({ title: "Errore", description: "Utente non autenticato.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let logoUrlToUpdate = (userProfile as CompanyProfile)?.logoUrl || '';

    if (logoFile && storage) {
      const filePath = `companyLogos/${user.uid}/${Date.now()}_${logoFile.name}`;
      const fileRef = storageRef(storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, logoFile);

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
              let userFriendlyMessage = "Errore durante il caricamento del logo.";
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
                   userFriendlyMessage = `Errore caricamento logo: ${error.message || 'Vedi console per dettagli.'}`;
              }
              toast({ title: "Errore Caricamento Logo", description: userFriendlyMessage, variant: "destructive" });
              setIsUploading(false);
              setUploadProgress(null);
              reject(error);
            },
            async () => {
              try {
                logoUrlToUpdate = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch (getUrlError: any) {
                toast({ title: "Errore URL Logo", description: `Impossibile ottenere l'URL del logo: ${(getUrlError as Error).message}`, variant: "destructive" });
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

    const dataToUpdate : Partial<CompanyProfile> = {
        ...data,
        displayName: data.companyName || (userProfile as CompanyProfile).companyName,
        logoUrl: logoUrlToUpdate,
    };

    try {
      await updateUserProfile(user.uid, dataToUpdate);
      setLogoFile(null); 
      if (logoInputRef.current) { 
        logoInputRef.current.value = "";
      }
      setProfileDataLoaded(false); // Trigger profile data reload into form
    } catch (error) {
      // updateUserProfile in AuthContext should handle its own toasts
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.substring(0, 2).toUpperCase();
  };


  if (authLoading) {
    return <div className="text-center py-10">Caricamento profilo aziendale...</div>;
  }

  if (!userProfile || userProfile.role !== 'company') {
    return <div className="text-center py-10">Profilo aziendale non trovato o non autorizzato.</div>;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-xl">
        <CardHeader className="p-4">
          <div className="flex items-center space-x-3">
            <Building className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-lg font-bold">Profilo Aziendale</CardTitle>
              <CardDescription className="text-xs">Gestisci le informazioni della tua azienda per attrarre i migliori talenti BIM.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <FormItem>
                <FormLabel className="text-xs">Logo Aziendale</FormLabel>
                <div className="flex items-center space-x-4 mt-1">
                  <Avatar className="h-20 w-20 rounded-md">
                    <AvatarImage src={logoPreview || (userProfile as CompanyProfile).logoUrl || undefined} alt={(userProfile as CompanyProfile).companyName || 'Logo Azienda'} data-ai-hint="company logo" className="object-contain"/>
                    <AvatarFallback className="rounded-md text-xl">{getInitials((userProfile as CompanyProfile).companyName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleLogoPickerClick}
                      className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit file:border-0 file:bg-accent file:text-accent-foreground file:hover:bg-accent/90 file:rounded-sm file:px-3 file:py-1.5 file:mr-4 file:text-xs file:font-medium"
                    >
                      <Upload className="mr-2 h-3 w-3" />
                      Scegli Logo
                    </Button>
                    {logoFile && (
                      <span className="text-xs text-muted-foreground">
                        File: {logoFile.name}
                      </span>
                    )}
                    <FormControl>
                      <Input
                          type="file"
                          accept="image/jpeg, image/png, image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                          ref={logoInputRef}
                           />
                    </FormControl>
                  </div>
                </div>
                {isUploading && uploadProgress !== null && (
                  <div className="mt-2">
                    <Progress value={uploadProgress} className="w-full h-1.5" />
                    <p className="text-xs text-muted-foreground mt-0.5">Caricamento: {Math.round(uploadProgress)}%</p>
                  </div>
                )}
                {!isUploading && uploadProgress === null && logoFile && (
                   <p className="text-xs text-green-600 mt-0.5">Nuovo logo selezionato. Salva per applicare.</p>
                 )}
                <FormDescription className="text-xs mt-0.5">Carica il logo (max 2MB, es. JPG, PNG, WEBP).</FormDescription>
                 <FormMessage className="text-xs"/>
              </FormItem>

              <Tabs defaultValue="info-azienda" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="info-azienda">Info Azienda</TabsTrigger>
                  <TabsTrigger value="info-contatto">Info di Contatto</TabsTrigger>
                </TabsList>

                <TabsContent value="info-azienda" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput control={form.control} name="companyName" label="Nome Azienda" placeholder="La Mia Azienda S.r.l." />
                    <FormInput control={form.control} name="companyVat" label="Partita IVA" placeholder="12345678901" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSingleSelect
                      control={form.control}
                      name="companyLocation"
                      label="Sede Azienda (Regione)"
                      options={ITALIAN_REGIONS.map(r => ({ value: r, label: r }))}
                      placeholder="Seleziona la regione della sede"
                    />
                    <FormInput control={form.control} name="companyWebsite" label="Sito Web" placeholder="https://www.lamiaazienda.it" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormSingleSelect
                      control={form.control}
                      name="companySize"
                      label="Dimensioni Azienda"
                      options={COMPANY_SIZE_OPTIONS}
                      placeholder="Seleziona dimensioni"
                    />
                    <FormSingleSelect
                      control={form.control}
                      name="industry"
                      label="Settore di Attività"
                      options={INDUSTRY_SECTORS}
                      placeholder="Seleziona settore"
                    />
                  </div>
                  <FormTextarea control={form.control} name="companyDescription" label="Descrizione Azienda" placeholder="Descrivi la tua azienda, la mission, i valori e i tipi di progetti..." rows={4} />
                </TabsContent>

                <TabsContent value="info-contatto" className="space-y-4">
                  <FormInput control={form.control} name="contactPerson" label="Persona di Riferimento" placeholder="Mario Rossi" />
                  <FormInput control={form.control} name="contactEmail" label="Email di Contatto" placeholder="info@lamiaazienda.it" type="email"/>
                  <FormInput control={form.control} name="contactPhone" label="Telefono di Contatto" placeholder="+39 02 1234567" type="tel"/>
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


    