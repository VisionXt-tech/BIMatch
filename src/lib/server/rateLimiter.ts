/**
 * Server-side Rate Limiter using Firestore
 *
 * Questo previene bypass del rate limiting client-side
 * Usa Firestore per tracciare tentativi su più dispositivi/browser
 */

import { getFirestore, doc, getDoc, setDoc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Finestra temporale in millisecondi
  blockDurationMs?: number; // Durata blocco dopo superamento limite
}

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime?: Date;
  retryAfter?: number; // Millisecondi prima di poter riprovare
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minuti
    blockDurationMs: 15 * 60 * 1000, // 15 minuti di blocco
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 ora
    blockDurationMs: 60 * 60 * 1000, // 1 ora di blocco
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 ora
    blockDurationMs: 60 * 60 * 1000, // 1 ora di blocco
  },
  api: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minuto
    blockDurationMs: 5 * 60 * 1000, // 5 minuti di blocco
  },
  fileUpload: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 ora
    blockDurationMs: 60 * 60 * 1000, // 1 ora di blocco
  },
};

interface RateLimitRecord {
  attempts: number;
  firstAttempt: Timestamp;
  lastAttempt: Timestamp;
  blockedUntil?: Timestamp;
}

/**
 * Controlla e aggiorna il rate limit per una chiave specifica
 *
 * @param db - Firestore database instance
 * @param key - Chiave unica (es. 'login:user@email.com' o 'api:192.168.1.1')
 * @param action - Tipo di azione (login, register, passwordReset, api, fileUpload)
 * @param customConfig - Configurazione personalizzata (opzionale)
 * @returns Risultato del rate limit check
 */
export async function checkRateLimit(
  db: Firestore,
  key: string,
  action: keyof typeof DEFAULT_CONFIGS = 'api',
  customConfig?: Partial<RateLimitConfig>
): Promise<RateLimitResult> {
  const config = { ...DEFAULT_CONFIGS[action], ...customConfig };
  const now = Timestamp.now();
  const rateLimitRef = doc(db, 'rateLimits', key);

  try {
    const rateLimitDoc = await getDoc(rateLimitRef);

    if (!rateLimitDoc.exists()) {
      // Prima richiesta - crea nuovo record
      await setDoc(rateLimitRef, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      } as RateLimitRecord);

      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
      };
    }

    const data = rateLimitDoc.data() as RateLimitRecord;

    // Controlla se è bloccato
    if (data.blockedUntil && data.blockedUntil.toMillis() > now.toMillis()) {
      const retryAfter = data.blockedUntil.toMillis() - now.toMillis();
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: data.blockedUntil.toDate(),
        retryAfter,
      };
    }

    // Calcola se la finestra temporale è scaduta
    const windowStart = now.toMillis() - config.windowMs;
    const firstAttemptTime = data.firstAttempt.toMillis();

    if (firstAttemptTime < windowStart) {
      // Finestra scaduta - resetta contatore
      await updateDoc(rateLimitRef, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
        blockedUntil: null,
      });

      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
      };
    }

    // Incrementa tentativi nella finestra corrente
    const newAttempts = data.attempts + 1;

    if (newAttempts > config.maxAttempts) {
      // Limite superato - blocca
      const blockedUntil = Timestamp.fromMillis(
        now.toMillis() + (config.blockDurationMs || config.windowMs)
      );

      await updateDoc(rateLimitRef, {
        attempts: newAttempts,
        lastAttempt: now,
        blockedUntil,
      });

      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: blockedUntil.toDate(),
        retryAfter: config.blockDurationMs || config.windowMs,
      };
    }

    // Aggiorna contatore
    await updateDoc(rateLimitRef, {
      attempts: newAttempts,
      lastAttempt: now,
    });

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - newAttempts,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // In caso di errore, permetti la richiesta (fail-open)
    // Questo evita di bloccare l'app se Firestore ha problemi
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
    };
  }
}

/**
 * Resetta manualmente il rate limit per una chiave
 * Utile per admin o dopo verifica manuale
 */
export async function resetRateLimit(db: Firestore, key: string): Promise<void> {
  const rateLimitRef = doc(db, 'rateLimits', key);
  await deleteDoc(rateLimitRef);
}

/**
 * Ottiene informazioni sul rate limit corrente senza incrementare
 */
export async function getRateLimitInfo(
  db: Firestore,
  key: string,
  action: keyof typeof DEFAULT_CONFIGS = 'api'
): Promise<RateLimitResult> {
  const config = DEFAULT_CONFIGS[action];
  const now = Timestamp.now();
  const rateLimitRef = doc(db, 'rateLimits', key);

  try {
    const rateLimitDoc = await getDoc(rateLimitRef);

    if (!rateLimitDoc.exists()) {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
      };
    }

    const data = rateLimitDoc.data() as RateLimitRecord;

    if (data.blockedUntil && data.blockedUntil.toMillis() > now.toMillis()) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: data.blockedUntil.toDate(),
        retryAfter: data.blockedUntil.toMillis() - now.toMillis(),
      };
    }

    const windowStart = now.toMillis() - config.windowMs;
    const firstAttemptTime = data.firstAttempt.toMillis();

    if (firstAttemptTime < windowStart) {
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts,
      };
    }

    return {
      allowed: data.attempts < config.maxAttempts,
      remainingAttempts: Math.max(0, config.maxAttempts - data.attempts),
    };
  } catch (error) {
    console.error('Get rate limit info error:', error);
    return {
      allowed: true,
      remainingAttempts: config.maxAttempts,
    };
  }
}
