# 🧪 BIMatch - Suite di Test di Sicurezza Completa

## 🎯 Obiettivo
Stress test completo per verificare che tutti i sistemi di sicurezza implementati funzionino correttamente prima del deploy in produzione.

---

## 🔐 **1. TEST AUTENTICAZIONE E RATE LIMITING**

### Test 1.1: Brute Force Protection
**Scopo**: Verificare che il rate limiting blocchi attacchi brute force

**Procedura**:
1. Vai su `/login`
2. Inserisci email esistente ma **password sbagliata**
3. Clicca "Accedi" **6 volte consecutive** rapidamente
4. **Risultato Atteso**: 
   - Primi 5 tentativi: "Credenziali non corrette"
   - 6° tentativo: "Troppi tentativi di accesso, riprova tra X minuti"
   - Toast con tempo di blocco visualizzato

**Test Aggiuntivo**: 
- Prova con email diversa → dovrebbe funzionare (rate limit per email)
- Prova stessa email dopo 1 minuto → dovrebbe ancora essere bloccata
- Controlla **Console Browser** → deve vedere audit log "LOGIN_FAILED"

### Test 1.2: Session Timeout
**Scopo**: Verificare logout automatico per inattività

**Procedura**:
1. Fai login correttamente
2. **NON toccare mouse/tastiera per esattamente 5 minuti**
3. **Risultato Atteso**: 
   - A 5 minuti: toast "Sessione in Scadenza, rimanenti 1 minuto"
   - A 6 minuti: logout automatico + toast "Sessione Scaduta"
   - Redirect automatico a pagina login

**Test Variazione**:
- A 5 minuti e 30 secondi, muovi il mouse → timeout dovrebbe resetarsi
- Cambia pagina durante il countdown → timeout dovrebbe resetarsi

---

## 🛡️ **2. TEST VALIDAZIONE INPUT E XSS**

### Test 2.1: XSS Prevention
**Scopo**: Verificare che input malicious vengano sanitizzati

**Procedura** (su pagina registrazione professionale):
1. Nel campo "Nome" inserisci: `<script>alert('XSS')</script>`
2. Nel campo "Cognome" inserisci: `<img src="x" onerror="alert('XSS')">`
3. Nel campo "Bio" inserisci: `javascript:alert('XSS')`
4. Clicca "Registrati"
5. **Risultato Atteso**: 
   - Nessun alert JavaScript deve apparire
   - Input devono essere sanitizzati (< diventa &lt;)
   - Registrazione fallisce con errori di validazione

### Test 2.2: SQL Injection Prevention  
**Scopo**: Verificare protezione contro injection

**Procedura** (su pagina login):
1. Email: `admin@test.com' OR '1'='1`
2. Password: `' OR '1'='1 --`
3. Clicca "Accedi"
4. **Risultato Atteso**: 
   - Login fallisce con "Credenziali non corrette"
   - Nessun accesso non autorizzato
   - Audit log "LOGIN_FAILED" creato

### Test 2.3: File Upload Security
**Scopo**: Verificare validazione rigorosa file upload

**Procedura** (su pagina profilo professionale):
1. Prova caricare file `.exe` come CV
2. Prova caricare file `.js` come certificazione
3. Prova caricare immagine > 2MB come foto profilo
4. Prova caricare PDF > 5MB come CV
5. **Risultato Atteso**: 
   - Tutti i tentativi devono fallire
   - Messaggi di errore specifici per tipo/dimensione
   - Nessun file malicious caricato su Firebase Storage

---

## 🕒 **3. TEST GESTIONE SESSIONI**

### Test 3.1: Multiple Browser Tabs
**Scopo**: Verificare comportamento con più tab

**Procedura**:
1. Fai login nel Tab A
2. Apri Tab B nella stessa app → dovrebbe essere già loggato
3. Nel Tab A, aspetta timeout (6 min) → logout automatico
4. Controlla Tab B → dovrebbe anche fare logout automatico
5. **Risultato Atteso**: Sincronizzazione logout tra tab

### Test 3.2: Browser Session Persistence
**Scopo**: Verificare che sessione non persista inappropriatamente

**Procedura**:
1. Fai login
2. Chiudi completamente il browser
3. Riapri browser e vai all'app
4. **Risultato Atteso**: Dovrebbe ricordare la sessione (Firebase Auth)
5. Fai logout esplicito
6. Chiudi browser, riapri
7. **Risultato Atteso**: Dovrebbe richiedere nuovo login

---

## 🍪 **4. TEST PRIVACY E COMPLIANCE**

### Test 4.1: Cookie Banner
**Scopo**: Verificare compliance GDPR

**Procedura**:
1. Apri app in **browser incognito**
2. **Risultato Atteso**: Cookie banner deve apparire immediatamente
3. Clicca "Solo Necessari"
4. Refresh pagina → banner non deve riapparire
5. In DevTools → Application → Local Storage → verifica consent salvato

### Test 4.2: Cookie Consent Persistence  
**Procedura**:
1. Cancella Local Storage
2. Refresh pagina → banner deve riapparire
3. Clicca "Accetta Tutti"
4. Verifica localStorage → consent = {necessary: true, analytics: true}

