
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
import { UserPlus } from 'lucide-react';
import type { ProfessionalRegistrationFormData } from '@/types/auth';
import { ROUTES, ITALIAN_REGIONS } from '@/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const professionalRegistrationSchema = z.object({
  firstName: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri.' }),
  lastName: z.string().min(2, { message: 'Il cognome deve contenere almeno 2 caratteri.' }),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  location: z.string().min(1, { message: 'La localizzazione è richiesta.' }),
  password: z.string().min(6, { message: 'La password deve contenere almeno 6 caratteri.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Le password non coincidono.',
  path: ['confirmPassword'],
});

export default function ProfessionalRegistrationPage() {
  const { registerProfessional, loading: authLoading } = useAuth();
  const router = useRouter();

  const form = useForm<ProfessionalRegistrationFormData>({
    resolver: zodResolver(professionalRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      location: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ProfessionalRegistrationFormData) => {
    try {
      await registerProfessional(data);
      router.push(ROUTES.DASHBOARD_PROFESSIONAL_PROFILE); // Redirect to complete profile
    } catch (error) {
      // Error is handled by useAuth and displayed via toast
      console.error('Professional registration failed on page:', error);
    }
  };

  return (
    <div className="flex justify-center items-center py-6 w-full">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center p-4">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Registrati come Professionista BIM</CardTitle>
          <CardDescription className="text-xs">Unisciti a BIMatch e trova nuove opportunità.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognome</FormLabel>
                      <FormControl>
                        <Input placeholder="Rossi" {...field} />
                      </FormControl>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="mario.rossi@esempio.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localizzazione (Regione)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona la tua regione" />
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
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? 'Registrazione in corso...' : 'Registrati'}
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
            Sei un'azienda?{' '}
            <Link href={ROUTES.REGISTER_COMPANY} className="font-medium text-primary hover:underline">
              Registrati qui
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
