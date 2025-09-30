'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';
import { usePathname } from 'next/navigation';

// 2 minutes of inactivity before warning, 30 seconds warning before logout
const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const WARNING_TIMEOUT = 30 * 1000; // 30 seconds warning
const TOTAL_TIMEOUT = INACTIVITY_TIMEOUT + WARNING_TIMEOUT; // 2.5 minutes total

export const useSessionTimeout = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  
  const inactivityTimer = useRef<NodeJS.Timeout>();
  const warningTimer = useRef<NodeJS.Timeout>();
  const logoutTimer = useRef<NodeJS.Timeout>();
  const [warningShown, setWarningShown] = useState<boolean>(false);
  
  const resetTimers = useCallback(() => {
    // Use a ref to get current warningShown value without dependency
    const currentWarningShown = warningShown;
    console.log('SessionTimeout: resetTimers called', { warningShown: currentWarningShown, hasUser: !!user });
    
    // Don't reset timers if warning is already shown - logout must proceed
    if (currentWarningShown) {
      console.log('SessionTimeout: Warning already shown, not resetting timers');
      return;
    }
    
    // Clear existing timers
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    
    if (!user) {
      console.log('SessionTimeout: No user, not setting timers');
      return;
    }
    
    console.log('SessionTimeout: Setting inactivity timer for', INACTIVITY_TIMEOUT, 'ms');
    
    // Set inactivity timer
    inactivityTimer.current = setTimeout(() => {
      console.log('SessionTimeout: Inactivity timeout reached, showing warning');
      setWarningShown(true);
      toast({
        title: "Sessione in Scadenza",
        description: "La tua sessione scadrà tra 30 secondi. Muovi il mouse per rimanere connesso.",
        variant: "destructive",
      });
      
      console.log('SessionTimeout: Setting logout timer for', WARNING_TIMEOUT, 'ms');
      
      // Set logout timer - this cannot be cancelled by user activity
      logoutTimer.current = setTimeout(async () => {
        console.log('SessionTimeout: Executing logout');
        try {
          await logout();
          toast({
            title: "Sessione Scaduta",
            description: "Sei stato disconnesso per inattività. Effettua nuovamente il login.",
            variant: "destructive",
          });
        } catch (error) {
          console.error('SessionTimeout: Error during logout:', error);
        }
      }, WARNING_TIMEOUT);
    }, INACTIVITY_TIMEOUT);
  }, [user, logout, toast]);
  
  // Separate function to handle activity that checks current warning state
  const handleActivity = useCallback(() => {
    console.log('SessionTimeout: Activity detected, warningShown:', warningShown);
    if (!warningShown) {
      resetTimers();
    } else {
      console.log('SessionTimeout: Warning shown, ignoring activity');
    }
  }, [resetTimers, warningShown]);
  
  useEffect(() => {
    console.log('SessionTimeout: useEffect triggered', { hasUser: !!user, pathname, isAuthPage: pathname.includes('/login') || pathname.includes('/register') });
    
    if (!user) return;
    
    // Don't apply timeout on login/register pages
    const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
    if (isAuthPage) {
      console.log('SessionTimeout: On auth page, skipping timeout setup');
      return;
    }
    
    // Reset timers on mount
    resetTimers();
    
    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      
      setWarningShown(false);
    };
  }, [user, handleActivity, resetTimers, pathname]);
  
  // Reset timers on route changes
  useEffect(() => {
    handleActivity();
  }, [pathname, handleActivity]);
};