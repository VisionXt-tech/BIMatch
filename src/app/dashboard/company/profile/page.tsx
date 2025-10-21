
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
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const companyProfileSchema = z.object({
  companyName: z.string().min(2, { message: 'Il nome azienda deve contenere almeno 2 caratteri.' }),
  companyVat: z.string().regex(/^[0-9]{11}$/, { message: 'La Partita IVA deve essere di 11 cifre.' }),
  companyLocation: z.string().min(1, { message: 'La sede è richiesta.' }),
  companyWebsite: z.string().url({ message: 'Inserisci un URL valido per il sito web.' }).min(1, {message: "Il sito web è richiesto."}),
  companySize: z.string().min(1, { message: 'Le dimensioni azienda sono richieste.' }),
  industry: z.string().min(1, { message: 'Il settore di attività è richiesto.' }),
  companyDescription: z.string().min(1, "La descrizione azienda è richiesta.").max(2000, "La descrizione non può superare i 2000 caratteri."),
  contactPerson: z.string().min(2, "Il nome della persona di riferimento è richiesto."),
  contactEmail: z.string().email("L'email di contatto è richiesta e deve essere valida."),
  contactPhone: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, "Il numero di telefono di contatto è richiesto e deve essere valido."),
  // Legal data for contracts
  legalAddress: z.string().max(200, "L'indirizzo non può superare i 200 caratteri.").optional().or(z.literal('')),
  legalCity: z.string().max(100).optional().or(z.literal('')),
  legalCAP: z.string().regex(/^\d{5}$/, { message: 'CAP deve contenere 5 cifre' }).optional().or(z.literal('')),
  legalProvince: z.string().max(2).optional().or(z.literal('')),
  legalRepresentative: z.string().max(200).optional().or(z.literal('')),
  legalRepresentativeRole: z.string().max(100).optional().or(z.literal('')),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

const mapProfileToFormData = (profile?: CompanyProfile | null): CompanyProfileFormData => {
  const p = (profile || {}) as CompanyProfile;
  return {
    companyName: p.companyName || '',
    companyVat: p.companyVat || '',
    companyLocation: p.companyLocation || '',
    companyWebsite: p.companyWebsite || '',
    companySize: p.companySize || '',
    industry: p.industry || '',
    companyDescription: p.companyDescription || '',
    contactPerson: p.contactPerson || '',
    contactEmail: p.contactEmail || '',
    contactPhone: p.contactPhone || '',
    // Legal data
    legalAddress: p.legalAddress || '',
    legalCity: p.legalCity || '',
    legalCAP: p.legalCAP || '',
    legalProvince: p.legalProvince || '',
    legalRepresentative: p.legalRepresentative || '',
    legalRepresentativeRole: p.legalRepresentativeRole || '',
  };
};


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


  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: mapProfileToFormData(),
  });

  useEffect(() => {
    if (userProfile && userProfile.role === 'company') {
      const defaultValuesForForm = mapProfileToFormData(userProfile as CompanyProfile);
      form.reset(defaultValuesForForm);
      if (userProfile.logoUrl) {
        setLogoPreview(userProfile.logoUrl);
      } else {
        setLogoPreview(null);
      }
    } else if (!authLoading && !userProfile) {
      form.reset(mapProfileToFormData());
      setLogoPreview(null);
    }
  }, [userProfile, form, authLoading]);

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
      if (file.size > 2 * 1024 * 1024) {
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
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };


  const onSubmit = async (data: CompanyProfileFormData) => {
    if (!user || !userProfile) {
      toast({ title: "Errore", description: "Utente non autenticato.", variant: "destructive" });
      return;
    }

    let logoUrlToUpdate = (userProfile as CompanyProfile)?.logoUrl || '';

    if (logoFile && storage) {
      setIsUploading(true);
      setUploadProgress(0);
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
                   userFriendlyMessage = `Errore caricamento logo: ${error.message || 'Vedi console del browser per dettagli.'}`;
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
        displayName: data.companyName || (userProfile as CompanyProfile).companyName || userProfile.displayName,
        logoUrl: logoUrlToUpdate,
    };

    try {
      const updatedProfile = await updateUserProfile(dataToUpdate);
       if (updatedProfile) {
        toast({ title: "Profilo Aggiornato", description: "Le modifiche sono state salvate con successo." });
      }
      setLogoFile(null);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    } catch (error) {
    } finally {
       if (logoFile || isUploading) {
        setIsUploading(false);
        setUploadProgress(null);
      }
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'A';
    return name.substring(0, 2).toUpperCase();
  };


  if (authLoading && !userProfile) {
    return <div className="text-center py-10">Caricamento profilo aziendale...</div>;
  }

  if (!userProfile || userProfile.role !== 'company') {
    return <div className="text-center py-10">Profilo aziendale non trovato o non autorizzato.</div>;
  }

  return (
    <div className="space-y-4 w-full max-w-7xl mx-auto px-4">
      {/* Header */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                Profilo Aziendale
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestisci le informazioni della tua azienda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Card */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="base-info" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="base-info">Logo e Info Base</TabsTrigger>
                  <TabsTrigger value="legal-data">Dati Legali</TabsTrigger>
                  <TabsTrigger value="details">Dettagli Azienda</TabsTrigger>
                  <TabsTrigger value="contacts">Contatti</TabsTrigger>
                </TabsList>

                <TabsContent value="base-info" className="space-y-4">
                  <FormItem>
                      <FormLabel className="text-sm font-semibold text-primary">Logo Aziendale</FormLabel>
                      <div className="flex items-center space-x-4 pt-2">
                        <Avatar className="h-24 w-24 rounded-md border">
                            <AvatarImage src={logoPreview || undefined} alt={(userProfile as CompanyProfile).companyName || 'Logo Azienda'} data-ai-hint="company logo" className="object-contain"/>
                            <AvatarFallback className="rounded-md text-2xl">{getInitials((userProfile as CompanyProfile).companyName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleLogoPickerClick}
                                className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit"
                                >
                                <Upload className="mr-2 h-4 w-4" />
                                Carica / Modifica Logo
                            </Button>
                            {logoFile && (
                                <span className="text-sm text-muted-foreground">
                                File selezionato: {logoFile.name}
                                </span>
                            )}
                            <Input
                                type="file"
                                accept="image/jpeg, image/png, image/webp"
                                onChange={handleFileChange}
                                className="hidden"
                                ref={logoInputRef}
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
                      {!isUploading && uploadProgress === null && logoFile && (
                        <p className="text-sm text-green-600 mt-1">Nuovo logo pronto. Salva per applicare.</p>
                      )}
                      <FormMessage className="text-xs"/>
                  </FormItem>
                   <FormInput control={form.control} name="companyName" label="Nome Azienda" placeholder="La Mia Azienda S.r.l." />
                   <FormInput control={form.control} name="companyVat" label="Partita IVA" placeholder="12345678901" />
                </TabsContent>

                <TabsContent value="legal-data" className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      🔒 Dati Legali e Contrattuali
                    </p>
                    <p className="text-xs text-yellow-700 mt-2">
                      Questi dati sono richiesti per la generazione automatica dei contratti. Sono visibili solo a voi e agli amministratori, mai pubblici sul marketplace.
                    </p>
                  </div>

                  {/* Rappresentante Legale */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Rappresentante Legale</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormInput
                        control={form.control}
                        name="legalRepresentative"
                        label="Nome Completo"
                        placeholder="Giuseppe Verdi"
                        description="Nome del rappresentante legale dell'azienda"
                      />
                      <FormInput
                        control={form.control}
                        name="legalRepresentativeRole"
                        label="Ruolo"
                        placeholder="Amministratore Delegato"
                        description="Es. Amministratore Delegato, Presidente"
                      />
                    </div>
                  </div>

                  {/* Sede Legale */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Sede Legale</h3>
                    <FormInput
                      control={form.control}
                      name="legalAddress"
                      label="Indirizzo Completo"
                      placeholder="Via Dante 10"
                      description="Indirizzo della sede legale (può differire dalla sede operativa)"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormInput
                        control={form.control}
                        name="legalCity"
                        label="Città"
                        placeholder="Milano"
                      />
                      <FormInput
                        control={form.control}
                        name="legalCAP"
                        label="CAP"
                        placeholder="20100"
                        description="5 cifre"
                      />
                      <FormInput
                        control={form.control}
                        name="legalProvince"
                        label="Provincia"
                        placeholder="MI"
                        description="Sigla provincia (2 lettere)"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSingleSelect
                            key={`companyLocation-${form.watch('companyLocation') || 'default'}`}
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
                            key={`companySize-${form.watch('companySize') || 'default'}`}
                            control={form.control}
                            name="companySize"
                            label="Dimensioni Azienda"
                            options={COMPANY_SIZE_OPTIONS}
                            placeholder="Seleziona dimensioni"
                        />
                        <FormSingleSelect
                            key={`industry-${form.watch('industry') || 'default'}`}
                            control={form.control}
                            name="industry"
                            label="Settore di Attività"
                            options={INDUSTRY_SECTORS}
                            placeholder="Seleziona settore"
                        />
                    </div>
                    <FormTextarea control={form.control} name="companyDescription" label="Descrizione Azienda" placeholder="Descrivi la tua azienda, la mission, i valori e i tipi di progetti..." rows={5} />
                </TabsContent>

                <TabsContent value="contacts" className="space-y-4">
                  <FormInput control={form.control} name="contactPerson" label="Persona di Riferimento" placeholder="Mario Rossi" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput control={form.control} name="contactEmail" label="Email di Contatto Principale" placeholder="info@lamiaazienda.it" type="email"/>
                      <FormInput control={form.control} name="contactPhone" label="Telefono di Contatto Principale" placeholder="+39 02 1234567" type="tel"/>
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" className="w-full md:w-auto mt-3 bg-[#008080] hover:bg-[#006666]" size="default" disabled={authLoading || form.formState.isSubmitting || isUploading}>
                <Save className="mr-2 h-5 w-5" />
                 {isUploading ? `Caricamento Logo... ${uploadProgress !== null ? Math.round(uploadProgress) + '%' : ''}` : (form.formState.isSubmitting ? 'Salvataggio Profilo...' : 'Salva Profilo Aziendale')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
