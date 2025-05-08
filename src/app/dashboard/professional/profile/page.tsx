'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, UserCircle2 } from 'lucide-react';
import type { ProfessionalProfile } from '@/types/auth';
import { FormInput, FormTextarea, FormMultiSelect, FormSingleSelect } from '@/components/ProfileFormElements';
import { BIM_SKILLS_OPTIONS, SOFTWARE_PROFICIENCY_OPTIONS, AVAILABILITY_OPTIONS, ITALIAN_REGIONS } from '@/constants';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const professionalProfileSchema = z.object({
  firstName: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri.' }).optional(),
  lastName: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri.' }).optional(),
  displayName: z.string().min(2, "Il nome visualizzato è richiesto.").optional(), // Should be updated from firstName + lastName
  location: z.string().min(1, { message: 'La localizzazione è richiesta.' }).optional(),
  bio: z.string().max(1000, "La bio non può superare i 1000 caratteri.").optional().or(z.literal('')),
  bimSkills: z.array(z.string()).optional(),
  softwareProficiency: z.array(z.string()).optional(),
  availability: z.string().optional().or(z.literal('')),
  experienceLevel: z.string().optional().or(z.literal('')),
  portfolioUrl: z.string().url({ message: 'Inserisci un URL valido per il portfolio.' }).optional().or(z.literal('')),
  cvUrl: z.string().url({ message: 'Inserisci un URL valido per il CV (es. link a Google Drive, Dropbox).' }).optional().or(z.literal('')), // For simplicity, direct URL for now. File upload later.
  linkedInProfile: z.string().url({message: 'Inserisci un URL valido per LinkedIn.'}).optional().or(z.literal('')),
  hourlyRate: z.number().positive({ message: 'La tariffa oraria deve essere un numero positivo.' }).optional().or(z.literal(0)).or(z.literal('')),
  // photoURL will be handled separately if we implement direct upload. For now, relies on Google/initials.
});

type ProfessionalProfileFormData = z.infer<typeof professionalProfileSchema>;

export default function ProfessionalProfilePage() {
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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
        hourlyRate: currentProfile.hourlyRate || undefined,
      });
    }
  }, [userProfile, form]);
  

  const onSubmit = async (data: ProfessionalProfileFormData) => {
    if (!user || !userProfile) {
      toast({ title: "Errore", description: "Utente non autenticato.", variant: "destructive" });
      return;
    }
    
    // Update displayName if firstName or lastName changed
    const updatedDisplayName = `${data.firstName || userProfile.firstName || ''} ${data.lastName || userProfile.lastName || ''}`.trim();
    const dataToUpdate : Partial<ProfessionalProfile> = {
      ...data,
      displayName: updatedDisplayName,
      // Convert empty string hourlyRate to undefined to avoid Firestore errors if it's not set.
      hourlyRate: data.hourlyRate === '' ? undefined : Number(data.hourlyRate) || undefined,
    };


    try {
      await updateUserProfile(user.uid, dataToUpdate);
      // Toast is handled by updateUserProfile
    } catch (error) {
      // Toast is handled by updateUserProfile
      console.error('Profile update failed on page:', error);
    }
  };
  
  const experienceLevelOptions = [
    { value: "entry", label: "Entry Level (0-2 anni)" },
    { value: "junior", label: "Junior (2-5 anni)" },
    { value: "mid", label: "Mid-Level (5-10 anni)" },
    { value: "senior", label: "Senior (10+ anni)" },
    { value: "expert", label: "Expert / Specialist" },
  ];


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
                  options={experienceLevelOptions}
                  placeholder="Seleziona il tuo livello"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput control={form.control} name="portfolioUrl" label="Link al Portfolio (Opzionale)" placeholder="https://tuo.portfolio.com" />
                <FormInput control={form.control} name="cvUrl" label="Link al CV (Opzionale)" placeholder="Link a Google Drive, Dropbox, etc." description="Assicurati che il link sia accessibile." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput control={form.control} name="linkedInProfile" label="Profilo LinkedIn (Opzionale)" placeholder="https://linkedin.com/in/tuoprofilo" />
                <FormInput control={form.control} name="hourlyRate" label="Tariffa Oraria Indicativa (€) (Opzionale)" type="number" placeholder="Es. 50" />
              </div>
              
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
