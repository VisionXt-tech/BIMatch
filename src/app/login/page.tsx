
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
import { LogIn } from 'lucide-react';
import { ROUTES } from '@/constants';
import type { LoginFormData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  password: z.string().min(1, { message: 'La password è richiesta.' }),
});

export default function LoginPage() {
  const { login, loading: authLoading, requestPasswordReset } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      router.push(ROUTES.DASHBOARD); 
    } catch (error) {
      console.error('Login failed on page:', error);
    }
  };

  const handlePasswordReset = async () => {
    const email = form.getValues("email"); // Get email from the form if filled
    let userEmail = email;

    if (!userEmail) {
      userEmail = window.prompt("Inserisci la tua email per reimpostare la password:");
    } else {
      const confirmReset = window.confirm(`Vuoi inviare un'email di reset password a ${userEmail}?`);
      if (!confirmReset) {
        return;
      }
    }
    
    if (userEmail) {
      try {
        await requestPasswordReset(userEmail);
        // Success toast is handled within requestPasswordReset
      } catch (error) {
        // Error toast is handled within requestPasswordReset
        console.error("Password reset request failed:", error);
      }
    } else if (email === "" && userEmail === null) { // Prompt cancelled and form email was empty
      toast({
        title: "Operazione Annullata",
        description: "Nessuna email fornita per il reset della password.",
        variant: "default",
      });
    }
  };

  return (
    <div className="flex justify-center items-center py-6 w-full"> 
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center p-4">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Accedi a BIMatch</CardTitle>
          <CardDescription className="text-xs">Bentornato! Inserisci le tue credenziali.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="iltuonome@esempio.com" {...field} className="h-9" />
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
                      <Input type="password" placeholder="********" {...field} className="h-9" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-xs h-auto py-0 text-primary hover:underline"
                  onClick={handlePasswordReset}
                >
                  Password dimenticata?
                </Button>
              </div>
              <Button type="submit" className="w-full" size="sm" disabled={authLoading}>
                {authLoading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Non hai un account?{' '}
            <Link href={ROUTES.REGISTER_PROFESSIONAL} className="font-medium text-primary hover:underline">
              Registrati come Professionista
            </Link>
            {' o '}
            <Link href={ROUTES.REGISTER_COMPANY} className="font-medium text-primary hover:underline">
              Azienda
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