### Test 4.3: Privacy Links
**Procedura**:
1. Footer → clicca "Privacy Policy" → deve andare a `/privacy-policy`
2. Footer → clicca "Termini di Servizio" → deve andare a `/terms-of-service`
3. **Risultato Atteso**: Pagine devono esistere e essere accessibili

---

## 🌐 **5. TEST SECURITY HEADERS**

### Test 5.1: Security Headers Check
**Scopo**: Verificare headers di sicurezza

**Procedura** (usa browser DevTools → Network):
1. Apri app e vai su homepage
2. In Network tab, clicca su documento principale
3. In Response Headers cerca:
   - `X-Frame-Options: DENY`
   - `Content-Security-Policy: default-src 'self'...`
   - `Strict-Transport-Security: max-age=31536000`
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`
4. **Risultato Atteso**: Tutti gli headers devono essere presenti

### Test 5.2: CSP Violations
**Procedura**:
1. Apri DevTools → Console
2. Naviga nell'app per 2-3 minuti
3. **Risultato Atteso**: Nessun errore CSP deve apparire in console
4. Se vedi errori tipo "Content Security Policy", sono da investigare

---

## 📊 **6. TEST AUDIT LOGGING**

### Test 6.1: Audit Trails
**Scopo**: Verificare che eventi siano loggati

**Procedura** (richiede accesso Firebase Console):
1. Fai login con successo
2. Fai logout  
3. Carica un file nel profilo
4. Prova login fallito
5. Va su **Firebase Console → Firestore → Collection "auditLogs"**
6. **Risultato Atteso**: Devi vedere documenti con:
   - `action: "LOGIN_SUCCESS"`
   - `action: "LOGOUT"`
   - `action: "FILE_UPLOAD"`
   - `action: "LOGIN_FAILED"`
   - Tutti con timestamp, userId, severity appropriati

---

## 🚨 **7. TEST SCENARI DI ATTACCO**

### Test 7.1: Clickjacking Protection
**Procedura**:
1. Crea file HTML locale:
```html
<!DOCTYPE html>
<html>
<body>
<iframe src="http://localhost:9002/login" width="100%" height="500px"></iframe>
</body>
</html>
```
2. Apri file in browser
3. **Risultato Atteso**: Iframe deve essere bloccato (X-Frame-Options: DENY)

### Test 7.2: Direct Database Access
**Procedura**:
1. Apri Browser DevTools → Console  
2. Prova a eseguire:
```javascript
// Tenta di accedere a dati di altri utenti
firebase.firestore().collection('users').get()
```
3. **Risultato Atteso**: Deve fallire con errore di permessi

### Test 7.3: File Path Traversal
**Procedura**:
1. Su upload file, intercetta request (DevTools → Network)
2. Modifica filename con path traversal: `../../../etc/passwd`
3. **Risultato Atteso**: Upload deve fallire, nessun path traversal

---

## 📈 **8. TEST PERFORMANCE SOTTO STRESS**

### Test 8.1: Concurrent Logins
**Procedura**:
1. Apri **10 tab browser** simultanei
2. In ogni tab, fai login con user diversi **contemporaneamente**
3. **Risultato Atteso**: 
   - Tutti login devono funzionare
   - Nessun errore di concorrenza
   - Rate limiting deve funzionare per user

### Test 8.2: File Upload Concorrenti
**Procedura**:
1. Su profilo, prova a caricare **3 file contemporaneamente**
2. **Risultato Atteso**: 
   - Upload devono essere gestiti correttamente
   - Nessun file corrotto
   - Progress bars funzionanti

---

## ✅ **CHECKLIST FINALE RISULTATI**

Dopo aver completato tutti i test, verifica:

- [ ] **Rate Limiting**: Blocca dopo 5 tentativi (15 min)
- [ ] **Session Timeout**: Logout automatico a 6 minuti  
- [ ] **XSS Prevention**: Input sanitizzati, no JavaScript execution
- [ ] **File Upload Security**: Solo PDF/immagini, size limits rispettati
- [ ] **Cookie Banner**: Appare al primo accesso, salva preferenze
- [ ] **Security Headers**: Tutti presenti nelle response
- [ ] **Audit Logging**: Eventi loggati correttamente in Firestore
- [ ] **Clickjacking Protection**: Iframe blocked
- [ ] **Database Security**: Accesso non autorizzato bloccato
- [ ] **Performance**: Nessun crash sotto concurrent load

---

## 🚨 **COSA FARE SE UN TEST FALLISCE**

1. **Documenta** quale test fallisce e come
2. **Screenshot** degli errori in console
3. **Verifica** configurazioni Firebase (rules, auth settings)
4. **Controlla** variabili d'ambiente (.env.local)
5. **Re-deploy** se necessario con fix

---

## 📞 **Emergency Checklist**

Se trovi vulnerabilità **critiche**:
1. **NON deployare** in produzione
2. Documenta la vulnerabilità trovata
3. Implementa fix immediato
4. Re-testa TUTTI i test della categoria
5. Solo dopo tutti i ✅, procedi con deploy

---

**🎯 Obiettivo**: Tutti i test devono passare ✅ prima del deploy produzione!**