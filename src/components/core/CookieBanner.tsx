'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { X, Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem('bimatch-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('bimatch-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const acceptNecessaryOnly = () => {
    localStorage.setItem('bimatch-cookie-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!mounted || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto sm:left-auto sm:max-w-lg">
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cookie className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Utilizzo dei Cookie</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={acceptNecessaryOnly}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <CardDescription className="text-sm">
            Utilizziamo cookie essenziali per il funzionamento del sito e cookie di analisi per migliorare l'esperienza utente.
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={acceptCookies} size="sm" className="text-sm">
              Accetta Tutti
            </Button>
            <Button onClick={acceptNecessaryOnly} variant="outline" size="sm" className="text-sm">
              Solo Necessari
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            <Link href="/privacy-policy" className="underline hover:text-primary">
              Privacy Policy
            </Link>{' '}|{' '}
            <Link href="/terms-of-service" className="underline hover:text-primary">
              Termini di Servizio
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}