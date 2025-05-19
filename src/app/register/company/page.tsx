
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
import type { CompanyRegistrationFormData } from '@/types/auth';
import { ROUTES, ITALIAN_REGIONS } from '@/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Schema only for the fields present in the form
const companyRegistrationFormSchema = z.object({
  companyName: z.string().min(2, { message: 'Il nome azienda deve contenere almeno 2 caratteri.' }),
  companyVat: z.string().regex(/^[0-9]{11}$/, { message: 'La Partita IVA deve essere di 11 cifre.' }),
  companyLocation: z.string().min(1, { message: 'La localizzazione è richiesta.' }),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  password: z.string().min(6, { message: 'La password deve contenere almeno 6 caratteri.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono.',
  path: ['confirmPassword'],
});

// Type for the form data, explicitly Omit companyWebsite
type CompanyRegistrationFormDataType = Omit<CompanyRegistrationFormData, 'companyWebsite'>;


export default function CompanyRegistrationPage() {
  const { registerCompany, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<CompanyRegistrationFormDataType>({
    resolver: zodResolver(companyRegistrationFormSchema), 
    defaultValues: {
      companyName: '',
      companyVat: '',
      companyLocation: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: CompanyRegistrationFormDataType) => {
    try {
      // Pass the form data, and explicitly add an empty companyWebsite
      // to satisfy the full CompanyRegistrationFormData type expected by registerCompany
      await registerCompany({ ...data, companyWebsite: '' }); 
      router.push(ROUTES.DASHBOARD_COMPANY_PROFILE); 
    } catch (error) {
      console.error('Company registration failed on page:', error);
    }
  };

  return (
    <div className="flex justify-center items-center py-4 w-full">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center p-3">
          <CardTitle className="text-lg font-bold">Registra la Tua Azienda</CardTitle>
          <CardDescription className="text-xs">Trova i migliori talenti BIM per i tuoi progetti.</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Nome Azienda</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome della tua Azienda S.r.l." {...field} className="h-9" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="companyVat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Partita IVA</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} className="h-9" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Sede (Regione)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9">
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
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email Aziendale (per login)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="hr@azienda.it" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min. 6 caratteri" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Conferma Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ripeti la password" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-4" size="sm" disabled={authLoading}>
                {authLoading ? 'Registrazione in corso...' : 'Registra Azienda'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Hai già un account?{' '}
            <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              Accedi
            </Link>
          </p>
           <p className="mt-1 text-center text-xs text-muted-foreground">
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
