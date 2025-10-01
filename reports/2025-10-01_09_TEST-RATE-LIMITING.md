# Test Rate Limiting Server-Side

## 🎯 Obiettivo
Testare che il rate limiting server-side funzioni correttamente e non possa essere bypassato.

---

## ✅ Pre-requisiti

1. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **App in esecuzione:**
   ```bash
   npm run dev
   ```

---

## 🧪 Test 1: Login Rate Limiting (CRITICAL)

### Configurazione:
- **Max Attempts:** 5 tentativi
- **Window:** 15 minuti
- **Block Duration:** 15 minuti

### Steps:

1. **Vai alla pagina di login:**
   - URL: `http://localhost:9002/login`

2. **Prova a fare login con email SBAGLIATA 5 volte:**
   - Email: `test@example.com`
   - Password: `wrong_password_123`

3. **Cosa deve succedere:**
   - ✅ Primi 4 tentativi: Errore "Credenziali non corrette"
   - ✅ 5° tentativo: Errore "Credenziali non corrette"
   - ✅ 6° tentativo: **"Account temporaneamente bloccato - Troppi tentativi di accesso falliti. Riprova tra 15 minuti"**

4. **Verifica in Firestore Console:**
   - Vai su Firebase Console → Firestore Database
   - Cerca collection `rateLimits`
   - Dovresti vedere un documento con ID `login:test@example.com`
   - Campi:
     - `attempts`: 6
     - `blockedUntil`: timestamp futuro (+15 minuti)
     - `firstAttempt`: timestamp del primo tentativo
     - `lastAttempt`: timestamp dell'ultimo tentativo

5. **Verifica Audit Log:**
   - Collection `auditLogs`
   - Cerca entry con `action: "LOGIN_RATE_LIMITED"`
   - `severity: "HIGH"`

6. **Prova a bypassare (DEVE FALLIRE):**
   - Apri DevTools → Application → Clear all site data
   - Oppure apri finestra incognito
   - Prova login con stessa email
   - ✅ **DEVE mostrare stesso errore di blocco** (questo dimostra che non è bypassabile lato client!)

7. **Reset manuale (per continuare i test):**
   - Vai su Firestore Console
   - Elimina il documento `login:test@example.com` dalla collection `rateLimits`
   - OPPURE attendi 15 minuti

---

## 🧪 Test 2: Registrazione Rate Limiting

### Configurazione:
- **Max Attempts:** 3 tentativi
- **Window:** 1 ora
- **Block Duration:** 1 ora

### Steps:

1. **Vai alla pagina di registrazione:**
   - URL: `http://localhost:9002/register/company`

2. **Prova a registrarti 4 volte con la STESSA EMAIL:**
   - Email: `test-rate@example.com`
   - Compila tutti i campi richiesti
   - Usa password diverse ogni volta

3. **Cosa deve succedere:**
   - ✅ Primi 3 tentativi: Possono fallire per vari motivi (email già usata, ecc.)
   - ✅ 4° tentativo: **Bloccato per 1 ora**

4. **Verifica in Firestore:**
   - Document ID: `register:test-rate@example.com`
   - `attempts`: 4
   - `blockedUntil`: +1 ora

---

## 🧪 Test 3: Doppio Rate Limiting (Client + Server)

### Obiettivo:
Verificare che entrambi i sistemi lavorino insieme

### Steps:

1. **Login con credenziali sbagliate 3 volte rapidamente:**
   - Il client-side dovrebbe mostrare un alert dopo 5 tentativi
   - Il server-side dovrebbe kickare dopo 5 tentativi

2. **Verifica che il messaggio cambi:**
   - Primi tentativi: "Credenziali non corrette"
   - Dopo 5 tentativi: "Account temporaneamente bloccato"

3. **Il server-side è definitivo:**
   - Anche se cancelli localStorage (client-side)
   - Il blocco rimane attivo (server-side)

---

## 🧪 Test 4: Performance & Fail-Safe

### Obiettivo:
Verificare che se Firestore è lento/offline, l'app non si blocchi

### Steps:

1. **Simula Firestore offline:**
   - DevTools → Network → Offline

2. **Prova a fare login:**
   - ✅ Dovrebbe comunque permettere il login (fail-open)
   - Console dovrebbe loggare: "Rate limit check error"

3. **Torna online:**
   - Network → Online
   - Riprova login
   - ✅ Rate limiting dovrebbe tornare attivo

---

## 🧪 Test 5: Admin Reset

### Steps:

1. **Blocca un account (5 tentativi login sbagliati)**

2. **Come admin, resetta il rate limit:**
   - Vai su Firestore Console
   - Collection `rateLimits`
   - Elimina il documento `login:email@example.com`

3. **Verifica:**
   - ✅ User può fare login immediatamente

---

## 📊 Risultati Attesi

| Test | Risultato Atteso | Status |
|------|------------------|--------|
| Login 5 tentativi | Blocco 15 min | ⬜ |
| Bypass con incognito | Bloccato comunque | ⬜ |
| Registrazione 3 tentativi | Blocco 1 ora | ⬜ |
| Firestore offline | Fail-open (permette) | ⬜ |
| Admin reset | Sblocco immediato | ⬜ |
| Doppio rate limiting | Entrambi attivi | ⬜ |

---

## 🐛 Troubleshooting

### Errore: "Missing or insufficient permissions"
- **Causa:** Firestore rules non deployate
- **Fix:** `firebase deploy --only firestore:rules`

### Rate limiting non funziona
- **Causa:** Collection `rateLimits` non creata
- **Fix:** Firestore crea automaticamente, ma verifica che le rules siano deployate

### Login sempre bloccato
- **Causa:** Documento rate limit rimasto in Firestore
- **Fix:** Elimina manualmente da Firestore Console

### Console errors
- **Causa:** Import path errato
- **Fix:** Verifica che `src/lib/server/rateLimiter.ts` esista

---

## ✅ Checklist Finale

Prima di passare al prossimo task, verifica:

- [ ] Firestore rules deployate
- [ ] Login rate limiting funziona (5 tentativi → blocco)
- [ ] Bypass impossibile (incognito/localStorage clear)
- [ ] Audit log registra i blocchi
- [ ] Fail-safe funziona (offline → fail-open)
- [ ] Nessun errore in console
- [ ] App funziona normalmente dopo test

---

## 📝 Note

- Il rate limiting è **per email**, non per IP (più preciso)
- Il sistema è **fail-open** (se Firestore ha problemi, permette l'accesso)
- Gli audit log tracciano tutti i blocchi per analisi sicurezza
- I record in `rateLimits` possono essere eliminati manualmente da admin

**⚠️ IMPORTANTE:** Se tutto funziona, fai commit prima di passare al task successivo!