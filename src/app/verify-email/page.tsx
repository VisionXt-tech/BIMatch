'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resendVerificationEmail, user, logout } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const email = searchParams.get('email');

  // Cooldown timer per resend (60 secondi)
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: 'Errore',
        description: 'Email non trovata. Torna al login e riprova.',
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);
    try {
      // Se l'utente non è loggato, deve fare login prima
      if (!user) {
        toast({
          title: 'Accesso richiesto',
          description: 'Effettua il login per poter inviare nuovamente l\'email di verifica.',
          variant: 'destructive',
        });
        router.push('/login?email=' + encodeURIComponent(email));
        return;
      }

      await resendVerificationEmail();
      toast({
        title: 'Email inviata!',
        description: 'Controlla la tua casella di posta e clicca sul link di verifica.',
      });
      setResendCooldown(60); // 60 secondi di cooldown
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile inviare l\'email. Riprova più tardi.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = async () => {
    await logout(); // Assicura logout completo
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Verifica la tua email</CardTitle>
          <CardDescription>
            Ti abbiamo inviato un'email di verifica a{' '}
            <span className="font-semibold text-foreground">{email || 'la tua email'}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Istruzioni */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Cosa fare ora:
            </h3>
            <ol className="text-sm space-y-1 ml-6 list-decimal text-muted-foreground">
              <li>Controlla la tua casella di posta (anche spam/promozioni)</li>
              <li>Apri l'email da BIMatch</li>
              <li>Clicca sul link di verifica</li>
              <li>Torna qui e accedi alla piattaforma</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">
                Non puoi accedere alla piattaforma finché non verifichi la tua email.
              </span>
            </p>
          </div>

          {/* Resend Button */}
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Non hai ricevuto l'email?
            </p>
            <Button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Invio in corso...
                </>
              ) : resendCooldown > 0 ? (
                <>Riprova tra {resendCooldown}s</>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Invia nuovamente email
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">oppure</span>
            </div>
          </div>

          {/* Torna al Login */}
          <Button
            onClick={handleGoToLogin}
            variant="ghost"
            className="w-full"
          >
            Torna al Login
          </Button>

          {/* Help */}
          <p className="text-xs text-center text-muted-foreground">
            Hai bisogno di aiuto?{' '}
            <a href="mailto:support@bimatch.it" className="text-primary hover:underline">
              Contatta il supporto
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
