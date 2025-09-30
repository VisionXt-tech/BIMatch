'use client';

import { useRef, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number[];
  blockedUntil?: number;
}

const rateLimitStorage: Map<string, RateLimitState> = new Map();

export const useRateLimit = () => {
  
  const checkRateLimit = useCallback((
    key: string, 
    config: RateLimitConfig = { maxAttempts: 5, windowMs: 60000, blockDurationMs: 300000 }
  ): boolean => {
    const now = Date.now();
    const state = rateLimitStorage.get(key) || { attempts: [] };
    
    // Check if still blocked
    if (state.blockedUntil && now < state.blockedUntil) {
      return false; // Still blocked
    }
    
    // Clear old attempts outside the window
    state.attempts = state.attempts.filter(attempt => now - attempt < config.windowMs);
    
    // Check if within rate limit
    if (state.attempts.length >= config.maxAttempts) {
      // Block for specified duration
      state.blockedUntil = now + (config.blockDurationMs || 300000); // Default 5 minutes
      rateLimitStorage.set(key, state);
      return false; // Rate limited
    }
    
    return true; // Not rate limited
  }, []);
  
  const recordAttempt = useCallback((key: string) => {
    const now = Date.now();
    const state = rateLimitStorage.get(key) || { attempts: [] };
    
    state.attempts.push(now);
    rateLimitStorage.set(key, state);
  }, []);
  
  const getRemainingTime = useCallback((key: string): number => {
    const state = rateLimitStorage.get(key);
    if (!state?.blockedUntil) return 0;
    
    const remaining = state.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }, []);
  
  return {
    checkRateLimit,
    recordAttempt,
    getRemainingTime
  };
};