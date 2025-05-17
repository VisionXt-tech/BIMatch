
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import type { CompanyRegistrationFormData } from '@/types/auth';
import { ROUTES, ITALIAN_REGIONS } from '@/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const companyRegistrationSchema = z.object({
  companyName: z.string().min(2, { message: 'Il nome azienda deve contenere almeno 2 caratteri.' }),
  companyVat: z.string().regex(/^[0-9]{11}$/, { message: 'La Partita IVA deve essere di 11 cifre.' }),
  companyLocation: z.string().min(1, { message: 'La localizzazione è richiesta.' }),
  // companyWebsite: z.string().url({ message: 'Inserisci un URL valido per il sito web.' }).optional().or(z.literal('')), // Rimosso perché opzionale
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  password: z.string().min(6, { message: 'La password deve contenere almeno 6 caratteri.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono.',
  path: ['confirmPassword'],
});

export default function CompanyRegistrationPage() {
  const { registerCompany, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<Omit<CompanyRegistrationFormData, 'companyWebsite'>>({ // Omit companyWebsite from form data type
    resolver: zodResolver(companyRegistrationSchema.omit({ companyWebsite: true })), // Omit from schema validation for the form
    defaultValues: {
      companyName: '',
      companyVat: '',
      companyLocation: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: Omit<CompanyRegistrationFormData, 'companyWebsite'>) => {
    try {
      // Pass the data including an empty companyWebsite if your registerCompany function expects it,
      // or adjust registerCompany to handle its absence.
      await registerCompany({ ...data, companyWebsite: '' }); 
      router.push(ROUTES.DASHBOARD_COMPANY_PROFILE); 
    } catch (error) {
      console.error('Company registration failed on page:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center p-6">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold">Registra la Tua Azienda</CardTitle>
          <CardDescription className="text-sm md:text-base">Trova i migliori talenti BIM per i tuoi progetti.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Azienda</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome della tua Azienda S.r.l." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyVat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partita IVA</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sede (Regione)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona regione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ITALIAN_REGIONS.map(region => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Aziendale (per login)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="hr@azienda.it" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min. 6 caratteri" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conferma Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ripeti la password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-6" disabled={authLoading}>
                {authLoading ? 'Registrazione in corso...' : 'Registra Azienda'}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Hai già un account?{' '}
            <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              Accedi
            </Link>
          </p>
           <p className="mt-2 text-center text-sm text-muted-foreground">
            Sei un professionista?{' '}
            <Link href={ROUTES.REGISTER_PROFESSIONAL} className="font-medium text-primary hover:underline">
              Registrati qui
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
