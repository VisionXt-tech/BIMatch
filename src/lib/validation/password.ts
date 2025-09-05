import * as z from 'zod';

// Strong password validation schema
export const strongPasswordSchema = z
  .string()
  .min(8, { message: 'La password deve contenere almeno 8 caratteri.' })
  .max(128, { message: 'La password non può superare i 128 caratteri.' })
  .regex(/[a-z]/, { message: 'La password deve contenere almeno una lettera minuscola.' })
  .regex(/[A-Z]/, { message: 'La password deve contenere almeno una lettera maiuscola.' })
  .regex(/[0-9]/, { message: 'La password deve contenere almeno un numero.' })
  .regex(/[^a-zA-Z0-9]/, { message: 'La password deve contenere almeno un carattere speciale (!@#$%^&*()_+-=[]{}|;:,.<>?).' })
  .refine((password) => {
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456789', 'qwertyuio', 'password123', 
      'admin123', 'welcome123', 'changeme', 'letmein'
    ];
    return !commonPasswords.some(common => 
      password.toLowerCase().includes(common.toLowerCase())
    );
  }, { message: 'La password non può contenere sequenze comuni.' });

// Email validation with domain restrictions
export const secureEmailSchema = z
  .string()
  .email({ message: 'Inserisci un indirizzo email valido.' })
  .min(5, { message: 'L\'email deve contenere almeno 5 caratteri.' })
  .max(254, { message: 'L\'email non può superare i 254 caratteri.' })
  .refine((email) => {
    // Block disposable email domains for professional platform
    const disposableDomains = [
      '10minutemail.com', 'guerrillamail.com', 'tempmail.org',
      'yopmail.com', 'mailinator.com', 'throwaway.email'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain || '');
  }, { message: 'Gli indirizzi email temporanei non sono consentiti.' });

// Name validation to prevent XSS
export const secureNameSchema = z
  .string()
  .min(2, { message: 'Il nome deve contenere almeno 2 caratteri.' })
  .max(50, { message: 'Il nome non può superare i 50 caratteri.' })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, { 
    message: 'Il nome può contenere solo lettere, spazi, apostrofi e trattini.' 
  })
  .refine((name) => {
    // Prevent script tags and HTML
    const dangerous = /<script|javascript:|data:|vbscript:|onload=|onerror=/i;
    return !dangerous.test(name);
  }, { message: 'Caratteri non validi nel nome.' });

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .slice(0, 1000); // Prevent extremely long inputs
};

// Rate limiting helper
export const createRateLimiter = (windowMs: number, maxAttempts: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (identifier: string): boolean => {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (userAttempts.count >= maxAttempts) {
      return false;
    }
    
    userAttempts.count++;
    return true;
  };
};