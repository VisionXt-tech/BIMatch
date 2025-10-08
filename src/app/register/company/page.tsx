
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { strongPasswordSchema, secureEmailSchema, secureNameSchema } from '@/lib/validation/password';
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

const companyRegistrationSchema = z.object({
  companyName: z.string().min(2, { message: 'Il nome azienda deve contenere almeno 2 caratteri.' }),
  companyVat: z.string().regex(/^[0-9]{11}$/, { message: 'La Partita IVA deve essere di 11 cifre.' }),
  companyLocation: z.string().min(1, { message: 'La localizzazione è richiesta.' }),
  email: secureEmailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono.',
  path: ['confirmPassword'],
});

export default function CompanyRegistrationPage() {
  const { registerCompany, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<Omit<CompanyRegistrationFormData, 'companyWebsite'>>({
  resolver: zodResolver(companyRegistrationSchema) as any,
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
      await registerCompany({ ...data, companyWebsite: '' }); 
      router.push(ROUTES.DASHBOARD_COMPANY_PROFILE); 
    } catch (error) {
      // Error is handled by useAuth
    }
  };

  return (
    <div
      className="relative flex flex-grow flex-col items-center justify-center w-full px-4 py-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <Card className="relative z-10 w-full max-w-lg shadow-xl bg-card/90 dark:bg-card/80 backdrop-blur-md border border-white/10 my-auto">
        <CardHeader className="text-center p-3">
          <CardTitle className="text-lg font-bold text-primary">Registra la Tua Azienda</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Trova i migliori talenti BIM per i tuoi progetti.</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground">Nome Azienda</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome della tua Azienda S.r.l." {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
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
                      <FormLabel className="text-xs text-foreground">Partita IVA</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
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
                      <FormLabel className="text-xs text-foreground">Sede (Regione)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-9 text-foreground">
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
                    <FormLabel className="text-xs text-foreground">Email Aziendale (per login)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="hr@azienda.it" {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
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
                    <FormLabel className="text-xs text-foreground">Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min. 6 caratteri" {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
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
                    <FormLabel className="text-xs text-foreground">Conferma Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ripeti la password" {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" size="sm" disabled={authLoading}>
                {authLoading ? 'Registrazione in corso...' : 'Registra Azienda'}
              </Button>
            </form>
          </Form>
          <p className="mt-3 text-center text-xs text-muted-foreground">
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
