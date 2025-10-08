
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
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Inserisci un indirizzo email valido.' }),
  password: z.string().min(1, { message: 'La password è richiesta.' }),
});

export default function LoginPage() {
  const { login, loading: authLoading, requestPasswordReset } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const form = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // No need to redirect here - AuthContext handles the redirect
    } catch (error) {
      console.error('Login failed on page:', error);
      // Toast is handled by useAuth
    }
  };

  const handlePasswordReset = async () => {
    setIsResettingPassword(true);
    const emailFromForm = form.getValues("email");
    let userEmailToReset = emailFromForm;

    if (!userEmailToReset) {
  userEmailToReset = window.prompt("Inserisci la tua email per reimpostare la password:") || '';
    } else {
      const confirmReset = window.confirm(`Vuoi inviare un'email di reset password a ${userEmailToReset}?`);
      if (!confirmReset) {
        setIsResettingPassword(false);
        return;
      }
    }
    
    if (userEmailToReset) {
      try {
        await requestPasswordReset(userEmailToReset);
      } catch (error) {
        console.error("Password reset request failed on page:", error);
        // Toast is handled by useAuth
      }
    } else if (emailFromForm === "" && userEmailToReset === null) { 
      toast({
        title: "Operazione Annullata",
        description: "Nessuna email fornita per il reset della password.",
        variant: "default",
      });
    }
    setIsResettingPassword(false);
  };

  const isSubmitting = form.formState.isSubmitting || authLoading;

  return (
    <div
      className="relative flex flex-grow items-center justify-center w-full px-4"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1481026469463-66327c86e544?w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <Card className="relative z-10 w-full max-w-md lg:max-w-lg shadow-2xl bg-card border-border">
        <CardHeader className="text-center p-5">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Accedi a BIMatch</CardTitle>
          <CardDescription className="text-sm text-foreground/70">Bentornato! Inserisci le tue credenziali.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="iltuonome@esempio.com"
                        {...field}
                        className="h-10 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary"
                        disabled={isSubmitting || isResettingPassword}
                      />
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
                    <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                        className="h-10 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary"
                        disabled={isSubmitting || isResettingPassword}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-xs h-auto py-0 text-muted-foreground hover:text-primary hover:underline"
                  onClick={handlePasswordReset}
                  disabled={isSubmitting || isResettingPassword}
                >
                  {isResettingPassword ? 'Invio in corso...' : 'Password dimenticata?'}
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full mt-2"
                size="default"
                disabled={isSubmitting || isResettingPassword}
              >
                {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>
          </Form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
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
