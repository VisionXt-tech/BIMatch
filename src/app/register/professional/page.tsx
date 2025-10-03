
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
import type { ProfessionalRegistrationFormData } from '@/types/auth';
import { ROUTES, ITALIAN_REGIONS } from '@/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const professionalRegistrationSchema = z.object({
  firstName: secureNameSchema,
  lastName: secureNameSchema,
  email: secureEmailSchema,
  location: z.string().min(1, { message: 'La localizzazione è richiesta.' }),
  password: strongPasswordSchema,
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
      router.push(ROUTES.DASHBOARD_PROFESSIONAL_PROFILE); 
    } catch (error) {
      // Error is handled by useAuth
    }
  };

  return (
    <div
      className="relative flex flex-grow flex-col items-center justify-center w-full px-4 py-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1744627049721-73c27008ad28?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      
      <Card className="w-full max-w-lg shadow-xl bg-card/90 dark:bg-card/80 backdrop-blur-md border border-white/10 my-auto">
        <CardHeader className="text-center p-3">
          <CardTitle className="text-lg font-bold text-primary">Registrati come Professionista BIM</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Unisciti a BIMatch e trova nuove opportunità.</CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-foreground">Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Mario" {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-foreground">Cognome</FormLabel>
                      <FormControl>
                        <Input placeholder="Rossi" {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
                      </FormControl>
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
                    <FormLabel className="text-xs text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="mario.rossi@esempio.com" {...field} className="h-9 text-foreground placeholder:text-muted-foreground" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-foreground">Localizzazione (Regione)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-foreground">
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
                {authLoading ? 'Registrazione in corso...' : 'Registrati'}
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
