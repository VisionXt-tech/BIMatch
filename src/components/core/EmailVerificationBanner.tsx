'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function EmailVerificationBanner() {
  const { user, resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner only if user exists and email is not verified
    setShowBanner(!!user && !user.emailVerified);
  }, [user]);

  if (!showBanner) return null;

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
    } finally {
      setIsResending(false);
    }
  };

  const handleReload = async () => {
    // Reload the user to check if email has been verified
    if (user) {
      await user.reload();
      setShowBanner(!user.emailVerified);
    }
  };

  return (
    <Alert variant="destructive" className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 dark:text-orange-200">
        Email Non Verificata
      </AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-300">
        <p className="mb-3">
          La tua email <strong>{user?.email}</strong> non è stata ancora verificata.
          Controlla la tua casella di posta (anche spam) per il link di verifica.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={isResending}
            className="border-orange-500 text-orange-700 hover:bg-orange-100 dark:text-orange-200 dark:hover:bg-orange-900"
          >
            <Mail className="mr-2 h-3 w-3" />
            {isResending ? 'Invio...' : 'Invia di Nuovo'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReload}
            className="border-orange-500 text-orange-700 hover:bg-orange-100 dark:text-orange-200 dark:hover:bg-orange-900"
          >
            Ho Verificato
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}