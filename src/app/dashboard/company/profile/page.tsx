'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, Building } from 'lucide-react';
import type { CompanyProfile } from '@/types/auth';
import { FormInput, FormTextarea, FormSingleSelect } from '@/components/ProfileFormElements';
import { COMPANY_SIZE_OPTIONS, INDUSTRY_SECTORS, ITALIAN_REGIONS } from '@/constants';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const companyProfileSchema = z.object({
  companyName: z.string().min(2, { message: 'Il nome azienda deve contenere almeno 2 caratteri.' }).optional(),
  companyVat: z.string().regex(/^[0-9]{11}$/, { message: 'La Partita IVA deve essere di 11 cifre.' }).optional(),
  companyLocation: z.string().min(1, { message: 'La localizzazione è richiesta.' }).optional(),
  companyWebsite: z.string().url({ message: 'Inserisci un URL valido.' }).optional().or(z.literal('')),
  companySize: z.string().optional().or(z.literal('')),
  industry: z.string().optional().or(z.literal('')),
  companyDescription: z.string().max(2000, "La descrizione non può superare i 2000 caratteri.").optional().or(z.literal('')),
  // logoUrl will be handled separately for file upload
  contactPerson: z.string().min(2, "Il nome del contatto è richiesto.").optional().or(z.literal('')),
  contactEmail: z.string().email("Inserisci un'email di contatto valida.").optional().or(z.literal('')),
  contactPhone: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, "Inserisci un numero di telefono valido.").optional().or(z.literal('')),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

export default function CompanyProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
    if (userProfile && userProfile.role === 'company') {
      const currentProfile = userProfile as CompanyProfile;
      form.reset({
        companyName: currentProfile.companyName || '',
        // displayName is companyName for companies
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
    }
  }, [userProfile, form]);

  const onSubmit = async (data: CompanyProfileFormData) => {
    if (!user || !userProfile) {
      toast({ title: "Errore", description: "Utente non autenticato.", variant: "destructive" });
      return;
    }
    
    const dataToUpdate : Partial<CompanyProfile> = {
        ...data,
        displayName: data.companyName || userProfile.companyName, // Ensure displayName is updated if companyName changes
    };

    try {
      await updateUserProfile(user.uid, dataToUpdate);
      // Toast is handled by updateUserProfile
    } catch (error) {
      // Toast is handled by updateUserProfile
      console.error('Company profile update failed on page:', error);
    }
  };

  if (authLoading) {
    return <div className="text-center py-10">Caricamento profilo aziendale...</div>;
  }

  if (!userProfile || userProfile.role !== 'company') {
    return <div className="text-center py-10">Profilo aziendale non trovato o non autorizzato.</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Profilo Aziendale</CardTitle>
              <CardDescription>Gestisci le informazioni della tua azienda per attrarre i migliori talenti BIM.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput control={form.control} name="companyName" label="Nome Azienda" placeholder="La Mia Azienda S.r.l." />
                <FormInput control={form.control} name="companyVat" label="Partita IVA" placeholder="12345678901" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormSingleSelect
                  control={form.control}
                  name="companyLocation"
                  label="Sede Azienda (Regione)"
                  options={ITALIAN_REGIONS.map(r => ({ value: r, label: r }))}
                  placeholder="Seleziona la regione della sede"
                />
                <FormInput control={form.control} name="companyWebsite" label="Sito Web (Opzionale)" placeholder="https://www.lamiaazienda.it" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormSingleSelect
                  control={form.control}
                  name="companySize"
                  label="Dimensioni Azienda (Opzionale)"
                  options={COMPANY_SIZE_OPTIONS}
                  placeholder="Seleziona dimensioni"
                />
                <FormSingleSelect
                  control={form.control}
                  name="industry"
                  label="Settore di Attività (Opzionale)"
                  options={INDUSTRY_SECTORS}
                  placeholder="Seleziona settore"
                />
              </div>
              
              <FormTextarea control={form.control} name="companyDescription" label="Descrizione Azienda (Opzionale)" placeholder="Descrivi la tua azienda, la mission, i valori e i tipi di progetti..." rows={5} />
              
              <CardTitle className="text-xl font-semibold pt-4 border-t mt-4">Informazioni di Contatto</CardTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput control={form.control} name="contactPerson" label="Persona di Riferimento (Opzionale)" placeholder="Mario Rossi" />
                <FormInput control={form.control} name="contactEmail" label="Email di Contatto (Opzionale)" placeholder="info@lamiaazienda.it" type="email"/>
                <FormInput control={form.control} name="contactPhone" label="Telefono di Contatto (Opzionale)" placeholder="+39 02 1234567" type="tel"/>
              </div>
              
              {/* TODO: Logo upload functionality */}
              {/* <FormItem>
                <FormLabel>Logo Aziendale</FormLabel>
                <Input type="file" />
                <FormDescription>Carica il logo della tua azienda (max 2MB).</FormDescription>
              </FormItem> */}
              
              <Button type="submit" className="w-full md:w-auto" disabled={authLoading || form.formState.isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                 {form.formState.isSubmitting ? 'Salvataggio in corso...' : 'Salva Modifiche'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
