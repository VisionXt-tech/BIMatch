
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
import Image from 'next/image';

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
    setIsResettingPassword(true);
    const emailFromForm = form.getValues("email");
    let userEmailToReset = emailFromForm;
    console.log("Attempting password reset for:", userEmailToReset);

    if (!userEmailToReset) {
      userEmailToReset = window.prompt("Inserisci la tua email per reimpostare la password:");
      console.log("Email from prompt:", userEmailToReset);
    } else {
      const confirmReset = window.confirm(`Vuoi inviare un'email di reset password a ${userEmailToReset}?`);
      console.log("Confirmation for reset:", confirmReset);
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
    <div className="relative flex flex-grow items-center justify-center w-full px-4">
      <Image
        src="https://images.unsplash.com/photo-1522071820081-009f0129c7da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxvZmZpY2V8ZW58MHx8fHwxNzE1MzUwNzU3fDA&ixlib=rb-4.0.3&q=80&w=1920"
        alt="Modern office background"
        layout="fill"
        objectFit="cover"
        className="-z-10"
        priority
        data-ai-hint="modern office"
      />
      <div className="absolute inset-0 bg-black/60 -z-10 backdrop-blur-sm"></div>

      <Card className="w-full max-w-md shadow-xl bg-card/70 dark:bg-neutral-900/80 backdrop-blur-md border border-white/10">
        <CardHeader className="text-center p-4">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-3">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold text-white">Accedi a BIMatch</CardTitle>
          <CardDescription className="text-xs text-neutral-200">Bentornato! Inserisci le tue credenziali.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-neutral-200">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="iltuonome@esempio.com" 
                        {...field} 
                        className="h-9 bg-background/80 text-foreground placeholder:text-muted-foreground" 
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
                    <FormLabel className="text-xs text-neutral-200">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                        className="h-9 bg-background/80 text-foreground placeholder:text-muted-foreground" 
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
                  className="px-0 text-xs h-auto py-0 text-neutral-300 hover:text-white hover:underline"
                  onClick={handlePasswordReset}
                  disabled={isSubmitting || isResettingPassword}
                >
                  {isResettingPassword ? 'Invio in corso...' : 'Password dimenticata?'}
                </Button>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                size="sm" 
                disabled={isSubmitting || isResettingPassword}
              >
                {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-neutral-300">
            Non hai un account?{' '}
            <Link href={ROUTES.REGISTER_PROFESSIONAL} className="font-medium text-white hover:underline">
              Registrati come Professionista
            </Link>
            {' o '}
            <Link href={ROUTES.REGISTER_COMPANY} className="font-medium text-white hover:underline">
              Azienda
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
